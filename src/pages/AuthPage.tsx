import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const BANGLADESH_DISTRICTS = [
  { division: 'Barishal', districts: ['Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'] },
  { division: 'Chattogram', districts: ['Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'] },
  { division: 'Dhaka', districts: ['Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail'] },
  { division: 'Khulna', districts: ['Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'] },
  { division: 'Mymensingh', districts: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'] },
  { division: 'Rajshahi', districts: ['Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'] },
  { division: 'Rangpur', districts: ['Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon'] },
  { division: 'Sylhet', districts: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'] }
]

export default function AuthPage() {
  const navigate = useNavigate()
  const { signUp, signIn, profile, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'CONSUMER' | 'SELLER' | 'AGENT'>('CONSUMER')
  const [districtName, setDistrictName] = useState('')
  const [shopName, setShopName] = useState('')
  const [nidNumber, setNidNumber] = useState('')

  useEffect(() => {
    if (!loading && profile) navigate('/dashboard')
  }, [profile, loading, navigate])

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
          email, password, name, phone, role,
          district: districtName,
          nidNumber: (role !== 'CONSUMER') ? nidNumber : null,
          shopName: (role === 'SELLER') ? shopName : null,
        })
        if (error) throw new Error(error)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
      setFormLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-1/2 bg-primary-900 p-12 flex-col justify-between text-white">
        <div className="text-2xl font-bold tracking-tight">Keokradong</div>
        <div>
          <h1 className="text-4xl font-extrabold mb-6">Authentic local goods, verified by agents.</h1>
          <p className="text-primary-200 text-lg">Every product is physically inspected by local district agents before reaching you.</p>
        </div>
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6">{mode === 'login' ? 'Welcome Back' : 'Join Keokradong'}</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <div className="flex gap-2">
                    {(['consumer', 'seller', 'agent'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${role === r ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {role === 'SELLER' && (
                  <div>
                    <label className={labelClass}>Shop Name</label>
                    <input className={inputClass} value={shopName} onChange={e => setShopName(e.target.value)} required />
                  </div>
                )}
                {role !== 'CONSUMER' && (
                  <div>
                    <label className={labelClass}>NID Number</label>
                    <input className={inputClass} value={nidNumber} onChange={e => setNidNumber(e.target.value)} required />
                  </div>
                )}
                <div>
                  <label className={labelClass}>District</label>
                  <select className={inputClass} value={districtName} onChange={e => setDistrictName(e.target.value)} required>
                    <option value="">Select District</option>
                    {BANGLADESH_DISTRICTS.map(g => (
                      <optgroup key={g.division} label={g.division}>{g.districts.map(d => <option key={d} value={d}>{d}</option>)}</optgroup>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button disabled={formLoading} className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              {formLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary-600 font-bold hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}