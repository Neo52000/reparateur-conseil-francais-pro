import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle, Archive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
  userType: 'client' | 'repairer';
}

interface Conversation {
  id: string;
  client_id: string;
  repairer_id: string;
  quote_id?: string;
  appointment_id?: string;
  last_message_at?: string;
  unread_count_client: number;
  unread_count_repairer: number;
  is_archived: boolean;
  created_at: string;
  client_name?: string;
  repairer_name?: string;
  last_message?: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  onSelectConversation,
  selectedConversationId,
  userType
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
      subscribeToConversations();
    }
  }, [user, showArchived]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchQuery]);

  const loadConversations = async () => {
    try {
      const query = supabase
        .from('conversations' as any)
        .select('*')
        .eq('is_archived', showArchived)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (userType === 'client') {
        query.eq('client_id', user?.id);
      } else {
        query.eq('repairer_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const conversationsWithNames = data.map((conv: any) => ({
        ...conv,
        client_name: conv.client ? `${conv.client.first_name} ${conv.client.last_name}` : 'Client',
        repairer_name: conv.repairer ? `${conv.repairer.first_name} ${conv.repairer.last_name}` : 'Réparateur'
      }));

      setConversations(conversationsWithNames);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: userType === 'client' 
            ? `client_id=eq.${user?.id}` 
            : `repairer_id=eq.${user?.id}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => {
      const searchName = userType === 'client' ? conv.repairer_name : conv.client_name;
      return searchName?.toLowerCase().includes(query);
    });

    setFilteredConversations(filtered);
  };

  const getUnreadCount = (conv: Conversation) => {
    return userType === 'client' ? conv.unread_count_client : conv.unread_count_repairer;
  };

  const getOtherPartyName = (conv: Conversation) => {
    return userType === 'client' ? conv.repairer_name : conv.client_name;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header avec recherche */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h2>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conv) => {
              const unreadCount = getUnreadCount(conv);
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`
                    w-full p-4 text-left hover:bg-accent transition-colors
                    ${isSelected ? 'bg-accent' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {getOtherPartyName(conv)}
                        </p>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      {conv.last_message_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(conv.last_message_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      )}

                      {conv.quote_id && (
                        <p className="text-xs text-blue-600 mt-1">
                          📋 Devis associé
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <div className="w-1 h-10 bg-primary rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ConversationsList;
