// supabase/functions/sendgrid-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const events = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    console.log('📬 Received', events.length, 'webhook events')

    for (const event of events) {
      // Trova il messaggio tramite sendgrid_message_id
      const { data: message } = await supabase
        .from('email_messages')
        .select('id')
        .eq('sendgrid_message_id', event.sg_message_id)
        .single()

      if (!message) {
        console.warn('⚠️ Message not found:', event.sg_message_id)
        continue
      }

      // Salva evento
      await supabase
        .from('email_events')
        .insert({
          email_message_id: message.id,
          event_type: event.event,
          sendgrid_event_id: event.sg_event_id,
          timestamp: new Date(event.timestamp * 1000).toISOString(),
          email: event.email,
          useragent: event.useragent,
          ip: event.ip,
          url: event.url,
          reason: event.reason,
          metadata: event
        })

      // Aggiorna il messaggio principale
      if (event.event === 'open') {
        await supabase
          .from('email_messages')
          .update({ 
            opened_at: new Date(event.timestamp * 1000).toISOString(),
            status: 'delivered'
          })
          .eq('id', message.id)
          .is('opened_at', null) // Solo la prima apertura
      } else if (event.event === 'delivered') {
        await supabase
          .from('email_messages')
          .update({ 
            delivered_at: new Date(event.timestamp * 1000).toISOString(),
            status: 'delivered'
          })
          .eq('id', message.id)
      } else if (event.event === 'bounce' || event.event === 'dropped') {
        await supabase
          .from('email_messages')
          .update({ status: event.event === 'bounce' ? 'bounced' : 'failed' })
          .eq('id', message.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})