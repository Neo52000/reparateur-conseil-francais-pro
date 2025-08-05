import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const QuotePage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Devis</CardTitle>
            <CardDescription>
              Devis ID: {id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Détails du devis en cours de développement...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotePage;