import { defineStore } from 'pinia'
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js'
import { supabase } from '@/api/supabase'
import { getProfileByUserId } from '@/api/profiles'
import type { UserProfile, UserRole } from '@/types/user'

interface UserSessionState {
  initialized: boolean
  isLoading: boolean
  userId: string | null
  email: string
  profile: UserProfile | null
  authError: string
  authSubscription: Subscription | null
}

const defaultState = (): UserSessionState => ({
  initialized: false,
  isLoading: false,
  userId: null,
  email: '',
  profile: null,
  authError: '',
  authSubscription: null,
})

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '认证状态同步失败，请稍后重试。'
}

export const useUserStore = defineStore('user', {
  state: defaultState,
  getters: {
    isAuthenticated: (state) => state.profile !== null,
    role: (state): UserRole | null => state.profile?.role ?? null,
    fullName: (state) => state.profile?.full_name ?? '',
    studentId: (state) => state.profile?.student_id ?? '',
    isClubLeader: (state) => state.profile?.role === 'club_leader' || state.profile?.role === 'admin',
    dashboardRoute: (state) => (state.profile?.role === 'club_leader' || state.profile?.role === 'admin'
      ? '/backend/club'
      : '/student/dashboard'),
  },
  actions: {
    async initializeAuth() {
      if (this.initialized) {
        return
      }

      this.isLoading = true
      this.setupAuthListener()

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        await this.applySession(data.session)
      } catch (error: unknown) {
        this.authError = getErrorMessage(error)
        this.clearLocalState()
      } finally {
        this.initialized = true
        this.isLoading = false
      }
    },
    setupAuthListener() {
      if (this.authSubscription) {
        return
      }

      const { data } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          void this.applySession(session)
        },
      )

      this.authSubscription = data.subscription
    },
    async refreshProfile() {
      if (!this.userId) {
        return
      }

      try {
        this.profile = await getProfileByUserId(this.userId)
        this.authError = ''
      } catch (error: unknown) {
        this.authError = getErrorMessage(error)
        this.profile = null
      }
    },
    async syncCurrentSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        await this.applySession(data.session)
      } catch (error: unknown) {
        this.authError = getErrorMessage(error)
        this.clearLocalState()
      }
    },
    async applySession(session: Session | null) {
      if (!session?.user) {
        this.clearLocalState()
        this.initialized = true
        return
      }

      this.userId = session.user.id
      this.email = session.user.email ?? ''

      await this.refreshProfile()
      this.initialized = true
    },
    clearLocalState() {
      this.userId = null
      this.email = ''
      this.profile = null
    },
    async signOut() {
      try {
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }

        this.authError = ''
      } finally {
        this.clearLocalState()
      }
    },
  },
})
