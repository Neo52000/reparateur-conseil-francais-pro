
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle,
  Download, 
  Trash2
} from 'lucide-react';

interface ScrapingBulkActionsProps {
  selectedItems: string[];
  onVerifySelected: () => Promise<void>;
  onDeleteSelected: () => Promise<void>;
  onChangeStatusSelected: (status: "verified" | "unverified") => Promise<void>;
}

const ScrapingBulkActions = ({
  selectedItems,
  onVerifySelected,
  onDeleteSelected,
  onChangeStatusSelected
}: ScrapingBulkActionsProps) => {
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);

  if (selectedItems.length === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedItems.length} éléments sélectionnés
      </span>
      <div className="flex space-x-2">
        <Button size="sm" onClick={onVerifySelected}>
          <CheckCircle className="h-4 w-4 mr-1" />
          Vérifier
        </Button>
        <div className="relative inline-block">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatusChangeOpen((v) => !v)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Changer le statut
          </Button>
          {statusChangeOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded shadow z-50">
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-green-700"
                type="button"
                onClick={() => {
                  onChangeStatusSelected("verified");
                  setStatusChangeOpen(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer comme vérifié
              </button>
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-gray-700"
                type="button"
                onClick={() => {
                  onChangeStatusSelected("unverified");
                  setStatusChangeOpen(false);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Remettre en attente
              </button>
              <button
                className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-gray-500"
                type="button"
                onClick={() => setStatusChangeOpen(false)}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          Exporter
        </Button>
        <Button size="sm" variant="destructive" onClick={onDeleteSelected}>
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default ScrapingBulkActions;
