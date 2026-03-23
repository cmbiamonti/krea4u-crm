import { supabase } from '@/lib/supabase'

// Helper per ottenere o creare conversazione
export const getOrCreateConversation = async (
  currentUserId: string,
  otherUserId: string,
  projectId?: string
): Promise<string | null> => {
  try {
    const supabaseClient = supabase as any

    // Check if conversation exists
    const { data: existingConv } = await supabaseClient
      .from('conversations')
      .select('id')
      .contains('participants', [currentUserId, otherUserId])
      .single()

    if (existingConv && existingConv.id) {
      return existingConv.id
    }

    // Create new conversation
    const { data: newConv, error } = await supabaseClient
      .from('conversations')
      .insert({
        participants: [currentUserId, otherUserId],
        project_id: projectId || null,
      })
      .select('id')
      .single()

    if (error) throw error

    return newConv?.id || null
  } catch (error) {
    console.error('Error getting/creating conversation:', error)
    return null
  }
}

// Helper per inviare messaggio di sistema
export const sendSystemMessage = async (
  conversationId: string,
  content: string
): Promise<boolean> => {
  try {
    const supabaseClient = supabase as any

    const { error } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: '00000000-0000-0000-0000-000000000000', // System user ID
        content,
        message_type: 'system',
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error sending system message:', error)
    return false
  }
}

// Helper per typing indicator
export const updateTypingIndicator = async (
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> => {
  const supabaseClient = supabase as any

  if (isTyping) {
    await supabaseClient
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        timestamp: new Date().toISOString(),
      })
  } else {
    await supabaseClient
      .from('typing_indicators')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
  }
}

// Subscribe to typing indicators
export const subscribeToTyping = (
  conversationId: string,
  currentUserId: string,
  callback: (typingUsers: string[]) => void
) => {
  const supabaseClient = supabase as any

  const channel = supabaseClient
    .channel(`typing-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async () => {
        // Fetch current typing users
        const { data } = await supabaseClient
          .from('typing_indicators')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', currentUserId)
          .gte('timestamp', new Date(Date.now() - 10000).toISOString()) // Last 10 seconds

        callback(data?.map((d: any) => d.user_id) || [])
      }
    )
    .subscribe()

  return () => {
    supabaseClient.removeChannel(channel)
  }
}