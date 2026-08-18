'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getImageUrl } from '@/utils/helpers'
import CommentModal from '@/app/components/CommentModal'
import ConfirmModal from '@/app/components/ConfirmModal'
import toast from 'react-hot-toast'
import type { Photo } from '@/types'

export default function WallPage() {
  const params = useParams()
  const router = useRouter()
  const { user, supabase } = useAuth()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [date, setDate] = useState('')
  const [mood, setMood] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [wallDetails, setWallDetails] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchWallDetails()
    fetchPhotos()
  }, [])

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
      const photosWithUrls = data.map((photo) => ({
        ...photo,
        image_url: getImageUrl(photo.image_url, supabase)
      }))
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

    if (comment.trim()) {
      const { data: insertedPhoto } = await supabase
        .from('photos')
        .select('id')
        .eq('image_url', fileName)
        .single()
      
      if (insertedPhoto) {
        await supabase.from('comments').insert({
          photo_id: insertedPhoto.id,
          user_id: user.data.user?.id,
          content: comment
        })
      }
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

  const deletePhoto = async () => {
    if (!photoToDelete) return
    
    const photo = photos.find(p => p.id === photoToDelete)
    if (photo) {
      const fileName = photo.image_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('photos').remove([fileName])
      }
    }
    
    await supabase.from('photos').delete().eq('id', photoToDelete)
    toast.success('Memory deleted')
    setShowDeleteConfirm(false)
    setPhotoToDelete(null)
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
      className="min-h-screen p-4 sm:p-6 relative overflow-y-auto bg-black"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, #1a1a2e 0%, #0a0a15 40%, #000000 80%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Decorative minimal particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="absolute top-20 right-20 w-2 h-2 bg-white/15 rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-10 w-2 h-2 bg-white/10 rounded-full"></div>
        <div className="absolute top-2/3 left-5 w-1 h-1 bg-white/15 rounded-full"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/20 transition"
      >
        ← Back
      </button>

      {/* Wall title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 relative z-10 text-white/90 drop-shadow-lg tracking-wider">
        🌿 Memory Wall
      </h1>
      
      {/* Wall Details */}
      {wallDetails && (
        <div className="text-center mb-6 relative z-10">
          <p className="text-sm text-white/50 font-mono">Code: <span className="font-bold text-white/70">{wallDetails.join_code}</span></p>
          <p className="text-xs text-white/30">
            Created: {new Date(wallDetails.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Photo grid - 90 degree constant */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {photos.length === 0 ? (
          <p className="text-center text-white/40 col-span-full py-12">No memories yet. Add your first photo!</p>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(photo.image_url)}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="relative w-full aspect-square">
                  {photo.image_url ? (
                    <img
                      src={photo.image_url}
                      alt="Memory"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/30">
                      No image
                    </div>
                  )}
                  
                  {/* Delete button - only for owner */}
                  {user && wallDetails?.owner_id === user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPhotoToDelete(photo.id)
                        setShowDeleteConfirm(true)
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs z-10"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {/* Overlay - shows on hover */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{photo.date || 'No date'}</p>
                  {photo.mood && (
                    <p className="text-pink-300 text-sm mt-1">💭 {photo.mood}</p>
                  )}
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                    💬 <span>Comments</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Photo Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setShowUpload(true)}
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 transition text-3xl border-2 border-white/30 hover:scale-110"
        >
          +
        </button>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:scale-110 transition"
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl mb-4 text-pink-400">Add Memory</h2>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Memory?"
          message="Are you sure you want to delete this memory forever? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => {
            setShowDeleteConfirm(false)
            deletePhoto()
          }}
          onCancel={() => {
            setShowDeleteConfirm(false)
            setPhotoToDelete(null)
          }}
        />
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