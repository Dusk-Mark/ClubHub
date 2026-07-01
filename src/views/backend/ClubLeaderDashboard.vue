<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface LeaderMetric {
  label: string
  value: string
  detail: string
}

interface ManagedActivity {
  id: string
  title: string
  schedule: string
  status: string
  volume: string
}

interface RegistrationTask {
  id: string
  applicant: string
  target: string
  submittedAt: string
}

interface ArchiveTask {
  id: string
  title: string
  summary: string
}

const router = useRouter()
const userStore = useUserStore()

const metrics: LeaderMetric[] = [
  { label: '进行中活动', value: '04', detail: '其中 2 场需要本周复盘' },
  { label: '待处理报名', value: '18', detail: '建议今天完成首轮审核' },
  { label: '待签到成员', value: '26', detail: '活动开始前 30 分钟开放' },
  { label: '待归档资料', value: '03', detail: '图片、文档与反馈待整理' },
]

const managedActivities: ManagedActivity[] = [
  {
    id: 'm1',
    title: '智能车竞赛队内选拔说明会',
    schedule: '今天 19:00 · 主楼 A203',
    status: '招募中',
    volume: '42 人已报名',
  },
  {
    id: 'm2',
    title: '机器臂实训开放日',
    schedule: '周三 15:00 · 实验中心 301',
    status: '待签到',
    volume: '28 人通过审核',
  },
  {
    id: 'm3',
    title: '社团成果展资料整理会',
    schedule: '周五 18:30 · 创新工坊',
    status: '待归档',
    volume: '12 份文档待上传',
  },
]

const registrationTasks: RegistrationTask[] = [
  { id: 'r1', applicant: '王晨曦', target: '智能车竞赛队内选拔说明会', submittedAt: '5 分钟前' },
  { id: 'r2', applicant: '赵嘉怡', target: '机器臂实训开放日', submittedAt: '今天 08:45' },
  { id: 'r3', applicant: '陈宇轩', target: '宣传组设计协作招募', submittedAt: '昨天 21:10' },
]

const archiveTasks: ArchiveTask[] = [
  {
    id: 'a1',
    title: '本月社团节奏概览',
    summary: '建议优先归档已结束活动的海报、现场图片与成员反馈，保持后台记录完整。',
  },
  {
    id: 'a2',
    title: '成员动态提醒',
    summary: '两位骨干成员本周无法到场，需要提前补位并同步签到负责人。',
  },
]

const leaderName = computed(() => userStore.fullName || '社团管理员')
const roleLabel = computed(() => (userStore.role === 'admin' ? '校团委管理员' : '社团管理员'))

