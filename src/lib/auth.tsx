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
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Updated interface to align perfectly with your public.users PostgreSQL table schema structure
interface SignUpData {
  email: string
  password: string
  name: string
  phone?: string | null
  role: 'CONSUMER' | 'SELLER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN'
  district: string
  shopName?: string | null
  nidNumber?: string | null
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
    const { data } = await supabase.from('users').select('*').eq('id', uid).maybeSingle()
    setProfile(data as Profile | null)
    setProfileLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        (async () => {
          await loadProfile(session.user.id)
        })()
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      await loadProfile(data.user.id)
    }
    return { error: null }
  }

  async function signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error) return { error: error.message }
    if (!authData.user) return { error: 'Registration failed' }

    // Adjusted properties to insert into your public.users schema explicitly
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      name: data.name,
      phone: data.phone ?? null,
      role: data.role,
      district: data.district,
      nid_number: data.nidNumber ?? null,
      shop_name: data.shopName ?? null,
    })
    
    if (profileError) return { error: profileError.message }

    await loadProfile(authData.user.id)
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, profileLoading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}