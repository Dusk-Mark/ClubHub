<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStudentDashboardData } from '@/api/student-dashboard'
import { useUserStore } from '@/stores/user'
import type { StudentDashboardData } from '@/types/student-dashboard'

const router = useRouter()
const userStore = useUserStore()

const dashboardData = ref<StudentDashboardData | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

const greeting = computed(() => userStore.fullName || '同学')
const metrics = computed(() => dashboardData.value?.metrics ?? [])
const activities = computed(() => dashboardData.value?.activities ?? [])
const notices = computed(() => dashboardData.value?.notices ?? [])
const timeline = computed(() => dashboardData.value?.timeline ?? [])
const primaryActivity = computed(() => activities.value[0] ?? null)
const secondaryMetrics = computed(() => metrics.value)
const quickOverview = computed(() => [
  { label: '待处理提醒', value: String(notices.value.length).padStart(2, '0') },
  { label: '参与活动', value: String(timeline.value.length).padStart(2, '0') },
  { label: '已同步记录', value: String(activities.value.length).padStart(2, '0') },
])
const overview = computed(() => dashboardData.value?.overview ?? {
  weekCount: '00',
  weekSummary: '正在同步数据...',
  slots: [
    { label: '01', title: '正在载入活动安排' },
    { label: '02', title: '正在载入活动安排' },
    { label: '03', title: '正在载入活动安排' },
  ],
})

const loadDashboard = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    await userStore.initializeAuth()

    if (!userStore.userId) {
      throw new Error('当前未识别到登录用户，请重新登录后再试。')
    }

    dashboardData.value = await getStudentDashboardData(userStore.userId)
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : '学生端首页数据加载失败，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}

const handleLogout = () => {
  void userStore.signOut().finally(() => {
    router.push('/login')
  })
}

