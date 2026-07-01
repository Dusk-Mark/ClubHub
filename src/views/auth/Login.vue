<template>
  <div class="min-h-screen flex">
    <!-- Left Side: Form -->
    <div class="w-full lg:w-1/2 bg-[#111111] flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24">
      <div
        v-reveal="{ origin: 'up', delay: 40, distance: 42 }"
        class="w-full max-w-md space-y-8"
      >
        <!-- Logo / Header -->
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <!-- Placeholder for Logo -->
            <div class="w-12 h-8 bg-white rounded-md flex items-center justify-center">
              <span class="text-black font-bold text-xl">ClubHub</span>
            </div>
          </div>
          <h2 class="text-3xl font-bold text-white tracking-tight">欢迎回来</h2>
          <p class="mt-2 text-sm text-gray-400">
            登录您的账号以继续。
          </p>
        </div>

        <!-- Form -->
        <form
          v-reveal="{ origin: 'up', delay: 120, distance: 34, duration: 760 }"
          class="mt-8 space-y-6"
          @submit.prevent="handleLogin"
        >
          <div class="space-y-4">
            <div>
              <label for="email" class="sr-only">邮箱地址</label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="email"
                class="appearance-none rounded-full relative block w-full px-4 py-3 bg-[#222222] border border-transparent placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-colors"
                placeholder="请输入邮箱地址"
              />
            </div>
            <div>
              <label for="password" class="sr-only">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="password"
                class="appearance-none rounded-full relative block w-full px-4 py-3 bg-[#222222] border border-transparent placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-colors"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#111111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">登录中...</span>
              <span v-else>继续</span>
            </button>
          </div>

        </form>

        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-400">
            还没有账号？
            <router-link to="/register" class="font-medium text-white hover:underline">
              立即注册
            </router-link>
          </p>
          <p class="mt-3 text-sm text-gray-500">
            校团委管理员或社团管理员请前往
            <router-link to="/backend" class="font-medium text-white hover:underline">
              后台入口
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Image -->
    <div
      v-reveal="{ origin: 'right', delay: 140, distance: 54, duration: 920 }"
      class="hidden lg:block lg:w-1/2 relative"
    >
      <img
        class="absolute inset-0 h-full w-full object-cover"
        :src="bgImage"
        alt="Background"
      />
      <!-- Optional Overlay -->
      <div class="absolute inset-0 bg-black/20"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useUserStore } from '@/stores/user'
import bgImage from '@/assets/auth/火车头.jpg'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message === 'Email not confirmed') {
    return '您的邮箱尚未验证，请查收邮件并点击验证链接后再尝试登录。'
  }
  if (error instanceof Error) {
    return error.message
  }

  return '登录失败，请检查邮箱和密码'
}

onMounted(async () => {
  await userStore.initializeAuth()

  if (userStore.isAuthenticated) {
    router.replace(userStore.dashboardRoute)
  }
})

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    await userStore.syncCurrentSession()

    if (!userStore.isAuthenticated) {
      throw new Error(userStore.authError || '登录成功，但未读取到用户资料。')
    }

    router.push(userStore.dashboardRoute)
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>
