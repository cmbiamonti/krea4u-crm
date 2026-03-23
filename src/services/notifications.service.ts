// src/services/notifications.service.ts

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { mapNotifications } from '../utils/typeMappers';

export interface Notification {
  id: string
  user_id: string
  type: 'message' | 'task' | 'project' | 'mention'
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

export class NotificationsService {
  /**
   * Crea una nuova notifica
   */
  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
    ): Promise<void> {
    try {
        logger.log('🔔 NotificationsService: Creating notification for user:', userId)

        // ✅ FIX: Cast esplicito
        const insertData: any = {
        user_id: userId,
        type,
        title,
        message,
        link,
        read: false,
        metadata: metadata || {},
        }

        const { error } = await supabase.from('notifications').insert(insertData)

        if (error) throw error

        await this.sendPushNotification(title, message)

        logger.log('✅ NotificationsService: Notification created')
    } catch (error: any) {
        logger.error('❌ NotificationsService: Error creating notification:', error)
    }
    }

  /**
   * Ottieni notifiche dell'utente
   */
  static async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (unreadOnly) {
        query = query.eq('read', false)
      }

      const { data, error } = await query

      if (error) throw error

      return mapNotifications(data || []);
    } catch (error: any) {
      logger.error('❌ NotificationsService: Error loading notifications:', error)
      return []
    }
  }

  /**
   * Segna notifica come letta
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
        const updateData = { read: true }

        const { error } = await supabase
        .from('notifications')
        .update(updateData as unknown as never)
        .eq('id', notificationId)

        if (error) throw error

        logger.log('✅ NotificationsService: Notification marked as read:', notificationId)
    } catch (error: any) {
        logger.error('❌ NotificationsService: Error marking as read:', error)
    }
    }

  /**
   * Segna tutte le notifiche come lette
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
        const updateData = { read: true }

        const { error } = await supabase
        .from('notifications')
        .update(updateData as unknown as never)
        .eq('user_id', userId)
        .eq('read', false)

        if (error) throw error

        logger.log('✅ NotificationsService: All notifications marked as read')
    } catch (error: any) {
        logger.error('❌ NotificationsService: Error marking all as read:', error)
    }
    }

  /**
   * Elimina notifica
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      logger.log('✅ NotificationsService: Notification deleted:', notificationId)
    } catch (error: any) {
      logger.error('❌ NotificationsService: Error deleting notification:', error)
    }
  }

  /**
   * Subscribe alle notifiche real-time
   */
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    logger.log('👂 NotificationsService: Subscribing to notifications for user:', userId)

    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.log('🔔 NotificationsService: New notification received:', payload.new)
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }

  /**
   * Richiedi permessi notifiche push
   */
  static async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      logger.warn('⚠️ NotificationsService: Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  /**
   * Invia notifica push al browser
   */
  static async sendPushNotification(title: string, body: string, icon?: string): Promise<void> {
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || '/logo.png',
          badge: '/logo.png',
          tag: 'krea4u-notification',
          requireInteraction: false,
        })
      } catch (error) {
        logger.error('❌ NotificationsService: Error sending push notification:', error)
      }
    }
  }

  /**
   * Notifica nuovo messaggio
   */
  static async notifyNewMessage(
    recipientUserId: string,
    senderName: string,
    projectName: string,
    messagePreview: string,
    projectId: string,
    conversationId: string
  ): Promise<void> {
    await this.createNotification(
      recipientUserId,
      'message',
      `Nuovo messaggio da ${senderName}`,
      `${projectName}: ${messagePreview}`,
      `/projects/${projectId}/messages?conversation=${conversationId}`,
      {
        sender: senderName,
        project_id: projectId,
        conversation_id: conversationId,
      }
    )
  }
}