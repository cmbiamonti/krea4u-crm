import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PenTool, Eye, Code, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface EmailSignature {
  html: string
  text: string
  auto_append: boolean
}

export default function SignatureManager() {
  const [signature, setSignature] = useState<EmailSignature>({
    html: '',
    text: '',
    auto_append: true
  })
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    loadSignature()
  }, [])

  const loadSignature = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Carica da user metadata
      const sig = user.user_metadata?.email_signature
      if (sig) {
        setSignature(sig)
      } else {
        // Genera firma default
        const defaultSig = generateDefaultSignature(user)
        setSignature(defaultSig)
      }
    } catch (error) {
      console.error('Error loading signature:', error)
    }
  }

  const generateDefaultSignature = (user: any) => {
    const name = user.user_metadata?.first_name 
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
      : user.email

    const html = `
<div style="font-family: Arial, sans-serif; color: #333; margin-top: 20px; padding-top: 20px; border-top: 2px solid #4472C4;">
  <p style="margin: 0; font-weight: bold; font-size: 16px;">${name}</p>
  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">La Stanza dell'Arte</p>
  <p style="margin: 5px 0 0 0; font-size: 14px;">
    <a href="mailto:${user.email}" style="color: #4472C4; text-decoration: none;">${user.email}</a>
  </p>
</div>
    `.trim()

    const text = `\n\n---\n${name}\nLa Stanza dell'Arte\n${user.email}`

    return { html, text, auto_append: true }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Salva in user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          email_signature: signature
        }
      })

      if (error) throw error

      toast.success('Firma salvata con successo')
    } catch (error: any) {
      console.error('Error saving signature:', error)
      toast.error(error.message || 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          Firma Email
        </h2>
        <p className="text-sm text-gray-500">
          Personalizza la firma delle tue email
        </p>
      </div>

      {/* Auto-append Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Aggiungi automaticamente</div>
            <div className="text-sm text-gray-500">
              Inserisci la firma in fondo a tutte le email
            </div>
          </div>
          <Button
            variant={signature.auto_append ? 'default' : 'outline'}
            onClick={() => setSignature({ ...signature, auto_append: !signature.auto_append })}
          >
            {signature.auto_append ? 'Attivo' : 'Disattivo'}
          </Button>
        </div>
      </Card>

      {/* Editor */}
      <Tabs defaultValue="html">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="html">
            <Code className="h-4 w-4 mr-2" />
            HTML
          </TabsTrigger>
          <TabsTrigger value="text">
            <PenTool className="h-4 w-4 mr-2" />
            Testo
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Anteprima
          </TabsTrigger>
        </TabsList>

        <TabsContent value="html" className="space-y-2">
          <Label>Firma HTML</Label>
          <Textarea
            value={signature.html}
            onChange={(e) => setSignature({ ...signature, html: e.target.value })}
            placeholder="<div>La tua firma HTML...</div>"
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            Usa HTML inline CSS per massima compatibilità
          </p>
        </TabsContent>

        <TabsContent value="text" className="space-y-2">
          <Label>Firma Testo (Fallback)</Label>
          <Textarea
            value={signature.text}
            onChange={(e) => setSignature({ ...signature, text: e.target.value })}
            placeholder="La tua firma in testo semplice..."
            rows={12}
          />
          <p className="text-xs text-gray-500">
            Versione testuale per client che non supportano HTML
          </p>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6">
            <div className="mb-4 pb-4 border-b">
              <div className="text-sm text-gray-600 mb-2">
                Gentile Cliente,
              </div>
              <div className="text-sm text-gray-600">
                Grazie per averci contattato. Ti risponderemo al più presto.
              </div>
            </div>

            {signature.html ? (
              <div dangerouslySetInnerHTML={{ __html: signature.html }} />
            ) : (
              <pre className="text-sm text-gray-500 whitespace-pre-wrap">
                {signature.text || 'Nessuna firma impostata'}
              </pre>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvataggio...
            </>
          ) : (
            'Salva Firma'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const loadUserSignature = async () => {
                const { data } = await supabase.auth.getUser()
                if (data.user) {
                    setSignature(generateDefaultSignature(data.user))
                }
                }
          }}
        >
          Reset Default
        </Button>
      </div>

      {/* Template Suggestions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm space-y-2">
          <div className="font-semibold text-blue-900">💡 Suggerimenti:</div>
          <ul className="text-blue-800 space-y-1 text-xs list-disc list-inside">
            <li>Mantieni la firma breve (max 4-5 righe)</li>
            <li>Includi nome, titolo, email e link essenziali</li>
            <li>Usa colori coerenti con il brand</li>
            <li>Testa su diversi client email</li>
            <li>Evita immagini pesanti (max 50KB)</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}