import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

/**
 * POST /.netlify/functions/process-meeting-action
 *
 * Host-gated server-side meeting operations that must not be trusted to
 * the client alone. Currently two actions: promote a participant to host
 * and remove a participant. Extend with recording start/stop, breakout
 * room creation, etc.
 */

const requestSchema = z.object({
  roomId: z.string().uuid(),
  action: z.enum(['promote-host', 'remove-participant']),
  participantId: z.string().uuid().optional(),
  targetUserId: z.string().uuid().optional(),
})

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (!serviceRole || !supabaseUrl) {
    console.error(JSON.stringify({ level: 'error', event: 'process-meeting-action', error: 'service role not configured' }))
    return json(500, { error: 'server_not_configured' })
  }

  let payload: unknown
  try {
    payload = JSON.parse(await request.text())
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const parsed = requestSchema.safeParse(payload)
  if (!parsed.success) {
    return json(400, { error: 'validation_failed', details: parsed.error.flatten() })
  }

  const supabase = createClient(supabaseUrl, serviceRole)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) return json(401, { error: 'unauthorized' })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token)
  if (userError || !user) return json(401, { error: 'unauthorized' })

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('host_id')
    .eq('id', parsed.data.roomId)
    .single()
  if (roomError || !room || room.host_id !== user.id) {
    return json(403, { error: 'not_host' })
  }

  const { roomId, action, participantId, targetUserId } = parsed.data

  if (action === 'promote-host') {
    if (!targetUserId && !participantId) {
      return json(400, { error: 'validation_failed', details: { field: 'targetUserId or participantId required' } })
    }
    let target = targetUserId ?? null
    if (!target && participantId) {
      const { data: p } = await supabase
        .from('participants')
        .select('user_id')
        .eq('id', participantId)
        .single()
      target = p?.user_id ?? null
    }
    if (!target) return json(404, { error: 'participant_not_found' })

    const { error: txnError } = await supabase.rpc('promote_host', {
      p_room_id: roomId,
      p_user_id: target,
    })
    if (txnError) {
      console.error(JSON.stringify({ level: 'error', event: 'process-meeting-action', action, error: txnError.message }))
      return json(502, { error: 'action_failed' })
    }
    console.log(JSON.stringify({ level: 'info', event: 'process-meeting-action', action, roomId, target }))
    return json(200, { ok: true })
  }

  if (action === 'remove-participant') {
    if (!participantId) return json(400, { error: 'validation_failed', details: { field: 'participantId required' } })
    const { error: rmError } = await supabase
      .from('participants')
      .update({ status: 'removed', left_at: new Date().toISOString() })
      .eq('id', participantId)
      .eq('room_id', roomId)
    if (rmError) {
      console.error(JSON.stringify({ level: 'error', event: 'process-meeting-action', action, error: rmError.message }))
      return json(502, { error: 'action_failed' })
    }
    console.log(JSON.stringify({ level: 'info', event: 'process-meeting-action', action, roomId, participantId }))
    return json(200, { ok: true })
  }

  return json(400, { error: 'unknown_action' })
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}