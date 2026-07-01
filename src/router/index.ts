import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/frontend/HomePage.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import BackendEntry from '../views/auth/BackendEntry.vue'
import BackendLogin from '../views/auth/BackendLogin.vue'
import BackendRegister from '../views/auth/BackendRegister.vue'
import StudentDashboard from '../views/frontend/StudentDashboard.vue'
import ClubLeaderDashboard from '../views/backend/ClubLeaderDashboard.vue'
import { pinia } from '@/stores'
import { useUserStore } from '@/stores/user'
import type { UserRole } from '@/types/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/backend',
      name: 'backend-entry',
      component: BackendEntry,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/backend/login',
      name: 'backend-login',
      component: BackendLogin,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/backend/register',
      name: 'backend-register',
      component: BackendRegister,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/student/dashboard',
      name: 'student-dashboard',
      component: StudentDashboard,
      meta: {
        requiresAuth: true,
        allowedRoles: ['student'],
      },
    },
    {
      path: '/backend/club',
      name: 'club-dashboard',
      component: ClubLeaderDashboard,
      meta: {
        requiresAuth: true,
        allowedRoles: ['club_leader', 'admin'],
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const userStore = useUserStore(pinia)

  await userStore.initializeAuth()

  const requiresAuth = to.meta.requiresAuth === true
  const guestOnly = to.meta.guestOnly === true
  const allowedRoles = to.meta.allowedRoles as UserRole[] | undefined

  if (guestOnly && userStore.isAuthenticated) {
    return { path: userStore.dashboardRoute }
  }

  if (!requiresAuth) {
    return true
  }

  if (!userStore.isAuthenticated) {
    return to.path.startsWith('/backend')
      ? { name: 'backend-login' }
      : { name: 'login' }
  }

  if (allowedRoles && userStore.role && !allowedRoles.includes(userStore.role)) {
    return { path: userStore.dashboardRoute }
  }

  if (to.path.startsWith('/backend') && !userStore.isClubLeader) {
    return { name: 'student-dashboard' }
  }

  return true
})

export default router
