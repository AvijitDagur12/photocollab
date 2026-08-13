'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ShareCode({ wallId }: { wallId: string }) {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCode()
  }, [])

  const fetchCode = async () => {
    const { data } = await supabase
      .from('walls')
      .select('join_code')
      .eq('id', wallId)
      .single()
    if (data) setCode(data.join_code)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg inline-block">
      <p className="text-sm text-gray-600">Share this code with your friend:</p>
      <div className="flex items-center gap-2 mt-2">
        <code className="bg-gray-100 px-4 py-2 rounded text-lg font-bold text-pink-600">
          {code || 'Loading...'}
        </code>
        <button
          onClick={copyCode}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
      </div>
    </div>
  )
}