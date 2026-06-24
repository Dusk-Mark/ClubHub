import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/frontend/HomePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
  ],
})

export default router
