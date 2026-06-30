import { supabase } from '@/api/supabase'
import type { UserProfile, UserRole } from '@/types/user'

interface RawProfileRecord {
  id: unknown
  student_id: unknown
  full_name: unknown
  role: unknown
  avatar_url: unknown
  created_at: unknown
  updated_at: unknown
}

const isUserRole = (value: unknown): value is UserRole =>
  value === 'student' || value === 'club_leader' || value === 'admin'

const parseProfile = (value: unknown): UserProfile | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as RawProfileRecord

  if (
    typeof record.id !== 'string'
    || typeof record.full_name !== 'string'
    || !isUserRole(record.role)
    || typeof record.created_at !== 'string'
    || typeof record.updated_at !== 'string'
  ) {
    return null
  }

  return {
    id: record.id,
    student_id: typeof record.student_id === 'string' ? record.student_id : null,
    full_name: record.full_name,
    role: record.role,
    avatar_url: typeof record.avatar_url === 'string' ? record.avatar_url : null,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

export const getProfileByUserId = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, student_id, full_name, role, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  const profile = parseProfile(data)

  if (!profile) {
    throw new Error('未读取到有效的用户资料，请确认 profiles 表和触发器配置正常。')
  }

  return profile
}
