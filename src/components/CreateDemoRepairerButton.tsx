
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreateDemoRepairerButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDemoRepairer = async () => {
    setLoading(true);
    try {
      console.log('🚀 Creating demo repairer...');
      
      const response = await fetch(
        'https://nbugpbakfkyvvjzgfjmw.functions.supabase.co/create-demo-repairer',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('📥 Response:', data);

      if (!response.ok) {
        throw new Error(data.error || `Erreur HTTP ${response.status}`);
      }

      toast({
        title: "Réparateur de démo créé !",
        description: "Email: demo@demo.fr | Mot de passe: demo@demo | Abonnement: Enterprise",
        duration: 8000,
      });

    } catch (error) {
      console.error('❌ Error creating demo repairer:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le réparateur de démo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          Créer un réparateur de démo
        </CardTitle>
        <CardDescription>
          Crée un compte réparateur avec abonnement Enterprise et toutes les fonctionnalités activées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span><strong>Email:</strong> demo@demo.fr</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span><strong>Mot de passe:</strong> demo@demo</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span><strong>Abonnement:</strong> Enterprise</span>
          </div>
        </div>
        
        <Button 
          onClick={createDemoRepairer} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Création en cours...' : 'Créer le réparateur de démo'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateDemoRepairerButton;
