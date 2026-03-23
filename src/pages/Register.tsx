// src/pages/Register.tsx
// ✅ Nuova logica: nessuna registrazione automatica
// → reindirizza al form di richiesta adesione

import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Clock,
  Mail,
  CheckCircle,
  UserCheck,
  FileText,
  ArrowRight,
  Info,
} from 'lucide-react'
import Logo from '@/components/Logo'

export default function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-0">

        {/* ── Header ── */}
        <CardHeader className="space-y-6 text-center pb-4">
          <div className="flex justify-center">
            <Logo size="lg" showIcon={true} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Richiesta di Accesso
            </CardTitle>
            <CardDescription className="text-base">
              Krea4u CRM — accesso su approvazione
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ── Info banner ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Come funziona l'accesso
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                Krea4u CRM non prevede registrazione automatica.
                Compila il modulo di richiesta: il nostro team valuterà
                la domanda e ti invierà le credenziali di accesso via email.
              </p>
            </div>
          </div>

          {/* ── Processo in 4 passi ── */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Processo di approvazione
            </p>

            {[
              {
                icon: FileText,
                color: 'text-purple-600 bg-purple-50',
                title: 'Compila il modulo',
                desc:  'Inserisci i tuoi dati e la motivazione della richiesta',
              },
              {
                icon: Mail,
                color: 'text-blue-600 bg-blue-50',
                title: 'Ricezione e valutazione',
                desc:  'Il team riceve la domanda e la esamina entro 5 giorni lavorativi',
              },
              {
                icon: UserCheck,
                color: 'text-orange-600 bg-orange-50',
                title: 'Approvazione',
                desc:  'In caso di approvazione riceverai le credenziali via email',
              },
              {
                icon: CheckCircle,
                color: 'text-green-600 bg-green-50',
                title: 'Accesso attivo',
                desc:  'Accedi con le credenziali ricevute e inizia ad usare il CRM',
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`p-2 rounded-lg flex-shrink-0 ${step.color}`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tempi e avviso ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Tempi:</strong> 5 giorni lavorativi per la valutazione.
              La richiesta potrebbe non essere accettata. In ogni caso
              riceverai una risposta via email.
            </p>
          </div>

          {/* ── CTA principale ── */}
          <Button
            className="w-full h-11 text-base font-semibold"
            onClick={() => navigate('/register/membership')}
          >
            Compila il Modulo di Richiesta
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* ── Link login ── */}
          <p className="text-center text-sm text-gray-600">
            Hai già le credenziali?{' '}
            <Link
              to="/login"
              className="text-primary hover:underline font-semibold"
            >
              Accedi
            </Link>
          </p>

          {/* ── Footer legale ── */}
          <div className="text-center border-t pt-4">
            <p className="text-xs text-gray-500">
              Inviando la richiesta accetti i nostri{' '}
              <a
                href="/documents/TerminiDiServizio.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Termini di Servizio
              </a>
              {' '}e la{' '}
              <a
                href="/documents/PrivacyPolicy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}