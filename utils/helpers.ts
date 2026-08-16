export const generateCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getImageUrl = (fileName: string, supabase: any): string => {
  if (!fileName) return ''
  const cleanName = fileName.includes('/') ? fileName.split('/').pop() : fileName
  const { data } = supabase.storage.from('photos').getPublicUrl(cleanName)
  return data?.publicUrl || ''
}

export const getRandomRotation = (index?: number): number => {
  const rotations = [-3, 2, -5, 4, -2, 3, -4, 5, -6, 2]
  const safeIndex = index ?? 0
  return rotations[safeIndex % rotations.length] ?? 0
}