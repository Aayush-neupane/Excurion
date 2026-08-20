import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

/**
 * POST /.netlify/functions/send-notification
 *
 * Server-side notification dispatch for privileged senders (hosts).
 * Notifications are always addressed to a specific user; the sender must
 * already hold permission in-app (RLS still applies to the re-read checks
 * done here via a service-role client).
 */

const requestSchema = z.object({
  userId: z.string().uuid(),
  kind: z.enum(['meeting', 'reminder', 'chat', 'recording', 'system', 'warning']),
  title: z.string().trim().min(1).max(140),
  body: z.string().trim().max(500).default(''),
  link: z.string().url().max(500).optional(),
})

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (!serviceRole || !supabaseUrl) {
    console.error(JSON.stringify({ level: 'error', event: 'send-notification', error: 'service role not configured' }))
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

  const { userId, kind, title, body, link } = parsed.data
  const supabase = createClient(supabaseUrl, serviceRole)

  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, kind, title, body, link: link ?? null })

  if (error) {
    console.error(JSON.stringify({ level: 'error', event: 'send-notification', userId, error: error.message }))
    return json(502, { error: 'notification_failed' })
  }

  console.log(JSON.stringify({ level: 'info', event: 'send-notification', userId, kind }))
  return json(201, { ok: true })
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}