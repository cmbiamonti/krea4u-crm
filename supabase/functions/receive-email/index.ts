// supabase/functions/receive-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface InboundEmail {
  from: string
  to: string[]
  cc?: string[]
  subject: string
  text: string
  html?: string
  headers: Record<string, string>
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📨 Received inbound email webhook')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Parse email data from SendGrid Inbound Parse
    const formData = await req.formData()
    
    const from = formData.get('from') as string
    const to = formData.get('to') as string
    const cc = formData.get('cc') as string | null
    const subject = formData.get('subject') as string
    const text = formData.get('text') as string
    const html = formData.get('html') as string | null
    const headers = formData.get('headers') as string

    console.log('📧 Email from:', from)
    console.log('📧 Email to:', to)
    console.log('📧 Subject:', subject)

    if (!from || !to || !subject) {
      throw new Error('Missing required email fields')
    }

    // Parse headers per trovare thread_id e message_id
    const parsedHeaders = headers ? JSON.parse(headers) : {}
    const inReplyTo = parsedHeaders['In-Reply-To'] || parsedHeaders['in-reply-to']
    const references = parsedHeaders['References'] || parsedHeaders['references']
    const messageId = parsedHeaders['Message-ID'] || parsedHeaders['message-id']

    // Determina thread_id
    let threadId: string | null = null

    // Cerca nelle email esistenti usando message-id di riferimento
    if (inReplyTo) {
      console.log('🔍 Looking for thread by In-Reply-To:', inReplyTo)
      const { data: existingEmail } = await supabase
        .from('email_messages')
        .select('thread_id')
        .eq('sendgrid_message_id', inReplyTo)
        .maybeSingle()

      if (existingEmail?.thread_id) {
        threadId = existingEmail.thread_id
        console.log('✅ Found existing thread:', threadId)
      }
    }

    // Se non trovato, cerca nei References
    if (!threadId && references) {
      const refIds = references.split(/\s+/)
      for (const refId of refIds) {
        const { data: existingEmail } = await supabase
          .from('email_messages')
          .select('thread_id')
          .eq('sendgrid_message_id', refId)
          .maybeSingle()

        if (existingEmail?.thread_id) {
          threadId = existingEmail.thread_id
          console.log('✅ Found thread from References:', threadId)
          break
        }
      }
    }

    // Se ancora non trovato, crea nuovo thread
    if (!threadId) {
      threadId = crypto.randomUUID()
      console.log('🆕 Creating new thread:', threadId)
    }

    // Salva email nel database
    const { data: savedEmail, error: dbError } = await supabase
      .from('email_messages')
      .insert({
        sender_email: from,
        to_emails: to.split(',').map((e: string) => e.trim()),
        cc_emails: cc ? cc.split(',').map((e: string) => e.trim()) : [],
        subject: subject,
        body_text: text,
        body_html: html,
        sendgrid_message_id: messageId,
        thread_id: threadId,
        status: 'received',
        direction: 'inbound',
        received_at: new Date().toISOString(),
        headers: parsedHeaders,
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      throw dbError
    }

    console.log('✅ Email saved successfully:', savedEmail.id)

    // TODO: Opzionale - Invia notifica agli utenti destinatari
    // TODO: Opzionale - Processa attachments

    return new Response(
      JSON.stringify({ 
        success: true,
        message_id: savedEmail.id,
        thread_id: threadId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: unknown) {
    console.error('❌ Error processing inbound email:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        stack: errorStack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})