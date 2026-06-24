export type UserRole = 'student' | 'club_leader' | 'admin';

export interface UserProfile {
  id: string;
  student_id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}
