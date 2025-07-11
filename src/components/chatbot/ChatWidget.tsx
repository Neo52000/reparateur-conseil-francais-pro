
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Mic, MicOff, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
      setMessages([{
        id: '1',
        content: data.message,
        sender_type: 'bot',
        timestamp: new Date()
      }]);
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

      setTimeout(() => {
        setIsTyping(false);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender_type: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions,
          actions: data.actions
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1500);
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
            <img 
              src="/lovable-uploads/68f25ab9-7b95-45e4-abba-df8bbdb8b6eb.png" 
              alt="Assistant IA"
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </Button>
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
        {/* Header avec avatar */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/lovable-uploads/68f25ab9-7b95-45e4-abba-df8bbdb8b6eb.png" 
                alt="Assistant IA"
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="font-semibold text-sm">Assistant IA</span>
              <Badge variant="secondary" className="text-xs ml-2 bg-white/20 text-white border-white/30">
                En ligne
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {message.sender_type === 'bot' && (
                  <img 
                    src="/lovable-uploads/68f25ab9-7b95-45e4-abba-df8bbdb8b6eb.png" 
                    alt="Assistant"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                )}
                <div className={`rounded-lg p-3 ${
                  message.sender_type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm border'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs w-full justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.sender_type === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <img 
                  src="/lovable-uploads/68f25ab9-7b95-45e4-abba-df8bbdb8b6eb.png" 
                  alt="Assistant"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-lg">
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
              <Button
                variant="outline"
                size="sm"
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                className={isListening ? 'bg-red-100 text-red-600 border-red-200' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWidget;
