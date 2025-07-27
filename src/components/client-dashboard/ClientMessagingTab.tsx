
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Search, Clock, CheckCircle2, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { toast } from 'sonner';
import { ClientDemoDataService, DemoConversation, DemoMessage } from '@/services/clientDemoDataService';

interface Conversation {
  id: string;
  repairer_id: string;
  repairer_name: string;
  repairer_business: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'closed';
  source?: 'demo';
}

interface Message {
  id: string;
  sender_type: 'client' | 'repairer';
  message: string;
  created_at: string;
  conversation_id: string;
  source?: 'demo';
}

const ClientMessagingTab = () => {
  const { user } = useAuth();
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      // Charger les vraies conversations (pour l'instant simulées car pas encore implémentées en base)
      const realConversations: Conversation[] = [];
      
      // Obtenir les données démo
      const demoConversations = ClientDemoDataService.getDemoConversations();
      
      // Combiner avec les vraies données (pour l'instant vides)
      const finalConversations = realConversations;
      
      setConversations(finalConversations);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Charger les vrais messages (pour l'instant simulés car pas encore implémentés en base)
      const realMessages: Message[] = [];
      
      // Si c'est une conversation démo, charger les messages démo
      const selectedConv = conversations.find(c => c.id === conversationId);
      if (selectedConv && ClientDemoDataService.isDemoData(selectedConv)) {
        const demoMessages = ClientDemoDataService.getDemoMessages(conversationId);
        const finalMessages = realMessages;
        setMessages(finalMessages);
      } else {
        setMessages(realMessages);
      }
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

    // Si c'est une conversation démo, juste simuler l'envoi
    if (ClientDemoDataService.isDemoData(selectedConversation)) {
      const message: Message = {
        id: `demo-msg-${Date.now()}`,
        sender_type: 'client',
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        conversation_id: selectedConversation.id,
        source: 'demo'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      toast.success('Message envoyé (mode démo)');
      return;
    }

    // Logique pour les vraies conversations
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
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div>
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune conversation</p>
                    <p className="text-xs mt-2">Vos conversations avec les réparateurs apparaîtront ici</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors relative ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      {/* Badge démo */}
                      {ClientDemoDataService.isDemoData(conversation) && (
                        <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                          Demo
                        </Badge>
                      )}
                      
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
              )}
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{selectedConversation.repairer_name}</CardTitle>
                      {ClientDemoDataService.isDemoData(selectedConversation) && (
                        <Badge variant="outline" className="text-xs">
                          Démo
                        </Badge>
                      )}
                    </div>
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
                        className={`max-w-[70%] rounded-lg px-3 py-2 relative ${
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
                      placeholder={
                        ClientDemoDataService.isDemoData(selectedConversation) 
                          ? "Tapez votre message (mode démo)..." 
                          : "Tapez votre message..."
                      }
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
    </div>
  );
};

export default ClientMessagingTab;
