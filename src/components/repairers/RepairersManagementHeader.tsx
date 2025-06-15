
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RepairersManagementHeaderProps {
  onRefresh: () => void;
}

const RepairersManagementHeader: React.FC<RepairersManagementHeaderProps> = ({ onRefresh }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Gestion des Réparateurs</h1>
              <p className="text-sm text-gray-600">
                Administration des réparateurs et abonnements
              </p>
            </div>
          </div>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
    </header>
  );
};

export default RepairersManagementHeader;
