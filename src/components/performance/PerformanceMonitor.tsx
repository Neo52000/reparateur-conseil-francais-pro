import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, Eye } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'poor';
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [vitals, setVitals] = useState<any>({});

  useEffect(() => {
    // Core Web Vitals monitoring - simplified
    console.log('Performance Monitor initialized');

    // Performance Observer for additional metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const newMetrics: PerformanceMetric[] = [];

        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            newMetrics.push({
              name: 'DOM Content Loaded',
              value: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              unit: 'ms',
              threshold: 1500,
              status: navEntry.domContentLoadedEventEnd - navEntry.fetchStart < 1500 ? 'good' : 'warning'
            });
          }
        });

        setMetrics(newMetrics);
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

      return () => observer.disconnect();
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVitalStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'warning';
    return 'poor';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Core Web Vitals */}
      {vitals.lcp && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              LCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(vitals.lcp.value)}ms</div>
            <Badge 
              className={getStatusColor(getVitalStatus(vitals.lcp.value, { good: 2500, poor: 4000 }))}
            >
              {getVitalStatus(vitals.lcp.value, { good: 2500, poor: 4000 })}
            </Badge>
          </CardContent>
        </Card>
      )}

      {vitals.fid && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              FID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(vitals.fid.value)}ms</div>
            <Badge 
              className={getStatusColor(getVitalStatus(vitals.fid.value, { good: 100, poor: 300 }))}
            >
              {getVitalStatus(vitals.fid.value, { good: 100, poor: 300 })}
            </Badge>
          </CardContent>
        </Card>
      )}

      {vitals.cls && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              CLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.cls.value.toFixed(3)}</div>
            <Badge 
              className={getStatusColor(getVitalStatus(vitals.cls.value, { good: 0.1, poor: 0.25 }))}
            >
              {getVitalStatus(vitals.cls.value, { good: 0.1, poor: 0.25 })}
            </Badge>
          </CardContent>
        </Card>
      )}

      {vitals.ttfb && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              TTFB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(vitals.ttfb.value)}ms</div>
            <Badge 
              className={getStatusColor(getVitalStatus(vitals.ttfb.value, { good: 800, poor: 1800 }))}
            >
              {getVitalStatus(vitals.ttfb.value, { good: 800, poor: 1800 })}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Additional metrics */}
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{metric.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metric.value)}{metric.unit}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
              ></div>
            </div>
            <Badge className={getStatusColor(metric.status)}>
              {metric.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PerformanceMonitor;