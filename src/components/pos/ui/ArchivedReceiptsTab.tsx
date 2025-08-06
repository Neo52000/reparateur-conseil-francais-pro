import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, FileText, CheckCircle } from 'lucide-react';
import ReceiptArchiveManager from '../ReceiptArchiveManager';

interface ArchivedReceiptsTabProps {
  repairerId: string;
}

const ArchivedReceiptsTab: React.FC<ArchivedReceiptsTabProps> = ({ repairerId }) => {
  return (
    <div className="space-y-6">
      {/* En-tête avec informations NF-525 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Archivage conforme NF-525
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Archive className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Archivage automatique</p>
                <p className="text-sm text-green-600">Tickets sauvegardés en temps réel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Conservation 10 ans</p>
                <p className="text-sm text-green-600">Conforme réglementation française</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Intégrité garantie</p>
                <p className="text-sm text-green-600">Hash cryptographique SHA-256</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestionnaire d'archives */}
      <ReceiptArchiveManager repairerId={repairerId} />
    </div>
  );
};

export default ArchivedReceiptsTab;