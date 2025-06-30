
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BlogTemplatesManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates de génération IA</CardTitle>
        <CardDescription>Gérez vos templates pour la génération automatique d'articles</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Fonctionnalité en cours de développement...</p>
      </CardContent>
    </Card>
  );
};

export default BlogTemplatesManager;
