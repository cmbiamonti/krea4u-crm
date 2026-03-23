// src/pages/Support.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Headphones,
  Mail,
  MessageSquare,
  BookOpen,
  ExternalLink,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { EmailService } from '@/services/email.service'

// ── Indirizzo di destinazione richieste supporto ──────────────────────────────
const SUPPORT_EMAIL = 'supporto@lastanzadellarte.com'

export default function Support() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name:     user?.user_metadata?.first_name || '',
    email:    user?.email || '',
    subject:  '',
    message:  '',
    priority: 'normal' as 'low' | 'normal' | 'high',
  })

  // ── Etichette priorità ────────────────────────────────────────────────────
  const priorityLabels = {
    low:    '🟢 Bassa',
    normal: '🟡 Normale',
    high:   '🔴 Alta',
  }

  const priorityColors = {
    low:    'bg-gray-600 hover:bg-gray-700',
    normal: 'bg-blue-600 hover:bg-blue-700',
    high:   'bg-red-600 hover:bg-red-700',
  }

  // ── Costruisce l'HTML della email di supporto ─────────────────────────────
  const buildSupportEmailHtml = (): string => {
    const year = new Date().getFullYear()
    const now  = new Date().toLocaleString('it-IT')

    const priorityBadgeColor = {
      low:    '#6b7280',
      normal: '#2563eb',
      high:   '#dc2626',
    }[formData.priority]

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
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
            <h2 style="color:#fff;margin:0;font-size:20px">
              🎨 Krea4u CRM — Richiesta di Supporto
            </h2>
            <p style="color:#fff;margin:6px 0 0;opacity:.8;font-size:12px">
              La Stanza dell'Arte
            </p>
          </td>
        </tr>

        <!-- Badge priorità -->
        <tr>
          <td style="padding:16px 24px;border-bottom:1px solid #eee;
                     background:#f8f9fa">
            <span style="display:inline-block;padding:4px 12px;border-radius:20px;
                         background:${priorityBadgeColor};color:#fff;
                         font-size:12px;font-weight:700">
              Priorità: ${priorityLabels[formData.priority]}
            </span>
            <span style="margin-left:12px;color:#888;font-size:12px">
              Ricevuta il ${now}
            </span>
          </td>
        </tr>

        <!-- Dati mittente -->
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #eee">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:12px">
                  <p style="margin:0;color:#888;font-size:11px;
                            text-transform:uppercase;letter-spacing:.5px">
                    Nome
                  </p>
                  <p style="margin:4px 0 0;color:#1F4788;font-weight:700;
                            font-size:15px">
                    ${formData.name || 'Non specificato'}
                  </p>
                </td>
                <td width="50%">
                  <p style="margin:0;color:#888;font-size:11px;
                            text-transform:uppercase;letter-spacing:.5px">
                    Email
                  </p>
                  <p style="margin:4px 0 0;font-size:14px">
                    <a href="mailto:${formData.email}"
                       style="color:#2563eb;text-decoration:none">
                      ${formData.email}
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Oggetto -->
        <tr>
          <td style="padding:16px 24px;border-bottom:1px solid #eee">
            <p style="margin:0;color:#888;font-size:11px;
                      text-transform:uppercase;letter-spacing:.5px">
              Oggetto
            </p>
            <p style="margin:6px 0 0;color:#111;font-size:16px;font-weight:600">
              ${formData.subject
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}
            </p>
          </td>
        </tr>

        <!-- Messaggio -->
        <tr>
          <td style="padding:24px">
            <p style="margin:0 0 12px;color:#888;font-size:11px;
                      text-transform:uppercase;letter-spacing:.5px">
              Messaggio
            </p>
            <div style="background:#f8f9fa;padding:18px;border-radius:6px;
                        border-left:4px solid #1F4788">
              <p style="margin:0;color:#333;font-size:14px;line-height:1.8;
                        white-space:pre-wrap">
                ${formData.message
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')}
              </p>
            </div>
          </td>
        </tr>

        <!-- Info utente autenticato -->
        ${user ? `
        <tr>
          <td style="padding:16px 24px;background:#fffbeb;
                     border-top:1px solid #fde68a">
            <p style="margin:0;color:#92400e;font-size:12px">
              🔐 <strong>User ID Supabase:</strong> ${user.id}<br>
              📧 <strong>Email account:</strong> ${user.email}
            </p>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;background:#f8f9fa;
                     border-top:1px solid #eee;text-align:center">
            <p style="margin:0;color:#bbb;font-size:11px">
              © ${year} Krea4u CRM — La Stanza dell'Arte<br>
              <span style="font-size:10px">
                Rispondi direttamente a questa email per contattare l'utente
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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Inserisci il tuo nome')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Inserisci la tua email')
      return
    }
    if (!formData.subject.trim()) {
      toast.error("Inserisci l'oggetto della richiesta")
      return
    }
    if (!formData.message.trim()) {
      toast.error('Inserisci il messaggio')
      return
    }

    setLoading(true)

    try {
      // ── Oggetto con prefisso priorità ────────────────────────────────────
      const subjectWithPriority =
        `[Supporto Krea4u][${formData.priority.toUpperCase()}] ${formData.subject}`

      // ── Testo plain per AltBody ───────────────────────────────────────────
      const bodyText =
        `RICHIESTA DI SUPPORTO — Krea4u CRM\n` +
        `${'─'.repeat(40)}\n` +
        `Nome:      ${formData.name}\n` +
        `Email:     ${formData.email}\n` +
        `Priorità:  ${priorityLabels[formData.priority]}\n` +
        `Oggetto:   ${formData.subject}\n` +
        `${'─'.repeat(40)}\n\n` +
        `${formData.message}\n\n` +
        `${'─'.repeat(40)}\n` +
        (user ? `User ID: ${user.id}\n` : '')

      // ── Invia via EmailService → PHP mailer ──────────────────────────────
      await EmailService.sendEmail({
        to:          [SUPPORT_EMAIL],
        subject:     subjectWithPriority,
        body_text:   bodyText,
        html:        buildSupportEmailHtml(),
        // ✅ Reply-To = email dell'utente → puoi rispondere direttamente
        reply_to:      formData.email,
        reply_to_name: formData.name,
        sender_name:   formData.name,
      })

      toast.success('Richiesta inviata con successo!', {
        description: `Ti risponderemo a ${formData.email} entro i tempi indicati`,
      })

      // Reset solo i campi variabili
      setFormData(prev => ({
        ...prev,
        subject:  '',
        message:  '',
        priority: 'normal',
      }))

    } catch (error: any) {
      console.error('❌ Support form error:', error)
      toast.error("Errore nell'invio della richiesta", {
        description: error.message ?? 'Riprova o contatta direttamente support@lastanzadellarte.com',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supporto Tecnico"
        description="Hai bisogno di aiuto? Siamo qui per supportarti"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Supporto Tecnico' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonna sinistra — Cards contatto ─────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Email Support */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Invia una email al nostro team di supporto
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700
                           flex items-center gap-1"
              >
                {SUPPORT_EMAIL}
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                Risposta entro 24h
              </div>
            </CardContent>
          </Card>

          {/* Documentazione */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Documentazione</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Consulta il manuale d'uso completo
              </p>
              <a
                href="https://jrfosqvvjkjvguxbnvhm.supabase.co/storage/v1/object/public/template-documents/manuale-utente-crm.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-purple-600 hover:text-purple-700
                           flex items-center gap-1"
              >
                Scarica Manuale (PDF)
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <CheckCircle2 className="h-3 w-3" />
                Guide passo-passo
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card
            className="border-orange-200 bg-orange-50/50 cursor-pointer
                       hover:shadow-md hover:border-orange-300 transition-all duration-200"
            onClick={() => navigate('/faq')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">FAQ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Domande frequenti e risposte rapide
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-orange-300 text-orange-700
                           hover:bg-orange-100 hover:border-orange-400
                           flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/faq')
                }}
              >
                Consulta le FAQ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* ── Colonna destra — Form contatto ────────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-6 w-6 text-blue-600" />
                Invia Richiesta di Supporto
              </CardTitle>
              <CardDescription>
                Il messaggio verrà inviato a{' '}
                <strong>{SUPPORT_EMAIL}</strong> e riceverai risposta
                all'indirizzo email indicato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Nome & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Il tuo nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email * 
                      <span className="ml-1 text-xs text-gray-400 font-normal">
                        (riceverai la risposta qui)
                      </span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Priorità */}
                <div className="space-y-2">
                  <Label>Priorità</Label>
                  <div className="flex gap-2">
                    {(['low', 'normal', 'high'] as const).map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={
                          formData.priority === priority ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={
                          formData.priority === priority
                            ? priorityColors[priority]
                            : ''
                        }
                      >
                        {priorityLabels[priority]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Oggetto */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Oggetto *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Descrivi brevemente il problema"
                    required
                  />
                </div>

                {/* Messaggio */}
                <div className="space-y-2">
                  <Label htmlFor="message">Messaggio *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Descrivi dettagliatamente il problema o la richiesta..."
                    rows={8}
                    className="resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Fornisci quanti più dettagli possibile per aiutarci a
                    risolvere rapidamente
                  </p>
                </div>

                {/* Info tempi risposta */}
                <div className="flex items-start gap-3 p-4 bg-blue-50
                                border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Tempi di risposta:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Alta priorità:</strong> entro 3 giorni</li>
                      <li>• <strong>Normale:</strong> entro 5 giorni</li>
                      <li>• <strong>Bassa:</strong> entro 7 giorni</li>
                    </ul>
                  </div>
                </div>

                {/* Pulsanti */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Invia Richiesta
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        subject:  '',
                        message:  '',
                        priority: 'normal',
                      }))
                    }
                  >
                    Reset
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}