import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase, District } from '../lib/supabase'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [districts, setDistricts] = useState<District[]>([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'consumer' | 'seller' | 'agent'>('consumer')
  const [districtId, setDistrictId] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [nationalId, setNationalId] = useState('')

  useEffect(() => {
    supabase
      .from('districts')
      .select('*')
      .order('name')
      .then(({ data }) => setDistricts(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else navigate('/dashboard')
    } else {
      if (role === 'seller' && !businessName) {
        setError('Business name is required for sellers')
        setLoading(false)
        return
      }
      if (role === 'agent' && !districtId) {
        setError('Please select your operating district')
        setLoading(false)
        return
      }
      if ((role === 'seller' || role === 'agent') && !nationalId) {
        setError('National ID is required')
        setLoading(false)
        return
      }
      
      const { error } = await signUp({
        email,
        password,
        fullName,
        phone,
        role,
        districtId,
        businessName,
        nationalId,
      })
      
      if (error) setError(error)
      else navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">K</div>
            <div>
              <div className="font-display font-bold text-2xl">Keokradong</div>
              <div className="text-sm text-primary-200">কেওক্রাডং</div>
            </div>
          </div>
          <h1 className="font-display font-extrabold text-4xl leading-tight mb-4">
            Authentic local goods,<br />verified by trusted agents.
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-md">
            Join Bangladesh's first trust-centric marketplace where every product is physically inspected by local district agents before reaching you.
          </p>
          <div className="space-y-3">
            {[
              'Physical agent verification on every product',
              'Filter authentic goods by district of origin',
              'Real-time order tracking and direct chats',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-primary-100">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo header */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg">K</div>
            <span className="font-display font-bold text-xl">Keokradong</span>
          </div>

          <h2 className="font-display font-bold text-2xl mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {mode === 'login' ? 'Sign in to your Keokradong account' : 'Join the trusted local marketplace'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Register as</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['consumer', 'seller', 'agent'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {r === 'consumer' ? '🛍️ Consumer' : r === 'seller' ? '🌾 Seller' : '🔍 Agent'}
                      </button>
                    ))}
                  </div>
                </div>
                {role === 'seller' && (
                  <div>
                    <label className="label">Business / Shop Name</label>
                    <input className="input" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Rajshahi Mango Farm" />
                  </div>
                )}
                {(role === 'seller' || role === 'agent') && (
                  <div>
                    <label className="label">National ID (NID)</label>
                    <input className="input" value={nationalId} onChange={e => setNationalId(e.target.value)} placeholder="Your NID number" />
                  </div>
                )}
                {role === 'agent' && (
                  <div>
                    <label className="label">Operating District</label>
                    <select className="input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
                      <option value="">Select your district</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name} — {d.division}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
              </>
            )}
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }} className="text-primary-600 font-semibold hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}