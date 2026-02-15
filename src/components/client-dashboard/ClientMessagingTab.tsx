import React, { useState } from 'react';
import ConversationsList from '@/components/messaging/ConversationsList';
import IntegratedMessaging from '@/components/messaging/IntegratedMessaging';
import { MessageCircle } from 'lucide-react';

const ClientMessagingTab = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="h-[600px] flex gap-4">
        {/* Liste des conversations */}
        <div className="w-1/3 min-w-[280px]">
          <ConversationsList
            onSelectConversation={(id) => setSelectedConversationId(id)}
            selectedConversationId={selectedConversationId || undefined}
            userType="client"
          />
        </div>

        {/* Zone de messages */}
        <div className="flex-1">
          {selectedConversationId ? (
            <IntegratedMessaging
              conversationId={selectedConversationId}
              userType="client"
            />
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg bg-muted/30">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Messagerie</h3>
                <p className="text-muted-foreground">
                  Sélectionnez une conversation pour commencer
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientMessagingTab;
