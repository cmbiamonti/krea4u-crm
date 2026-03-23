// src/pages/Login.tsx

import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, loading: authLoading } = useAuth()

  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [showPassword,    setShowPassword]    = useState(false)   // ← NEW

  useEffect(() => {
    if (!authLoading && user) {
      const from = location.state?.from?.pathname || '/app'
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Compila tutti i campi')
      return
    }

    if (password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      if (data.user) {
        toast('Login effettuato con successo!', {
          description: 'Benvenuto in Krea4u',
        })
      }
    } catch (error: any) {
      console.error('Login error:', error)

      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email o password non corretti')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Verifica la tua email prima di accedere')
      } else if (error.message.includes('Too many requests')) {
        toast.error('Troppi tentativi. Riprova tra qualche minuto')
      } else {
        toast.error(error.message || 'Errore durante il login')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Loading auth ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2B4C7E] mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Caricamento...</p>
        </div>
      </div>
    )
  }

  // ── Già autenticato ─────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2B4C7E] mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Accesso effettuato</p>
          <p className="text-xs text-gray-500 mt-2">Reindirizzamento in corso...</p>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">

        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <Logo size="xl" showIcon={true} />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Bentornato!
            </CardTitle>
            <CardDescription className="text-base">
              CRM Curatoriale - Accedi al tuo account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Email ──────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tuoemail@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* ── Password ────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                {/* Icona lucchetto — sinistra */}
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}   // ← TOGGLE
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-11 h-11"                // ← pr-11 spazio per icona destra
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  minLength={6}
                />

                {/* Bottone mostra/nascondi — destra */}
                <button
                  type="button"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-muted-foreground hover:text-gray-700
                    focus:outline-none focus-visible:ring-2
                    focus-visible:ring-[#2B4C7E] rounded
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            {/* ── Password dimenticata ────────────────────────────────────────── */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#2B4C7E] hover:underline font-medium"
                tabIndex={-1}
              >
                Password dimenticata?
              </Link>
            </div>

            {/* ── Submit ───────────────────────────────────────────────────────── */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-[#2B4C7E] hover:bg-[#1A2E4C]"
              disabled={loading || authLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                'Accedi'
              )}
            </Button>

            {/* ── Link registrazione ───────────────────────────────────────────── */}
            <div className="text-center text-sm text-muted-foreground pt-2">
              Non hai un account?{' '}
              <Link
                to="/register"
                className="text-[#2B4C7E] hover:underline font-semibold"
              >
                Registrati
              </Link>
            </div>

          </form>

          {/* ── Copyright ────────────────────────────────────────────────────── */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2024 <span className="font-semibold">Krea4u</span>. Tutti i diritti riservati.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}