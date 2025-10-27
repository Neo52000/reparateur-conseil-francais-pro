import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AIAnalytics {
  overall: {
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    success_rate: number;
    avg_latency_ms: number;
  };
  by_provider: Record<string, {
    total_calls: number;
    success_count: number;
    error_count: number;
    avg_latency: number;
    success_rate: number;
    models_used: string[];
  }>;
  by_function: Record<string, {
    total_calls: number;
    success_count: number;
    error_count: number;
    avg_latency: number;
    success_rate: number;
  }>;
  recent_errors: Array<{
    function: string;
    provider: string;
    error: string;
    timestamp: string;
  }>;
}

export const useAIAnalytics = (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ai-analytics-dashboard', {
        body: { timeRange }
      });

      if (invokeError) throw invokeError;
      if (!data.success) throw new Error(data.error);

      setAnalytics(data);
    } catch (err: any) {
      console.error('Analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics
  };
};
