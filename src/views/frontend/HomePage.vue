<script setup lang="ts">
import type { CSSProperties, ComponentPublicInstance } from 'vue'
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
const STICKY_OFFSET_PX = 73

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
const sceneProgress = ref<Record<string, number>>({
  theme: 0,
  clubs: 0,
  basketball: 0,
  art: 0,
  coding: 0,
})
const pointerPosition = ref({
  x: 50,
  y: 34,
})

type SceneRefTarget = Element | ComponentPublicInstance | null

const sceneElements = new Map<string, HTMLElement>()
const sceneRefHandlers = new Map<string, (element: SceneRefTarget) => void>()

let introTimer: number | null = null
let introExitTimer: number | null = null
let sceneFrame: number | null = null
let reduceMotion = false

const pageClassName = computed(() => {
  if (!pageReady.value) {
    return 'opacity-0 blur-[10px] scale-[0.985]'
  }

  return 'opacity-100 blur-0 scale-100'
})

const themeProgress = computed(() => sceneProgress.value.theme ?? 0)
const clubsProgress = computed(() => sceneProgress.value.clubs ?? 0)

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3)

const getStageProgress = (progress: number, start: number, end: number) => {
  if (end <= start) {
    return progress >= end ? 1 : 0
  }

  return easeOutCubic((progress - start) / (end - start))
}

const getSceneProgress = (id: string) => sceneProgress.value[id] ?? 0

const getRevealStyle = (
  progress: number,
  options: {
    start: number
    end: number
    fromY?: number
    fromX?: number
    fromScale?: number
    blur?: number
    maxOpacity?: number
  },
): CSSProperties => {
  if (reduceMotion) {
    return {
      opacity: '1',
      transform: 'translate3d(0, 0, 0) scale(1)',
      filter: 'blur(0px)',
    }
  }

  const amount = getStageProgress(progress, options.start, options.end)
  const opacity = (options.maxOpacity ?? 1) * amount
  const fromY = options.fromY ?? 48
  const fromX = options.fromX ?? 0
  const fromScale = options.fromScale ?? 0.965
  const blur = options.blur ?? 16
  const translateY = (1 - amount) * fromY
  const translateX = (1 - amount) * fromX
  const scale = fromScale + (1 - fromScale) * amount

  return {
    opacity: opacity.toFixed(3),
    transform: `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`,
    filter: `blur(${((1 - amount) * blur).toFixed(2)}px)`,
    willChange: 'opacity, transform, filter',
  }
}

const getBackgroundStyle = (progress: number, depth = 1): CSSProperties => {
  if (reduceMotion) {
    return {}
  }

  const translateY = progress * 10 * depth
  const scale = 1.065 - progress * 0.026 * depth
  const saturate = 1 + (1 - progress) * 0.08

  return {
    transform: `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`,
    filter: `saturate(${saturate.toFixed(3)})`,
    transformOrigin: 'center center',
    willChange: 'transform, filter',
  }
}

const getCursorGlowStyle = (opacity: number): CSSProperties => {
  if (reduceMotion) {
    return { opacity: '0' }
  }

  return {
    background: `radial-gradient(circle at ${pointerPosition.value.x}% ${pointerPosition.value.y}%, rgba(255,255,255,${opacity}), transparent 34%)`,
  }
}

const getSceneMaskStyle = (progress: number, opacity = 0.78): CSSProperties => {
  if (reduceMotion) {
    return { opacity: `${opacity - 0.08}` }
  }

  return {
    opacity: `${opacity - progress * 0.07}`,
  }
}

const getProgressRailStyle = (progress: number): CSSProperties => ({
  transform: `scaleY(${Math.max(progress, 0.06).toFixed(3)})`,
  transformOrigin: 'top',
})

const assignSceneElement = (id: string, element: SceneRefTarget) => {
  if (element instanceof HTMLElement) {
    sceneElements.set(id, element)

    if (typeof window !== 'undefined') {
      queueSceneUpdate()
    }

    return
  }

  sceneElements.delete(id)
}

const getSceneRefHandler = (id: string) => {
  const existing = sceneRefHandlers.get(id)

  if (existing) {
    return existing
  }

  const handler = (element: SceneRefTarget) => {
    assignSceneElement(id, element)
  }

  sceneRefHandlers.set(id, handler)
  return handler
}

