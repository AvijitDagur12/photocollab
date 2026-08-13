'use client'

export default function ConfirmModal({ 
  onConfirm, 
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: { 
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 text-sm mt-2">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 p-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 p-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}