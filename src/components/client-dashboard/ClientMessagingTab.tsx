import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const ClientMessagingTab = () => {
  const [conversationsLoading] = useState(false);

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[600px] flex gap-4">
        {/* Interface de messagerie simplifiée pour la production */}
        <Card className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Messagerie
            </h3>
            <p className="text-gray-600">
              La messagerie sera disponible prochainement pour échanger avec les réparateurs
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientMessagingTab;