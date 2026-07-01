<template>
  <div class="min-h-screen flex">
    <div class="flex w-full flex-col justify-center bg-[#111111] p-8 sm:p-12 lg:w-1/2 lg:p-24">
      <div
        v-reveal="{ origin: 'up', delay: 40, distance: 42 }"
        class="w-full max-w-2xl space-y-8"
      >
        <div class="space-y-6">
          <div class="flex justify-center lg:justify-start">
            <div class="flex h-8 w-20 items-center justify-center rounded-md bg-white text-xl font-bold text-black">
              ClubHub
            </div>
          </div>

          <div class="space-y-3 text-center lg:text-left">
            <p class="text-xs uppercase tracking-[0.32em] text-gray-500">Backend Access</p>
            <h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              进入 ClubHub 后台入口
            </h1>
            <p class="max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
              为校团委管理员与社团管理员提供统一认证入口，延续学生端的极简黑白视觉与信息节奏，
              在同一品牌语言下切换到审批、活动与运营工作台。
            </p>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <article
            v-for="role in backendRoles"
            :key="role.value"
            v-reveal="{ origin: 'up', delay: role.delay, distance: 36, duration: 760 }"
            class="border border-white/10 bg-white/[0.03] p-6"
          >
            <p class="text-xs uppercase tracking-[0.28em] text-gray-500">{{ role.eyebrow }}</p>
            <h2 class="mt-4 text-2xl font-semibold tracking-tight text-white">{{ role.label }}</h2>
            <p class="mt-3 text-sm leading-7 text-gray-400">{{ role.description }}</p>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <router-link
                :to="{ name: 'backend-login', query: { role: role.value } }"
                class="flex cursor-pointer items-center justify-center border border-white bg-white px-4 py-3 text-sm font-medium text-black transition-colors duration-200 hover:bg-gray-200"
              >
                立即登录
              </router-link>
              <router-link
                :to="{ name: 'backend-register', query: { role: role.value } }"
                class="flex cursor-pointer items-center justify-center border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
              >
                申请注册
              </router-link>
            </div>
          </article>
        </div>

        <div class="flex flex-col gap-3 border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-white">已经拥有学生账号？</p>
            <p class="mt-1 text-sm text-gray-400">学生端入口保持不变，可继续通过前台登录访问个人中心。</p>
          </div>
          <router-link
            to="/login"
            class="inline-flex cursor-pointer items-center justify-center border border-white/10 px-4 py-3 text-sm text-white transition-colors duration-200 hover:bg-white/10"
          >
            前往学生端登录
          </router-link>
        </div>
      </div>
    </div>

    <div
      v-reveal="{ origin: 'right', delay: 120, distance: 54, duration: 920 }"
      class="relative hidden lg:block lg:w-1/2"
    >
      <img
        class="absolute inset-0 h-full w-full object-cover"
        :src="bgImage"
        alt="ClubHub backend background"
      />
      <div class="absolute inset-0 bg-black/45" />

      <div class="relative flex h-full flex-col justify-between p-12 text-white">
        <div class="max-w-xl space-y-5">
          <p class="text-xs uppercase tracking-[0.32em] text-white/60">Console Narrative</p>
          <h2 class="text-4xl font-semibold tracking-tight">
            从统一入口进入后台，让审批、活动与运营维持同样克制的秩序感。
          </h2>
          <p class="text-sm leading-7 text-white/80">
            保留学生端已经建立的留白、边框和黑白灰体系，只在信息层次与角色文案上切换视角，
            让后台不显得割裂，也方便后续继续扩展真实业务功能。
          </p>
        </div>

        <div class="grid gap-px border border-white/10 bg-white/10">
          <div class="grid gap-px bg-white/10 sm:grid-cols-3">
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Role</p>
              <p class="mt-3 text-xl font-medium">双角色入口</p>
              <p class="mt-2 text-sm leading-7 text-white/70">支持校团委管理员与社团管理员快速进入。</p>
            </div>
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Guard</p>
              <p class="mt-3 text-xl font-medium">统一鉴权</p>
              <p class="mt-2 text-sm leading-7 text-white/70">未登录访问后台时自动回到后台认证链路。</p>
            </div>
            <div class="bg-black/25 p-5">
              <p class="text-xs uppercase tracking-[0.28em] text-white/55">Visual</p>
              <p class="mt-3 text-xl font-medium">风格连续</p>
              <p class="mt-2 text-sm leading-7 text-white/70">延续学生端的分栏、暗色背景与极简表单语言。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import bgImage from '@/assets/auth/火车头.jpg'

interface BackendRoleCard {
  value: 'admin' | 'club_leader'
  eyebrow: string
  label: string
  description: string
  delay: number
}

const backendRoles: BackendRoleCard[] = [
  {
    value: 'admin',
    eyebrow: 'Committee',
    label: '校团委管理员',
    description: '处理社团审核、系统公告与后台配置，适合负责全局审批与治理的管理角色。',
    delay: 90,
  },
  {
    value: 'club_leader',
    eyebrow: 'Club Leader',
    label: '社团管理员',
    description: '处理活动发布、报名管理与成员协作，适合社团日常运营与执行负责人。',
    delay: 160,
  },
]
</script>
