// supabase/functions/send-email/index.ts
// ✅ Hostinger SMTP — mittente fisso, reply-to = email utente registrato

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Secrets (configurati su Supabase Dashboard → Settings → Edge Functions → Secrets) ──
const SMTP_HOST          = Deno.env.get('SMTP_HOST')          ?? 'smtp.hostinger.com'
const SMTP_PORT          = parseInt(Deno.env.get('SMTP_PORT') ?? '465', 10)
const SMTP_USER          = Deno.env.get('SMTP_USER')          ?? ''   // noreply@lastanzadellarte.com
const SMTP_PASS          = Deno.env.get('SMTP_PASS')          ?? ''
const SMTP_FROM_EMAIL    = Deno.env.get('SMTP_FROM_EMAIL')    ?? 'noreply@lastanzadellarte.com'
const SMTP_FROM_NAME     = Deno.env.get('SMTP_FROM_NAME')     ?? "Krea4u CRM"
const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')       ?? ''
const SUPABASE_SERVICE   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Interfaccia richiesta ─────────────────────────────────────────────────────
interface EmailRequest {
  to:               string | string[]
  subject:          string
  html?:            string
  text?:            string
  cc?:              string[]
  bcc?:             string[]
  // ✅ reply_to = email dell'utente registrato che invia
  reply_to?:        string
  reply_to_name?:   string
  // Metadati per salvataggio DB
  sender_user_id?:  string
  sender_name?:     string   // nome visualizzato del mittente
  thread_id?:       string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const b64 = (s: string): string => btoa(unescape(encodeURIComponent(s)))

// Legge una riga dalla connessione TCP
async function readLine(
  reader: ReadableStreamDefaultReader<Uint8Array>
): Promise<string> {
  const dec = new TextDecoder()
  let line  = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    line += dec.decode(value)
    if (line.includes('\n')) break
  }
  return line.trim()
}