const handleLogout = () => {
  void userStore.signOut().finally(() => {
    router.push('/backend/login')
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] text-slate-900">
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f8f9fa]/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.32em] text-slate-500">Club Leader Console</p>
          <p class="text-sm text-slate-900">ClubHub 社团管理员端</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 md:block">
            {{ leaderName }} · {{ userStore.studentId || roleLabel }}
          </div>
          <button
            type="button"
            class="cursor-pointer border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-slate-50 transition-colors duration-200 hover:bg-slate-800"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10 lg:py-10">
      <aside
        v-reveal="{ origin: 'up', delay: 40, distance: 40 }"
        class="h-fit border border-slate-200 bg-white"
      >
        <div class="border-b border-slate-200 px-6 py-5">
          <p class="text-xs uppercase tracking-[0.32em] text-slate-400">Workspace</p>
          <h1 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{{ leaderName }}</h1>
          <p class="mt-3 text-sm leading-7 text-slate-500">
            当前账号角色为 {{ roleLabel }}，工作台先保留活动、报名、签到与资料归档等核心入口，后续再继续接社团真实业务数据。
          </p>
        </div>

        <nav class="divide-y divide-slate-200">
          <a
            href="#overview"
            class="flex cursor-pointer items-center justify-between px-6 py-4 text-sm text-slate-900 transition-colors duration-200 hover:bg-[#f8f9fa]"
          >
            <span>工作总览</span>
            <span class="text-slate-400">01</span>
          </a>
          <a
            href="#activities"
            class="flex cursor-pointer items-center justify-between px-6 py-4 text-sm text-slate-500 transition-colors duration-200 hover:bg-[#f8f9fa] hover:text-slate-900"
          >
            <span>活动管理</span>
            <span class="text-slate-400">02</span>
          </a>
          <a
            href="#applications"
            class="flex cursor-pointer items-center justify-between px-6 py-4 text-sm text-slate-500 transition-colors duration-200 hover:bg-[#f8f9fa] hover:text-slate-900"
          >
            <span>报名审核</span>
            <span class="text-slate-400">03</span>
          </a>
          <a
            href="#archive"
            class="flex cursor-pointer items-center justify-between px-6 py-4 text-sm text-slate-500 transition-colors duration-200 hover:bg-[#f8f9fa] hover:text-slate-900"
          >
            <span>资料归档</span>
            <span class="text-slate-400">04</span>
          </a>
        </nav>
      </aside>

      <div class="flex flex-col gap-8">
        <section
          id="overview"
          v-reveal="{ origin: 'up', delay: 80, distance: 54 }"
          class="grid gap-6 border border-slate-200 bg-white p-6 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:p-8"
        >
          <div class="space-y-6">
            <div class="space-y-3">
              <p class="text-xs uppercase tracking-[0.32em] text-slate-400">Management Overview</p>
              <h2 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                欢迎回来，{{ leaderName }}
                <span class="block">让你的管理节奏更清晰、更有秩序。</span>
              </h2>
              <p class="max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                工作台围绕活动发布、报名审核、签到提醒与资料沉淀展开，保持和前台一致的留白、边框与信息层次，方便后续继续扩展真实业务。
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                class="cursor-pointer border border-slate-900 bg-slate-900 px-5 py-3 text-sm text-slate-50 transition-colors duration-200 hover:bg-slate-800"
              >
                新建活动
              </button>
              <button
                type="button"
                class="cursor-pointer border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-100"
              >
                查看报名队列
              </button>
            </div>
          </div>

          <div class="grid gap-px border border-slate-200 bg-slate-200">
            <div class="bg-[#f8f9fa] p-5">
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Today Focus</p>
              <p class="mt-4 text-3xl font-semibold tracking-tight text-slate-900">18 项</p>
              <p class="mt-2 text-sm leading-7 text-slate-500">待审核报名与签到准备会影响今天的活动节奏，建议优先处理。</p>
            </div>
            <div class="grid gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-1">
              <div class="bg-white p-5">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-400">审核</p>
                <p class="mt-3 text-base text-slate-900">报名首轮筛选</p>
              </div>
              <div class="bg-white p-5">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-400">签到</p>
                <p class="mt-3 text-base text-slate-900">开放现场核验</p>
              </div>
              <div class="bg-white p-5">
                <p class="text-xs uppercase tracking-[0.3em] text-slate-400">归档</p>
                <p class="mt-3 text-base text-slate-900">收集活动资料</p>
              </div>
            </div>
          </div>
        </section>

        <section class="grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="(metric, index) in metrics"
            :key="metric.label"
            v-reveal="{
              origin: 'up',
              delay: index * 90,
              distance: 38,
              duration: 760,
            }"
            class="bg-white p-6"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400">{{ metric.label }}</p>
            <p class="mt-5 text-4xl font-semibold tracking-tight text-slate-900">{{ metric.value }}</p>
            <p class="mt-3 text-sm leading-7 text-slate-500">{{ metric.detail }}</p>
          </article>
        </section>

        <section class="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_340px]">
          <div
            id="activities"
            v-reveal="{ origin: 'up', delay: 90, distance: 50 }"
            class="border border-slate-200 bg-white"
          >
            <div class="border-b border-slate-200 px-6 py-5">
              <p class="text-xs uppercase tracking-[0.32em] text-slate-400">Activity Management</p>
              <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">活动管理面板</h2>
            </div>

            <div class="divide-y divide-slate-200">
              <article
                v-for="activity in managedActivities"
                :key="activity.id"
                v-reveal="{ origin: 'up', distance: 28, duration: 740 }"
                class="grid gap-4 px-6 py-6 md:grid-cols-[minmax(0,1fr)_120px_130px]"
              >
                <div class="space-y-3">
                  <h3 class="text-xl font-semibold tracking-tight text-slate-900">{{ activity.title }}</h3>
                  <p class="text-sm text-slate-500">{{ activity.schedule }}</p>
                </div>
                <div class="flex items-start md:justify-center">
                  <span class="border border-slate-200 bg-[#f8f9fa] px-4 py-2 text-sm text-slate-700">
                    {{ activity.status }}
                  </span>
                </div>
                <div class="text-sm leading-7 text-slate-500 md:text-right">
                  {{ activity.volume }}
                </div>
              </article>
            </div>
          </div>

          <div class="grid gap-8">
            <section
              id="applications"
              v-reveal="{ origin: 'left', delay: 120, distance: 40 }"
              class="border border-slate-200 bg-white"
            >
              <div class="border-b border-slate-200 px-6 py-5">
                <p class="text-xs uppercase tracking-[0.32em] text-slate-400">Application Queue</p>
                <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">待审核报名</h2>
              </div>

              <div class="divide-y divide-slate-200">
                <article
                  v-for="task in registrationTasks"
                  :key="task.id"
                  v-reveal="{ origin: 'left', distance: 24, duration: 720 }"
                  class="px-6 py-5"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="text-base font-medium text-slate-900">{{ task.applicant }}</h3>
                      <p class="mt-2 text-sm leading-7 text-slate-500">{{ task.target }}</p>
                    </div>
                    <span class="text-xs uppercase tracking-[0.24em] text-slate-400">{{ task.submittedAt }}</span>
                  </div>
                </article>
              </div>
            </section>

            <section
              id="archive"
              v-reveal="{ origin: 'left', delay: 180, distance: 40 }"
              class="border border-slate-200 bg-white"
            >
              <div class="border-b border-slate-200 px-6 py-5">
                <p class="text-xs uppercase tracking-[0.32em] text-slate-400">Archive Notes</p>
                <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">资料与成员提醒</h2>
              </div>

              <div class="divide-y divide-slate-200">
                <article
                  v-for="item in archiveTasks"
                  :key="item.id"
                  v-reveal="{ origin: 'left', distance: 24, duration: 720 }"
                  class="px-6 py-5"
                >
                  <h3 class="text-base font-medium text-slate-900">{{ item.title }}</h3>
                  <p class="mt-3 text-sm leading-7 text-slate-500">{{ item.summary }}</p>
                </article>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
