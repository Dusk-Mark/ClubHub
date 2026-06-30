<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import campusImage from '../../assets/frontend/中北大学.jpg'
import artImage from '../../assets/frontend/小提琴.jpg'
import codingImage from '../../assets/frontend/程序员.jpg'
import basketballImage from '../../assets/frontend/篮球.jpg'

interface ClubHighlight {
  id: string
  label: string
  title: string
  subtitle: string
  description: string
  image: string
  detailA: string
  detailB: string
  overlayClass: string
  panelClass: string
}

const HOME_INTRO_STORAGE_KEY = 'clubhub-home-intro-played'
const INTRO_DURATION_MS = 2200
const INTRO_OUTRO_MS = 720

const clubHighlights: ClubHighlight[] = [
  {
    id: 'basketball',
    label: 'Sports Club',
    title: '篮球社团',
    subtitle: '从训练报名到赛事组织，运动热情在这里被看见，也被有序地连接起来。',
    description:
      '篮球社团可以通过 ClubHub 发布训练计划、组织友谊赛、管理报名名单，并同步签到与活动反馈，让每一次上场都更高效、更有参与感。',
    image: basketballImage,
    detailA: '训练组织',
    detailB: '赛事报名',
    overlayClass: 'bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-slate-950/10',
    panelClass: 'border-white/20 bg-slate-950/20 text-white',
  },
  {
    id: 'art',
    label: 'Arts Society',
    title: '艺术社团',
    subtitle: '排练通知、演出安排与作品展示，让校园里的灵感有更稳定的舞台。',
    description:
      '艺术社团可以集中管理排练日程、演出活动、成员招募和成果归档，让创作过程与社团运营都不再零散，交流也更加顺畅。',
    image: artImage,
    detailA: '排练演出',
    detailB: '作品归档',
    overlayClass: 'bg-gradient-to-r from-stone-950/65 via-stone-900/30 to-amber-50/15',
    panelClass: 'border-white/25 bg-white/10 text-white backdrop-blur-sm',
  },
  {
    id: 'coding',
    label: 'Coding Lab',
    title: '编程社团',
    subtitle: '项目协作、技术分享与成果展示，让热爱技术的同学更容易找到同伴。',
    description:
      '编程社团可以用统一平台发布讲座与比赛、招募成员、沉淀项目资料，并记录活动反馈，让每一次技术交流都能继续延展成新的合作。',
    image: codingImage,
    detailA: '技术分享',
    detailB: '项目协作',
    overlayClass: 'bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-cyan-500/10',
    panelClass: 'border-white/15 bg-slate-950/30 text-slate-50 backdrop-blur-sm',
  },
]

const showIntro = ref(false)
const introLeaving = ref(false)
const pageReady = ref(false)

let introTimer: number | null = null
let introExitTimer: number | null = null

const pageClassName = computed(() => {
  if (!pageReady.value) {
    return 'opacity-0 blur-[10px] scale-[0.985]'
  }

  return 'opacity-100 blur-0 scale-100'
})

const clearTimers = () => {
  if (introTimer !== null) {
    window.clearTimeout(introTimer)
    introTimer = null
  }

  if (introExitTimer !== null) {
    window.clearTimeout(introExitTimer)
    introExitTimer = null
  }
}

const finishIntro = () => {
  introLeaving.value = true
  pageReady.value = true

  introExitTimer = window.setTimeout(() => {
    showIntro.value = false
    introLeaving.value = false
  }, INTRO_OUTRO_MS)
}

onMounted(() => {
  if (typeof window === 'undefined') {
    pageReady.value = true
    return
  }

  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const hasPlayed = window.sessionStorage.getItem(HOME_INTRO_STORAGE_KEY) === 'true'

  if (shouldReduceMotion || hasPlayed) {
    pageReady.value = true
    return
  }

  showIntro.value = true
  window.sessionStorage.setItem(HOME_INTRO_STORAGE_KEY, 'true')

  introTimer = window.setTimeout(() => {
    finishIntro()
  }, INTRO_DURATION_MS)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    clearTimers()
  }
})
</script>

