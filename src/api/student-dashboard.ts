import { supabase } from '@/api/supabase'
import type {
  StudentDashboardActivityCard,
  StudentDashboardData,
  StudentDashboardMetric,
  StudentDashboardNoticeItem,
  StudentDashboardOverview,
  StudentDashboardOverviewSlot,
  StudentDashboardTimelineItem,
} from '@/types/student-dashboard'

type ClubStatus = 'pending' | 'active' | 'cancelled'
type ActivityStatus = 'recruiting' | 'ongoing' | 'finished' | 'archived'
type ApplicationStatus = 'pending' | 'approved' | 'rejected'
type ApplicationTargetType = 'club' | 'activity'

interface RawClubRecord {
  id: unknown
  name: unknown
  description: unknown
  status: unknown
  created_at: unknown
  updated_at: unknown
}

interface RawMembershipRecord {
  id: unknown
  club_id: unknown
  user_id: unknown
  joined_at: unknown
  position: unknown
  created_at: unknown
  updated_at: unknown
}

interface RawActivityRecord {
  id: unknown
  club_id: unknown
  title: unknown
  content: unknown
  location: unknown
  start_time: unknown
  end_time: unknown
  status: unknown
  created_at: unknown
  updated_at: unknown
}

interface RawApplicationRecord {
  id: unknown
  applicant_id: unknown
  target_type: unknown
  target_id: unknown
  status: unknown
  reason: unknown
  reviewed_at: unknown
  created_at: unknown
  updated_at: unknown
}

interface ClubRecord {
  id: string
  name: string
  description: string | null
  status: ClubStatus
  created_at: string
  updated_at: string
}

interface MembershipRecord {
  id: string
  club_id: string
  user_id: string
  joined_at: string
  position: string
  created_at: string
  updated_at: string
}

interface ActivityRecord {
  id: string
  club_id: string
  title: string
  content: string
  location: string | null
  start_time: string | null
  end_time: string | null
  status: ActivityStatus
  created_at: string
  updated_at: string
}

interface ApplicationRecord {
  id: string
  applicant_id: string
  target_type: ApplicationTargetType
  target_id: string
  status: ApplicationStatus
  reason: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

const isClubStatus = (value: unknown): value is ClubStatus =>
  value === 'pending' || value === 'active' || value === 'cancelled'

const isActivityStatus = (value: unknown): value is ActivityStatus =>
  value === 'recruiting' || value === 'ongoing' || value === 'finished' || value === 'archived'

const isApplicationStatus = (value: unknown): value is ApplicationStatus =>
  value === 'pending' || value === 'approved' || value === 'rejected'

const isApplicationTargetType = (value: unknown): value is ApplicationTargetType =>
  value === 'club' || value === 'activity'

const parseClub = (value: unknown): ClubRecord | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as RawClubRecord

  if (
    typeof record.id !== 'string'
    || typeof record.name !== 'string'
    || !isClubStatus(record.status)
    || typeof record.created_at !== 'string'
    || typeof record.updated_at !== 'string'
  ) {
    return null
  }

