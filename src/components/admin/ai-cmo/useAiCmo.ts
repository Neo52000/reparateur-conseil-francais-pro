import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AiCmoProfile,
  AiCmoCompetitor,
  AiCmoQuestion,
  AiCmoPromptRun,
  AiCmoDashboardStats,
  AiCmoRecommendation,
  AiCmoLlmCost,
  ProfileFormData,
  CompetitorFormData,
  QuestionFormData,
  DEFAULT_SITE_ID,
} from './types';

export function useAiCmo() {
  const { toast } = useToast();
  const siteId = DEFAULT_SITE_ID;

  // --- State ---
  const [profile, setProfile] = useState<AiCmoProfile | null>(null);
  const [competitors, setCompetitors] = useState<AiCmoCompetitor[]>([]);
  const [questions, setQuestions] = useState<AiCmoQuestion[]>([]);
  const [promptRuns, setPromptRuns] = useState<AiCmoPromptRun[]>([]);
  const [dashboardStats, setDashboardStats] = useState<AiCmoDashboardStats | null>(null);
  const [recommendations, setRecommendations] = useState<AiCmoRecommendation[]>([]);
  const [llmCosts, setLlmCosts] = useState<AiCmoLlmCost[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination for prompt runs
  const [runsPage, setRunsPage] = useState(0);
  const [runsTotal, setRunsTotal] = useState(0);
  const RUNS_PER_PAGE = 20;

  // ============================================================
  // EAGER LOADERS (profile, competitors, questions)
  // ============================================================

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('ai_cmo_profiles')
        .select('*')
        .eq('site_id', siteId)
        .maybeSingle();
      if (error) throw error;
      setProfile(data as AiCmoProfile | null);
    } catch (err: any) {
      console.error('Error fetching AI-CMO profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [siteId]);

  const fetchCompetitors = useCallback(async () => {
    setLoadingCompetitors(true);
    try {
      const { data, error } = await supabase
        .from('ai_cmo_competitors')
        .select('*')
        .eq('site_id', siteId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setCompetitors((data || []) as AiCmoCompetitor[]);
    } catch (err: any) {
      console.error('Error fetching AI-CMO competitors:', err);
    } finally {
      setLoadingCompetitors(false);
    }
  }, [siteId]);

  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from('ai_cmo_questions')
        .select('*')
        .eq('site_id', siteId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setQuestions((data || []) as AiCmoQuestion[]);
    } catch (err: any) {
      console.error('Error fetching AI-CMO questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  }, [siteId]);

  // Load eager data on mount
  useEffect(() => {
    fetchProfile();
    fetchCompetitors();
    fetchQuestions();
  }, [fetchProfile, fetchCompetitors, fetchQuestions]);

  // ============================================================
  // LAZY LOADERS (runs, stats, recommendations, costs)
  // ============================================================

  const fetchPromptRuns = useCallback(async (page = 0) => {
    setLoadingRuns(true);
    try {
      const from = page * RUNS_PER_PAGE;
      const to = from + RUNS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('ai_cmo_prompt_runs')
        .select('*, ai_cmo_questions(prompt)', { count: 'exact' })
        .eq('site_id', siteId)
        .order('run_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((row: any) => ({
        ...row,
        question_prompt: row.ai_cmo_questions?.prompt || null,
      })) as AiCmoPromptRun[];

      setPromptRuns(mapped);
      setRunsTotal(count || 0);
      setRunsPage(page);
    } catch (err: any) {
      console.error('Error fetching AI-CMO prompt runs:', err);
    } finally {
      setLoadingRuns(false);
    }
  }, [siteId]);

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data, error } = await supabase
        .from('ai_cmo_dashboard_stats')
        .select('*')
        .eq('site_id', siteId)
        .maybeSingle();
      if (error) throw error;
      setDashboardStats(data as AiCmoDashboardStats | null);

      // Also fetch LLM costs
      setLoadingCosts(true);
      const { data: costsData, error: costsError } = await supabase
        .from('ai_cmo_llm_costs')
        .select('*')
        .eq('site_id', siteId)
        .order('date', { ascending: false })
        .limit(30);
      if (costsError) throw costsError;
      setLlmCosts((costsData || []) as AiCmoLlmCost[]);
    } catch (err: any) {
      console.error('Error fetching AI-CMO dashboard stats:', err);
    } finally {
      setLoadingStats(false);
      setLoadingCosts(false);
    }
  }, [siteId]);

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      const { data, error } = await supabase
        .from('ai_cmo_recommendations')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecommendations((data || []) as AiCmoRecommendation[]);
    } catch (err: any) {
      console.error('Error fetching AI-CMO recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [siteId]);

  // ============================================================
  // PROFILE CRUD (upsert single row)
  // ============================================================

  const saveProfile = async (formData: ProfileFormData) => {
    setSaving(true);
    try {
      const aliases = formData.name_aliases
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        site_id: siteId,
        description: formData.description || null,
        website: formData.website || null,
        name_aliases: aliases,
        llm_understanding: formData.llm_understanding || null,
        products: formData.products || null,
      };

      let result;
      if (profile) {
        result = await supabase
          .from('ai_cmo_profiles')
          .update(payload)
          .eq('id', profile.id);
      } else {
        result = await supabase
          .from('ai_cmo_profiles')
          .insert([payload]);
      }

      if (result.error) throw result.error;
      await fetchProfile();
      toast({ title: 'Succès', description: 'Profil AI-CMO sauvegardé' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // COMPETITORS CRUD (delete-all + re-insert)
  // ============================================================

  const saveCompetitors = async (items: CompetitorFormData[]) => {
    setSaving(true);
    try {
      // Delete all existing
      const { error: delError } = await supabase
        .from('ai_cmo_competitors')
        .delete()
        .eq('site_id', siteId);
      if (delError) throw delError;

      // Insert new
      if (items.length > 0) {
        const rows = items.map((item, idx) => ({
          site_id: siteId,
          name: item.name,
          website: item.website || null,
          weight: item.weight,
          sort_order: idx,
        }));
        const { error: insError } = await supabase
          .from('ai_cmo_competitors')
          .insert(rows);
        if (insError) throw insError;
      }

      await fetchCompetitors();
      toast({ title: 'Succès', description: 'Concurrents sauvegardés' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // QUESTIONS CRUD (upsert pattern - preserves FK from prompt_runs)
  // ============================================================

  const saveQuestions = async (items: QuestionFormData[], deletedIds: string[]) => {
    setSaving(true);
    try {
      // Delete removed questions
      if (deletedIds.length > 0) {
        const { error: delError } = await supabase
          .from('ai_cmo_questions')
          .delete()
          .in('id', deletedIds);
        if (delError) throw delError;
      }

      // Upsert each question
      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const payload = {
          site_id: siteId,
          prompt: item.prompt,
          prompt_type: item.prompt_type,
          target_country: item.target_country || null,
          refresh_interval_seconds: item.refresh_interval_seconds,
          is_active: item.is_active,
          sort_order: idx,
        };

        if (item.id) {
          const { error } = await supabase
            .from('ai_cmo_questions')
            .update(payload)
            .eq('id', item.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('ai_cmo_questions')
            .insert([payload]);
          if (error) throw error;
        }
      }

      await fetchQuestions();
      toast({ title: 'Succès', description: 'Questions sauvegardées' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return {
    siteId,
    // Data
    profile,
    competitors,
    questions,
    promptRuns,
    dashboardStats,
    recommendations,
    llmCosts,
    // Loading states
    loadingProfile,
    loadingCompetitors,
    loadingQuestions,
    loadingRuns,
    loadingStats,
    loadingRecommendations,
    loadingCosts,
    saving,
    // Pagination
    runsPage,
    runsTotal,
    runsPerPage: RUNS_PER_PAGE,
    // Actions
    fetchProfile,
    fetchCompetitors,
    fetchQuestions,
    fetchPromptRuns,
    fetchDashboardStats,
    fetchRecommendations,
    saveProfile,
    saveCompetitors,
    saveQuestions,
  };
}
