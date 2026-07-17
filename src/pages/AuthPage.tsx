import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
interface District {
  id: string
  name: string
  division: string
}

export default function AuthPage() {
  const navigate = useNavigate()

  const {
    signIn,
    signUp,
    profile,
    user,
    loading,
  } = useAuth()
  


  const [districts, setDistricts] = useState<District[]>([])
  const [districtId, setDistrictId] = useState('')

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'consumer' | 'seller' | 'agent'>('consumer')
  const [districtName, setDistrictName] = useState('')
  const [shopName, setShopName] = useState('')
  const [nidNumber, setNidNumber] = useState('')


  useEffect(() => {

  async function fetchDistricts() {

    const {
      data,
      error,
    } = await supabase
      .from('districts')
      .select('id, name, division')
      .order('name', { ascending: true });


    if (error) {
      console.error(
        'District loading failed:',
        error.message
      )
      return
    }


    setDistricts(data || [])
  }


  fetchDistricts()

}, [])

  useEffect(() => {
    if (!loading && user && profile) {
      navigate('/dashboard')
    }
  }, [loading, user, profile, navigate])

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  setError(null)
  setFormLoading(true)

  try {
    if (mode === 'login') {
      const { error } = await signIn(email, password)

      if (error) throw new Error(error)

    } else {

      const { error } = await signUp({
        email,
        password,
        fullName: name.trim(),
        phone: phone.trim(),
        role,
        districtId: districtId || undefined,
        businessName:
          role === 'seller'
            ? shopName.trim()
            : undefined,
        nationalId:
          role !== 'consumer'
            ? nidNumber.trim()
            : undefined,
      })

      if (error) throw new Error(error)

      // SUCCESS: clear the form
      setName('')
      setPhone('')
      setEmail('')
      setPassword('')
      setRole('consumer')
      setShopName('')
      setNidNumber('')
      setDistrictId('')

      // Switch back to login
      setMode('login')

      alert('Confirm your Email & you are ready to sign in!')
    }
  const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

console.log({ data, error });

  } catch (err: any) {
    setError(err.message || 'Authentication failed')
  } finally {
    setFormLoading(false)
  }
}

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all'

  const labelClass =
    'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-1/2 bg-primary-900 p-12 flex-col justify-between text-white">
        <div className="text-2xl font-bold tracking-tight">
          Keokradong
        </div>

        <div>
          <h1 className="text-4xl font-extrabold mb-6">
            Authentic local goods, verified by agents.
          </h1>

          <p className="text-primary-200 text-lg">
            Every product is physically inspected by local district agents before reaching you.
          </p>
        </div>

        <div />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <h2 className="text-2xl font-bold mb-6">
            {mode === 'login'
              ? 'Welcome Back'
              : 'Join Keokradong'}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === 'register' && (
              <>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Role</label>

                  <div className="flex gap-2">
                    {(['consumer', 'seller', 'agent'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-semibold ${
                          role === r
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'seller' && (
                  <div>
                    <label className={labelClass}>Shop Name</label>
                    <input
                      className={inputClass}
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {role !== 'consumer' && (
                  <div>
                    <label className={labelClass}>NID Number</label>
                    <input
                      className={inputClass}
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>District</label>

                  <select
                     className={inputClass}
                     value={districtId}
                     onChange={(e) => setDistrictId(e.target.value)}
                    required
                             >
                  <option value="">
                  Select District
                  </option>

                 {districts.map((district) => (
                 <option
                 key={district.id}
                value={district.id}
                   >
                      {district.name}
                   </option>
                   ))}

              </select>
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full rounded-xl bg-primary-600 py-2.5 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {formLoading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}

            <button
              type="button"
              onClick={() =>
                setMode(mode === 'login' ? 'register' : 'login')
              }
              className="font-bold text-primary-600 hover:underline"
            >
              {mode === 'login'
                ? 'Sign Up'
                : 'Sign In'}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}
