
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BlogAnalytics: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics du Blog</CardTitle>
        <CardDescription>Statistiques et métriques de performance</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Fonctionnalité en cours de développement...</p>
      </CardContent>
    </Card>
  );
};

export default BlogAnalytics;
