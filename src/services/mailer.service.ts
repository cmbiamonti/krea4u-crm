// src/services/mailer.service.ts
// ✅ Usa PHP proxy su Hostinger — API key mai esposta al browser

const MAILER_URL   = import.meta.env.VITE_MAILER_URL   as string
const MAILER_TOKEN = import.meta.env.VITE_MAILER_TOKEN as string

interface SendEmailParams {
  to:       string
  subject:  string
  html:     string
  replyTo?: string
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  const { to, subject, html, replyTo } = params

  const res = await fetch(MAILER_URL, {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Mailer-Token':  MAILER_TOKEN,      // ← token leggero, non la API key
    },
    body: JSON.stringify({
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    let errMsg = errText
    try {
      const errJson = JSON.parse(errText)
      errMsg = errJson.error ?? errText
    } catch { /* testo grezzo */ }
    throw new Error(`Errore invio email: ${errMsg}`)
  }
}