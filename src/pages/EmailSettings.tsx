import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { 
  Settings, 
  FileText, 
  Users, 
  PenTool,
  Mail
} from 'lucide-react'
import TemplateManager from '@/components/email/TemplateManager'
import ContactsManager from '@/components/email/ContactsManager'
import SignatureManager from '@/components/email/SignatureManager'

export default function EmailSettings() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-blue-600" />
          Impostazioni Email
        </h1>
        <p className="text-gray-600 mt-1">
          Gestisci template, contatti, firma e preferenze
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Template
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-2" />
            Contatti
          </TabsTrigger>
          <TabsTrigger value="signature">
            <PenTool className="h-4 w-4 mr-2" />
            Firma
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Mail className="h-4 w-4 mr-2" />
            Preferenze
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <ContactsManager />
        </TabsContent>

        <TabsContent value="signature" className="mt-6">
          <SignatureManager />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preferenze Email</h3>
            <p className="text-gray-500">
              Funzionalità in arrivo: notifiche, autoresponder, filtri automatici
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}