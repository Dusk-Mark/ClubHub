export interface StudentDashboardMetric {
  label: string
  value: string
  detail: string
}

export interface StudentDashboardActivityCard {
  id: string
  category: string
  title: string
  clubName: string
  schedule: string
  location: string
  status: string
}

export interface StudentDashboardNoticeItem {
  id: string
  title: string
  summary: string
  time: string
}

export interface StudentDashboardTimelineItem {
  id: string
  step: string
  title: string
  description: string
}

export interface StudentDashboardOverviewSlot {
  label: string
  title: string
}

export interface StudentDashboardOverview {
  weekCount: string
  weekSummary: string
  slots: StudentDashboardOverviewSlot[]
}

export interface StudentDashboardData {
  metrics: StudentDashboardMetric[]
  activities: StudentDashboardActivityCard[]
  notices: StudentDashboardNoticeItem[]
  timeline: StudentDashboardTimelineItem[]
  overview: StudentDashboardOverview
}
