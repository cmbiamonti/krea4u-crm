// src/utils/checkTwilioConfig.ts

export function checkTwilioWhatsAppConfig() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 TWILIO WHATSAPP CONFIG CHECK')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN
  const whatsappNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER

  console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : '❌ MISSING')
  console.log('Auth Token:', authToken ? '***CONFIGURED***' : '❌ MISSING')
  console.log('WhatsApp Number:', whatsappNumber || '❌ MISSING')

  console.log('\n✅ Expected WhatsApp Number format:')
  console.log('   whatsapp:+14155238886')
  console.log('\n✅ Your WhatsApp Number:')
  console.log('  ', whatsappNumber || 'NOT SET')

  if (!whatsappNumber) {
    console.log('\n⚠️ WhatsApp number not configured!')
    console.log('1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn')
    console.log('2. Activate WhatsApp Sandbox')
    console.log('3. Copy the number (usually: whatsapp:+14155238886)')
    console.log('4. Add to .env: VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886')
    console.log('5. Restart dev server')
  }

  if (!whatsappNumber?.startsWith('whatsapp:')) {
    console.log('\n⚠️ WhatsApp number format incorrect!')
    console.log('Should start with: whatsapp:')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}