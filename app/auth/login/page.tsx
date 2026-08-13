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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h1>
        <p className="text-gray-400 text-center mb-6">Login to your Ztag wall</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-4 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}