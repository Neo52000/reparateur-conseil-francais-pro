import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const mockData = [
  { name: 'Lun', revenus: 240, commandes: 4 },
  { name: 'Mar', revenus: 380, commandes: 6 },
  { name: 'Mer', revenus: 290, commandes: 5 },
  { name: 'Jeu', revenus: 450, commandes: 7 },
  { name: 'Ven', revenus: 520, commandes: 8 },
  { name: 'Sam', revenus: 610, commandes: 9 },
  { name: 'Dim', revenus: 340, commandes: 5 },
];

export const RevenueChart: React.FC = () => {
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
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockData}>
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
      </CardContent>
    </Card>
  );
};
