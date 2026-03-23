import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Users, Mail, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EmailService } from '@/services/email.service'
import type { EmailContact } from '@/types/email.types'

export default function ContactsManager() {
  const [contacts, setContacts] = useState<EmailContact[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const data = await EmailService.getContacts()
      setContacts(data)
    } catch (error: any) {
      console.error('Error loading contacts:', error)
      toast.error('Errore nel caricamento dei contatti')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const data = await EmailService.getContacts(searchQuery)
      setContacts(data)
    } catch (error: any) {
      console.error('Error searching contacts:', error)
      toast.error('Errore nella ricerca')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (email: string, name?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  const filteredContacts = searchQuery
    ? contacts
    : contacts.filter(contact => 
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Rubrica Contatti
          </h2>
          <p className="text-sm text-gray-500">
            {contacts.length} contatti salvati automaticamente
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca per email o nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          Cerca
        </Button>
      </div>

      {/* Contacts Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">Nessun contatto</p>
          <p className="text-sm text-gray-400">
            I contatti vengono aggiunti automaticamente quando invii email
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contatto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Email Inviate</TableHead>
                <TableHead>Ultimo Contatto</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(contact.email, contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {contact.name || 'Nessun nome'}
                        </div>
                        {!contact.name && (
                          <div className="text-xs text-gray-500">
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {contact.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {contact.contact_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contact.last_contact_at ? (
                      <span className="text-sm text-gray-600">
                        {new Date(contact.last_contact_at).toLocaleDateString('it-IT')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Mai contattato</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Implementa eliminazione se necessario
                        toast.error('Funzionalità in arrivo')
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {contacts.length}
            </div>
            <div className="text-sm text-gray-500">Contatti Totali</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {contacts.reduce((sum, c) => sum + c.contact_count, 0)}
            </div>
            <div className="text-sm text-gray-500">Email Inviate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {contacts.filter(c => c.last_contact_at &&
                new Date(c.last_contact_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="text-sm text-gray-500">Ultimi 7 Giorni</div>
          </div>
        </div>
      </Card>
    </div>
  )
}