import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Rechercher un réparateur
        </h1>
        
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Trouvez le réparateur parfait</CardTitle>
            <CardDescription>
              Entrez votre localisation et le type de réparation souhaité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Que voulez-vous réparer ?" />
              <Input placeholder="Où (ville, code postal)" />
            </div>
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground">
            Fonctionnalité de recherche en cours de développement...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;