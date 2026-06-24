export type ActivityStatus = 'recruiting' | 'ongoing' | 'finished' | 'archived';

export interface Activity {
  id: string;
  title: string;
  content: string;
  club_id: string;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}
