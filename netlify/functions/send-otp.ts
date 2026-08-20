import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

/**
 * POST /.netlify/functions/send-otp
 *
 * Creates a 6-digit code in the otp_codes table (service role) and sends it as
 * a branded Excurion email via Resend. If RESEND_API_KEY is not configured,
 * the code is still created and returned in `devCode` so development/testing
 * can proceed without an inbox (beta convenience only).
 */

const requestSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['register', 'reset-password']),
})

const APP_URL = 'https://excurion.app'

function emailHtml(code: string, purpose: 'register' | 'reset-password'): string {
  const headline =
    purpose === 'register'
      ? 'Your account is almost ready'
      : 'Reset your password'
  const body =
    purpose === 'register'
      ? 'Use the code below to finish creating your Excurion account. It works once and expires in 10 minutes — no links, no redirects.'
      : 'Use the code below to choose a new password. It works once and expires in 10 minutes — no links, no redirects.'
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(23,37,84,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 55%,#4f46e5 100%);padding:28px 32px;">
              <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:0.5px;">EXCURION</span>
              <span style="display:block;color:#c7d2fe;font-size:12px;margin-top:2px;">excurion.app</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">${headline}</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4b5563;">${body}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="background:#eef2ff;border:1px dashed #818cf8;border-radius:12px;padding:16px 40px;">
                <tr><td style="font-size:32px;font-weight:800;letter-spacing:10px;color:#312e81;" align="center">${code}</td></tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
                If you didn't request this code, you can safely ignore this email.<br/>
                &copy; ${new Date().getFullYear()} Excurion &middot; ${APP_URL}
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json(405, { error: 'method_not_allowed' })
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (!serviceRole || !supabaseUrl) {
    console.error(JSON.stringify({ level: 'error', event: 'send-otp', error: 'service role not configured' }))
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

  const { email, purpose } = parsed.data
  const supabase = createClient(supabaseUrl, serviceRole)

  const { data: code, error: codeError } = await supabase.rpc('create_otp_code', {
    p_email: email,
    p_purpose: purpose,
  })
  if (codeError) {
    console.error(JSON.stringify({ level: 'error', event: 'send-otp', email, purpose, error: codeError.message }))
    return json(429, { error: 'otp_rate_limited' })
  }

  const apiKey = process.env.RESEND_API_KEY
  // Until a real domain (e.g. excurion.app) is verified in Resend, use the
  // built-in test sender. Resend's test mode only delivers to the inbox of
  // the account that owns the key.
  const from = process.env.RESEND_FROM ?? 'Excurion <no-reply@excurion.app>'

  if (apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject:
          purpose === 'register'
            ? 'Your Excurion verification code'
            : 'Reset your Excurion password',
        html: emailHtml(code, purpose),
      }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error(JSON.stringify({ level: 'error', event: 'send-otp', email, resendError: detail }))
      return json(502, { error: 'email_send_failed' })
    }
  } else {
    console.log(JSON.stringify({ level: 'warn', event: 'send-otp', email, purpose, devCode: code }))
  }

  console.log(JSON.stringify({ level: 'info', event: 'send-otp', email, purpose }))
  return json(201, { ok: true, devCode: apiKey ? undefined : code })
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}