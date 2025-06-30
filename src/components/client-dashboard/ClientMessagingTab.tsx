
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Search, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  repairer_id: string;
  repairer_name: string;
  repairer_business: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'closed';
}

interface Message {
  id: string;
  sender_type: 'client' | 'repairer';
  message: string;
  created_at: string;
  conversation_id: string;
}

const ClientMessagingTab = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      // Simuler des conversations pour la démo
      const mockConversations: Conversation[] = [
        {
          id: '1',
          repairer_id: 'rep1',
          repairer_name: 'TechRepair Pro',
          repairer_business: 'Réparation iPhone spécialisée',
          last_message: 'Votre iPhone est prêt à être récupéré !',
          last_message_time: '2024-06-30T10:30:00Z',
          unread_count: 1,
          status: 'active'
        },
        {
          id: '2',
          repairer_id: 'rep2',
          repairer_name: 'Mobile Expert',
          repairer_business: 'Diagnostic et réparation tous mobiles',
          last_message: 'Le diagnostic de votre Samsung est terminé',
          last_message_time: '2024-06-29T16:45:00Z',
          unread_count: 0,
          status: 'active'
        },
        {
          id: '3',
          repairer_id: 'rep3',
          repairer_name: 'Quick Fix',
          repairer_business: 'Réparation express',
          last_message: 'Merci pour votre confiance !',
          last_message_time: '2024-06-28T14:20:00Z',
          unread_count: 0,
          status: 'closed'
        }
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Simuler des messages pour la démo
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_type: 'client',
          message: 'Bonjour, j\'aimerais avoir un devis pour réparer l\'écran de mon iPhone 13',
          created_at: '2024-06-30T09:00:00Z',
          conversation_id: conversationId
        },
        {
          id: '2',
          sender_type: 'repairer', 
          message: 'Bonjour ! Je peux vous faire un devis de 89€ pour la réparation de l\'écran. La réparation prend environ 1h.',
          created_at: '2024-06-30T09:15:00Z',
          conversation_id: conversationId
        },
        {
          id: '3',
          sender_type: 'client',
          message: 'Parfait ! Pouvez-vous me confirmer la disponibilité pour demain ?',
          created_at: '2024-06-30T09:30:00Z',
          conversation_id: conversationId
        },
        {
          id: '4',
          sender_type: 'repairer',
          message: 'Votre iPhone est prêt à être récupéré !',
          created_at: '2024-06-30T10:30:00Z',
          conversation_id: conversationId
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      sender_type: 'client',
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      conversation_id: selectedConversation.id
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    toast.success('Message envoyé');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.repairer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.repairer_business.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex gap-4">
      {/* Liste des conversations */}
      <div className="w-1/3 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Mes conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un réparateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversation.repairer_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.repairer_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_time)}
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {conversation.repairer_business}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone de chat */}
      <div className="flex-1">
        {selectedConversation ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedConversation.repairer_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConversation.repairer_name}</CardTitle>
                  <p className="text-sm text-gray-600">{selectedConversation.repairer_business}</p>
                </div>
                <div className="ml-auto">
                  <Badge 
                    variant={selectedConversation.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {selectedConversation.status === 'active' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {selectedConversation.status === 'active' ? 'Actif' : 'Fermé'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sender_type === 'client'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_type === 'client' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-600">
                Choisissez une conversation pour commencer à échanger avec un réparateur
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientMessagingTab;
