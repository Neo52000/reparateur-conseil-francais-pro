/**
 * Hook pour les analytics des réparateurs
 * Récupère et traite les données statistiques des réparateurs
 */

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RepairerWithStats {
  id: string;
  name: string;
  city: string;
  postal_code?: string;
  description?: string;
  phone?: string;
  email?: string;
  rating?: number;
  is_verified: boolean;
  requests_count?: number;
  created_at: string;
}

export interface RepairersStats {
  totalRepairers: number;
  newThisMonth: number;
  totalRequests: number;
  avgRequestsPerRepairer: number;
  avgRating: number;
  totalRatings: number;
  citiesCount: number;
  departmentsCount: number;
}

export const useRepairersAnalytics = () => {
  const [repairers, setRepairers] = useState<RepairerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadRepairersData = async () => {
    try {
      setLoading(true);

      // Récupérer les réparateurs avec leurs statistiques
      const { data: repairersData, error: repairersError } = await supabase
        .from('repairers')
        .select(`
          id,
          name,
          city,
          postal_code,
          description,
          phone,
          email,
          rating,
          is_verified,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (repairersError) {
        throw repairersError;
      }

      // Récupérer le nombre de demandes par réparateur (simulation)
      // En réalité, cela viendrait d'une table de demandes/quotes
      const repairersWithStats: RepairerWithStats[] = (repairersData || []).map(repairer => ({
        ...repairer,
        requests_count: Math.floor(Math.random() * 100) // Simulation - à remplacer par vraies données
      }));

      setRepairers(repairersWithStats);

    } catch (error) {
      console.error('Erreur lors du chargement des analytics réparateurs:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les statistiques des réparateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairersData();
  }, []);

  // Calculs des statistiques globales
  const stats: RepairersStats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newThisMonth = repairers.filter(r => 
      new Date(r.created_at) >= thisMonth
    ).length;

    const totalRequests = repairers.reduce((sum, r) => sum + (r.requests_count || 0), 0);
    
    const repairersWithRating = repairers.filter(r => r.rating && r.rating > 0);
    const avgRating = repairersWithRating.length > 0 
      ? repairersWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / repairersWithRating.length
      : 0;

    const cities = new Set(repairers.map(r => r.city).filter(Boolean));
    const departments = new Set(
      repairers
        .map(r => r.postal_code?.substring(0, 2))
        .filter(Boolean)
    );

    return {
      totalRepairers: repairers.length,
      newThisMonth,
      totalRequests,
      avgRequestsPerRepairer: repairers.length > 0 ? totalRequests / repairers.length : 0,
      avgRating,
      totalRatings: repairersWithRating.length,
      citiesCount: cities.size,
      departmentsCount: departments.size
    };
  }, [repairers]);

  // Liste des villes uniques pour les filtres
  const cities = useMemo(() => {
    return Array.from(new Set(repairers.map(r => r.city).filter(Boolean))).sort();
  }, [repairers]);

  return {
    repairers,
    stats,
    loading,
    cities,
    refetch: loadRepairersData
  };
};