const updateSceneProgress = () => {
  if (typeof window === 'undefined') {
    return
  }

  const next: Record<string, number> = {}

  if (reduceMotion) {
    sceneElements.forEach((_, id) => {
      next[id] = 1
    })
    sceneProgress.value = next
    return
  }

  const viewportHeight = window.innerHeight

  sceneElements.forEach((element, id) => {
    const rect = element.getBoundingClientRect()
    const totalScrollableDistance = Math.max(rect.height - viewportHeight + STICKY_OFFSET_PX, 1)
    const rawProgress = (STICKY_OFFSET_PX - rect.top) / totalScrollableDistance
    next[id] = clamp(rawProgress)
  })

  sceneProgress.value = next
}

const queueSceneUpdate = () => {
  if (typeof window === 'undefined' || sceneFrame !== null) {
    return
  }

  sceneFrame = window.requestAnimationFrame(() => {
    sceneFrame = null
    updateSceneProgress()
  })
}

const handlePointerMove = (event: MouseEvent) => {
  if (reduceMotion || typeof window === 'undefined') {
    return
  }

  pointerPosition.value = {
    x: clamp((event.clientX / window.innerWidth) * 100, 0, 100),
    y: clamp((event.clientY / window.innerHeight) * 100, 0, 100),
  }
}

