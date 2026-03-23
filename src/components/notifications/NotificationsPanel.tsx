// components/notifications/NotificationsPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { Bell, Check, CheckCheck, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  link?: string
  metadata?: any
}

export default function NotificationsPanel() {
  const { user } = useAuth()
  const supabaseClient = supabase as any
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (user) {
      fetchNotifications()
      subscribeToNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications((data as Notification[]) || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    if (!user) return

    const channel = supabaseClient
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const deleteAllRead = async () => {
    if (!user) return

    try {
      const { error } = await supabaseClient
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('read', true)

      if (error) throw error

      setNotifications((prev) => prev.filter((n) => !n.read))
    } catch (error) {
      console.error('Error deleting read notifications:', error)
    }
  }

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'task':
        return '✅'
      case 'project':
        return '📁'
      case 'system':
        return '⚙️'
      default:
        return '🔔'
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifiche</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/app/settings/notifications">
              <Settings className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tutte
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Non lette ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="p-2 border-b flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Segna tutte come lette
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteAllRead}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina lette
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Nessuna notifica</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 hover:bg-neutral-50 transition-colors cursor-pointer',
                  !notification.read && 'bg-blue-50'
                )}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id)
                  }
                  if (notification.link) {
                    window.location.href = notification.link
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true, locale: it }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}