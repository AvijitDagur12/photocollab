import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const wallId = url.searchParams.get('wallId')

  if (!wallId) {
    return NextResponse.json({ error: 'Missing wallId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('wall_id', wallId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}