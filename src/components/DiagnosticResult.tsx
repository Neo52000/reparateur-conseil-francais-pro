
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DiagnosticResultProps {
  diagnosis: string;
  onReset: () => void;
}

const DiagnosticResult = ({ diagnosis, onReset }: DiagnosticResultProps) => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-3 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Diagnostic</h3>
            <p className="text-gray-700 mb-4">{diagnosis}</p>
            <div className="flex space-x-3">
              <Button size="sm">
                Voir le guide de réparation
              </Button>
              <Button size="sm" variant="outline">
                Calculer le prix
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={onReset} variant="outline" className="w-full">
        Nouveau diagnostic
      </Button>
    </div>
  );
};

export default DiagnosticResult;
