'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if username exists
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      setError('Username already taken')
      setLoading(false)
      return
    }

    // Check if email exists in auth users
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      setError('Email already has an account. Please login.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/verify` }
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      await supabase
        .from('profiles')
        .insert({ id: data.user.id, email: data.user.email, username })
      router.push('/auth/verify')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
        <p className="text-gray-400 text-center mb-6">Start your Ztag wall</p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-4 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}