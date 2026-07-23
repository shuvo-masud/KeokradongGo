import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase, Profile } from './supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (data: SignUpData) => Promise<{ error: string | null }>
  resetPasswordForEmail: (email: string, redirectTo?: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  fullName: string
  phone?: string
  role: 'consumer' | 'seller' | 'agent' | 'admin' | 'super_admin'
  districtId?: string
  businessName?: string
  nationalId?: string
  sellerProductsDesc?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  async function loadProfile(uid: string) {
    setProfileLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        district:districts(*)
      `)
      .eq('id', uid)
      .maybeSingle()

    if (error) {
      console.error('Profile loading error:', error.message)
      setProfile(null)
    } else {
      setProfile(data as Profile | null)
    }

    setProfileLoading(false)
  }

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      }

      setLoading(false)
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      await loadProfile(data.user.id)
    }

    return { error: null }
  }

  async function signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName.trim(),
          phone: data.phone?.trim() || null,
          role: data.role,
          district_id: data.districtId || null,
          business_name: data.businessName?.trim() || null,
          national_id: data.nationalId?.trim() || null,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (!authData.user) {
      return { error: 'Registration failed' }
    }

    if (authData.session) {
      await loadProfile(authData.user.id)
    }

    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()

    setSession(null)
    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id)
    }
  }

  async function resetPasswordForEmail(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        profileLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}