import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Hook pour récupérer les vraies données de revenus
const useRevenueData = (repairerId: string | undefined) => {
  return useQuery({
    queryKey: ['revenue-chart', repairerId],
    queryFn: async () => {
      if (!repairerId) return [];
      
      // Récupérer les 7 derniers jours de données
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select('created_at, estimated_price, status')
        .eq('repairer_id', repairerId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Grouper par jour
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const chartData: { name: string; revenus: number; commandes: number }[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = data?.filter(item => 
          item.created_at?.startsWith(dateStr)
        ) || [];
        
        chartData.push({
          name: dayName,
          revenus: dayData.reduce((sum, item) => sum + (item.estimated_price || 0), 0),
          commandes: dayData.length
        });
      }
      
      return chartData;
    },
    enabled: !!repairerId
  });
};

export const RevenueChart: React.FC = () => {
  const { user } = useAuth();
  const { data: chartData, isLoading } = useRevenueData(user?.id);
  
  // Si pas de données, afficher un message
  const hasData = chartData && chartData.some(d => d.revenus > 0 || d.commandes > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Évolution hebdomadaire
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Revenus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-status-info" />
              <span className="text-muted-foreground">Commandes</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hasData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Aucune donnée pour cette période</p>
              <p className="text-sm">Les revenus apparaîtront ici</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenus" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorRevenue)" 
              />
              <Line 
                type="monotone" 
                dataKey="commandes" 
                stroke="hsl(var(--status-info))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--status-info))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
