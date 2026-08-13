'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CommentModal from '@/app/components/CommentModal'
import toast from 'react-hot-toast'

export default function WallPage() {
  const params = useParams()
  const [photos, setPhotos] = useState<any[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [date, setDate] = useState('')
  const [mood, setMood] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [wallDetails, setWallDetails] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchWallDetails()
    fetchPhotos()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const fetchWallDetails = async () => {
    const { data } = await supabase
      .from('walls')
      .select('*')
      .eq('id', params.id)
      .single()
    setWallDetails(data)
  }

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('wall_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('Fetch error:', error)
      return
    }

    if (data) {
      const photosWithUrls = data.map((photo) => {
        const fileName = photo.image_url.includes('/') 
          ? photo.image_url.split('/').pop() 
          : photo.image_url
        
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName || '')
        
        return {
          ...photo,
          image_url: urlData?.publicUrl || ''
        }
      })
      setPhotos(photosWithUrls)
    }
  }

  const uploadPhoto = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }
    
    setLoading(true)

    const fileName = `${Date.now()}_${file.name}`
    console.log('Uploading:', fileName)
    
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      toast.error('Upload failed: ' + uploadError.message)
      setLoading(false)
      return
    }

    console.log('Upload success!')

    const user = await supabase.auth.getUser()
    const { error: insertError } = await supabase.from('photos').insert({
      wall_id: params.id,
      user_id: user.data.user?.id,
      image_url: fileName,
      date,
      mood
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      toast.error('Failed to save: ' + insertError.message)
      setLoading(false)
      return
    }

    toast.success('Memory added! 🌸')
    setShowUpload(false)
    setFile(null)
    setDate('')
    setMood('')
    setComment('')
    setLoading(false)
    fetchPhotos()
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Delete this memory?')) return
    
    const photo = photos.find(p => p.id === photoId)
    if (photo) {
      const fileName = photo.image_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('photos').remove([fileName])
      }
    }
    
    await supabase.from('photos').delete().eq('id', photoId)
    toast.success('Memory deleted')
    fetchPhotos()
  }

  useEffect(() => {
    const updateActivity = () => {
      document.cookie = `last_activity=${Date.now()}; path=/; max-age=3600`
    }

    window.addEventListener('click', updateActivity)
    window.addEventListener('keydown', updateActivity)

    return () => {
      window.removeEventListener('click', updateActivity)
      window.removeEventListener('keydown', updateActivity)
    }
  }, [])

  return (
    <div
      className="min-h-screen p-4 sm:p-6 relative overflow-y-auto"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Green overlay for garden feel */}
      <div className="absolute inset-0 bg-green-900/20 backdrop-blur-[1px]"></div>

      {/* Decorative tree branches - SVG overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M100,100 Q300,50 400,200 Q500,350 700,300 Q900,250 1100,400" 
                stroke="#2d1b0e" strokeWidth="8" fill="none" className="branch"/>
          <path d="M400,200 Q450,150 500,180 Q550,210 600,190" 
                stroke="#2d1b0e" strokeWidth="5" fill="none" className="branch"/>
          <path d="M700,300 Q750,250 800,280 Q850,310 900,290" 
                stroke="#2d1b0e" strokeWidth="5" fill="none" className="branch"/>
          <path d="M300,50 Q350,20 400,50 Q450,80 500,60" 
                stroke="#2d1b0e" strokeWidth="4" fill="none" className="branch"/>
        </svg>
      </div>

      {/* Wall title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 relative z-10 text-white drop-shadow-lg tracking-wider">
        🌿 Memory Wall
      </h1>
      
      {/* Wall Details */}
      {wallDetails && (
        <div className="text-center mb-6 relative z-10">
          <p className="text-sm text-white/80 font-mono">Code: <span className="font-bold">{wallDetails.join_code}</span></p>
          <p className="text-xs text-white/60">
            Created: {new Date(wallDetails.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Photo grid - Hanging from branches */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {photos.length === 0 ? (
          <p className="text-center text-white/60 col-span-full py-12">No memories yet. Add your first photo!</p>
        ) : (
          photos.map((photo, index) => {
            // Random hanging angles and heights
            const angles = [-3, 2, -5, 4, -2, 3, -4, 5, -6, 2]
            const angle = angles[index % angles.length]
            const topOffsets = ['mt-0', 'mt-8', 'mt-4', 'mt-12', 'mt-6', 'mt-16']
            const topOffset = topOffsets[index % topOffsets.length]
            
            return (
              <div
                key={photo.id}
                className={`relative ${topOffset} group`}
                style={{ transform: `rotate(${angle}deg)` }}
              >
                {/* Hanging string */}
                <div className="absolute -top-8 left-1/2 w-[1px] h-8 bg-[#2d1b0e]/60 origin-top"
                     style={{ transform: 'rotate(var(--string-angle, 0deg))' }}></div>
                
                {/* Photo card */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <div className="relative w-full aspect-square">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url}
                        alt="Memory"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/30">
                        No image
                      </div>
                    )}
                    
                    {/* Date badge - always visible */}
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                      <p className="text-white text-xs font-medium">{photo.date || 'No date'}</p>
                    </div>
                    
                    {/* Delete button - only for owner */}
                    {user && wallDetails?.owner_id === user.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePhoto(photo.id)
                        }}
                        className="absolute top-3 right-3 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {/* Bottom overlay with mood and comments */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 cursor-pointer group-hover:from-black/90 transition-all duration-300"
                    onClick={() => setSelectedPhoto(photo.id)}
                  >
                    {photo.mood && (
                      <p className="text-pink-300 text-xs font-medium">💭 {photo.mood}</p>
                    )}
                    <div className="flex items-center gap-1 text-white/70 text-xs hover:text-white transition">
                      💬 <span>Comments</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Photo Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setShowUpload(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 transition text-3xl border-2 border-white/30 hover:scale-110"
        >
          🌸
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl mb-4 text-pink-400">🌸 Add Memory</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-3 w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Mood (e.g. Happy, Romantic)"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Comment"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={uploadPhoto}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-2 rounded-xl hover:scale-105 transition"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 bg-white/10 text-gray-300 p-2 rounded-xl hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {selectedPhoto && (
        <CommentModal
          photoId={selectedPhoto}
          onCloseAction={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}