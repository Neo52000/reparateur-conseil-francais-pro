
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface Repair {
  id: string;
  device: string;
  issue: string;
  repairer: string;
  date: string;
  status: string;
  rating: number;
}

interface ClientRepairsTabProps {
  repairs: Repair[];
}

const ClientRepairsTab: React.FC<ClientRepairsTabProps> = ({ repairs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des réparations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {repairs.map((repair) => (
            <div key={repair.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{repair.device}</h3>
                <p className="text-sm text-gray-600">{repair.issue} • {repair.repairer}</p>
                <p className="text-sm text-gray-500">{repair.date}</p>
              </div>
              <div className="text-right">
                <Badge variant={repair.status === 'Terminé' ? 'default' : 'secondary'}>
                  {repair.status}
                </Badge>
                <div className="flex items-center mt-1">
                  {[...Array(repair.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientRepairsTab;
