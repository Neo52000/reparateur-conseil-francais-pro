export interface BlogAutomationSchedule {
  id: string;
  name: string;
  enabled: boolean;
  category_id: string | null;
  schedule_day: number;
  schedule_time: string;
  auto_publish: boolean;
  ai_model: string;
  prompt_template: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
}

export interface CronStatus {
  enabled: boolean;
  schedule: string;
  last_run: string | null;
  next_run: string | null;
  last_status: string | null;
  last_error: string | null;
}