const clearTimers = () => {
  if (introTimer !== null) {
    window.clearTimeout(introTimer)
    introTimer = null
  }

  if (introExitTimer !== null) {
    window.clearTimeout(introExitTimer)
    introExitTimer = null
  }

  if (sceneFrame !== null) {
    window.cancelAnimationFrame(sceneFrame)
    sceneFrame = null
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

  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('scroll', queueSceneUpdate, { passive: true })
  window.addEventListener('resize', queueSceneUpdate)
  window.addEventListener('mousemove', handlePointerMove, { passive: true })
  queueSceneUpdate()

  const shouldReduceMotion = reduceMotion
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
    window.removeEventListener('scroll', queueSceneUpdate)
    window.removeEventListener('resize', queueSceneUpdate)
    window.removeEventListener('mousemove', handlePointerMove)
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
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.32em] text-slate-500">ClubHub</p>
            <p class="text-sm text-slate-900">中北大学活力校园社团活动管理系统</p>
          </div>

          <nav class="hidden items-center gap-8 text-sm text-slate-500 md:flex">
            <a href="/" class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900">
              首页
            </a>
            <a href="#clubs" class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900">
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
            <router-link
              to="/backend"
              class="cursor-pointer border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-slate-50 transition-all duration-300 hover:bg-slate-800"
            >
              后台入口
            </router-link>
          </div>
        </div>
      </header>

      <main class="bg-[#f8f9fa]">
        <section
          id="theme"
          :ref="getSceneRefHandler('theme')"
          class="relative isolate h-[285svh] overflow-clip border-b border-slate-200 bg-[#04060a]"
        >
          <div class="sticky top-[73px] h-[calc(100svh-73px)] overflow-hidden">
            <img
              :src="campusImage"
              alt="中北大学校园风景"
              class="absolute inset-0 h-full w-full object-cover"
              :style="getBackgroundStyle(themeProgress, 1)"
            />
            <div
              class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/35 to-[#06080d]"
              :style="getSceneMaskStyle(themeProgress, 0.82)"
            />
            <div
              class="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen"
              :style="getCursorGlowStyle(0.18)"
            />
            <div class="pointer-events-none absolute inset-[6%] border border-white/10" />
            <div class="pointer-events-none absolute left-1/2 top-0 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-white/0 via-white/35 to-white/0" />

            <div class="relative mx-auto grid h-full max-w-7xl items-end gap-14 px-6 py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:px-10 lg:py-16">
              <div class="space-y-10 pb-4 lg:pb-8">
                <div
                  class="space-y-3"
                  :style="getRevealStyle(themeProgress, { start: 0.08, end: 0.24, fromY: 32, blur: 12 })"
                >
                  <p class="text-xs uppercase tracking-[0.35em] text-slate-200">North University of China</p>
                  <p class="max-w-xl text-sm leading-7 text-slate-200/85">
                    面向中北大学普通学生、社团负责人和校团委管理者，统一承载社团活动发布、在线报名、交流互动与后台管理。
                  </p>
                </div>

                <div
                  class="max-w-4xl space-y-6"
                  :style="getRevealStyle(themeProgress, { start: 0.22, end: 0.44, fromY: 56, blur: 18 })"
                >
                  <h1 class="text-5xl font-bold tracking-tight text-white sm:text-6xl xl:text-7xl">
                    在中北大学，
                    <span class="block">让每一个社团都被看见，让每一场活动都更有参与感。</span>
                  </h1>
                  <p class="max-w-2xl text-base leading-8 text-slate-200/90 sm:text-lg">
                    ClubHub 聚焦中北大学社团全流程管理，帮助学生发现感兴趣的活动，帮助社团高效组织报名与签到，也帮助学校更清晰地管理公告、审批与社团发展。
                  </p>
                </div>

                <div
                  class="flex flex-col gap-4 sm:flex-row"
                  :style="getRevealStyle(themeProgress, { start: 0.42, end: 0.62, fromY: 42, blur: 14 })"
                >
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
                class="grid gap-0 self-stretch border border-white/20 bg-white/8 text-white backdrop-blur-sm"
                :style="getRevealStyle(themeProgress, { start: 0.56, end: 0.84, fromX: 84, fromScale: 0.94, blur: 16 })"
              >
                <div class="grid gap-0 sm:grid-cols-3 lg:grid-cols-1">
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

              <div
                class="pointer-events-none absolute bottom-8 left-6 text-[10px] uppercase tracking-[0.42em] text-white/45 lg:left-10"
                :style="getRevealStyle(themeProgress, { start: 0.7, end: 0.88, fromY: 18, blur: 10, maxOpacity: 0.8 })"
              >
                Scroll To Reveal
              </div>

              <div class="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-4 text-white/55 xl:flex">
                <span class="text-[10px] uppercase tracking-[0.42em]">Scene 01</span>
                <span class="relative h-40 w-px overflow-hidden bg-white/15">
                  <span class="absolute inset-x-0 top-0 bg-white" :style="getProgressRailStyle(themeProgress)" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="clubs"
          :ref="getSceneRefHandler('clubs')"
          class="relative isolate h-[235svh] overflow-clip border-b border-slate-200 bg-[#06080d]"
        >
          <div class="sticky top-[73px] h-[calc(100svh-73px)] overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_28%)]" />
            <div
              class="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
              :style="getCursorGlowStyle(0.12)"
            />
            <div class="pointer-events-none absolute inset-[7%] border border-white/10" />
            <div class="pointer-events-none absolute inset-x-[12%] top-[18%] h-px bg-gradient-to-r from-white/0 via-white/18 to-white/0" />

            <div class="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 py-12 lg:px-10">
              <div class="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.1fr)] lg:items-start">
                <div
                  class="space-y-6"
                  :style="getRevealStyle(clubsProgress, { start: 0.14, end: 0.34, fromY: 38, blur: 14 })"
                >
                  <p class="text-xs uppercase tracking-[0.38em] text-slate-400">Campus Highlights</p>
                  <h2 class="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    从体育、艺术到技术，
                    <span class="block">把中北大学的社团生活完整连接起来。</span>
                  </h2>
                </div>

                <div
                  class="grid gap-0 border border-white/10 bg-white/[0.03] text-sm leading-8 text-slate-300 md:grid-cols-3"
                  :style="getRevealStyle(clubsProgress, { start: 0.34, end: 0.68, fromY: 42, fromScale: 0.96, blur: 16 })"
                >
                  <div class="border-b border-white/10 px-6 py-8 md:border-b-0 md:border-r">
                    <p class="text-[10px] uppercase tracking-[0.32em] text-slate-500">Students</p>
                    <p class="mt-5">
                      面向学生，首页可以快速了解热门社团、订阅活动，并进入报名入口。
                    </p>
                  </div>
                  <div class="border-b border-white/10 px-6 py-8 md:border-b-0 md:border-r">
                    <p class="text-[10px] uppercase tracking-[0.32em] text-slate-500">Club Leaders</p>
                    <p class="mt-5">
                      面向社团负责人，系统支持活动发布、成员招募、签到管理与资料沉淀。
                    </p>
                  </div>
                  <div class="px-6 py-8">
                    <p class="text-[10px] uppercase tracking-[0.32em] text-slate-500">Administration</p>
                    <p class="mt-5">
                      面向学校管理端，系统也为公告、审批、社团管理和权限控制预留完整能力。
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]"
                :style="getRevealStyle(clubsProgress, { start: 0.62, end: 0.86, fromY: 34, blur: 14 })"
              >
                <div class="border-t border-white/10 pt-6 text-sm leading-7 text-slate-400">
                  这一页作为首页与社团场景之间的章节过渡，先完成系统能力总览，再进入每一个社团的独立镜头叙事。
                </div>
                <div class="border border-white/10 bg-white/[0.03] px-6 py-6 text-xs uppercase tracking-[0.32em] text-slate-400">
                  <p>Scene Transition</p>
                  <p class="mt-4 text-lg tracking-[0.08em] text-white">Overview To Clubs</p>
                </div>
              </div>

              <div class="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-4 text-white/55 xl:flex">
                <span class="text-[10px] uppercase tracking-[0.42em]">Scene 02</span>
                <span class="relative h-40 w-px overflow-hidden bg-white/15">
                  <span class="absolute inset-x-0 top-0 bg-white" :style="getProgressRailStyle(clubsProgress)" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          v-for="(club, index) in clubHighlights"
          :id="club.id"
          :key="club.id"
          :ref="getSceneRefHandler(club.id)"
          class="group relative isolate h-[265svh] overflow-clip border-b border-slate-200 bg-slate-950 last:border-b-0"
        >
          <div class="sticky top-[73px] h-[calc(100svh-73px)] overflow-hidden">
            <img
              :src="club.image"
              :alt="`${club.title}背景图`"
              class="absolute inset-0 h-full w-full object-cover"
              :style="getBackgroundStyle(getSceneProgress(club.id), 1.12)"
            />
            <div
              :class="['absolute inset-0', club.overlayClass]"
              :style="getSceneMaskStyle(getSceneProgress(club.id), 0.84)"
            />
            <div
              class="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
              :style="getCursorGlowStyle(0.14)"
            />
            <div class="pointer-events-none absolute inset-[7%] border border-white/10" />

            <div class="relative mx-auto grid h-full max-w-7xl items-end px-6 py-14 lg:grid-cols-12 lg:px-10 lg:py-20">
              <div
                :class="[
                  'col-span-12 grid gap-0 border lg:col-span-6',
                  club.panelClass,
                ]"
                :style="
                  getRevealStyle(getSceneProgress(club.id), {
                    start: 0.24,
                    end: 0.54,
                    fromX: club.id === 'art' ? 88 : -88,
                    fromY: 24,
                    fromScale: 0.94,
                    blur: 18,
                  })
                "
              >
                <div class="grid gap-8 border-b border-current/15 p-8 lg:grid-cols-[minmax(0,1fr)_120px] lg:p-10">
                  <div
                    class="space-y-5"
                    :style="getRevealStyle(getSceneProgress(club.id), { start: 0.28, end: 0.5, fromY: 32, blur: 12 })"
                  >
                    <p class="text-xs uppercase tracking-[0.32em] text-current/70">{{ club.label }}</p>
                    <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">{{ club.title }}</h2>
                    <p class="max-w-xl text-lg leading-8 text-current/90">{{ club.subtitle }}</p>
                  </div>
                  <div
                    class="flex items-start justify-start lg:justify-end"
                    :style="getRevealStyle(getSceneProgress(club.id), { start: 0.42, end: 0.62, fromY: 20, blur: 10, maxOpacity: 0.75 })"
                  >
                    <span class="text-xs uppercase tracking-[0.3em] text-current/70">
                      {{ club.id }}
                    </span>
                  </div>
                </div>

                <div class="grid gap-8 p-8 text-sm leading-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:p-10">
                  <p
                    class="max-w-xl text-current/80"
                    :style="getRevealStyle(getSceneProgress(club.id), { start: 0.56, end: 0.76, fromY: 34, blur: 14 })"
                  >
                    {{ club.description }}
                  </p>

                  <div
                    class="grid gap-4 border-t border-current/15 pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0"
                    :style="getRevealStyle(getSceneProgress(club.id), { start: 0.72, end: 0.9, fromY: 30, blur: 12 })"
                  >
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

              <div class="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-4 text-white/55 xl:flex">
                <span class="text-[10px] uppercase tracking-[0.42em]">
                  Scene 0{{ index + 3 }}
                </span>
                <span class="relative h-40 w-px overflow-hidden bg-white/15">
                  <span
                    class="absolute inset-x-0 top-0 bg-white"
                    :style="getProgressRailStyle(getSceneProgress(club.id))"
                  />
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