<template>
  <div class="relative bg-[#f8f9fa] text-slate-900">
    <transition name="clubhub-intro">
      <div
        v-if="showIntro"
        class="pointer-events-none fixed inset-0 z-[90] overflow-hidden bg-[#05070b] text-white"
        :class="{ 'clubhub-intro-outro': introLeaving }"
        aria-hidden="true"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(148,163,184,0.16),_transparent_45%)]" />
        <div class="absolute inset-[8%] border border-white/10" />
        <div class="absolute left-1/2 top-10 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-white/0 via-white/60 to-white/0" />
        <div class="absolute bottom-10 left-1/2 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-white/0 via-white/30 to-white/0" />

        <div class="relative flex min-h-screen items-center justify-center px-6">
          <div class="text-center">
            <p class="clubhub-intro-kicker text-[10px] uppercase tracking-[0.55em] text-slate-400 sm:text-xs">
              North University Of China
            </p>
            <div class="mt-8 overflow-hidden">
              <p class="clubhub-intro-word text-5xl font-semibold tracking-[0.34em] text-white sm:text-7xl lg:text-8xl">
                ClubHub
              </p>
            </div>
            <div class="mx-auto mt-8 h-px w-28 bg-gradient-to-r from-white/0 via-white/70 to-white/0 sm:w-40" />
            <p class="clubhub-intro-subtitle mt-6 text-xs uppercase tracking-[0.42em] text-slate-500 sm:text-sm">
              Campus Activity Management System
            </p>
          </div>
        </div>
      </div>
    </transition>

    <div
      class="transition-all duration-[900ms] ease-out motion-reduce:transform-none motion-reduce:transition-none"
      :class="pageClassName"
    >
      <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-md">
        <div
          class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10"
        >
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.32em] text-slate-500">ClubHub</p>
            <p class="text-sm text-slate-900">中北大学活力校园社团活动管理系统</p>
          </div>

          <nav class="hidden items-center gap-8 text-sm text-slate-500 md:flex">
            <a
              href="/"
              class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
            >
              首页
            </a>
            <a
              href="#clubs"
              class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
            >
              社团风采
            </a>
            <button
              type="button"
              class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
            >
              新闻公告
            </button>
            <button
              type="button"
              class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
            >
              规章制度
            </button>
            <button
              type="button"
              class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
            >
              活动报名
            </button>
            <button
              type="button"
              class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
            >
              互动交流
            </button>
          </nav>

          <div class="hidden items-center gap-3 md:flex">
            <router-link
              to="/login"
              class="cursor-pointer border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100/80 hover:text-slate-900"
            >
              登录
            </router-link>
            <router-link
              to="/register"
              class="cursor-pointer border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100/80 hover:text-slate-900"
            >
              注册
            </router-link>
            <button
              type="button"
              class="cursor-pointer border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-slate-50 transition-all duration-300 hover:bg-slate-800"
            >
              后台入口
            </button>
          </div>
        </div>
      </header>

      <main class="divide-y divide-slate-200">
        <section
          id="theme"
          class="relative isolate overflow-hidden border-b border-slate-200"
        >
          <img
            :src="campusImage"
            alt="中北大学校园风景"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/20 to-[#f8f9fa]/88" />

          <div
            class="relative mx-auto grid min-h-[calc(100svh-73px)] max-w-7xl items-end gap-14 px-6 py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:px-10 lg:py-16"
          >
            <div class="space-y-10 pb-4 lg:pb-10">
              <div class="space-y-3">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-200">North University of China</p>
                <p class="max-w-xl text-sm leading-7 text-slate-200/85">
                  面向中北大学普通学生、社团负责人和校团委管理者，统一承载社团活动发布、在线报名、交流互动与后台管理。
                </p>
              </div>

              <div class="max-w-4xl space-y-6">
                <h1 class="text-5xl font-bold tracking-tight text-white sm:text-6xl xl:text-7xl">
                  在中北大学，
                  <span class="block">让每一个社团都被看见，让每一场活动都更有参与感。</span>
                </h1>
                <p class="max-w-2xl text-base leading-8 text-slate-200/90 sm:text-lg">
                  ClubHub 聚焦中北大学社团全流程管理，帮助学生发现感兴趣的活动，帮助社团高效组织报名与签到，也帮助学校更清晰地管理公告、审批与社团发展。
                </p>
              </div>

              <div class="flex flex-col gap-4 sm:flex-row">
                <a
                  href="#clubs"
                  class="inline-flex items-center justify-center border border-white/30 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-white/20"
                >
                  浏览社团活动
                </a>
                <a
                  href="#clubs"
                  class="inline-flex items-center justify-center border border-transparent bg-slate-950/70 px-6 py-3 text-xs uppercase tracking-[0.28em] text-slate-100 transition-all duration-300 hover:bg-slate-950/85"
                >
                  查看社团
                </a>
              </div>
            </div>

            <div
              class="grid gap-0 self-stretch border border-white/20 bg-white/8 text-white backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-1"
            >
              <div class="border-b border-white/15 p-6 sm:border-b-0 sm:border-r lg:border-r-0 lg:border-b">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-200">01 Portal</p>
                <p class="mt-6 text-2xl font-semibold tracking-tight">活动发布</p>
                <p class="mt-3 text-sm leading-7 text-slate-200/85">社团可以集中发布招新、讲座、训练、比赛与演出等校园活动。</p>
              </div>
              <div class="border-b border-white/15 p-6 sm:border-b-0 sm:border-r lg:border-r-0 lg:border-b">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-200">02 Activity</p>
                <p class="mt-6 text-2xl font-semibold tracking-tight">在线报名</p>
                <p class="mt-3 text-sm leading-7 text-slate-200/85">学生能够快速查看详情、提交申请，并跟踪自己的报名与参与状态。</p>
              </div>
              <div class="p-6">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-200">03 Manage</p>
                <p class="mt-6 text-2xl font-semibold tracking-tight">分权管理</p>
                <p class="mt-3 text-sm leading-7 text-slate-200/85">兼顾学生端、社团管理员和校团委后台，支撑校园社团日常运行。</p>
              </div>
            </div>
          </div>
        </section>

        <section id="clubs" class="border-b border-slate-200 bg-[#f8f9fa]">
          <div class="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <div class="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div class="space-y-5">
                <p class="text-xs uppercase tracking-[0.32em] text-slate-400">Campus Highlights</p>
                <h2 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  从体育、艺术到技术，
                  <span class="block">把中北大学的社团生活完整连接起来。</span>
                </h2>
              </div>

              <div class="grid gap-6 border-t border-slate-200 pt-6 text-sm leading-7 text-slate-500 md:grid-cols-3 md:border-t-0 md:pt-0">
                <div class="border-b border-slate-200 pb-6 md:border-b-0 md:border-l md:border-slate-200 md:pl-6">
                  面向学生，首页可以快速了解热门社团、近期活动和报名入口。
                </div>
                <div class="border-b border-slate-200 pb-6 md:border-b-0 md:border-l md:border-slate-200 md:pl-6">
                  面向社团负责人，系统支持活动发布、成员招募、签到管理和资料沉淀。
                </div>
                <div class="md:border-l md:border-slate-200 md:pl-6">
                  面向学校管理端，系统也为公告、审批、社团管理和权限控制预留完整能力。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          v-for="club in clubHighlights"
          :id="club.id"
          :key="club.id"
          class="group relative isolate overflow-hidden border-b border-slate-200 last:border-b-0"
        >
          <img
            :src="club.image"
            :alt="`${club.title}背景图`"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div :class="['absolute inset-0 transition-all duration-300 group-hover:bg-slate-100/5', club.overlayClass]" />

          <div
            class="relative mx-auto grid min-h-[92svh] max-w-7xl items-end px-6 py-14 lg:grid-cols-12 lg:px-10 lg:py-20"
          >
            <div
              :class="[
                'col-span-12 grid gap-0 border transition-all duration-300 group-hover:-translate-y-1 lg:col-span-6',
                club.panelClass,
              ]"
            >
              <div class="grid gap-8 border-b border-current/15 p-8 lg:grid-cols-[minmax(0,1fr)_120px] lg:p-10">
                <div class="space-y-5">
                  <p class="text-xs uppercase tracking-[0.32em] text-current/70">{{ club.label }}</p>
                  <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">{{ club.title }}</h2>
                  <p class="max-w-xl text-lg leading-8 text-current/90">{{ club.subtitle }}</p>
                </div>
                <div class="flex items-start justify-start lg:justify-end">
                  <span class="text-xs uppercase tracking-[0.3em] text-current/70">
                    {{ club.id }}
                  </span>
                </div>
              </div>

              <div class="grid gap-8 p-8 text-sm leading-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:p-10">
                <p class="max-w-xl text-current/80">
                  {{ club.description }}
                </p>

                <div class="grid gap-4 border-t border-current/15 pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-current/60">重点</p>
                    <p class="mt-2 text-base text-current/90">{{ club.detailA }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-current/60">场景</p>
                    <p class="mt-2 text-base text-current/90">{{ club.detailB }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
