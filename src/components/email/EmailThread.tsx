import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Mail, 
  MailOpen,
  Clock, 
  Paperclip, 
  MoreVertical,
  Reply,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import type { EmailMessage } from '@/types/email.types'

interface EmailThreadProps {
  messages: EmailMessage[]
  onReply?: (message: EmailMessage) => void
  onDelete?: (messageId: string) => void
}

export default function EmailThread({ messages, onReply, onDelete }: EmailThreadProps) {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(messages.length > 0 ? [messages[messages.length - 1].id] : [])
  )

  const toggleMessage = (id: string) => {
    const newExpanded = new Set(expandedMessages)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedMessages(newExpanded)
  }

  const getStatusBadge = (message: EmailMessage) => {
    const status = message.status 
    
    switch (status) {
      case 'delivered':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Consegnata
          </Badge>
        )
      case 'sent':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <Mail className="h-3 w-3 mr-1" />
            Inviata
          </Badge>
        )
      case 'failed':
      case 'bounced':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Fallita
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300">
            <Clock className="h-3 w-3 mr-1" />
            In coda
          </Badge>
        )
      default:
        return null
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

  if (messages.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Nessun messaggio</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isExpanded = expandedMessages.has(message.id)
        const isLast = index === messages.length - 1

        return (
          <Card 
            key={message.id} 
            className={`overflow-hidden transition-all ${
              isExpanded ? 'shadow-md' : 'shadow-sm'
            }`}
          >
            {/* Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleMessage(message.id)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {getInitials(message.sender_email, message.sender_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {message.sender_name || message.sender_email}
                      </span>
                      {message.direction === 'outbound' && (
                        <Badge variant="secondary" className="text-xs">
                          Tu
                        </Badge>
                      )}
                      {message.opened_at && (
                        <span title="Letta">
                          <MailOpen className="h-3 w-3 text-blue-600" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(message)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {message.direction === 'inbound' && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                onReply?.(message)
                              }}
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Rispondi
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete?.(message.id)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">A:</span> {message.to_emails.join(', ')}
                    {message.cc_emails.length > 0 && (
                      <span className="ml-2">
                        <span className="font-medium">Cc:</span> {message.cc_emails.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(message.created_at), { 
                      addSuffix: true,
                      locale: it 
                    })}
                    {message.sent_at && (
                      <span className="ml-2">
                        • {new Date(message.sent_at).toLocaleString('it-IT')}
                      </span>
                    )}
                  </div>

                  {!isExpanded && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {message.body_text}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Body (quando espanso) */}
            {isExpanded && (
              <div className="border-t">
                <div className="p-4 space-y-4">
                  {/* Subject */}
                  {index === 0 && (
                    <div className="pb-2 border-b">
                      <h3 className="font-semibold text-lg">{message.subject}</h3>
                    </div>
                  )}

                  {/* Body */}
                  <div className="prose prose-sm max-w-none">
                    {message.body_html ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: message.body_html }}
                        className="text-sm text-gray-700"
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                        {message.body_text}
                      </pre>
                    )}
                  </div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {message.attachments.length} allegat{message.attachments.length > 1 ? 'i' : 'o'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {message.attachments.map((attachment, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm truncate">{attachment.filename}</span>
                            </div>
                            {attachment.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                Apri
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {message.direction === 'outbound' && (
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Inviata:</span>
                          <div className="font-medium">
                            {message.sent_at 
                              ? new Date(message.sent_at).toLocaleTimeString('it-IT')
                              : 'N/D'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Consegnata:</span>
                          <div className="font-medium">
                            {message.delivered_at 
                              ? new Date(message.delivered_at).toLocaleTimeString('it-IT')
                              : 'In attesa'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Aperta:</span>
                          <div className="font-medium">
                            {message.opened_at 
                              ? new Date(message.opened_at).toLocaleTimeString('it-IT')
                              : 'Non ancora'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {message.direction === 'inbound' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReply?.(message)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Rispondi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}