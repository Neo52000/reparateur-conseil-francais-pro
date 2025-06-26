
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCatalog } from '@/hooks/useCatalog';
import { Wrench, Clock, Shield } from 'lucide-react';

const RepairTypesManagement = () => {
  const { repairCategories, repairTypes, loading } = useCatalog();

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Base de données des réparations
        </h3>
        <p className="text-blue-700">
          Cette section affiche les types de réparations disponibles. 
          Les réparateurs pourront les activer/désactiver dans leur profil.
        </p>
      </div>

      <div className="grid gap-6">
        {repairCategories.map((category) => {
          const categoryRepairs = repairTypes.filter(
            repair => repair.category_id === category.id
          );

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {category.name}
                  <Badge variant="secondary">{categoryRepairs.length} types</Badge>
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {categoryRepairs.map((repair) => (
                    <div key={repair.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{repair.name}</h4>
                        <Badge 
                          variant={
                            repair.difficulty_level === 'Facile' ? 'default' :
                            repair.difficulty_level === 'Moyen' ? 'secondary' :
                            repair.difficulty_level === 'Difficile' ? 'destructive' : 'outline'
                          }
                        >
                          {repair.difficulty_level}
                        </Badge>
                      </div>
                      
                      {repair.description && (
                        <p className="text-sm text-gray-600 mb-2">{repair.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {repair.estimated_time_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {repair.estimated_time_minutes} min
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {repair.warranty_days} j garantie
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RepairTypesManagement;
