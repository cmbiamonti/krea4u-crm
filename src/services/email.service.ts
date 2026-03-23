// src/services/email.service.ts
// ✅ Hostinger SMTP via PHP mailer.php
// ✅ Sender = utente CRM, Reply-To = email utente, From = noreply@lastanzadellarte.com
// ✅ Soft delete con deleted_at timestamp
// ✅ Archive con archived_at timestamp separato
// ✅ getThreads con filtro folder (inbox/archived/trash/all)

import { supabase } from '@/lib/supabase'
import type {
  EmailMessage,
  SendEmailRequest,
  EmailFilters,
  EmailContact,
  EmailTemplate,
  EmailThread,
} from '@/types/email.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ── Helper type-safe per accesso tabelle ──────────────────────────────────────
const getTable = (tableName: string) =>
  supabase.from(tableName as any) as any

// ── ⚠️ NON leggere import.meta.env a livello di modulo —
//    usare sempre funzioni getter per garantire lettura a runtime ──────────────
const getMailerUrl   = () => import.meta.env.VITE_MAILER_URL   as string | undefined
const getMailerToken = () => import.meta.env.VITE_MAILER_TOKEN as string | undefined

// ── HTML template di default ──────────────────────────────────────────────────
function buildDefaultHtml(opts: {
  senderName:  string
  senderEmail: string
  text:        string
}): string {
  const safe = opts.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;overflow:hidden;
                    box-shadow:0 2px 8px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1F4788,#C55A11);
                     padding:24px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:20px">🎨 Krea4u CRM</h2>
            <p style="color:#fff;margin:6px 0 0;opacity:.8;font-size:12px">
              La Stanza dell'Arte
            </p>
          </td>
        </tr>

        <!-- Mittente -->
        <tr>
          <td style="padding:16px 24px;border-bottom:1px solid #eee">
            <p style="margin:0;color:#888;font-size:11px;
                      text-transform:uppercase;letter-spacing:.5px">
              Messaggio da
            </p>
            <p style="margin:4px 0 0;color:#1F4788;font-weight:700;font-size:15px">
              ${opts.senderName}
            </p>
            <p style="margin:2px 0 0;color:#888;font-size:12px">
              ${opts.senderEmail}
            </p>
          </td>
        </tr>

        <!-- Corpo -->
        <tr>
          <td style="padding:24px">
            <div style="background:#f8f9fa;padding:18px;border-radius:6px;
                        border-left:4px solid #1F4788">
              <p style="margin:0;color:#333;font-size:14px;line-height:1.7">
                ${safe}
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;background:#f8f9fa;
                     border-top:1px solid #eee;text-align:center">
            <p style="margin:0;color:#bbb;font-size:11px">
              © ${year} Krea4u CRM — La Stanza dell'Arte<br>
              <span style="font-size:10px">
                Puoi rispondere direttamente a questa email
              </span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export class EmailService {

  private static readonly TABLES = {
    MESSAGES:  'email_messages',
    CONTACTS:  'email_contacts',
    TEMPLATES: 'email_templates',
  } as const

  // ── Verifica esistenza tabella ──────────────────────────────────────────────
  private static async tableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await getTable(tableName).select('id').limit(1)
      return !error || !['42P01', 'PGRST204'].includes(error?.code ?? '')
    } catch {
      return false
    }
  }

  // ── Firma HTML utente ───────────────────────────────────────────────────────
  private static buildSignatureHtml(userName: string, userEmail: string): string {
    return `
      <br><br>
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb">
        <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6">
          <strong style="color:#374151">${userName}</strong><br>
          <a href="mailto:${userEmail}"
             style="color:#3b82f6;text-decoration:none">${userEmail}</a><br>
          <span style="color:#9ca3af;font-size:12px">
            Krea4u CRM — La Stanza dell'Arte
          </span>
        </p>
      </div>`
  }

  // ── Converti testo in HTML ──────────────────────────────────────────────────
  static textToHtml(text: string): string {
    if (!text?.trim()) return ''
    return text
      .trim()
      .split('\n\n')
      .map(p => {
        const safe = p
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        return `<p style="margin:0 0 12px 0">${safe.replace(/\n/g, '<br>')}</p>`
      })
      .join('')
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SEND EMAIL — via PHP mailer.php su Hostinger
  // ────────────────────────────────────────────────────────────────────────────
  static async sendEmail(request: SendEmailRequest): Promise<EmailMessage> {
    try {

      // ── ✅ Leggi env a runtime ──────────────────────────────────────────────
      const MAILER_URL   = getMailerUrl()
      const MAILER_TOKEN = getMailerToken()

      console.log('=== EMAIL SERVICE DEBUG ===')
      console.log('MAILER_URL:   ', MAILER_URL   ?? '❌ NON CONFIGURATO')
      console.log('MAILER_TOKEN: ', MAILER_TOKEN ? '✅ presente' : '❌ NON CONFIGURATO')
      console.log('===========================')

      if (!MAILER_URL || !MAILER_TOKEN) {
        throw new Error(
          '❌ Mailer non configurato.\n' +
          'Aggiungi nel file .env.local nella root del progetto:\n' +
          'VITE_MAILER_URL=https://krea4u.lastanzadellarte.com/api/mailer.php\n' +
          'VITE_MAILER_TOKEN=krea4u_2024_mailer_secret_xyz\n' +
          'Poi riavvia il dev server con: npm run dev'
        )
      }

      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw new Error(`Session error: ${sessionError.message}`)
      if (!session?.user) throw new Error('Non autenticato. Effettua il login.')

      const currentUser = session.user

      if (!request.to?.length)        throw new Error('Almeno un destinatario è obbligatorio')
      if (!request.subject?.trim())   throw new Error("L'oggetto è obbligatorio")
      if (!request.body_text?.trim()) throw new Error('Il corpo del messaggio è obbligatorio')

      const senderUserId = currentUser.id
      const senderName   =
        request.sender_name                                              ??
        (currentUser.user_metadata?.full_name    as string | undefined) ??
        (currentUser.user_metadata?.curator_name as string | undefined) ??
        (currentUser.user_metadata?.name         as string | undefined) ??
        currentUser.email?.split('@')[0]                                 ??
        'Utente'
      const senderEmail = currentUser.email ?? ''

      console.log('📧 Sending email as:', { senderName, senderEmail })

      const htmlBase = request.html
        ?? buildDefaultHtml({ senderName, senderEmail, text: request.body_text })

      const htmlWithSignature =
        htmlBase + this.buildSignatureHtml(senderName, senderEmail)

      const threadId = request.thread_id ?? crypto.randomUUID()

      const toList = (Array.isArray(request.to) ? request.to : [request.to])
        .map(e => e.trim())
        .filter(e => e.includes('@'))

      if (toList.length === 0) throw new Error('Nessun indirizzo email valido')

      const payload = {
        to:            toList,
        cc:            request.cc  ?? [],
        bcc:           request.bcc ?? [],
        subject:       request.subject,
        html:          htmlWithSignature,
        sender_name:   senderName,
        reply_to:      request.reply_to ?? senderEmail,
        reply_to_name: senderName,
      }

      console.log('📤 POST →', MAILER_URL)
      console.log('   to:       ', toList.join(', '))
      console.log('   reply_to: ', payload.reply_to)

      const controller = new AbortController()
      const timeoutId  = setTimeout(() => controller.abort(), 20_000)

      let response: Response

      try {
        response = await fetch(MAILER_URL, {
          method:  'POST',
          signal:  controller.signal,
          headers: {
            'Content-Type':   'application/json',
            'X-Mailer-Token': MAILER_TOKEN,
          },
          body: JSON.stringify(payload),
        })
      } catch (fetchErr: any) {
        if (fetchErr.name === 'AbortError') {
          throw new Error('Timeout: il server mailer non risponde dopo 20 secondi')
        }
        console.error('❌ fetch() fallito:', fetchErr.message)
        throw new Error(
          `Impossibile contattare il server email (${fetchErr.message}).\n` +
          `URL: ${MAILER_URL}\n` +
          `Verifica che il file .htaccess in /api/ sia presente e che il CORS sia abilitato.`
        )
      } finally {
        clearTimeout(timeoutId)
      }

      const responseData = await response.json().catch(() => ({
        error: `HTTP ${response.status} — risposta non JSON`
      }))

      console.log('📬 Mailer response:', response.status, responseData)

      if (!response.ok) {
        throw new Error(
          `Invio fallito (HTTP ${response.status}): ${
            responseData.error ?? responseData.details ?? response.statusText
          }`
        )
      }

      console.log('✅ Email inviata via Hostinger PHP:', responseData)

      const messageData = {
        sender_user_id: senderUserId,
        sender_email:   senderEmail,
        sender_name:    senderName,
        to_emails:      toList,
        cc_emails:      request.cc  ?? [],
        bcc_emails:     request.bcc ?? [],
        subject:        request.subject,
        body_text:      request.body_text,
        body_html:      htmlWithSignature,
        reply_to:       payload.reply_to,
        thread_id:      threadId,
        status:         'sent',
        direction:      'outbound',
        sent_at:        new Date().toISOString(),
        deleted_at:     null,
        archived_at:    null,
      }

      if (await this.tableExists(this.TABLES.MESSAGES)) {
        const { data: savedMessage, error: dbError } =
          await getTable(this.TABLES.MESSAGES)
            .insert(messageData)
            .select()
            .single()

        if (dbError) {
          console.warn('⚠️ DB save error (non-blocking):', dbError.message)
        } else {
          console.log('✅ Email salvata in DB:', savedMessage.id)
          return savedMessage as unknown as EmailMessage
        }
      }

      return {
        id:         crypto.randomUUID(),
        ...messageData,
        created_at: new Date().toISOString(),
      } as unknown as EmailMessage

    } catch (error: any) {
      console.error('❌ sendEmail error:', error)

      if (error.message?.includes('Invalid Refresh Token')) {
        await supabase.auth.signOut()
        throw new Error('Sessione scaduta. Effettua nuovamente il login.')
      }

      throw error
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET EMAILS — con filtro folder
  // ────────────────────────────────────────────────────────────────────────────
  static async getEmails(filters?: EmailFilters): Promise<EmailMessage[]> {
    if (!(await this.tableExists(this.TABLES.MESSAGES))) {
      console.warn('⚠️ email_messages table does not exist')
      return []
    }

    try {
      let query = getTable(this.TABLES.MESSAGES)
        .select('*')
        .order('created_at', { ascending: false })

      // ✅ Filtro folder
      const folder = (filters as any)?.folder ?? 'inbox'
      if (folder === 'inbox') {
        query = query.is('deleted_at', null).is('archived_at', null)
      } else if (folder === 'archived') {
        query = query.is('deleted_at', null).not('archived_at', 'is', null)
      } else if (folder === 'trash') {
        query = query.not('deleted_at', 'is', null)
      }
      // folder === 'all' → nessun filtro stato

      if (filters?.direction) query = query.eq('direction', filters.direction)
      if (filters?.status)    query = query.eq('status',    filters.status)
      if (filters?.date_from) query = query.gte('created_at', filters.date_from)
      if (filters?.date_to)   query = query.lte('created_at', filters.date_to)

      if (filters?.search?.trim()) {
        const term = filters.search.trim()
        query = query.or(
          `subject.ilike.%${term}%,body_text.ilike.%${term}%,sender_email.ilike.%${term}%`
        )
      }

      query = query.limit(filters?.limit ?? 100)

      const { data, error } = await query
      if (error) { console.error('❌ getEmails error:', error); return [] }
      return (data ?? []) as unknown as EmailMessage[]

    } catch (error) {
      console.error('❌ getEmails exception:', error)
      return []
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET SINGLE EMAIL
  // ────────────────────────────────────────────────────────────────────────────
  static async getEmail(id: string): Promise<EmailMessage | null> {
    if (!id?.trim()) throw new Error('Email ID obbligatorio')

    try {
      const { data, error } = await getTable(this.TABLES.MESSAGES)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) { console.error('❌ getEmail error:', error); return null }
      return (data as unknown as EmailMessage) ?? null
    } catch (error) {
      console.error('❌ getEmail exception:', error)
      return null
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET THREADS — con filtro folder
  // ────────────────────────────────────────────────────────────────────────────
  static async getThreads(
    limit  = 50,
    folder : 'inbox' | 'archived' | 'trash' | 'all' = 'inbox'
  ): Promise<EmailThread[]> {
    if (!(await this.tableExists(this.TABLES.MESSAGES))) {
      console.warn('⚠️ email_messages table does not exist')
      return []
    }

    try {
      let query = getTable(this.TABLES.MESSAGES)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit * 5)

      // ✅ Filtro per folder
      if (folder === 'inbox') {
        // Solo messaggi attivi: non eliminati E non archiviati
        query = query
          .is('deleted_at',  null)
          .is('archived_at', null)
      } else if (folder === 'archived') {
        // Solo archiviati: non eliminati MA con archived_at valorizzato
        query = query
          .is('deleted_at', null)
          .not('archived_at', 'is', null)
      } else if (folder === 'trash') {
        // Solo eliminati: con deleted_at valorizzato
        query = query
          .not('deleted_at', 'is', null)
      }
      // folder === 'all' → nessun filtro stato

      const { data: rawMessages, error } = await query

      if (error) { console.error('❌ getThreads error:', error); return [] }

      const messages = (rawMessages ?? []) as unknown as EmailMessage[]
      if (!messages.length) return []

      const threadsMap = new Map<string, EmailMessage[]>()
      messages.forEach(msg => {
        const tid = msg.thread_id ?? msg.id
        threadsMap.set(tid, [...(threadsMap.get(tid) ?? []), msg])
      })

      const threads: EmailThread[] = Array.from(threadsMap.entries()).map(
        ([threadId, msgs]) => {
          msgs.sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )

          const participants = new Set<string>()
          msgs.forEach(msg => {
            if (msg.sender_email) participants.add(msg.sender_email)
            msg.to_emails?.forEach(e => participants.add(e))
            msg.cc_emails?.forEach(e => participants.add(e))
          })

          const lastMessage = msgs[msgs.length - 1]

          return {
            thread_id:       threadId,
            subject:         msgs[0].subject ?? '(Nessun oggetto)',
            participants:    Array.from(participants),
            message_count:   msgs.length,
            last_message_at: lastMessage.created_at,
            messages:        msgs,
          }
        }
      )

      return threads
        .sort(
          (a, b) =>
            new Date(b.last_message_at).getTime() -
            new Date(a.last_message_at).getTime()
        )
        .slice(0, limit)

    } catch (error) {
      console.error('❌ getThreads exception:', error)
      return []
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GET THREAD singolo
  // ────────────────────────────────────────────────────────────────────────────
  static async getThread(threadId: string): Promise<EmailThread | null> {
    if (!threadId?.trim()) throw new Error('Thread ID obbligatorio')
    if (!(await this.tableExists(this.TABLES.MESSAGES))) return null

    try {
      const { data: rawMessages, error } = await getTable(this.TABLES.MESSAGES)
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) { console.error('❌ getThread error:', error); return null }

      const messages = (rawMessages ?? []) as unknown as EmailMessage[]
      if (!messages.length) return null

      const participants = new Set<string>()
      messages.forEach(msg => {
        if (msg.sender_email) participants.add(msg.sender_email)
        msg.to_emails?.forEach(e => participants.add(e))
        msg.cc_emails?.forEach(e => participants.add(e))
      })

      const lastMessage = messages[messages.length - 1]

      return {
        thread_id:       threadId,
        subject:         messages[0].subject ?? '(Nessun oggetto)',
        participants:    Array.from(participants),
        message_count:   messages.length,
        last_message_at: lastMessage.created_at,
        messages,
      }
    } catch (error) {
      console.error('❌ getThread exception:', error)
      return null
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE — soft delete con timestamp
  // ────────────────────────────────────────────────────────────────────────────
  static async deleteEmail(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Email ID obbligatorio')

    console.log('🗑️ deleteEmail chiamato per id:', id)

    // ── Prima leggi lo stato attuale ──────────────────────────────────────────
    const { data: current, error: readError } = await getTable(this.TABLES.MESSAGES)
      .select('id, deleted_at, archived_at')
      .eq('id', id)
      .single()

    console.log('📋 Stato attuale:', current)
    console.log('📋 Read error:', readError)

    if (readError) throw new Error(`Lettura fallita: ${readError.message}`)

    // ── Esegui update ─────────────────────────────────────────────────────────
    const now = new Date().toISOString()
    console.log('⏰ Timestamp da scrivere:', now)

    const { data: updated, error: updateError } = await getTable(this.TABLES.MESSAGES)
      .update({
        deleted_at:  now,
        archived_at: null,
      })
      .eq('id', id)
      .select('id, deleted_at, archived_at')

    console.log('✅ Dopo update:', updated)
    console.log('❌ Update error:', updateError)

    if (updateError) throw new Error(`Eliminazione fallita: ${updateError.message}`)

    // ── Verifica che il dato sia stato scritto ────────────────────────────────
    const { data: verify } = await getTable(this.TABLES.MESSAGES)
      .select('id, deleted_at, archived_at')
      .eq('id', id)
      .single()

    console.log('🔍 Verifica post-update:', verify)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE PERMANENTLY — hard delete (rimuove la riga dal DB)
  // ────────────────────────────────────────────────────────────────────────────
  static async deleteEmailPermanently(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Email ID obbligatorio')

    const { error } = await getTable(this.TABLES.MESSAGES)
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Eliminazione definitiva fallita: ${error.message}`)

    console.log(`💀 Email ${id} permanently deleted`)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ARCHIVE — soft archive con timestamp
  // ────────────────────────────────────────────────────────────────────────────
  static async archiveEmail(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Email ID obbligatorio')

    console.log('📦 archiveEmail chiamato per id:', id)

    const now = new Date().toISOString()

    const { data: updated, error: updateError } = await getTable(this.TABLES.MESSAGES)
      .update({
        archived_at: now,
        deleted_at:  null,
      })
      .eq('id', id)
      .select('id, deleted_at, archived_at')

    console.log('✅ Dopo archive update:', updated)
    console.log('❌ Archive error:', updateError)

    if (updateError) throw new Error(`Archiviazione fallita: ${updateError.message}`)

    const { data: verify } = await getTable(this.TABLES.MESSAGES)
      .select('id, deleted_at, archived_at')
      .eq('id', id)
      .single()

    console.log('🔍 Verifica post-archive:', verify)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RESTORE — ripristina da archivio o cestino → torna in inbox
  // ────────────────────────────────────────────────────────────────────────────
  static async restoreEmail(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Email ID obbligatorio')

    const { error } = await getTable(this.TABLES.MESSAGES)
      .update({
        deleted_at:  null,
        archived_at: null,
      })
      .eq('id', id)

    if (error) throw new Error(`Ripristino fallito: ${error.message}`)

    console.log(`♻️ Email ${id} restored to inbox`)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MARK AS READ
  // ────────────────────────────────────────────────────────────────────────────
  static async markAsRead(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Email ID obbligatorio')
    const { error } = await getTable(this.TABLES.MESSAGES)
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .is('read_at', null)
    if (error) console.error('❌ markAsRead error:', error)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CONTACTS
  // ────────────────────────────────────────────────────────────────────────────
  static async getContacts(search?: string, limit = 50): Promise<EmailContact[]> {
    if (!(await this.tableExists(this.TABLES.CONTACTS))) {
      console.warn('⚠️ email_contacts table does not exist')
      return []
    }

    try {
      let query = getTable(this.TABLES.CONTACTS)
        .select('*')
        .order('contact_count', { ascending: false })
        .limit(limit)

      if (search?.trim()) {
        const term = search.trim()
        query = query.or(`email.ilike.%${term}%,name.ilike.%${term}%`)
      }

      const { data, error } = await query
      if (error) { console.error('❌ getContacts error:', error); return [] }
      return (data ?? []) as unknown as EmailContact[]
    } catch (error) {
      console.error('❌ getContacts exception:', error)
      return []
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TEMPLATES
  // ────────────────────────────────────────────────────────────────────────────
  static async getTemplates(): Promise<EmailTemplate[]> {
    if (!(await this.tableExists(this.TABLES.TEMPLATES))) {
      console.warn('⚠️ email_templates table does not exist')
      return []
    }

    try {
      const { data, error } = await getTable(this.TABLES.TEMPLATES)
        .select('*')
        .order('name')
      if (error) { console.error('❌ getTemplates error:', error); return [] }
      return (data ?? []) as unknown as EmailTemplate[]
    } catch (error) {
      console.error('❌ getTemplates exception:', error)
      return []
    }
  }

  static async saveTemplate(
    template: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<EmailTemplate> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Non autenticato')
    if (!template.name?.trim()) throw new Error('Nome template obbligatorio')

    const { data, error } = await getTable(this.TABLES.TEMPLATES)
      .insert({ ...template, user_id: user.id })
      .select()
      .single()

    if (error) throw new Error(`Salvataggio template fallito: ${error.message}`)
    return data as unknown as EmailTemplate
  }

  static async updateTemplate(
    id: string,
    updates: Partial<Omit<EmailTemplate, 'id' | 'user_id' | 'created_at'>>
  ): Promise<EmailTemplate> {
    if (!id?.trim()) throw new Error('Template ID obbligatorio')

    const { data, error } = await getTable(this.TABLES.TEMPLATES)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Aggiornamento template fallito: ${error.message}`)
    return data as unknown as EmailTemplate
  }

  static async deleteTemplate(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('Template ID obbligatorio')
    const { error } = await getTable(this.TABLES.TEMPLATES).delete().eq('id', id)
    if (error) throw new Error(`Eliminazione template fallita: ${error.message}`)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STATISTICHE — esclude eliminati e archiviati dal conteggio inbox
  // ────────────────────────────────────────────────────────────────────────────
  static async getStats(): Promise<{
    total: number; sent: number; received: number; unread: number;
    archived: number; trash: number;
  }> {
    try {
      const [
        { count: total    },
        { count: sent     },
        { count: received },
        { count: unread   },
        { count: archived },
        { count: trash    },
      ] = await Promise.all([
        // Totale inbox (attivi)
        getTable(this.TABLES.MESSAGES)
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null)
          .is('archived_at', null),
        // Inviati (attivi)
        getTable(this.TABLES.MESSAGES)
          .select('*', { count: 'exact', head: true })
          .eq('direction', 'outbound')
          .is('deleted_at', null)
          .is('archived_at', null),
        // Ricevuti (attivi)
        getTable(this.TABLES.MESSAGES)
          .select('*', { count: 'exact', head: true })
          .eq('direction', 'inbound')
          .is('deleted_at', null)
          .is('archived_at', null),
        // Da leggere (attivi)
        getTable(this.TABLES.MESSAGES)
          .select('*', { count: 'exact', head: true })
          .eq('direction', 'inbound')
          .is('read_at',    null)
          .is('deleted_at', null)
          .is('archived_at', null),
        // Archiviati
        getTable(this.TABLES.MESSAGES)
          .select('*', { count: 'exact', head: true })
          .is('deleted_at', null)
          .not('archived_at', 'is', null),
        // Cestino
        getTable(this.TABLES.MESSAGES)
          .select('*', { count: 'exact', head: true })
          .not('deleted_at', 'is', null),
      ])

      return {
        total:    total    ?? 0,
        sent:     sent     ?? 0,
        received: received ?? 0,
        unread:   unread   ?? 0,
        archived: archived ?? 0,
        trash:    trash    ?? 0,
      }
    } catch (error) {
      console.error('❌ getStats error:', error)
      return { total: 0, sent: 0, received: 0, unread: 0, archived: 0, trash: 0 }
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // REALTIME
  // ────────────────────────────────────────────────────────────────────────────
  static subscribeToEmails(
    callback: (email: EmailMessage) => void,
    onError?:  (error: Error) => void
  ): RealtimeChannel {
    return supabase
      .channel('email-messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'email_messages' },
        payload => {
          try {
            callback(payload.new as EmailMessage)
          } catch (err) {
            console.error('❌ Subscription callback error:', err)
            onError?.(err instanceof Error ? err : new Error(String(err)))
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Subscription error:', err)
          onError?.(new Error(`Subscription error: ${err?.message ?? 'Unknown'}`))
        }
      })
  }

  static async unsubscribeFromEmails(channel: RealtimeChannel): Promise<void> {
    await supabase.removeChannel(channel)
  }
}