const getStatusClassName = (status: string) => {
  if (status.includes('进行') || status.includes('通过')) {
    return 'border-cyan-200 bg-cyan-50 text-cyan-700'
  }

  if (status.includes('待') || status.includes('审核')) {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (status.includes('结束') || status.includes('归档')) {
    return 'border-slate-200 bg-slate-100 text-slate-600'
  }

  return 'border-slate-200 bg-white text-slate-700'
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] text-slate-900">
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.32em] text-slate-500">Student Space</p>
          <p class="text-sm text-slate-900">ClubHub 学生端</p>
        </div>

        <nav class="hidden items-center gap-8 text-sm text-slate-500 md:flex">
          <router-link to="/" class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900">
            门户首页
          </router-link>
          <a href="#activities" class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900">
            我的日程
          </a>
          <a href="#notices" class="transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900">
            最新通知
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <div class="hidden border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 sm:block">
            {{ greeting }} · {{ userStore.studentId || '学生身份' }}
          </div>
          <button
            type="button"
            class="cursor-pointer border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-slate-50 transition-all duration-300 hover:bg-slate-800"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8 space-y-12 lg:px-10 lg:py-12">
      <section
        v-if="errorMessage"
        v-reveal="{ origin: 'up', distance: 28 }"
        class="border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </section>

      <!-- 顶部概览区 -->
      <section class="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div v-reveal="{ origin: 'up', delay: 60, distance: 50 }" class="space-y-8">
          <div class="space-y-4">
            <p class="text-xs uppercase tracking-[0.35em] text-slate-400">Dashboard</p>
            <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              欢迎回来，{{ greeting }}
            </h1>
            <p class="max-w-2xl text-base leading-7 text-slate-600">
              在这里查看你的近期活动安排、社团通知与报名状态。
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row">
            <a
              href="#activities"
              class="inline-flex items-center justify-center border border-slate-300 bg-white px-6 py-3 text-xs uppercase tracking-[0.28em] text-slate-700 transition-all duration-300 hover:bg-slate-50"
            >
              查看最近活动
            </a>
            <a
              href="#notices"
              class="inline-flex items-center justify-center border border-slate-300 bg-white px-6 py-3 text-xs uppercase tracking-[0.28em] text-slate-700 transition-all duration-300 hover:bg-slate-50"
            >
              打开我的提醒
            </a>
          </div>

          <div class="grid gap-0 border border-slate-200 bg-white sm:grid-cols-3">
            <article
              v-for="(item, index) in quickOverview"
              :key="item.label"
              v-reveal="{
                origin: 'up',
                delay: index * 90,
                distance: 36,
                duration: 760,
              }"
              :class="[
                'p-6 relative bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:z-10',
                index !== quickOverview.length - 1 ? 'border-b border-slate-200 sm:border-b-0 sm:border-r' : ''
              ]"
            >
              <p class="text-xs uppercase tracking-[0.3em] text-slate-500">{{ item.label }}</p>
              <p class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{{ item.value }}</p>
            </article>
          </div>
        </div>

        <aside
          v-reveal="{ origin: 'left', delay: 140, distance: 46 }"
          class="border border-slate-200 bg-white p-8 text-slate-900"
        >
          <div class="space-y-8">
            <div class="space-y-3">
              <p class="text-xs uppercase tracking-[0.32em] text-slate-500">This Week</p>
              <p class="text-4xl font-semibold tracking-tight">{{ overview.weekCount }} 场</p>
              <p class="text-sm leading-7 text-slate-600">{{ overview.weekSummary }}</p>
            </div>

            <div class="grid gap-0 border border-slate-200 bg-slate-50">
              <article
                v-for="(slot, index) in overview.slots"
                :key="`${slot.label}-${slot.title}`"
                v-reveal="{
                  origin: 'left',
                  delay: 80 + index * 70,
                  distance: 28,
                  duration: 720,
                }"
                :class="[
                  'p-4 relative bg-slate-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:z-10',
                  index !== overview.slots.length - 1 ? 'border-b border-slate-200' : ''
                ]"
              >
                <p class="text-[10px] uppercase tracking-[0.32em] text-slate-500">{{ slot.label }}</p>
                <p class="mt-2 text-sm text-slate-900">{{ slot.title }}</p>
              </article>
            </div>

            <div v-if="primaryActivity" class="border border-cyan-200 bg-cyan-50 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)]">
              <p class="text-[10px] uppercase tracking-[0.32em] text-cyan-600">Next Activity</p>
              <h2 class="mt-3 text-lg font-semibold tracking-tight text-cyan-900">
                {{ primaryActivity.title }}
              </h2>
              <p class="mt-2 text-sm text-cyan-700">{{ primaryActivity.schedule }}</p>
              <p class="mt-1 text-sm text-cyan-700">{{ primaryActivity.location }}</p>
            </div>
          </div>
        </aside>
      </section>

      <!-- 数据统计区 -->
      <section class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <article
          v-reveal="{ origin: 'up', delay: 60, distance: 46 }"
          class="border border-slate-200 bg-white p-8 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
        >
          <p class="text-xs uppercase tracking-[0.32em] text-slate-500">Overview</p>
          <div class="mt-6 flex items-end justify-between gap-4">
            <div>
              <p class="text-5xl font-semibold tracking-tight text-slate-900">{{ overview.weekCount }}</p>
              <p class="mt-3 text-sm text-slate-600">本周活动参与数</p>
            </div>
            <div class="border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600">
              Live Sync
            </div>
          </div>
          <p class="mt-6 max-w-2xl text-sm leading-7 text-slate-600">{{ overview.weekSummary }}</p>
        </article>

        <div class="grid gap-0 border border-slate-200 bg-white sm:grid-cols-3">
          <article
            v-for="(metric, index) in secondaryMetrics"
            :key="metric.label"
            v-reveal="{
              origin: 'up',
              delay: index * 90,
              distance: 36,
              duration: 760,
            }"
            :class="[
              'p-6 relative bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:z-10',
              index !== secondaryMetrics.length - 1 ? 'border-b border-slate-200 sm:border-b-0 sm:border-r' : ''
            ]"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-slate-500">{{ metric.label }}</p>
            <p class="mt-6 text-3xl font-semibold tracking-tight text-slate-900">{{ metric.value }}</p>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ metric.detail }}</p>
          </article>
        </div>
      </section>

      <!-- 列表区 -->
      <section class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_360px]">
        <div
          id="activities"
          v-reveal="{ origin: 'up', delay: 80, distance: 52 }"
          class="border border-slate-200 bg-white"
        >
          <div class="border-b border-slate-200 px-8 py-6">
            <p class="text-xs uppercase tracking-[0.32em] text-slate-500">Upcoming Activities</p>
            <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">近期活动安排</h2>
          </div>

          <div v-if="isLoading" class="px-8 py-10 text-sm text-slate-500">
            正在同步数据...
          </div>

          <div v-else-if="activities.length === 0" class="px-8 py-10 text-sm leading-7 text-slate-500">
            当前还没有可展示的活动记录。你可以先前往门户页浏览活动并提交报名申请。
          </div>

          <div v-else class="divide-y divide-slate-200">
            <article
              v-for="activity in activities"
              :key="activity.id"
              v-reveal="{ origin: 'up', distance: 30, duration: 760 }"
              class="grid gap-6 px-8 py-6 relative bg-white transition-all duration-300 hover:scale-[1.01] hover:bg-slate-50 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:z-10 lg:grid-cols-[120px_minmax(0,1fr)_120px]"
            >
              <div class="border border-slate-200 bg-white px-4 py-4 text-center">
                <p class="text-[10px] uppercase tracking-[0.3em] text-slate-500">{{ activity.category }}</p>
                <p class="mt-3 text-sm font-medium text-slate-900">{{ activity.clubName }}</p>
              </div>

              <div class="space-y-3">
                <h3 class="text-lg font-semibold tracking-tight text-slate-900">{{ activity.title }}</h3>
                <p class="text-sm text-slate-600">{{ activity.schedule }}</p>
                <p class="text-sm text-slate-600">{{ activity.location }}</p>
              </div>

              <div class="flex items-start lg:justify-end">
                <span
                  :class="[
                    'border px-3 py-1.5 text-xs',
                    getStatusClassName(activity.status),
                  ]"
                >
                  {{ activity.status }}
                </span>
              </div>
            </article>
          </div>
        </div>

        <div class="grid gap-8">
          <section
            id="notices"
            v-reveal="{ origin: 'left', delay: 120, distance: 42 }"
            class="border border-slate-200 bg-white"
          >
            <div class="border-b border-slate-200 px-6 py-5">
              <p class="text-xs uppercase tracking-[0.32em] text-slate-500">Notice Board</p>
              <h2 class="mt-3 text-xl font-semibold tracking-tight text-slate-900">申请提醒</h2>
            </div>

            <div v-if="isLoading" class="px-6 py-8 text-sm text-slate-500">
              正在同步提醒...
            </div>

            <div v-else-if="notices.length === 0" class="px-6 py-8 text-sm leading-7 text-slate-500">
              当前没有新的申请动态。
            </div>

            <div v-else class="divide-y divide-slate-200">
              <article
                v-for="notice in notices"
                :key="notice.id"
                v-reveal="{ origin: 'left', distance: 26, duration: 720 }"
                class="px-6 py-5 relative bg-white transition-all duration-300 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:z-10"
              >
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-sm font-medium text-slate-900">{{ notice.title }}</h3>
                  <span class="text-[10px] uppercase tracking-[0.2em] text-slate-500">{{ notice.time }}</span>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ notice.summary }}</p>
              </article>
            </div>
          </section>

          <section
            v-reveal="{ origin: 'left', delay: 180, distance: 42 }"
            class="border border-slate-200 bg-white"
          >
            <div class="border-b border-slate-200 px-6 py-5">
              <p class="text-xs uppercase tracking-[0.32em] text-slate-500">Timeline</p>
              <h2 class="mt-3 text-xl font-semibold tracking-tight text-slate-900">参与轨迹</h2>
            </div>

            <div v-if="isLoading" class="px-6 py-8 text-sm text-slate-500">
              正在整理轨迹...
            </div>

            <div v-else-if="timeline.length === 0" class="px-6 py-8 text-sm leading-7 text-slate-500">
              当前还没有已通过且待参与的活动。
            </div>

            <div v-else class="px-6 py-4">
              <article
                v-for="(item, index) in timeline"
                :key="item.id"
                v-reveal="{
                  origin: 'left',
                  delay: index * 80,
                  distance: 26,
                  duration: 720,
                }"
                class="grid grid-cols-[16px_minmax(0,1fr)] gap-4 py-4"
              >
                <div class="flex flex-col items-center">
                  <span class="mt-1.5 h-2 w-2 bg-slate-900" />
                  <span v-if="index < timeline.length - 1" class="mt-2 h-full w-px bg-slate-200" />
                </div>
                <div class="border border-slate-200 bg-slate-50 px-4 py-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-sm font-medium text-slate-900">{{ item.title }}</h3>
                    <span class="text-[10px] uppercase tracking-[0.2em] text-slate-500">{{ item.step }}</span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.description }}</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
