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
          <p class="text-xs uppercase tracking-[0.32em] text-gray-500">Backend Register</p>
          <h2 class="mt-4 text-3xl font-bold tracking-tight text-white">
            注册{{ activeRole.label }}
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
          @submit.prevent="handleRegister"
        >
          <div class="space-y-4">
            <div>
              <label for="fullName" class="sr-only">姓名</label>
              <input
                id="fullName"
                v-model="fullName"
                type="text"
                required
                class="block w-full appearance-none rounded-full border border-transparent bg-[#222222] px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                placeholder="请输入真实姓名"
              />
            </div>
            <div>
              <label for="studentId" class="sr-only">{{ idLabel }}</label>
              <input
                id="studentId"
                v-model="studentId"
                type="text"
                required
                class="block w-full appearance-none rounded-full border border-transparent bg-[#222222] px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                :placeholder="`请输入${idLabel}`"
              />
            </div>
            <div>
              <label for="email" class="sr-only">邮箱地址</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full appearance-none rounded-full border border-transparent bg-[#222222] px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                placeholder="请输入邮箱地址"
              />
            </div>
            <div>
              <label for="password" class="sr-only">密码</label>
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                required
                class="block w-full appearance-none rounded-full border border-transparent bg-[#222222] px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white sm:text-sm"
                placeholder="请设置密码"
              />
            </div>
          </div>

          <div class="border border-white/10 bg-white/[0.03] p-4">
            <p class="text-xs uppercase tracking-[0.28em] text-gray-500">Registration Notice</p>
            <p class="mt-3 text-sm leading-7 text-gray-400">
              注册时会写入后台角色标识，用于创建后台账号资料。演示环境下可直接注册，
              后续若接入正式审批流，建议再增加邀请码或人工审核。
            </p>
          </div>

          <div v-if="errorMessage" class="text-center text-sm text-red-500">
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="rounded-3xl border border-green-500/20 bg-green-500/10 p-4 text-center text-sm text-green-500"
          >
            {{ successMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full cursor-pointer justify-center rounded-full border border-transparent bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isLoading">创建中...</span>
            <span v-else>创建后台账号</span>
          </button>

          <p class="text-center text-xs text-gray-500">
            继续即表示您同意以当前身份接入 ClubHub 后台工作台。
          </p>
        </form>

        <div class="space-y-3 text-center text-sm text-gray-400 lg:text-left">
          <p>
            已有后台账号？
            <router-link
              :to="{ name: 'backend-login', query: { role: selectedRole } }"
              class="font-medium text-white hover:underline"
            >
              立即登录
            </router-link>
          </p>
          <p>
            学生用户请前往
            <router-link to="/register" class="font-medium text-white hover:underline">
              学生端注册
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
        alt="ClubHub backend register background"
      />
      <div class="absolute inset-0 bg-black/45" />

      <div class="relative flex h-full flex-col justify-between p-12 text-white">
        <div class="max-w-lg space-y-5">
          <p class="text-xs uppercase tracking-[0.32em] text-white/60">Role Onboarding</p>
          <h2 class="text-4xl font-semibold tracking-tight">
            在同一视觉语境中完成后台身份接入。
          </h2>
          <p class="text-sm leading-7 text-white/80">
            将后台注册页保持为与学生端一致的分栏叙事，只增加角色维度与管理说明，
            保证用户从注册到工作台切换时不会感到界面风格断裂。
          </p>
        </div>

        <div class="grid gap-px border border-white/10 bg-white/10">
          <div class="grid gap-px bg-white/10 sm:grid-cols-3">
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Step 01</p>
              <p class="mt-3 text-base text-white">选择后台身份</p>
            </div>
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Step 02</p>
              <p class="mt-3 text-base text-white">填写姓名、编号与邮箱</p>
            </div>
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Step 03</p>
              <p class="mt-3 text-base text-white">完成认证后进入后台工作台</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
    description: '创建后可接入社团审核、公告管理与系统治理等后台能力。',
  },
  {
    value: 'club_leader',
    eyebrow: 'Club Leader',
    label: '社团管理员',
    description: '创建后可接入活动管理、报名处理与成员协作等后台能力。',
  },
]

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const fullName = ref('')
const studentId = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

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
const idLabel = computed(() => (selectedRole.value === 'admin' ? '工号 / 管理编号' : '学号 / 负责人编号'))

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
    successMessage.value = ''

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
          student_id: studentId.value,
          role: selectedRole.value,
        },
      },
    })

    if (error) {
      throw error
    }

    if (data.session) {
      await userStore.syncCurrentSession()
      router.push('/backend/club')
      return
    }

    successMessage.value = '注册成功！请查收邮箱并点击验证链接，验证后即可登录后台。'
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