// ── Core SMTP sender ──────────────────────────────────────────────────────────
async function sendViaSMTP(opts: {
  to:          string[]
  cc?:         string[]
  bcc?:        string[]
  subject:     string
  html?:       string
  text?:       string
  fromEmail:   string
  fromName:    string
  replyTo?:    string
  replyToName?: string
}): Promise<void> {

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP_USER e SMTP_PASS non configurati nei secrets Supabase')
  }

  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const date     = new Date().toUTCString()

  // ── Costruisce header From con nome ──────────────────────────────────────
  const fromHeader    = opts.fromName
    ? `=?UTF-8?B?${b64(opts.fromName)}?= <${opts.fromEmail}>`
    : opts.fromEmail

  // ── Reply-To: email dell'utente CRM che invia ─────────────────────────────
  const replyToHeader = opts.replyTo
    ? `Reply-To: ${opts.replyToName
        ? `=?UTF-8?B?${b64(opts.replyToName)}?= <${opts.replyTo}>`
        : opts.replyTo}\r\n`
    : ''

  const toHeader      = opts.to.join(', ')
  const ccHeader      = opts.cc?.length  ? `CC: ${opts.cc.join(', ')}\r\n`  : ''
  const subjectHeader = `=?UTF-8?B?${b64(opts.subject)}?=`

  // ── Corpo MIME ────────────────────────────────────────────────────────────
  let mimeBody: string

  if (opts.html && opts.text) {
    mimeBody = [
      `MIME-Version: 1.0`,
      `Date: ${date}`,
      `From: ${fromHeader}`,
      `To: ${toHeader}`,
      ccHeader.trimEnd(),
      replyToHeader.trimEnd(),
      `Subject: ${subjectHeader}`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64(opts.text),
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64(opts.html),
      ``,
      `--${boundary}--`,
    ].filter(l => l !== null && l !== undefined).join('\r\n')
  } else if (opts.html) {
    mimeBody = [
      `MIME-Version: 1.0`,
      `Date: ${date}`,
      `From: ${fromHeader}`,
      `To: ${toHeader}`,
      ccHeader.trimEnd(),
      replyToHeader.trimEnd(),
      `Subject: ${subjectHeader}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64(opts.html),
    ].filter(Boolean).join('\r\n')
  } else {
    mimeBody = [
      `MIME-Version: 1.0`,
      `Date: ${date}`,
      `From: ${fromHeader}`,
      `To: ${toHeader}`,
      ccHeader.trimEnd(),
      replyToHeader.trimEnd(),
      `Subject: ${subjectHeader}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64(opts.text ?? ''),
    ].filter(Boolean).join('\r\n')
  }

  // ── Connessione TLS diretta (porta 465 = SMTPS) ───────────────────────────
  const conn    = await Deno.connectTls({ hostname: SMTP_HOST, port: SMTP_PORT })
  const enc     = new TextEncoder()
  const writer  = conn.writable.getWriter()
  const reader  = conn.readable.getReader()

  const send = async (cmd: string) => {
    const preview = cmd.length > 60 ? cmd.substring(0, 60) + '…' : cmd
    console.log(`→ SMTP: ${preview}`)
    await writer.write(enc.encode(cmd + '\r\n'))
  }

  const expect = async (code: number): Promise<string> => {
    // Legge righe finché non trova la riga finale del blocco (es. "250 OK")
    let last = ''
    while (true) {
      const line = await readLine(reader)
      console.log(`← SMTP: ${line}`)
      last = line
      // Riga finale: "XXX " (spazio dopo codice) — riga intermedia: "XXX-"
      if (/^\d{3} /.test(line)) {
        const got = parseInt(line.substring(0, 3), 10)
        if (got !== code) throw new Error(`SMTP ${got}: ${line}`)
        break
      }
    }
    return last
  }

  try {
    await expect(220)                          // Greeting
    await send(`EHLO ${SMTP_HOST}`)
    await expect(250)
    await send('AUTH LOGIN')
    await expect(334)
    await send(b64(SMTP_USER))
    await expect(334)
    await send(b64(SMTP_PASS))
    await expect(235)                          // Auth OK

    await send(`MAIL FROM:<${opts.fromEmail}>`)
    await expect(250)

    // RCPT TO per ogni destinatario (to + cc + bcc)
    const allRecipients = [
      ...opts.to,
      ...(opts.cc  ?? []),
      ...(opts.bcc ?? []),
    ]
    for (const addr of allRecipients) {
      await send(`RCPT TO:<${addr}>`)
      await expect(250)
    }

    await send('DATA')
    await expect(354)
    // Il corpo termina con CRLF.CRLF
    await send(mimeBody + '\r\n.')
    await expect(250)                          // Message accepted

    await send('QUIT')
  } finally {
    try { writer.releaseLock() }  catch { /* ok */ }
    try { reader.releaseLock() }  catch { /* ok */ }
    try { conn.close() }          catch { /* ok */ }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// HANDLER
// ══════════════════════════════════════════════════════════════════════════════
serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // ── Validazione secrets ─────────────────────────────────────────────────
    if (!SMTP_USER || !SMTP_PASS) {
      return new Response(
        JSON.stringify({
          error: 'SMTP non configurato. Aggiungi SMTP_USER e SMTP_PASS nei Secrets Supabase.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailData: EmailRequest = await req.json()

    // ── Validazione input ───────────────────────────────────────────────────
    if (!emailData.to || !emailData.subject) {
      return new Response(
        JSON.stringify({ error: 'Campi obbligatori mancanti: to, subject' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!emailData.html && !emailData.text) {
      return new Response(
        JSON.stringify({ error: 'Corpo email mancante: fornire html o text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Normalizza destinatari ──────────────────────────────────────────────
    const toList = (Array.isArray(emailData.to) ? emailData.to : [emailData.to])
      .map(e => e.trim())
      .filter(e => e.includes('@'))

    if (toList.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nessun indirizzo email valido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ✅ Nome visualizzato: preferisce sender_name, poi username dalla reply_to
    const displayName = emailData.sender_name
      ?? (emailData.reply_to
          ? emailData.reply_to.split('@')[0]
          : SMTP_FROM_NAME)

    // ✅ From: "Nome Utente via Krea4u CRM <noreply@lastanzadellarte.com>"
    //    Reply-To: email reale dell'utente
    const fromName = emailData.reply_to
      ? `${displayName} via ${SMTP_FROM_NAME}`
      : SMTP_FROM_NAME

    console.log(`📧 Sending email`)
    console.log(`   To:       ${toList.join(', ')}`)
    console.log(`   Subject:  ${emailData.subject}`)
    console.log(`   From:     ${fromName} <${SMTP_FROM_EMAIL}>`)
    console.log(`   Reply-To: ${emailData.reply_to ?? '(none)'}`)

    // ── Invia ───────────────────────────────────────────────────────────────
    await sendViaSMTP({
      to:           toList,
      cc:           emailData.cc,
      bcc:          emailData.bcc,
      subject:      emailData.subject,
      html:         emailData.html,
      text:         emailData.text,
      fromEmail:    SMTP_FROM_EMAIL,
      fromName:     fromName,
      replyTo:      emailData.reply_to,
      replyToName:  emailData.reply_to_name ?? displayName,
    })

    // ── Salva in DB (non bloccante) ─────────────────────────────────────────
    const threadId = emailData.thread_id ?? crypto.randomUUID()
    let savedId: string | null = null

    if (SUPABASE_URL && SUPABASE_SERVICE) {
      try {
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE)
        const { data, error: dbErr } = await sb
          .from('email_messages')
          .insert({
            sender_user_id:  emailData.sender_user_id ?? null,
            sender_email:    emailData.reply_to ?? SMTP_FROM_EMAIL,
            sender_name:     displayName,
            to_emails:       toList,
            cc_emails:       emailData.cc  ?? [],
            bcc_emails:      emailData.bcc ?? [],
            subject:         emailData.subject,
            body_text:       emailData.text ?? '',
            body_html:       emailData.html ?? '',
            thread_id:       threadId,
            status:          'sent',
            direction:       'outbound',
            sent_at:         new Date().toISOString(),
          })
          .select('id')
          .single()

        if (dbErr) {
          console.warn('⚠️ DB save error (non-blocking):', dbErr.message)
        } else {
          savedId = data?.id ?? null
          console.log('✅ Email saved to DB:', savedId)
        }
      } catch (dbEx: any) {
        console.warn('⚠️ DB exception (non-blocking):', dbEx.message)
      }
    }

    return new Response(
      JSON.stringify({
        success:   true,
        message:   'Email inviata con successo',
        id:        savedId,
        thread_id: threadId,
        recipients: toList,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ send-email error:', error)
    return new Response(
      JSON.stringify({
        error:  error.message ?? 'Errore interno',
        detail: 'Controlla i log su Supabase Dashboard → Edge Functions → send-email',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})