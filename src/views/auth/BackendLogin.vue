<template>
  <div class="min-h-screen flex">
    <div class="flex w-full flex-col justify-center bg-[#111111] p-8 sm:p-12 lg:w-1/2 lg:p-24">
      <div
        v-reveal="{ origin: 'up', delay: 40, distance: 42 }"
        class="w-full max-w-md space-y-8"
      >
        <div class="text-center lg:text-left">
          <div class="mb-6 flex justify-center lg:justify-start">
            <div class="flex h-8 w-20 items-center justify-center rounded-md bg-white text-xl font-bold text-black">
              ClubHub
            </div>
          </div>
          <p class="text-xs uppercase tracking-[0.32em] text-gray-500">Backend Login</p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight text-white">
            进入{{ activeRole.label }}
          </h2>
          <p class="mt-2 text-sm leading-7 text-gray-400">
            {{ activeRole.description }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="role in backendRoles"
            :key="role.value"
            type="button"
            class="cursor-pointer border px-4 py-4 text-left transition-colors duration-200"
            :class="selectedRole === role.value
              ? 'border-white bg-white text-black'
              : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/10'"
            @click="selectedRole = role.value"
          >
            <p class="text-xs uppercase tracking-[0.28em]" :class="selectedRole === role.value ? 'text-black/60' : 'text-gray-500'">
              {{ role.eyebrow }}
            </p>
            <p class="mt-3 text-sm font-medium">{{ role.label }}</p>
          </button>
        </div>

        <form
          v-reveal="{ origin: 'up', delay: 120, distance: 34, duration: 760 }"
          class="space-y-6"
          @submit.prevent="handleLogin"
        >
          <div class="space-y-4">
            <div>
              <label for="email" class="sr-only">邮箱地址</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-full border border-transparent bg-[#222222] px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                placeholder="请输入后台账号邮箱"
              />
            </div>
            <div>
              <label for="password" class="sr-only">密码</label>
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full appearance-none rounded-full border border-transparent bg-[#222222] px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div class="border border-white/10 bg-white/[0.03] p-4">
            <p class="text-xs uppercase tracking-[0.28em] text-gray-500">Access Notice</p>
            <p class="mt-3 text-sm leading-7 text-gray-400">
              后台登录仅开放给校团委管理员与社团管理员。系统会在登录后读取 `profiles.role`，
              自动判断是否具备后台访问权限。
            </p>
          </div>

          <div v-if="errorMessage" class="text-center text-sm text-red-500">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full cursor-pointer justify-center rounded-full border border-transparent bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isLoading">登录中...</span>
            <span v-else>进入后台</span>
          </button>
        </form>

        <div class="space-y-3 text-center text-sm text-gray-400 lg:text-left">
          <p>
            还没有后台账号？
            <router-link
              :to="{ name: 'backend-register', query: { role: selectedRole } }"
              class="font-medium text-white hover:underline"
            >
              立即注册
            </router-link>
          </p>
          <p>
            学生用户请前往
            <router-link to="/login" class="font-medium text-white hover:underline">
              学生端登录
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <div
      v-reveal="{ origin: 'right', delay: 140, distance: 54, duration: 920 }"
      class="relative hidden lg:block lg:w-1/2"
    >
      <img
        class="absolute inset-0 h-full w-full object-cover"
        :src="bgImage"
        alt="ClubHub backend background"
      />
      <div class="absolute inset-0 bg-black/45" />

      <div class="relative flex h-full flex-col justify-between p-12 text-white">
        <div class="max-w-lg space-y-5">
          <p class="text-xs uppercase tracking-[0.32em] text-white/60">Management Workspace</p>
          <h2 class="text-4xl font-semibold tracking-tight">
            登录之后，直接回到统一的管理工作台。
          </h2>
          <p class="text-sm leading-7 text-white/80">
            在同样的深色登录氛围中承接学生端的品牌调性，只把文案切换为后台语境，
            让认证链路和后续管理页面形成完整闭环。
          </p>
        </div>

        <div class="grid gap-px border border-white/10 bg-white/10">
          <div class="bg-black/25 p-5">
            <p class="text-xs uppercase tracking-[0.28em] text-white/55">Route</p>
            <p class="mt-3 text-2xl font-medium">后台独立链路</p>
            <p class="mt-2 text-sm leading-7 text-white/70">未登录访问后台时，会自动回到当前这一组后台认证页面。</p>
          </div>
          <div class="grid gap-px bg-white/10 sm:grid-cols-2">
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Role</p>
              <p class="mt-3 text-base text-white">支持校团委管理员与社团管理员登录</p>
            </div>
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Style</p>
              <p class="mt-3 text-base text-white">延续学生端分栏、圆角输入与黑白灰层次</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useUserStore } from '@/stores/user'
import bgImage from '@/assets/auth/火车头.jpg'

type BackendRole = 'admin' | 'club_leader'

interface BackendRoleOption {
  value: BackendRole
  eyebrow: string
  label: string
  description: string
}

const backendRoles: BackendRoleOption[] = [
  {
    value: 'admin',
    eyebrow: 'Committee',
    label: '校团委管理员',
    description: '登录后处理社团审核、公告发布与系统治理等全局任务。',
  },
  {
    value: 'club_leader',
    eyebrow: 'Club Leader',
    label: '社团管理员',
    description: '登录后继续管理活动、报名、成员协作与运营工作流。',
  },
]

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const parseBackendRole = (
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): BackendRole => {
  if (Array.isArray(value)) {
    return parseBackendRole(value[0])
  }

  return value === 'club_leader' ? 'club_leader' : 'admin'
}

const selectedRole = ref<BackendRole>(parseBackendRole(route.query.role))
const activeRole = computed(
  () => backendRoles.find((role) => role.value === selectedRole.value) ?? backendRoles[0],
)

const getErrorMessage = (error: unknown) => {
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

    if (error) {
      throw error
    }

    await userStore.syncCurrentSession()

    if (!userStore.isAuthenticated) {
      throw new Error(userStore.authError || '登录成功，但未读取到用户资料。')
    }

    if (!userStore.isClubLeader) {
      await userStore.signOut()
      throw new Error('当前账号没有后台权限，请改用学生端入口登录。')
    }

    router.push('/backend/club')
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>
