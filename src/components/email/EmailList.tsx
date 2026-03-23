// components/EmailList.tsx
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, MailOpen, Paperclip, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import type { EmailThread } from '@/types/email.types'

interface EmailListProps {
  threads: EmailThread[]
  selectedThreadId?: string | null
  onSelect: (threadId: string) => void
}

export default function EmailList({ threads, selectedThreadId, onSelect }: EmailListProps) {
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  if (threads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Nessuna email</p>
        <p className="text-sm text-gray-400 mt-2">
          Le tue email appariranno qui
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const lastMessage = thread.messages[thread.messages.length - 1]
        const isSelected = thread.thread_id === selectedThreadId
        const hasAttachments = thread.messages.some(m => 
          m.attachments && m.attachments.length > 0
        )

        return (
          <Card
            key={thread.thread_id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(thread.thread_id)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {getInitials(lastMessage.sender_email)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {lastMessage.sender_name || lastMessage.sender_email}
                    </span>
                    {thread.message_count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {thread.message_count}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(thread.last_message_at), { 
                      addSuffix: true,
                      locale: it 
                    })}
                  </span>
                </div>

                {/* Subject */}
                <div className="text-sm font-medium text-gray-900 truncate mb-1">
                  {thread.subject}
                </div>

                {/* Preview */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {lastMessage.body_text}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Participants */}
                  {thread.participants.length > 2 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{thread.participants.length}</span>
                    </div>
                  )}

                  {/* Attachments */}
                  {hasAttachments && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Paperclip className="h-3 w-3" />
                    </div>
                  )}

                  {/* Status */}
                  {lastMessage.direction === 'outbound' && (
                    <>
                      {lastMessage.opened_at ? (
                        <MailOpen className="h-3 w-3 text-blue-600" />
                      ) : lastMessage.delivered_at ? (
                        <Mail className="h-3 w-3 text-gray-400" />
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}