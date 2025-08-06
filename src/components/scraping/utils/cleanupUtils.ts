import { CleanupQuery } from '../types/historyTypes';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';

export const getCleanupQuery = (filter: string): CleanupQuery | null => {
  const now = new Date();
  
  switch (filter) {
    case 'older_than_day':
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return { column: 'started_at', operator: 'lt', value: oneDayAgo.toISOString() };
    
    case 'older_than_week':
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { column: 'started_at', operator: 'lt', value: oneWeekAgo.toISOString() };
    
    case 'older_than_month':
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { column: 'started_at', operator: 'lt', value: oneMonthAgo.toISOString() };
    
    case 'failed_only':
      return { column: 'status', operator: 'eq', value: 'failed' };
    
    case 'successful_only':
      return { column: 'status', operator: 'eq', value: 'completed' };
    
    case 'all':
      return null;
    
    default:
      return null;
  }
};

export const getLogsToDelete = (logs: ScrapingLog[], filter: string): ScrapingLog[] => {
  const query = getCleanupQuery(filter);
  if (!query) return logs;
  
  return logs.filter(log => {
    if (query.column === 'started_at') {
      const logDate = new Date(log.started_at);
      const compareDate = new Date(query.value);
      return query.operator === 'lt' ? logDate < compareDate : logDate > compareDate;
    }
    
    if (query.column === 'status') {
      return query.operator === 'eq' ? log.status === query.value : log.status !== query.value;
    }
    
    return false;
  });
};
