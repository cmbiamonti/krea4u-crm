// src/pages/ForgotPassword.tsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Logo from '@/components/Logo'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validazione email
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'L\'email è obbligatoria'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Inserisci un\'email valida'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Valida email
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsSubmitting(true)

    try {
      // resetPassword lancia eccezione se c'è errore (non ritorna { error })
      await resetPassword(email.trim())
      
      setSuccess(true)
      toast('Email inviata!', {
        description: 'Controlla la tua casella di posta',
        duration: 5000
      })
    } catch (err: any) {
      console.error('Reset password error:', err)
      
      // Gestisci errori specifici
      if (err.message?.includes('User not found')) {
        setError('Email non trovata. Verifica e riprova.')
      } else if (err.message?.includes('Invalid email')) {
        setError('Inserisci un\'email valida.')
      } else if (err.message?.includes('Too many requests')) {
        setError('Troppi tentativi. Riprova tra qualche minuto.')
      } else {
        setError(err.message || 'Si è verificato un errore. Riprova più tardi.')
      }

      toast.error('Errore durante l\'invio', {
        description: err.message || 'Riprova più tardi'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-6 text-center pb-6">
          {/* Logo Krea4u */}
          <div className="flex justify-center">
            <Logo size="lg" showIcon={true} />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              {success ? 'Email Inviata!' : 'Password Dimenticata?'}
            </CardTitle>
            <CardDescription className="text-base">
              {success 
                ? 'Controlla la tua casella di posta'
                : 'Inserisci la tua email per reimpostare la password'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            // Success State
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-gray-700 font-medium">
                  Ti abbiamo inviato un'email con le istruzioni per reimpostare la password.
                </p>
                <p className="text-sm text-gray-600">
                  Non hai ricevuto l'email? Controlla la cartella spam o riprova tra qualche minuto.
                </p>
                <p className="text-xs text-gray-500 pt-2">
                  Email inviata a: <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button variant="default" className="w-full h-11">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Torna al Login
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                    setError(null)
                  }}
                >
                  Riprova con un'altra email
                </Button>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                  className={error ? 'border-red-500 focus:ring-red-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Inserisci l'email associata al tuo account
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold" 
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  'Invia Link di Reset'
                )}
              </Button>

              {/* Back to Login */}
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full" type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna al Login
                </Button>
              </Link>
            </form>
          )}

          {/* Help Text */}
          {!success && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Suggerimento:</strong> Se non ricordi la tua email di registrazione, 
                contatta il supporto a <a href="mailto:supporto@lastanzadellarte.com" className="underline font-semibold">supporto@lastanzadellarte.com</a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}