'use client'
import { useState } from 'react'

export default function PasswordModal({ 
  onConfirm, 
  onCancel,
  email,
  title = 'Verify Identity',
  message = 'Enter your password to continue'
}: { 
  onConfirm: (password: string) => void
  onCancel: () => void
  email: string
  title?: string
  message?: string
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('Password required')
      return
    }
    onConfirm(password)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 text-sm mt-1">{message}</p>
          <p className="text-gray-500 text-xs mt-2">{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}