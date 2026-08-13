'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CommentModal({ photoId, onCloseAction }: { photoId: string; onCloseAction: () => void }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUserId(data.user?.id || null)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const addComment = async () => {
    if (!newComment.trim()) return
    const user = await supabase.auth.getUser()
    await supabase.from('comments').insert({
      photo_id: photoId,
      user_id: user.data.user?.id,
      content: newComment
    })
    setNewComment('')
    fetchComments()
  }

  const updateComment = async (id: string) => {
    if (!editContent.trim()) return
    await supabase
      .from('comments')
      .update({ content: editContent })
      .eq('id', id)
    setEditingId(null)
    setEditContent('')
    fetchComments()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl mb-4">💬 Comments</h2>
        
        <div className="space-y-2 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-100 p-2 rounded">
              {editingId === c.id ? (
                <div className="flex gap-2">
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 p-1 border rounded"
                  />
                  <button onClick={() => updateComment(c.id)} className="bg-green-500 text-white px-2 rounded">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-300 px-2 rounded">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p>{c.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {c.user_id === userId ? 'You' : 'Friend'}
                    </p>
                    {c.user_id === userId && (
                      <button
                        onClick={() => {
                          setEditingId(c.id)
                          setEditContent(c.content)
                        }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded"
            placeholder="Add comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={addComment} className="bg-pink-500 text-white p-2 rounded hover:bg-pink-600">
            Send
          </button>
        </div>
        
        <button onClick={onCloseAction} className="mt-4 w-full bg-gray-300 p-2 rounded hover:bg-gray-400">
          Close
        </button>
      </div>
    </div>
  )
}