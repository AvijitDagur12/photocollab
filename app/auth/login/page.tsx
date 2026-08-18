'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 py-3 px-4 text-center">
        <h1 className="text-white text-lg font-bold tracking-wider">Ztag v1</h1>
      </div>

      {/* Login Card */}
      <div className="bg-white/5 backdrop-blur-lg p-6 sm:p-8 rounded-2xl w-full max-w-sm sm:max-w-md border border-white/10 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-1">Welcome Back</h2>
        <p className="text-gray-400 text-center text-sm sm:text-base mb-6">Login to your Ztag wall</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm sm:text-base"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm sm:text-base"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="text-red-400 text-xs sm:text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-4 text-xs sm:text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}