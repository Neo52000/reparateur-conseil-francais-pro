import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { REGIONS } from '@/components/scraping/controls/scrapingConstants';

export interface DepartmentStats {
  code: string;
  repairerCount: number;
  cityCount: number;
  lastAdded: string | null;
}

export interface RegionStats {
  name: string;
  totalRepairers: number;
  scrapedDepartments: number;
  totalDepartments: number;
  lastAdded: string | null;
}

export const useScrapedRegionsStats = () => {
  const [departmentStats, setDepartmentStats] = useState<Map<string, DepartmentStats>>(new Map());
  const [regionStats, setRegionStats] = useState<Map<string, RegionStats>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Récupérer les réparateurs avec leurs codes postaux
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select('postal_code, city, created_at')
        .not('postal_code', 'is', null)
        .not('postal_code', 'eq', '');
      
      let statsData: Array<{ dept_code: string; repairer_count: number; city_count: number; last_added: string | null }> = [];
      
      if (!repairersError && repairersData) {
        // Agréger manuellement par département
        const deptMap = new Map<string, { count: number; cities: Set<string>; lastAdded: string | null }>();
        
        repairersData.forEach((r) => {
          if (!r.postal_code) return;
          const deptCode = r.postal_code.substring(0, 2);
          const existing = deptMap.get(deptCode) || { count: 0, cities: new Set<string>(), lastAdded: null };
          existing.count++;
          if (r.city) existing.cities.add(r.city);
          if (!existing.lastAdded || (r.created_at && r.created_at > existing.lastAdded)) {
            existing.lastAdded = r.created_at;
          }
          deptMap.set(deptCode, existing);
        });
        
        statsData = Array.from(deptMap.entries()).map(([code, data]) => ({
          dept_code: code,
          repairer_count: data.count,
          city_count: data.cities.size,
          last_added: data.lastAdded
        }));
      }

      // Construire le map des stats par département
      const deptStatsMap = new Map<string, DepartmentStats>();
      statsData.forEach((row: any) => {
        deptStatsMap.set(row.dept_code, {
          code: row.dept_code,
          repairerCount: row.repairer_count || 0,
          cityCount: row.city_count || 0,
          lastAdded: row.last_added
        });
      });
      setDepartmentStats(deptStatsMap);

      // Calculer les stats par région
      const regionStatsMap = new Map<string, RegionStats>();
      REGIONS.forEach(region => {
        let totalRepairers = 0;
        let scrapedDepartments = 0;
        let lastAdded: string | null = null;
        
        region.departments.forEach(dept => {
          const deptStat = deptStatsMap.get(dept.code);
          if (deptStat && deptStat.repairerCount > 0) {
            totalRepairers += deptStat.repairerCount;
            scrapedDepartments++;
            if (!lastAdded || (deptStat.lastAdded && deptStat.lastAdded > lastAdded)) {
              lastAdded = deptStat.lastAdded;
            }
          }
        });
        
        regionStatsMap.set(region.name, {
          name: region.name,
          totalRepairers,
          scrapedDepartments,
          totalDepartments: region.departments.length,
          lastAdded
        });
      });
      setRegionStats(regionStatsMap);
      
    } catch (err) {
      console.error('Erreur chargement stats scraping:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    departmentStats,
    regionStats,
    loading,
    refresh: loadStats
  };
};
