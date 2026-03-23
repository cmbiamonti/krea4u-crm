import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import PageHeader from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Bell, Mail, Smartphone, Volume2, Moon } from 'lucide-react'

interface NotificationSettings {
  email_notifications: boolean
  in_app_notifications: boolean
  push_notifications: boolean
  notification_sound: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  categories: {
    messages: boolean
    tasks: boolean
    projects: boolean
    system: boolean
  }
}

const defaultSettings: NotificationSettings = {
  email_notifications: true,
  in_app_notifications: true,
  push_notifications: false,
  notification_sound: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  categories: {
    messages: true,
    tasks: true,
    projects: true,
    system: true,
  },
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    if (!user) return

    try {
      setLoading(true)

      const result: any = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (result.error && result.error.code !== 'PGRST116') throw result.error

      if (result.data) {
        setSettings({
          ...result.data,
          categories: result.data.categories as any,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      const supabaseClient: any = supabase

      const result: any = await supabaseClient
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        })

      if (result.error) throw result.error

      toast({
        title: 'Successo',
        description: 'Impostazioni salvate con successo',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le impostazioni',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  const updateCategory = (category: keyof NotificationSettings['categories'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Impostazioni Notifiche"
          breadcrumbs={[
            { label: 'Dashboard', href: '/app' },
            { label: 'Impostazioni', href: '/app/settings' },
            { label: 'Notifiche' },
          ]}
        />
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-neutral-200 rounded-lg" />
          <div className="h-64 bg-neutral-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Impostazioni Notifiche"
        description="Gestisci come e quando ricevere le notifiche"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Impostazioni', href: '/app/settings' },
          { label: 'Notifiche' },
        ]}
      />

      <div className="max-w-3xl space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Canali di Notifica
            </CardTitle>
            <CardDescription>
              Scegli come vuoi ricevere le notifiche
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-neutral-500" />
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">
                    Notifiche Email
                  </Label>
                  <p className="text-sm text-neutral-600">
                    Ricevi notifiche via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({ email_notifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-neutral-500" />
                <div>
                  <Label htmlFor="in-app-notifications" className="font-medium">
                    Notifiche In-App
                  </Label>
                  <p className="text-sm text-neutral-600">
                    Mostra notifiche nell'applicazione
                  </p>
                </div>
              </div>
              <Switch
                id="in-app-notifications"
                checked={settings.in_app_notifications}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({ in_app_notifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-neutral-500" />
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">
                    Notifiche Push
                  </Label>
                  <p className="text-sm text-neutral-600">
                    Ricevi notifiche push sul dispositivo
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.push_notifications}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({ push_notifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-neutral-500" />
                <div>
                  <Label htmlFor="notification-sound" className="font-medium">
                    Suoni Notifiche
                  </Label>
                  <p className="text-sm text-neutral-600">
                    Riproduci suono per nuove notifiche
                  </p>
                </div>
              </div>
              <Switch
                id="notification-sound"
                checked={settings.notification_sound}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({ notification_sound: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categorie di Notifica</CardTitle>
            <CardDescription>
              Scegli quali tipi di notifiche ricevere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages-category" className="font-medium">
                  Messaggi
                </Label>
                <p className="text-sm text-neutral-600">
                  Nuovi messaggi e conversazioni
                </p>
              </div>
              <Switch
                id="messages-category"
                checked={settings.categories.messages}
                onCheckedChange={(checked: boolean) => updateCategory('messages', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tasks-category" className="font-medium">
                  Tasks & Progetti
                </Label>
                <p className="text-sm text-neutral-600">
                  Task assegnate e scadenze
                </p>
              </div>
              <Switch
                id="tasks-category"
                checked={settings.categories.tasks}
                onCheckedChange={(checked: boolean) => updateCategory('tasks', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="projects-category" className="font-medium">
                  Progetti
                </Label>
                <p className="text-sm text-neutral-600">
                  Aggiornamenti sui progetti
                </p>
              </div>
              <Switch
                id="projects-category"
                checked={settings.categories.projects}
                onCheckedChange={(checked: boolean) => updateCategory('projects', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-category" className="font-medium">
                  Sistema
                </Label>
                <p className="text-sm text-neutral-600">
                  Notifiche di sistema e aggiornamenti
                </p>
              </div>
              <Switch
                id="system-category"
                checked={settings.categories.system}
                onCheckedChange={(checked: boolean) => updateCategory('system', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Orari di Silenzio
            </CardTitle>
            <CardDescription>
              Disattiva le notifiche durante specifici orari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet-hours-enabled" className="font-medium">
                Abilita Orari di Silenzio
              </Label>
              <Switch
                id="quiet-hours-enabled"
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({ quiet_hours_enabled: checked })
                }
              />
            </div>

            {settings.quiet_hours_enabled && (
              <>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Inizio</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) =>
                        updateSettings({ quiet_hours_start: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">Fine</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) =>
                        updateSettings({ quiet_hours_end: e.target.value })
                      }
                    />
                  </div>
                </div>

                <p className="text-sm text-neutral-600">
                  Le notifiche saranno silenziate dalle {settings.quiet_hours_start} alle{' '}
                  {settings.quiet_hours_end}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </Button>
        </div>
      </div>
    </div>
  )
}