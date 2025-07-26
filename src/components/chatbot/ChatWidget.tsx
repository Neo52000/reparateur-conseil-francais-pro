import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Mic, MicOff, Minimize2, Maximize2, ThumbsUp, ThumbsDown, Power } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import BenAvatar from './BenAvatar';
import TypingIndicator from './TypingIndicator';
import { useEmotionalContext } from '@/hooks/useEmotionalContext';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  actions?: any[];
}

interface ChatWidgetProps {
  onClose?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isListening, setIsListening] = useState(false);
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState('');
  const { user } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Contexte émotionnel
  const { 
    emotionalState, 
    updateEmotionalState, 
    getThinkingMessage,
    getEmotionalResponse 
  } = useEmotionalContext();

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialiser la reconnaissance vocale si supportée
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          action: 'start_conversation',
          session_id: sessionId,
          user_id: user?.id
        }
      });

      if (error) throw error;

      setConversationId(data.conversation_id);
      const welcomeMessage = getEmotionalResponse(data.message || 'Bonjour ! Je suis Ben, votre assistant de réparation personnel. Comment puis-je vous aider aujourd\'hui ? 😊');
      setMessages([{
        id: '1',
        content: welcomeMessage,
        sender_type: 'bot',
        timestamp: new Date()
      }]);
      updateEmotionalState(welcomeMessage, 'bot', { emotion: 'joy' });
    } catch (error) {
      console.error('Erreur initialisation conversation:', error);
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender_type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Analyser l'émotion du message utilisateur
    updateEmotionalState(content, 'user');
    
    // Message de réflexion personnalisé
    setCurrentThinkingMessage(getThinkingMessage());

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-conversation', {
        body: {
          action: 'send_message',
          message: {
            conversation_id: conversationId,
            content
          }
        }
      });

      if (error) throw error;

      // Délai de réflexion plus naturel (1-3 secondes)
      const thinkingDelay = 1000 + Math.random() * 2000;
      
      setTimeout(() => {
        setIsTyping(false);
        const enhancedResponse = getEmotionalResponse(data.response, data);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: enhancedResponse,
          sender_type: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions,
          actions: data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        
        // Mettre à jour l'état émotionnel avec la réponse du bot
        updateEmotionalState(enhancedResponse, 'bot', data);
      }, thinkingDelay);
    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);
      console.error('Erreur envoi message:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  
  if (!isEnabled) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsEnabled(true)}
            className="rounded-full w-16 h-16 bg-gray-400 hover:bg-gray-500 shadow-lg relative overflow-hidden group opacity-50"
            title="Assistant IA désactivé - Cliquer pour activer"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Power className="h-6 w-6 text-white" />
            </div>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
              <BenAvatar emotion="happy" size="lg" />
            </div>
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${
      isFullscreen 
        ? 'inset-0' 
        : 'bottom-6 right-6 w-96 h-[500px]'
    }`}>
      <Card className={`h-full flex flex-col ${
        isFullscreen ? 'rounded-none' : 'rounded-lg shadow-2xl'
      }`}>
        {/* Header avec avatar émotionnel */}
        <motion.div 
          className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <BenAvatar 
              emotion={emotionalState.currentEmotion} 
              isTyping={isTyping}
              size="md"
            />
            <div>
              <motion.span 
                className="font-semibold text-sm"
                key={emotionalState.currentEmotion}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                Ben - Assistant IA
              </motion.span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                  En ligne
                </Badge>
                <motion.div
                  className="text-xs text-white/80"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {isTyping ? 'réfléchit...' : `Satisfaction ${emotionalState.userSatisfaction}%`}
                </motion.div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEnabled(false)}
              className="text-white hover:bg-white/10"
              title="Désactiver l'assistant IA"
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Messages avec animations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.sender_type === 'bot' && (
                    <BenAvatar 
                      emotion="happy" 
                      isTyping={false}
                      size="sm"
                    />
                  )}
                  <motion.div 
                    className={`rounded-lg p-3 ${
                      message.sender_type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm border'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <motion.div 
                        className="mt-3 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.5 }}
                      >
                        {message.suggestions.map((suggestion, suggestionIndex) => (
                          <motion.div
                            key={suggestionIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + suggestionIndex * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs w-full justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:scale-105 transition-transform"
                            >
                              {suggestion}
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                    
                    {/* Boutons de feedback pour les messages du bot */}
                    {message.sender_type === 'bot' && (
                      <motion.div 
                        className="flex items-center space-x-2 mt-2 opacity-0 hover:opacity-100 transition-opacity"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-green-100">
                          <ThumbsUp className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100">
                          <ThumbsDown className="h-3 w-3 text-red-600" />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                  {message.sender_type === 'user' && (
                    <motion.div 
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Indicateur de frappe amélioré */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <BenAvatar 
                    emotion="thinking" 
                    isTyping={true}
                    size="sm"
                  />
                  <TypingIndicator 
                    isVisible={isTyping} 
                    message={currentThinkingMessage}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input avec animations */}
        <motion.div 
          className="p-4 border-t bg-white rounded-b-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="flex-1"
              disabled={isLoading}
            />
            {recognitionRef.current && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  className={isListening ? 'bg-red-100 text-red-600 border-red-200' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Card>
    </div>
  );
};

export default ChatWidget;