// src/pages/Settings.tsx

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { clearAllCache } from '@/lib/clearCache'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  User,
  Bell,
  Shield,
  Plug,
  FileText,
  Settings as SettingsIcon,
  Loader2,
  Sparkles,
  Upload,
  DatabaseBackup,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import TemplateManager from '@/components/templates/TemplateManager'
import TemplateUpload from '@/components/templates/TemplateUpload'
import { templateService } from '@/services/templateService'
import { TemplateCategory } from '@/types/template.types'
import BackupPanel from '@/components/settings/BackupPanel'

export default function Settings() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // ── Profile state ─────────────────────────────────────────────────────────
  const [curatorName,      setCuratorName]      = useState('')
  const [companyName,      setCompanyName]       = useState('')
  const [phone,            setPhone]             = useState('')
  const [bio,              setBio]               = useState('')
  const [location,         setLocation]          = useState('')
  const [website,          setWebsite]           = useState('')
  const [instagramHandle,  setInstagramHandle]   = useState('')

  // ── Notification state ────────────────────────────────────────────────────
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [projectUpdates,     setProjectUpdates]     = useState(true)
  const [weeklyDigest,       setWeeklyDigest]       = useState(false)

  // ── Password change state ─────────────────────────────────────────────────
  const [currentPassword,  setCurrentPassword]  = useState('')
  const [newPassword,      setNewPassword]       = useState('')
  const [confirmPassword,  setConfirmPassword]   = useState('')
  const [showCurrentPwd,   setShowCurrentPwd]    = useState(false)
  const [showNewPwd,       setShowNewPwd]        = useState(false)
  const [showConfirmPwd,   setShowConfirmPwd]    = useState(false)
  const [changingPassword, setChangingPassword]  = useState(false)
  const [pwdError,         setPwdError]          = useState('')

  // ── Delete account state ──────────────────────────────────────────────────
  const [deleteDialogOpen,   setDeleteDialogOpen]   = useState(false)
  const [deleteConfirmText,  setDeleteConfirmText]  = useState('')
  const [deletingAccount,    setDeletingAccount]    = useState(false)

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      setCuratorName(profile.curator_name      || '')
      setCompanyName(profile.company_name      || '')
      setPhone(profile.phone                   || '')
      setBio(profile.bio                       || '')
      setLocation(profile.location             || '')
      setWebsite(profile.website               || '')
      setInstagramHandle(profile.instagram_handle || '')
    }
  }, [profile])

  // ── Load categories when templates tab is active ──────────────────────────
  useEffect(() => {
    if (activeTab === 'templates') loadCategories()
  }, [activeTab])

  const loadCategories = async () => {
    setLoadingCategories(true)
    try {
      const data = await templateService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Errore nel caricamento delle categorie')
    } finally {
      setLoadingCategories(false)
    }
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!user?.id) { toast.error('Utente non autenticato'); return }
    if (!curatorName.trim()) { toast.error('Il nome curatore è obbligatorio'); return }

    setLoading(true)
    try {
      const updateData = {
        curator_name:     curatorName.trim(),
        company_name:     companyName.trim(),
        phone:            phone.trim(),
        bio:              bio.trim(),
        location:         location.trim(),
        website:          website.trim(),
        instagram_handle: instagramHandle.trim(),
        updated_at:       new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()

      if (error) throw error
      if (updateProfile) await updateProfile(updateData)

      toast.success('Profilo aggiornato con successo! ✅', {
        description: 'Le modifiche sono state salvate',
      })
    } catch (error: any) {
      toast.error('Errore durante il salvataggio', {
        description: error.message || 'Riprova più tardi',
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Change password (in-place, con verifica current password) ─────────────
  const handleChangePassword = async () => {
    setPwdError('')

    // Validazione lato client
    if (!currentPassword) {
      setPwdError('Inserisci la password attuale')
      return
    }
    if (newPassword.length < 6) {
      setPwdError('La nuova password deve contenere almeno 6 caratteri')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Le nuove password non corrispondono')
      return
    }
    if (newPassword === currentPassword) {
      setPwdError('La nuova password deve essere diversa da quella attuale')
      return
    }

    setChangingPassword(true)
    try {
      // ✅ Step 1 — verifica la password attuale tentando un re-login silenzioso
      if (!user?.email) throw new Error('Email utente non disponibile')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email:    user.email,
        password: currentPassword,
      })

      if (signInError) {
        setPwdError('La password attuale non è corretta')
        setChangingPassword(false)
        return
      }

      // ✅ Step 2 — aggiorna la password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      // Reset campi
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwdError('')

      toast.success('Password aggiornata con successo! 🔒', {
        description: 'Usa la nuova password al prossimo accesso',
      })
    } catch (error: any) {
      toast.error('Errore durante il cambio password', {
        description: error.message || 'Riprova più tardi',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!user?.id) return

    if (deleteConfirmText !== 'ELIMINA') {
      toast.error('Testo di conferma non corretto')
      return
    }

    setDeletingAccount(true)
    try {
      // ✅ Step 1 — elimina i dati utente dalle tabelle applicative
      // Chiamate separate e tipizzate esplicitamente per evitare
      // l'errore TS2589 "Type instantiation is excessively deep"
      await (supabase.from('artists')  as any).delete().eq('created_by', user.id)
      await (supabase.from('venues')   as any).delete().eq('created_by', user.id)
      await (supabase.from('projects') as any).delete().eq('created_by', user.id)
      await (supabase.from('messages') as any).delete().eq('created_by', user.id)

      // ✅ Step 2 — elimina il profilo
      await (supabase.from('profiles') as any).delete().eq('id', user.id)

      // ✅ Step 3 — tenta eliminazione account Auth via Edge Function
      const { error: deleteAuthError } = await supabase.functions.invoke(
        'delete-user-account',
        { body: { user_id: user.id } }
      )

      if (deleteAuthError) {
        console.warn('Edge function delete-user-account non disponibile:', deleteAuthError)
        toast.warning(
          'Dati eliminati. Contatta il supporto per completare la cancellazione.',
          { duration: 8000 }
        )
      } else {
        toast.success('Account eliminato con successo')
      }

      // ✅ Step 4 — logout e redirect
      await signOut()
      navigate('/')

    } catch (error: any) {
      console.error('Delete account error:', error)
      toast.error("Errore durante l'eliminazione dell'account", {
        description: error.message || 'Contatta il supporto',
      })
    } finally {
      setDeletingAccount(false)
      setDeleteDialogOpen(false)
      setDeleteConfirmText('')
    }
  }

  const handleClearCache = async () => {
    try {
      await clearAllCache()
      toast.success('Cache pulita!', {
        description: 'La pagina si ricaricherà automaticamente',
      })
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      toast.error('Errore durante la pulizia della cache')
    }
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    toast.success('Template caricato con successo!')
    window.dispatchEvent(new CustomEvent('template-uploaded'))
  }

  // ── Password strength indicator ───────────────────────────────────────────
  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: '', width: '0%' }
    if (pwd.length < 6)  return { label: 'Troppo corta',  color: 'bg-red-500',    width: '20%' }
    if (pwd.length < 8)  return { label: 'Debole',        color: 'bg-orange-400', width: '40%' }
    if (pwd.length < 10) return { label: 'Discreta',      color: 'bg-yellow-400', width: '60%' }
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
                          return { label: 'Molto sicura',  color: 'bg-green-500',  width: '100%' }
    return               { label: 'Buona',          color: 'bg-blue-500',   width: '80%' }
  }

  const pwdStrength = getPasswordStrength(newPassword)

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Impostazioni"
        description="Gestisci il tuo account e le preferenze"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Impostazioni' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profilo</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifiche</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sicurezza</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrazioni</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 relative">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Template</span>
            <Badge variant="default" className="ml-1 h-5 px-1 text-[10px] bg-[#2B4C7E]">
              <Sparkles className="h-3 w-3" />
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferenze</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <DatabaseBackup className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Profilo</CardTitle>
              <CardDescription>
                Gestisci le tue informazioni personali e aziendali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="curatorName" className="flex items-center gap-2">
                  Nome Curatore <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="curatorName"
                  value={curatorName}
                  onChange={e => setCuratorName(e.target.value)}
                  placeholder="Es: Mario Rossi"
                  className="font-medium"
                  required
                />
                <p className="text-xs text-neutral-500">Il tuo nome completo come curatore artistico</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled className="bg-neutral-50" />
                <p className="text-sm text-neutral-500">L'email non può essere modificata</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Nome Azienda/Studio</Label>
                <Input id="company" value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Es: Studio d'Arte Milano" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+39 333 1234567" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Città</Label>
                <Input id="location" value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Milano, Italia" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sito Web</Label>
                <Input id="website" type="url" value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://www.example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={instagramHandle}
                  onChange={e => setInstagramHandle(e.target.value)}
                  placeholder="@username" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <textarea id="bio" value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Raccontaci qualcosa su di te..."
                  className="w-full min-h-[100px] px-3 py-2 border border-neutral-200
                             rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Account</p>
                  <p className="text-sm text-neutral-500">
                    Creato il {new Date(user?.created_at || '').toLocaleDateString('it-IT')}
                  </p>
                </div>
                <Button variant="outline" onClick={signOut}>Logout</Button>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={loading || !curatorName.trim()}
                className="w-full sm:w-auto bg-[#2B4C7E] hover:bg-[#1A2E4C]"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvataggio...</>
                ) : 'Salva Modifiche'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ───────────────────────────────────────────── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferenze Notifiche</CardTitle>
              <CardDescription>Gestisci come e quando ricevere le notifiche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifiche Email</Label>
                  <p className="text-sm text-neutral-500">Ricevi email per aggiornamenti importanti</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aggiornamenti Progetti</Label>
                  <p className="text-sm text-neutral-500">Notifiche per modifiche ai progetti</p>
                </div>
                <Switch checked={projectUpdates} onCheckedChange={setProjectUpdates} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Riepilogo Settimanale</Label>
                  <p className="text-sm text-neutral-500">Ricevi un riepilogo settimanale via email</p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
              <Button className="bg-[#2B4C7E] hover:bg-[#1A2E4C]">Salva Preferenze</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security Tab ────────────────────────────────────────────────── */}
        <TabsContent value="security">
          <div className="space-y-6">

            {/* ── Cambia Password ─────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-[#2B4C7E]" />
                  Cambia Password
                </CardTitle>
                <CardDescription>
                  Aggiorna la tua password di accesso. Usa almeno 8 caratteri
                  con numeri e simboli per una maggiore sicurezza.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Password attuale */}
                <div className="space-y-2">
                  <Label htmlFor="currentPwd">Password Attuale</Label>
                  <div className="relative">
                    <Input
                      id="currentPwd"
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setPwdError('') }}
                      placeholder="La tua password attuale"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Nuova password */}
                <div className="space-y-2">
                  <Label htmlFor="newPwd">Nuova Password</Label>
                  <div className="relative">
                    <Input
                      id="newPwd"
                      type={showNewPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPwdError('') }}
                      placeholder="Minimo 6 caratteri"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Indicatore forza password */}
                  {newPassword && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color}`}
                          style={{ width: pwdStrength.width }}
                        />
                      </div>
                      <p className={`text-xs font-medium ${
                        pwdStrength.color.includes('red')    ? 'text-red-500'    :
                        pwdStrength.color.includes('orange') ? 'text-orange-500' :
                        pwdStrength.color.includes('yellow') ? 'text-yellow-600' :
                        pwdStrength.color.includes('blue')   ? 'text-blue-600'   :
                        'text-green-600'
                      }`}>
                        {pwdStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Conferma nuova password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPwd">Conferma Nuova Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPwd"
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPwdError('') }}
                      placeholder="Ripeti la nuova password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {confirmPassword && newPassword && (
                    <p className={`text-xs font-medium ${
                      confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {confirmPassword === newPassword ? '✓ Le password corrispondono' : '✗ Le password non corrispondono'}
                    </p>
                  )}
                </div>

                {/* Errore */}
                {pwdError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{pwdError}</p>
                  </div>
                )}

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    changingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="bg-[#2B4C7E] hover:bg-[#1A2E4C]"
                >
                  {changingPassword ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Aggiornamento...</>
                  ) : (
                    <><KeyRound className="mr-2 h-4 w-4" />Aggiorna Password</>
                  )}
                </Button>

              </CardContent>
            </Card>

            {/* ── Zona Pericolosa ──────────────────────────────────────────── */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Zona Pericolosa
                </CardTitle>
                <CardDescription>
                  Azioni irreversibili. Procedi con estrema cautela.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-red-800">Elimina Account</p>
                      <p className="text-sm text-red-600 mt-1">
                        Elimina permanentemente il tuo account e tutti i dati associati:
                        artisti, spazi, progetti e messaggi.
                        <strong> Questa azione non può essere annullata.</strong>
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* ── Integrations Tab ────────────────────────────────────────────── */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrazioni</CardTitle>
              <CardDescription>Connetti Krea4u con altri servizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Plug className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 mb-2 font-medium">Moduli a pagamento</p>
                <p className="text-sm text-neutral-500 mb-2">
                  Ricerca Artisti • Ricerca Spazi • Ricerca Professionisti
                </p>
                <p className="text-sm text-neutral-500">
                  Dropbox • Google Drive • Twilio SMS • SendGrid Email
                </p>
                <Button
                  variant="outline" className="mt-4"
                  onClick={() => window.open('mailto:supporto@lastanzadellarte.com', '_blank')}
                >
                  Contatta il Supporto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Templates Tab ───────────────────────────────────────────────── */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2B4C7E]" />
                Template Manager
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Gestisci template di sistema e personalizzati
              </p>
            </div>
            <Button
              onClick={() => setShowUpload(!showUpload)}
              variant={showUpload ? 'outline' : 'default'}
              className={!showUpload ? 'bg-[#2B4C7E] hover:bg-[#1A2E4C]' : ''}
            >
              {showUpload ? (
                <><FileText className="h-4 w-4 mr-2" />Chiudi Upload</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Carica Template</>
              )}
            </Button>
          </div>

          {showUpload && (
            <Card className="border-2 border-[#2B4C7E]/20 bg-blue-50/30">
              <CardContent className="pt-6">
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
                    <span className="ml-3 text-neutral-600">Caricamento categorie...</span>
                  </div>
                ) : (
                  <TemplateUpload categories={categories} onSuccess={handleUploadSuccess} />
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <TemplateManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Preferences Tab ─────────────────────────────────────────────── */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferenze Generali</CardTitle>
                <CardDescription>Personalizza l'esperienza dell'applicazione</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">Lingua</Label>
                  <select className="w-full px-3 py-2 border border-neutral-200 rounded-md
                                     focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]">
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Fuso Orario</Label>
                  <select className="w-full px-3 py-2 border border-neutral-200 rounded-md
                                     focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]">
                    <option value="Europe/Rome">Europa/Roma</option>
                    <option value="Europe/London">Europa/Londra</option>
                    <option value="America/New_York">America/New York</option>
                  </select>
                </div>
                <Button className="bg-[#2B4C7E] hover:bg-[#1A2E4C]">Salva Preferenze</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache e Dati</CardTitle>
                <CardDescription>Gestisci cache e dati dell'applicazione</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pulisci Cache</p>
                    <p className="text-sm text-gray-500">Risolve problemi di caricamento e loop</p>
                  </div>
                  <Button variant="outline" onClick={handleClearCache}>Pulisci Cache</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Backup Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseBackup className="h-5 w-5 text-[#2B4C7E]" />
                Backup e Ripristino Dati
              </CardTitle>
              <CardDescription>
                Esporta i tuoi dati in formato JSON o CSV e ripristinali in qualsiasi momento.
                I backup includono artisti, spazi, progetti e messaggi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackupPanel />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* ════════════════════════════════════════════════════════════════════
          Dialog Elimina Account
      ════════════════════════════════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={open => {
        setDeleteDialogOpen(open)
        if (!open) setDeleteConfirmText('')
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Elimina Account
            </DialogTitle>
            <DialogDescription>
              Questa azione è <strong>irreversibile</strong>. Verranno eliminati
              permanentemente tutti i tuoi dati: artisti, spazi espositivi,
              progetti e messaggi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <p className="font-semibold mb-1">Verranno eliminati:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Tutti gli artisti nel database</li>
                <li>Tutti gli spazi espositivi</li>
                <li>Tutti i progetti e task</li>
                <li>Tutti i messaggi e template</li>
                <li>Il tuo profilo e account</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                Per confermare, digita{' '}
                <span className="font-mono font-bold text-red-600">ELIMINA</span>
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINA"
                className="border-red-200 focus:ring-red-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmText('')
              }}
              disabled={deletingAccount}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'ELIMINA' || deletingAccount}
            >
              {deletingAccount ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Eliminazione...</>
              ) : (
                <><Trash2 className="mr-2 h-4 w-4" />Elimina Definitivamente</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}