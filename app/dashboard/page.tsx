'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PasswordModal from '@/app/components/PasswordModal'
import ConfirmModal from '@/app/components/ConfirmModal'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [walls, setWalls] = useState<any[]>([])
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteCode, setDeleteCode] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null)
  const [showWallPasswordModal, setShowWallPasswordModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) router.push('/auth/login')
      else {
        setUser(data.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single()
        if (profile) setUsername(profile.username)
        fetchWalls(data.user.id)
      }
    })
  }, [])

  const fetchWalls = async (userId: string) => {
    const { data } = await supabase
      .from('walls')
      .select('*')
      .or(`owner_id.eq.${userId},friend_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    setWalls(data || [])
  }

  const createWall = async (password: string) => {
  setLoading(true)
  setError('')

  console.log('Creating wall for user:', user.id)

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password
  })

  if (error) {
    console.log('Password error:', error)
    toast.error('❌ Incorrect password. Please try again.')
    setLoading(false)
    return
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  console.log('Generated code:', code)

  const { data, error: createError } = await supabase
    .from('walls')
    .insert({ owner_id: user.id, join_code: code })
    .select()
    .single()

  console.log('Insert result:', { data, createError })

  if (createError) {
    toast.error('Failed to create wall: ' + createError.message)
    setLoading(false)
  } else {
    setWalls([data, ...walls])
    setLoading(false)
    setShowPasswordModal(false)
    toast.success('✅ Wall created successfully!')
  }
}
  const verifyWallAccess = async (password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    })

    if (error) {
      toast.error('❌ Incorrect password.')
      return
    }

    setShowWallPasswordModal(false)
    router.push(`/wall/${selectedWallId}`)
  }

  const joinWall = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('walls')
      .select()
      .eq('join_code', joinCode.toUpperCase())
      .single()

    if (error || !data) {
      toast.error('❌ Invalid code. Please check and try again.')
      setLoading(false)
    } else {
      await supabase
        .from('walls')
        .update({ friend_id: user.id })
        .eq('id', data.id)
      fetchWalls(user.id)
      setJoinCode('')
      setLoading(false)
      toast.success('🎉 Joined wall successfully!')
    }
  }

  const deleteWall = async () => {
    const { data: wall } = await supabase
      .from('walls')
      .select('id')
      .eq('join_code', deleteCode.toUpperCase())
      .single()

    if (!wall) {
      toast.error('❌ Invalid delete code.')
      return
    }

    const confirm = window.confirm('⚠️ Are you sure? This will delete the entire wall forever.')
    if (!confirm) return

    const { data: photos } = await supabase
      .from('photos')
      .select('image_url')
      .eq('wall_id', wall.id)

    for (const photo of photos || []) {
      const path = photo.image_url.split('/').pop()
      if (path) await supabase.storage.from('photos').remove([path])
    }

    await supabase.from('walls').delete().eq('id', wall.id)
    fetchWalls(user.id)
    setDeleteCode('')
    setShowDelete(false)
    toast.success('🗑️ Wall deleted successfully.')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/50 text-lg">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white flex relative">
      {/* Mobile Hamburger - Bottom Right */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-2xl hover:scale-105 transition"
      >
        <span className="text-2xl">{sidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-40 w-80 bg-black/95 lg:bg-white/5 border-r border-white/10 p-6 min-h-screen transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-8 mt-12 lg:mt-0">
          <h1 className="text-2xl font-bold">🌸 Ztag</h1>
          <p className="text-gray-400 text-sm mt-1 truncate">Welcome, {username || user.email}</p>
        </div>

        <button
          onClick={() => {
            setShowPasswordModal(true)
            setSidebarOpen(false)
          }}
          disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 mb-6"
        >
          + Create New Wall
        </button>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 p-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 min-w-0"
            placeholder="Enter join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button
            onClick={joinWall}
            disabled={loading}
            className="p-2 px-4 bg-purple-500 rounded-xl hover:bg-purple-600 transition whitespace-nowrap"
          >
            Join
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="space-y-2">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">Your Walls</p>
          {walls.length === 0 ? (
            <p className="text-gray-500 text-sm">No walls yet. Create one!</p>
          ) : (
            walls.map((wall) => (
              <div
                key={wall.id}
                onClick={() => {
                  setSelectedWallId(wall.id)
                  setShowWallPasswordModal(true)
                  setSidebarOpen(false)
                }}
                className="p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition border border-white/5"
              >
                <div className="flex justify-between items-center">
                  <div className="truncate">
                    <p className="font-medium text-sm">{wall.join_code}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(wall.created_at).toLocaleDateString()}
                      {wall.owner_id === user.id ? ' • Owner' : ' • Friend'}
                    </p>
                  </div>
                  <span className="text-xs text-pink-400 flex-shrink-0">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Your Memory Walls</h2>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm sm:text-base"
          >
            🚪 Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {walls.map((wall) => (
            <div
              key={wall.id}
              onClick={() => {
                setSelectedWallId(wall.id)
                setShowWallPasswordModal(true)
              }}
              className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition group"
            >
              <div className="flex justify-between items-start">
                <div className="truncate">
                  <p className="text-base sm:text-lg font-semibold">🌿 {wall.join_code}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Created: {new Date(wall.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {wall.owner_id === user.id ? '👤 Owner' : '👥 Friend'}
                  </p>
                </div>
                <span className="text-xl sm:text-2xl group-hover:translate-x-1 transition flex-shrink-0">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 sm:mt-12 border-t border-red-500/20 pt-6">
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="text-red-400 hover:text-red-300 transition text-sm flex items-center gap-2"
          >
            🔴 Danger Zone
          </button>

          {showDelete && (
            <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md">
              <p className="text-red-400 text-sm mb-3">Enter wall code to delete permanently:</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-2 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 min-w-0"
                  placeholder="Enter wall code"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                />
                <button
                  onClick={deleteWall}
                  className="px-4 py-2 bg-red-500 rounded-xl hover:bg-red-600 transition whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal - Create Wall */}
{showPasswordModal && (
  <PasswordModal
    email={user.email}
    title="Create New Wall"
    message="Enter your password to create a new wall"
    onConfirm={createWall}
    onCancel={() => setShowPasswordModal(false)}
  />
)}

{/* Password Modal - Open Wall */}
{showWallPasswordModal && (
  <PasswordModal
    email={user.email}
    title="Access Wall"
    message="Enter your password to access this wall"
    onConfirm={verifyWallAccess}
    onCancel={() => setShowWallPasswordModal(false)}
  />
)}

      {/* Logout Modal */}
      {showLogoutModal && (
        <ConfirmModal
          title="Logout?"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
          onConfirm={() => {
            setShowLogoutModal(false)
            handleLogout()
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  )
}