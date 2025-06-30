
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BlogSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Réglages du Blog</CardTitle>
        <CardDescription>Configuration générale du système de blog</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Fonctionnalité en cours de développement...</p>
      </CardContent>
    </Card>
  );
};

export default BlogSettings;