  return {
    id: record.id,
    name: record.name,
    description: typeof record.description === 'string' ? record.description : null,
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

const parseMembership = (value: unknown): MembershipRecord | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as RawMembershipRecord

  if (
    typeof record.id !== 'string'
    || typeof record.club_id !== 'string'
    || typeof record.user_id !== 'string'
    || typeof record.joined_at !== 'string'
    || typeof record.position !== 'string'
    || typeof record.created_at !== 'string'
    || typeof record.updated_at !== 'string'
  ) {
    return null
  }

  return {
    id: record.id,
    club_id: record.club_id,
    user_id: record.user_id,
    joined_at: record.joined_at,
    position: record.position,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

const parseActivity = (value: unknown): ActivityRecord | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as RawActivityRecord

  if (
    typeof record.id !== 'string'
    || typeof record.club_id !== 'string'
    || typeof record.title !== 'string'
    || typeof record.content !== 'string'
    || !isActivityStatus(record.status)
    || typeof record.created_at !== 'string'
    || typeof record.updated_at !== 'string'
  ) {
    return null
  }

  return {
    id: record.id,
    club_id: record.club_id,
    title: record.title,
    content: record.content,
    location: typeof record.location === 'string' ? record.location : null,
    start_time: typeof record.start_time === 'string' ? record.start_time : null,
    end_time: typeof record.end_time === 'string' ? record.end_time : null,
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

const parseApplication = (value: unknown): ApplicationRecord | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as RawApplicationRecord

  if (
    typeof record.id !== 'string'
    || typeof record.applicant_id !== 'string'
    || !isApplicationTargetType(record.target_type)
    || typeof record.target_id !== 'string'
    || !isApplicationStatus(record.status)
    || typeof record.created_at !== 'string'
    || typeof record.updated_at !== 'string'
  ) {
    return null
  }

  return {
    id: record.id,
    applicant_id: record.applicant_id,
    target_type: record.target_type,
    target_id: record.target_id,
    status: record.status,
    reason: typeof record.reason === 'string' ? record.reason : null,
    reviewed_at: typeof record.reviewed_at === 'string' ? record.reviewed_at : null,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

const getDateValue = (value: string | null): number => {
  if (!value) {
    return Number.POSITIVE_INFINITY
  }

  return new Date(value).getTime()
}

const formatMetricNumber = (value: number): string => value.toString().padStart(2, '0')

const formatDateTime = (value: string) => {
  const date = new Date(value)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000)
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (diffDays === 0) {
    return `今天 ${time}`
  }

  if (diffDays === 1) {
    return `明天 ${time}`
  }

  if (diffDays > 1 && diffDays < 7) {
    const weekDay = date.toLocaleDateString('zh-CN', { weekday: 'short' })
    return `${weekDay} ${time}`
  }

  const dateLabel = date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  })

  return `${dateLabel} ${time}`
}

const formatSchedule = (startTime: string | null, endTime: string | null) => {
  if (!startTime) {
    return '时间待定'
  }

  const startDate = new Date(startTime)
  const startLabel = formatDateTime(startTime)

  if (!endTime) {
    return startLabel
  }

  const endDate = new Date(endTime)
  const sameDay =
    startDate.getFullYear() === endDate.getFullYear()
    && startDate.getMonth() === endDate.getMonth()
    && startDate.getDate() === endDate.getDate()

  if (sameDay) {
    const endLabel = endDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    return `${startLabel} - ${endLabel}`
  }

  return `${startLabel} - ${formatDateTime(endTime)}`
}

const formatRelativeTime = (value: string) => {
  const diff = new Date(value).getTime() - Date.now()
  const diffMinutes = Math.round(diff / 60000)
  const absoluteMinutes = Math.abs(diffMinutes)

  if (absoluteMinutes < 60) {
    return diffMinutes >= 0 ? `${absoluteMinutes} 分钟后` : `${absoluteMinutes} 分钟前`
  }

  const diffHours = Math.round(diffMinutes / 60)
  const absoluteHours = Math.abs(diffHours)

  if (absoluteHours < 24) {
    return diffHours >= 0 ? `${absoluteHours} 小时后` : `${absoluteHours} 小时前`
  }

  const diffDays = Math.round(diffHours / 24)
  const absoluteDays = Math.abs(diffDays)

  return diffDays >= 0 ? `${absoluteDays} 天后` : `${absoluteDays} 天前`
}

const getApplicationStatusLabel = (status: ApplicationStatus) => {
  const labelMap: Record<ApplicationStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }

  return labelMap[status]
}

const getActivityCategory = (status: ActivityStatus) => {
  const labelMap: Record<ActivityStatus, string> = {
    recruiting: '招募中',
    ongoing: '进行中',
    finished: '已结束',
    archived: '已归档',
  }

  return labelMap[status]
}

const getActivityStatusDescription = (status: ActivityStatus) => {
  const labelMap: Record<ActivityStatus, string> = {
    recruiting: '活动仍在招募阶段，可继续关注审核结果与开始时间。',
    ongoing: '活动正在进行中，请关注签到与现场安排。',
    finished: '活动已结束，可留意是否需要补充反馈或资料。',
    archived: '活动已归档，你的参与记录已沉淀到历史数据中。',
  }

  return labelMap[status]
}

const getApplicationNoticeTitle = (status: ApplicationStatus, targetLabel: string) => {
  const labelMap: Record<ApplicationStatus, string> = {
    pending: `${targetLabel}申请已提交`,
    approved: `${targetLabel}申请已通过`,
    rejected: `${targetLabel}申请未通过`,
  }

  return labelMap[status]
}

const isWithinCurrentWeek = (value: string | null) => {
  if (!value) {
    return false
  }

  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7))

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  const target = new Date(value)

  return target >= start && target < end
}

