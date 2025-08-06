
export interface ScrapingLog {
  id: string;
  source: string;
  status: 'running' | 'completed' | 'failed';
  items_scraped: number;
  items_added: number;
  items_updated: number;
  items_pappers_verified?: number;
  items_pappers_rejected?: number;
  pappers_api_calls?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}
