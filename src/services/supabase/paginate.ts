import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 1000;

export interface PaginationProgress {
  loaded: number;
  total: number | null;
}

/**
 * Fetches all repairers with pagination, bypassing the 1000 row limit.
 * Includes related business_categories.
 */
export async function fetchAllRepairers(
  onProgress?: (progress: PaginationProgress) => void
): Promise<{ data: any[]; error: Error | null; total: number }> {
  const allData: any[] = [];
  let from = 0;
  let hasMore = true;
  let totalCount: number | null = null;
  
  try {
    // First, get the total count
    const { count, error: countError } = await supabase
      .from('repairers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting repairers count:', countError);
    } else {
      totalCount = count;
    }
    
    // Fetch data in pages
    while (hasMore) {
      const { data, error } = await supabase
        .from('repairers')
        .select('*, business_categories(name, color)')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      
      if (error) {
        console.error('Error fetching repairers page:', error);
        return { data: allData, error: new Error(error.message), total: allData.length };
      }
      
      if (data && data.length > 0) {
        allData.push(...data);
        from += PAGE_SIZE;
        
        if (onProgress) {
          onProgress({ loaded: allData.length, total: totalCount });
        }
        
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    return { data: allData, error: null, total: totalCount ?? allData.length };
  } catch (error) {
    console.error('Unexpected error fetching all repairers:', error);
    return { 
      data: allData, 
      error: error instanceof Error ? error : new Error('Unknown error'), 
      total: allData.length 
    };
  }
}

/**
 * Fetches only repairers with GPS coordinates for map display.
 */
export async function fetchRepairersWithGPS(
  onProgress?: (progress: PaginationProgress) => void
): Promise<{ data: any[]; error: Error | null; total: number }> {
  const allData: any[] = [];
  let from = 0;
  let hasMore = true;
  let totalCount: number | null = null;
  
  try {
    // First, get the count of repairers with GPS
    const { count, error: countError } = await supabase
      .from('repairers')
      .select('*', { count: 'exact', head: true })
      .not('lat', 'is', null)
      .not('lng', 'is', null);
    
    if (countError) {
      console.error('Error getting GPS repairers count:', countError);
    } else {
      totalCount = count;
    }
    
    // Fetch data in pages
    while (hasMore) {
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('rating', { ascending: false, nullsFirst: false })
        .range(from, from + PAGE_SIZE - 1);
      
      if (error) {
        console.error('Error fetching GPS repairers page:', error);
        return { data: allData, error: new Error(error.message), total: allData.length };
      }
      
      if (data && data.length > 0) {
        allData.push(...data);
        from += PAGE_SIZE;
        
        if (onProgress) {
          onProgress({ loaded: allData.length, total: totalCount });
        }
        
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    return { data: allData, error: null, total: totalCount ?? allData.length };
  } catch (error) {
    console.error('Unexpected error fetching GPS repairers:', error);
    return { 
      data: allData, 
      error: error instanceof Error ? error : new Error('Unknown error'), 
      total: allData.length 
    };
  }
}