export const getStudentDashboardData = async (userId: string): Promise<StudentDashboardData> => {
  const [membershipsResult, applicationsResult] = await Promise.all([
    supabase
      .from('club_members')
      .select('id, club_id, user_id, joined_at, position, created_at, updated_at')
      .eq('user_id', userId),
    supabase
      .from('applications')
      .select('id, applicant_id, target_type, target_id, status, reason, reviewed_at, created_at, updated_at')
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false }),
  ])

  if (membershipsResult.error) {
    throw membershipsResult.error
  }

  if (applicationsResult.error) {
    throw applicationsResult.error
  }

  const memberships = (membershipsResult.data ?? [])
    .map((item) => parseMembership(item))
    .filter((item): item is MembershipRecord => item !== null)

  const applications = (applicationsResult.data ?? [])
    .map((item) => parseApplication(item))
    .filter((item): item is ApplicationRecord => item !== null)

  const activityIds = Array.from(
    new Set(
      applications
        .filter((item) => item.target_type === 'activity')
        .map((item) => item.target_id),
    ),
  )

  const clubIdSet = new Set<string>(
    memberships.map((item) => item.club_id),
  )

  applications
    .filter((item) => item.target_type === 'club')
    .forEach((item) => {
      clubIdSet.add(item.target_id)
    })

  const activitiesResult = activityIds.length > 0
    ? await supabase
        .from('activities')
        .select('id, club_id, title, content, location, start_time, end_time, status, created_at, updated_at')
        .in('id', activityIds)
    : { data: [], error: null }

  if (activitiesResult.error) {
    throw activitiesResult.error
  }

  const activities = (activitiesResult.data ?? [])
    .map((item) => parseActivity(item))
    .filter((item): item is ActivityRecord => item !== null)

  activities.forEach((item) => {
    clubIdSet.add(item.club_id)
  })

  const clubIds = Array.from(clubIdSet)

  const clubsResult = clubIds.length > 0
    ? await supabase
        .from('clubs')
        .select('id, name, description, status, created_at, updated_at')
        .in('id', clubIds)
    : { data: [], error: null }

  if (clubsResult.error) {
    throw clubsResult.error
  }

  const clubs = (clubsResult.data ?? [])
    .map((item) => parseClub(item))
    .filter((item): item is ClubRecord => item !== null)

  const clubMap = new Map(clubs.map((item) => [item.id, item]))
  const activityMap = new Map(activities.map((item) => [item.id, item]))

  const validActivityApplications = applications
    .filter((item) => item.target_type === 'activity')
    .map((item) => {
      const activity = activityMap.get(item.target_id)

      if (!activity) {
        return null
      }

      return {
        application: item,
        activity,
        club: clubMap.get(activity.club_id) ?? null,
      }
    })
    .filter((item): item is { application: ApplicationRecord; activity: ActivityRecord; club: ClubRecord | null } => item !== null)

  validActivityApplications.sort((left, right) => {
    const leftTime = getDateValue(left.activity.start_time)
    const rightTime = getDateValue(right.activity.start_time)

    if (leftTime !== rightTime) {
      return leftTime - rightTime
    }

    return new Date(right.application.created_at).getTime() - new Date(left.application.created_at).getTime()
  })

  const displayActivities = validActivityApplications
    .filter((item) => item.application.status !== 'rejected')
    .slice(0, 3)

  const activityCards: StudentDashboardActivityCard[] = displayActivities.map((item) => ({
    id: item.application.id,
    category: getActivityCategory(item.activity.status),
    title: item.activity.title,
    clubName: item.club?.name ?? '社团信息待补充',
    schedule: formatSchedule(item.activity.start_time, item.activity.end_time),
    location: item.activity.location ?? '地点待定',
    status: getApplicationStatusLabel(item.application.status),
  }))

  const approvedUpcomingActivities = validActivityApplications.filter((item) =>
    item.application.status === 'approved'
    && item.activity.status !== 'finished'
    && item.activity.status !== 'archived',
  )

  const pendingApplications = applications.filter((item) => item.status === 'pending')
  const registeredActivityCount = applications.filter((item) => item.target_type === 'activity').length
  const joinedClubCount = memberships.length
  const thisWeekCount = approvedUpcomingActivities.filter((item) => isWithinCurrentWeek(item.activity.start_time)).length

  const metrics: StudentDashboardMetric[] = [
    {
      label: '已报名活动',
      value: formatMetricNumber(registeredActivityCount),
      detail: `其中 ${validActivityApplications.filter((item) => item.application.status === 'approved').length} 场已通过审核`,
    },
    {
      label: '待参加日程',
      value: formatMetricNumber(approvedUpcomingActivities.length),
      detail: `本周有 ${thisWeekCount} 场活动已排期`,
    },
    {
      label: '已加入社团',
      value: formatMetricNumber(joinedClubCount),
      detail: joinedClubCount > 0 ? '系统已同步你的社团成员身份' : '你暂时还没有加入任何社团',
    },
    {
      label: '待处理申请',
      value: formatMetricNumber(pendingApplications.length),
      detail: pendingApplications.length > 0 ? '请留意报名或入社申请的审批结果' : '当前没有待处理的申请记录',
    },
  ]

  const overviewSlots: StudentDashboardOverviewSlot[] = approvedUpcomingActivities
    .slice(0, 3)
    .map((item) => ({
      label: item.activity.start_time ? formatDateTime(item.activity.start_time).split(' ')[0] : '待定',
      title: item.activity.title,
    }))

  while (overviewSlots.length < 3) {
    overviewSlots.push({
      label: `0${overviewSlots.length + 1}`,
      title: '等待新的活动安排',
    })
  }

  const overview: StudentDashboardOverview = {
    weekCount: formatMetricNumber(thisWeekCount),
    weekSummary: thisWeekCount > 0
      ? `本周你有 ${thisWeekCount} 场已通过的活动安排，建议优先查看最近的开始时间。`
      : '本周暂时没有已排期活动，你可以先浏览新的社团活动并提交报名。',
    slots: overviewSlots,
  }

  const notices: StudentDashboardNoticeItem[] = applications
    .slice(0, 3)
    .map((item) => {
      const targetName = item.target_type === 'activity'
        ? activityMap.get(item.target_id)?.title ?? '活动'
        : clubMap.get(item.target_id)?.name ?? '社团'

      return {
        id: item.id,
        title: getApplicationNoticeTitle(item.status, item.target_type === 'activity' ? '活动' : '入社'),
        summary: `目标：${targetName}。当前状态为${getApplicationStatusLabel(item.status)}。`,
        time: formatRelativeTime(item.updated_at),
      }
    })

  const timeline: StudentDashboardTimelineItem[] = approvedUpcomingActivities
    .slice(0, 3)
    .map((item, index) => ({
      id: item.application.id,
      step: `${index + 1}`.padStart(2, '0'),
      title: item.activity.title,
      description: `${item.club?.name ?? '社团待补充'} · ${formatSchedule(item.activity.start_time, item.activity.end_time)} · ${getActivityStatusDescription(item.activity.status)}`,
    }))

  return {
    metrics,
    activities: activityCards,
    notices,
    timeline,
    overview,
  }
}
