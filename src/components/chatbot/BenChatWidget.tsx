import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  MapPin, 
  User, 
  Heart,
  ThumbsUp,
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BenAvatar from './BenAvatar';
import SystemStatus from './SystemStatus';
import ChatModeIndicator from './ChatModeIndicator';
import { useSystemDiagnostics } from '@/hooks/useSystemDiagnostics';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ben';
  timestamp: Date;
  suggestions?: string[];
  emotion?: 'happy' | 'thinking' | 'empathetic' | 'excited';
}

interface ConversationContext {
  userLocation?: { lat: number; lng: number; city?: string };
  previousMessages: Message[];
  userIntent?: 'devis' | 'search_repairer' | 'availability' | 'general';
  deviceBrand?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

const BenChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    previousMessages: [],
    urgencyLevel: 'medium'
  });
  const [config, setConfig] = useState<any>({});
  const [configLoading, setConfigLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { shouldUseFallback } = useSystemDiagnostics();

  // Charger la configuration du chatbot
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await supabase
          .from('chatbot_configuration')
          .select('config_key, config_value');
        
        if (data) {
          const configMap = data.reduce((acc, item) => {
            acc[item.config_key] = item.config_value;
            return acc;
          }, {} as Record<string, any>);
          
          // Valeurs par défaut pour éviter les problèmes
          const finalConfig = {
            chatbot_enabled: true,
            maintenance_mode: false,
            chatbot_name: 'Ben',
            maintenance_message: 'Le chatbot est temporairement indisponible pour maintenance.',
            ...configMap
          };
          
          console.log('🤖 Config chargée:', finalConfig);
          console.log('🔧 maintenance_mode type:', typeof finalConfig.maintenance_mode, 'value:', finalConfig.maintenance_mode);
          
          setConfig(finalConfig);
        }
      } catch (error) {
        console.error('Erreur chargement config chatbot:', error);
        // Configuration par défaut en cas d'erreur
        setConfig({
          chatbot_enabled: true,
          maintenance_mode: false,
          chatbot_name: 'Ben',
          maintenance_message: 'Le chatbot est temporairement indisponible pour maintenance.'
        });
      }
      setConfigLoading(false);
    };

    loadConfig();
  }, []);

  // Écouter l'événement open-chatbot
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      if (messages.length === 0) {
        initializeConversation();
      }
      // Focus sur l'input après ouverture
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, [messages.length]);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialiser la conversation avec Ben
  const initializeConversation = () => {
    const chatbotName = config.chatbot_name || 'Ben';
    
    const welcomeMessage: Message = {
      id: 'welcome-1',
      content: `Salut ! Moi c'est ${chatbotName} 👋 Je suis là pour vous aider avec tout ce qui concerne la réparation de votre smartphone ! Que puis-je faire pour vous aujourd'hui ?`,
      sender: 'ben',
      timestamp: new Date(),
      suggestions: [
        "Demander un devis",
        "Trouver un réparateur",
        "Vérifier les disponibilités",
        "Questions générales"
      ],
      emotion: 'happy'
    };
    
    setMessages([welcomeMessage]);
  };

  // Détecter l'intention utilisateur
  const detectUserIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('devis') || lowerMessage.includes('prix') || lowerMessage.includes('coût')) {
      return 'devis';
    }
    if (lowerMessage.includes('réparateur') || lowerMessage.includes('proche') || lowerMessage.includes('près')) {
      return 'search_repairer';
    }
    if (lowerMessage.includes('disponib') || lowerMessage.includes('horaire') || lowerMessage.includes('ouvert')) {
      return 'availability';
    }
    return 'general';
  };

  // Gérer l'envoi de messages avec ai-router
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Utiliser le système ai-router
      const { data } = await supabase.functions.invoke('ai-router', {
        body: {
          action: 'send_message',
          text: messageText,
          language_hint: 'fr',
          session_id: `ben_${Date.now()}`,
          user_id: null
        }
      });

      setIsTyping(false);
      
      const benResponse: Message = {
        id: `ben-${Date.now()}`,
        content: data.response || "Désolé, je n'ai pas pu traiter votre demande.",
        sender: 'ben',
        timestamp: new Date(),
        suggestions: data.suggestions,
        emotion: 'happy'
      };

      setMessages(prev => [...prev, benResponse]);
      setIsLoading(false);

      // Gérer les actions du chatbot
      if (data.actions) {
        data.actions.forEach((action: any) => {
          if (action.type === 'open_booking') {
            toast({
              title: "Prise de rendez-vous",
              description: "Fonctionnalité en cours de développement",
            });
          } else if (action.type === 'open_faq') {
            window.open('/faq', '_blank');
          }
        });
      }

    } catch (error) {
      console.error('Erreur Ben Chatbot:', error);
      setIsTyping(false);
      
      // Message d'erreur contextuel selon le mode
      const getErrorMessage = () => {
        if (shouldUseFallback) {
          return "Je fonctionne actuellement en mode local intelligent 💡 Je peux toujours vous aider avec les questions courantes sur la réparation de smartphones !";
        } else {
          return "J'ai basculé vers mon mode local intelligent 🔄 Je reste disponible pour vous guider dans vos réparations !";
        }
      };
      
      const errorMessage: Message = {
        id: `ben-error-${Date.now()}`,
        content: getErrorMessage(),
        sender: 'ben',
        timestamp: new Date(),
        suggestions: ["Redemander un devis", "Chercher un réparateur", "Questions sur les pannes"],
        emotion: 'empathetic'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Gérer les suggestions
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // Demander la géolocalisation
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setConversationContext(prev => ({
            ...prev,
            userLocation: location
          }));
          
          toast({
            title: "Localisation activée",
            description: `${config.chatbot_name || 'Ben'} peut maintenant vous proposer des réparateurs proches !`,
          });
        },
        (error) => {
          toast({
            title: "Localisation indisponible",
            description: "Vous pouvez indiquer votre ville manuellement",
            variant: "destructive"
          });
        }
      );
    }
  };

  // Animation Ben typing
  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 text-muted-foreground text-sm"
    >
      <BenAvatar isTyping={true} emotion="thinking" size="sm" />
      <div className="flex gap-1">
        <span>{config.chatbot_name || 'Ben'} réfléchit</span>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex gap-1"
        >
          <div className="w-1 h-1 bg-primary rounded-full" />
          <div className="w-1 h-1 bg-primary rounded-full" />
          <div className="w-1 h-1 bg-primary rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );

  // Afficher un spinner pendant le chargement
  if (configLoading) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center bg-primary rounded-full">
        <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
      </div>
    );
  }

  // Ne pas afficher le widget si le chatbot est désactivé
  if (String(config.chatbot_enabled) === 'false') {
    return null;
  }

  // Interface minimisée
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]"
      >
        <Button
          onClick={() => {
            setIsOpen(true);
            if (messages.length === 0) {
              initializeConversation();
            }
          }}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        
        {/* Notification badge */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full flex items-center justify-center"
        >
          <Heart className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] max-w-[calc(100vw-2rem)] ${
        isMinimized ? 'w-72 sm:w-80 h-16' : 'w-72 sm:w-80 h-[500px] max-h-[calc(100vh-6rem)]'
      }`}
    >
      <Card className="w-full h-full shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BenAvatar emotion="happy" size="md" />
              <div>
                <CardTitle className="text-lg">{config.chatbot_name || 'Ben'}</CardTitle>
                <ChatModeIndicator />
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col h-full"
            >
              <CardContent className="flex-1 overflow-hidden p-0">
                {/* System Status */}
                <div className="p-3 border-b">
                  <SystemStatus />
                </div>
                
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {/* Mode maintenance */}
                  {String(config.maintenance_mode) === 'true' ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-4">
                        <BenAvatar emotion="concerned" size="lg" />
                        <p className="text-sm text-muted-foreground mt-4">
                          {config.maintenance_message || 'Le chatbot est temporairement indisponible pour maintenance.'}
                        </p>
                        <div className="mt-4 space-y-2">
                          <Button variant="outline" size="sm" onClick={() => window.open('/faq', '_blank')}>
                            Consulter la FAQ
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open('/contact', '_blank')}>
                            Prendre rendez-vous
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                              <div className="flex items-start gap-2">
                                {message.sender === 'ben' && (
                                  <BenAvatar emotion={message.emotion || 'happy'} size="sm" />
                                )}
                                <div className={`p-3 rounded-lg ${
                                  message.sender === 'user' 
                                    ? 'bg-primary text-primary-foreground ml-auto' 
                                    : 'bg-muted text-foreground'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              </div>
                              
                              {/* Suggestions */}
                              {message.suggestions && (
                                <div className="mt-2 space-y-1 ml-10">
                                  {message.suggestions.map((suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      className="text-xs mr-1 mb-1"
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {/* Typing indicator */}
                      <AnimatePresence>
                        {isTyping && <TypingIndicator />}
                      </AnimatePresence>
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Quick Actions - seulement si pas en maintenance */}
                {String(config.maintenance_mode) !== 'true' && (
                  <div className="p-3 border-t bg-muted/50">
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestLocation}
                        className="text-xs"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Ma position
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        Réparateurs près de vous
                      </Badge>
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Tapez votre message à ${config.chatbot_name || 'Ben'}...`}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        size="sm"
                        className="px-3"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default BenChatWidget;