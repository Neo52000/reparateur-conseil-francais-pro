import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeRange = '24h' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate time range
    const now = new Date();
    let startTime: Date;
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Fetch analytics data
    const { data: analytics } = await supabase
      .from('ai_analytics')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false });

    if (!analytics) {
      throw new Error('Failed to fetch analytics');
    }

    // Calculate metrics by provider
    const providerStats = analytics.reduce((acc: any, record: any) => {
      if (!acc[record.provider]) {
        acc[record.provider] = {
          total_calls: 0,
          success_count: 0,
          error_count: 0,
          total_latency: 0,
          models_used: new Set()
        };
      }
      
      acc[record.provider].total_calls++;
      acc[record.provider].models_used.add(record.model);
      
      if (record.success) {
        acc[record.provider].success_count++;
      } else {
        acc[record.provider].error_count++;
      }
      
      if (record.latency_ms) {
        acc[record.provider].total_latency += record.latency_ms;
      }
      
      return acc;
    }, {});

    // Calculate metrics by function
    const functionStats = analytics.reduce((acc: any, record: any) => {
      if (!acc[record.function_name]) {
        acc[record.function_name] = {
          total_calls: 0,
          success_count: 0,
          error_count: 0,
          total_latency: 0,
          avg_latency: 0
        };
      }
      
      acc[record.function_name].total_calls++;
      
      if (record.success) {
        acc[record.function_name].success_count++;
      } else {
        acc[record.function_name].error_count++;
      }
      
      if (record.latency_ms) {
        acc[record.function_name].total_latency += record.latency_ms;
      }
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(providerStats).forEach(provider => {
      const stats = providerStats[provider];
      stats.avg_latency = stats.total_calls > 0 
        ? Math.round(stats.total_latency / stats.total_calls) 
        : 0;
      stats.success_rate = stats.total_calls > 0 
        ? Math.round((stats.success_count / stats.total_calls) * 100) 
        : 0;
      stats.models_used = Array.from(stats.models_used);
    });

    Object.keys(functionStats).forEach(fn => {
      const stats = functionStats[fn];
      stats.avg_latency = stats.total_calls > 0 
        ? Math.round(stats.total_latency / stats.total_calls) 
        : 0;
      stats.success_rate = stats.total_calls > 0 
        ? Math.round((stats.success_count / stats.total_calls) * 100) 
        : 0;
    });

    // Overall stats
    const totalCalls = analytics.length;
    const successfulCalls = analytics.filter(a => a.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const avgLatency = analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + (a.latency_ms || 0), 0) / analytics.length)
      : 0;

    return new Response(
      JSON.stringify({
        success: true,
        time_range: timeRange,
        period: {
          start: startTime.toISOString(),
          end: now.toISOString()
        },
        overall: {
          total_calls: totalCalls,
          successful_calls: successfulCalls,
          failed_calls: failedCalls,
          success_rate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0,
          avg_latency_ms: avgLatency
        },
        by_provider: providerStats,
        by_function: functionStats,
        recent_errors: analytics
          .filter(a => !a.success && a.error_message)
          .slice(0, 10)
          .map(a => ({
            function: a.function_name,
            provider: a.provider,
            error: a.error_message,
            timestamp: a.created_at
          }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-analytics-dashboard:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
