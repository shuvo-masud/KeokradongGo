import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

function hasRecoveryParams() {
  const hash = window.location.hash
  const search = window.location.search

  return (
    hash.includes('type=recovery') ||
    hash.includes('access_token=') ||
    search.includes('code=') ||
    search.includes('type=recovery')
  )
}

function clearRecoveryParamsFromUrl() {
  window.history.replaceState({}, document.title, window.location.pathname)
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, signOut } = useAuth()

  const [checkingLink, setCheckingLink] = useState(true)
  const [linkValid, setLinkValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function establishRecoverySession() {
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')
      const type = queryParams.get('type')
      const hash = window.location.hash

      // 1. Handle PKCE Code Flow
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!isMounted) return

        if (exchangeError) {
          console.error('Code exchange failed:', exchangeError.message)
          setLinkValid(false)
          setCheckingLink(false)
          clearRecoveryParamsFromUrl()
          return
        }

        clearRecoveryParamsFromUrl()
        setLinkValid(true)
        setCheckingLink(false)
        return
      }

      // 2. Handle Hash / Recovery Type Flow
      if (hash.includes('type=recovery') || type === 'recovery' || hash.includes('access_token=')) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!isMounted) return

        if (sessionError || !session) {
          setLinkValid(false)
          setCheckingLink(false)
          return
        }

        clearRecoveryParamsFromUrl()
        setLinkValid(true)
        setCheckingLink(false)
        return
      }

      // 3. Check if an active recovery session already exists
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setLinkValid(true)
        setCheckingLink(false)
        return
      }

      if (!isMounted) return
      setLinkValid(false)
      setCheckingLink(false)
    }

    establishRecoverySession()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setFormLoading(true)

    try {
      const { error: updateError } = await updatePassword(password)
      if (updateError) throw new Error(updateError)

      await signOut()
      setSuccess(true)

      window.setTimeout(() => {
        navigate('/auth', { replace: true })
      }, 2500)
    } catch (err: any) {
      setError(err.message || 'Failed to update password.')
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
        <div className="text-2xl font-bold tracking-tight">Keokradong</div>
        <div>
          <h1 className="text-4xl font-extrabold mb-6">Set a new password</h1>
          <p className="text-primary-200 text-lg">
            Choose a strong password to secure your account.
          </p>
        </div>
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {checkingLink ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
              <p className="text-sm text-gray-500">Verifying reset link...</p>
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h2 className="text-2xl font-bold">Password updated</h2>
              <p className="text-gray-600 text-sm">
                Your password has been changed. Redirecting you to sign in...
              </p>
            </div>
          ) : !linkValid ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">⚠️</div>
              <h2 className="text-2xl font-bold">Invalid or expired link</h2>
              <p className="text-gray-600 text-sm">
                This password reset link is invalid or has expired. Request a new one from the sign-in page.
              </p>
              <Link
                to="/auth"
                className="inline-block w-full rounded-xl bg-primary-600 py-2.5 font-semibold text-white transition-colors hover:bg-primary-700 text-center"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your new password below.
              </p>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    className={inputClass}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full rounded-xl bg-primary-600 py-2.5 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                >
                  {formLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                <Link to="/auth" className="font-bold text-primary-600 hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}