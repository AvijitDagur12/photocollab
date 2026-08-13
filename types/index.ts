export interface User {
  id: string
  email: string
  username?: string
  created_at?: string
}

export interface Wall {
  id: string
  owner_id: string
  friend_id?: string
  join_code: string
  created_at: string
}

export interface Photo {
  id: string
  wall_id: string
  user_id: string
  image_url: string
  date?: string
  mood?: string
  created_at: string
}

export interface Comment {
  id: string
  photo_id: string
  user_id: string
  content: string
  created_at: string
}