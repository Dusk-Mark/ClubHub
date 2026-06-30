export type UserRole = 'student' | 'club_leader' | 'admin'

export interface UserProfile {
  id: string
  student_id: string | null
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}
