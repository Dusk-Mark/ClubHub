import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/frontend/HomePage.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
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
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
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
  const allowedRoles = to.meta.allowedRoles as UserRole[] | undefined

  if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    return { path: userStore.dashboardRoute }
  }

  if (!requiresAuth) {
    return true
  }

  if (!userStore.isAuthenticated) {
    return { name: 'login' }
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
