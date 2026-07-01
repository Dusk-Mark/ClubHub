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
          <h2 class="text-3xl font-bold text-white tracking-tight">创建您的账号</h2>
          <p class="mt-2 text-sm text-gray-400">
            加入 ClubHub，发现并参与精彩的社团活动。
          </p>
        </div>

        <!-- Form -->
        <form
          v-reveal="{ origin: 'up', delay: 120, distance: 34, duration: 760 }"
          class="mt-8 space-y-6"
          @submit.prevent="handleRegister"
        >
          <div class="space-y-4">
            <div>
              <label for="fullName" class="sr-only">姓名</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                v-model="fullName"
                class="appearance-none rounded-full relative block w-full px-4 py-3 bg-[#222222] border border-transparent placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-colors"
                placeholder="请输入真实姓名 (例如: 张三)"
              />
            </div>
            <div>
              <label for="studentId" class="sr-only">学号</label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                v-model="studentId"
                class="appearance-none rounded-full relative block w-full px-4 py-3 bg-[#222222] border border-transparent placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-colors"
                placeholder="请输入学号 (例如: 20230001)"
              />
            </div>
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
                autocomplete="new-password"
                required
                v-model="password"
                class="appearance-none rounded-full relative block w-full px-4 py-3 bg-[#222222] border border-transparent placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent sm:text-sm transition-colors"
                placeholder="请设置密码"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-4 rounded-xl text-center">
            {{ successMessage }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-[#111111] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">创建中...</span>
              <span v-else>继续</span>
            </button>
          </div>
          
          <p class="text-xs text-center text-gray-500 mt-4">
            继续即表示您同意 ClubHub 的服务条款和隐私政策。
          </p>
        </form>

        <!-- Footer -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-400">
            已有账号？
            <router-link to="/login" class="font-medium text-white hover:underline">
              立即登录
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useUserStore } from '@/stores/user'
import bgImage from '@/assets/auth/火车头.jpg'

const router = useRouter()
const userStore = useUserStore()
const fullName = ref('')
const studentId = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '注册失败，请检查输入信息'
}

const handleRegister = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
          student_id: studentId.value,
          role: 'student',
        },
      },
    })

    if (error) throw error

    if (data.session) {
      await userStore.syncCurrentSession()
      router.push(userStore.dashboardRoute)
      return
    }

    successMessage.value = '注册成功！请查收您的邮箱并点击验证链接以激活账号。'
    // 清空表单
    fullName.value = ''
    studentId.value = ''
    email.value = ''
    password.value = ''
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>
