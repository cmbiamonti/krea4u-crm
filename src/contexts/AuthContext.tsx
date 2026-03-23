// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface Profile {
  id: string
  email?: string
  role?: 'artist' | 'curator' | 'site_owner'
  subscription_tier?: 'free' | 'basic' | 'pro'
  curator_name?: string
  company_name?: string
  avatar_url?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  instagram_handle?: string
  profile_complete?: boolean
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadingProfileRef = useRef(false)
  const initializedRef = useRef(false)
  const mountedRef = useRef(true)
  const profileLoadedForUserRef = useRef<string | null>(null)

  useEffect(() => {
    logger.log('📊 AuthContext STATE:', {
      hasUser: !!user,
      userId: user?.id?.slice(0, 8),
      hasProfile: !!profile,
      profileId: profile?.id?.slice(0, 8),
      role: profile?.role,
      hasSession: !!session,
      loading,
      timestamp: new Date().toISOString()
    })
  }, [user, profile, session, loading])

  useEffect(() => {
    // Gestione automatica del refresh token
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return

      // Gestisci TOKEN_REFRESHED
      if (event === 'TOKEN_REFRESHED') {
        logger.log('🔄 Token refreshed successfully')
        if (session) {
          setSession(session)
          setUser(session.user)
        }
      }

      // Gestisci errori di token
      if (event === 'SIGNED_OUT') {
        logger.log('🚪 Session expired or invalid token, clearing data')
        setUser(null)
        setProfile(null)
        setSession(null)
        profileLoadedForUserRef.current = null
        localStorage.clear()
        sessionStorage.clear()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Aggiungi anche un metodo per gestire refresh manuale
  const handleRefreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        logger.error('❌ Failed to refresh session:', error)
        // Se il refresh fallisce, forza logout
        await signOut()
        return
      }
      
      if (data.session) {
        logger.log('✅ Session refreshed')
        setSession(data.session)
        setUser(data.session.user)
      }
    } catch (error) {
      logger.error('❌ Error refreshing session:', error)
      await signOut()
    }
  }

  // ✅ CARICA PROFILO da auth.users + role-specific table
  const loadProfile = async (userId: string, authUser: User) => {
    if (loadingProfileRef.current) {
      logger.log('⏸️ AuthContext: Profile già in caricamento, skip')
      return
    }

    if (profileLoadedForUserRef.current === userId) {
      logger.log('✅ AuthContext: Profile già caricato, skip')
      return
    }

    loadingProfileRef.current = true
    logger.log(`📂 AuthContext: Loading profile for user: ${userId}`)

    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current && !profile) {
        logger.warn('⚠️ AuthContext: Profile loading timeout, using fallback')
        setProfile({
          id: userId,
          email: authUser.email,
          role: authUser.user_metadata?.role || 'site_owner',
          subscription_tier: 'free',
          profile_complete: false,
        } as Profile)
        profileLoadedForUserRef.current = userId
        loadingProfileRef.current = false
      }
    }, 3000)

    try {
      // ✅ 1. Estrai dati base da auth.users (via user object)
      const role = authUser.user_metadata?.role || 'site_owner'
      const baseProfile: Profile = {
        id: userId,
        email: authUser.email,
        role: role as 'artist' | 'curator' | 'site_owner',
        subscription_tier: 'free',
        phone: authUser.phone || undefined,
        profile_complete: false,
      }

      logger.log('✅ AuthContext: Base profile from auth.users:', baseProfile.email, 'role:', baseProfile.role)

      // ✅ 2. Carica dati specifici del ruolo
      let roleSpecificData = null

      if (role === 'artist') {
        logger.log('📋 Loading artist_profiles...')
        // ✅ FIX: Cast a any per bypassare type check
        const { data: artistData, error: artistError } = await (supabase as any)
          .from('artist_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (artistError && artistError.code !== 'PGRST116') {
          logger.warn('⚠️ Artist profile error:', artistError.message)
        } else if (!artistData) {
          logger.log('📝 Creating artist_profiles...')
          await createRoleProfile(userId, 'artist')
        } else {
          roleSpecificData = artistData
          logger.log('✅ Artist profile loaded')
        }
      } else if (role === 'curator') {
        logger.log('📋 Loading curator_profiles...')
        // ✅ FIX: Cast a any
        const { data: curatorData, error: curatorError } = await (supabase as any)
          .from('curator_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (curatorError && curatorError.code !== 'PGRST116') {
          logger.warn('⚠️ Curator profile error:', curatorError.message)
        } else if (!curatorData) {
          logger.log('📝 Creating curator_profiles...')
          await createRoleProfile(userId, 'curator')
        } else {
          roleSpecificData = curatorData
          logger.log('✅ Curator profile loaded')
        }
      } else {
        logger.log('📋 Site owner - no specific profile needed')
      }

      clearTimeout(safetyTimeout)

      // ✅ 3. Merge dati
      const mergedProfile = {
        ...baseProfile,
        ...roleSpecificData,
      }

      logger.log('✅ AuthContext: Profile loaded successfully')
      if (mountedRef.current) {
        setProfile(mergedProfile as Profile)
        profileLoadedForUserRef.current = userId
      }

    } catch (error: any) {
      clearTimeout(safetyTimeout)
      logger.warn('⚠️ AuthContext: Profile load failed (non-critical):', error.message)

      if (mountedRef.current) {
        setProfile({
          id: userId,
          email: authUser.email,
          role: authUser.user_metadata?.role || 'site_owner',
          profile_complete: false,
        } as Profile)
        profileLoadedForUserRef.current = userId
      }
    } finally {
      loadingProfileRef.current = false
    }
  }

  // ✅ CREA PROFILO SPECIFICO (solo artist/curator)
  const createRoleProfile = async (userId: string, role: 'artist' | 'curator') => {
    try {
      const tableName = role === 'artist' ? 'artist_profiles' : 'curator_profiles'
      logger.log(`📝 Creating ${tableName} for user ${userId}`)

      // ✅ FIX: Cast a any
      const { data, error } = await (supabase as any)
        .from(tableName)
        .insert({
          id: userId,
          profile_complete: false,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          logger.log(`✅ ${tableName} already exists`)
        } else {
          logger.warn(`⚠️ Failed to create ${tableName}:`, error.message)
        }
      } else {
        logger.log(`✅ ${tableName} created`)
      }
    } catch (error: any) {
      logger.warn(`⚠️ Error creating role profile:`, error.message)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      logger.log('📝 AuthContext: Signing up user:', email)
      logger.log('📋 Metadata:', metadata)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            ...metadata,
            role: metadata?.role || 'site_owner',
          },
        },
      })

      if (error) throw error
      logger.log('✅ AuthContext: Sign up successful')
      logger.log('👤 User ID:', data.user?.id)
      logger.log('🎭 Role:', data.user?.user_metadata?.role)
    } catch (error: any) {
      logger.error('❌ AuthContext: Sign up error:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      logger.log('🔑 AuthContext: Sending password reset email')

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      logger.log('✅ AuthContext: Password reset email sent')
    } catch (error: any) {
      logger.error('❌ AuthContext: Reset password error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')
      if (!profile) throw new Error('No profile loaded')

      logger.log('💾 AuthContext: Updating profile')
      logger.log('📋 Current role:', profile.role)

      // ✅ Site owner: nessuna tabella specifica
      if (profile.role === 'site_owner') {
        logger.log('📋 Site owner: updating only local state')
        
        if (mountedRef.current) {
          setProfile({
            ...profile,
            ...updates,
            updated_at: new Date().toISOString(),
          } as Profile)
        }
        logger.log('✅ AuthContext: Profile updated (local only)')
        return
      }

      // ✅ Artist/Curator: aggiorna tabella specifica
      const tableName = profile.role === 'artist' ? 'artist_profiles' : 'curator_profiles'
      logger.log(`📋 Updating ${tableName}`)

      // ✅ FIX: Cast a any
      const { data, error } = await (supabase as any)
        .from(tableName)
        .update({
          ...updates,
          curator_name: updates.curator_name?.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      if (mountedRef.current) {
        setProfile({
          ...profile,
          ...data,
          ...updates,
        } as Profile)
      }
      logger.log('✅ AuthContext: Profile updated')
    } catch (error: any) {
      logger.error('❌ AuthContext: Update profile error:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      profileLoadedForUserRef.current = null
      loadingProfileRef.current = false
      await loadProfile(user.id, user)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      logger.log('🚪 AuthContext: Signing out...')

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      if (mountedRef.current) {
        setUser(null)
        setProfile(null)
        setSession(null)
        profileLoadedForUserRef.current = null
      }

      localStorage.clear()
      sessionStorage.clear()

      logger.log('✅ AuthContext: Signed out successfully')
    } catch (error) {
      logger.error('❌ AuthContext: Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true

    if (initializedRef.current && import.meta.env.PROD) {
      logger.log('⏭️ AuthContext: Already initialized')
      return
    }

    logger.log('🔍 AuthContext: Initializing auth...')
    initializedRef.current = true

    const initializeAuth = async () => {
      const startTime = Date.now()

      try {
        logger.log('🔄 AuthContext: Getting session...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (!mountedRef.current) return

        if (session) {
          logger.log('✅ AuthContext: Session found:', session.user.email)
          logger.log('🎭 User role:', session.user.user_metadata?.role)

          setSession(session)
          setUser(session.user)
          setLoading(false)

          setTimeout(() => {
            loadProfile(session.user.id, session.user).catch(err => {
              logger.warn('⚠️ Background profile load failed:', err.message)
            })
          }, 100)

        } else {
          logger.log('ℹ️ AuthContext: No session')
          setLoading(false)
        }

        const loadTime = Date.now() - startTime
        logger.log(`⏱️ AuthContext: Init completed in ${loadTime}ms`)

      } catch (error) {
        logger.error('❌ AuthContext: Init error:', error)
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        if (event === 'INITIAL_SESSION') {
          logger.log('⏭️ AuthContext: Skipping INITIAL_SESSION')
          return
        }

        logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        logger.log('🔄 AuthContext: Auth state changed!')
        logger.log('📋 Event:', event)
        logger.log('👤 User:', session?.user?.email || 'No user')
        logger.log('🎭 Role:', session?.user?.user_metadata?.role || 'N/A')
        logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          logger.log('✅ AuthContext: User signed in')

          if (profileLoadedForUserRef.current !== session.user.id) {
            loadProfile(session.user.id, session.user).catch(err => {
              logger.warn('⚠️ Profile load failed:', err.message)
            })
          }

        } else if (event === 'SIGNED_OUT') {
          logger.log('🚪 AuthContext: User signed out')
          setProfile(null)
          profileLoadedForUserRef.current = null

        } else if (event === 'TOKEN_REFRESHED') {
          logger.log('🔄 AuthContext: Token refreshed')
        }
      }
    )

    initializeAuth()

    return () => {
      logger.log('🔌 AuthContext: Cleanup')
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    signUp,
    resetPassword,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}