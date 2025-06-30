
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  X, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Star
} from 'lucide-react';
import { useChatbot, ChatbotMessage } from '@/hooks/useChatbot';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatbotWidgetProps {
  className?: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [satisfactionScore, setSatisfactionScore] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    currentConversation,
    isLoading,
    isTyping,
    sendMessage,
    sendFeedback,
    endConversation,
    startNewConversation
  } = useChatbot();

  const { toast } = useToast();

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentConversation?.messages]);

  // Gestion de l'envoi de message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    
    await sendMessage(message);
  };

  // Gestion des touches
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Composant pour un message
  const MessageBubble: React.FC<{ message: ChatbotMessage }> = ({ message }) => {
    const isBot = message.sender_type === 'bot';
    const isUser = message.sender_type === 'user';

    return (
      <div className={cn(
        "flex mb-4",
        isUser ? "justify-end" : "justify-start"
      )}>
        {isBot && (
          <Avatar className="h-8 w-8 mr-2 mt-1">
            <AvatarImage src="/lovable-uploads/0cc1089d-ae78-4aa2-a433-2a364ba71f6d.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "max-w-[80%] p-3 rounded-lg",
          isBot ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900",
          isUser && "bg-blue-600 text-white"
        )}>
          <div className="text-sm">{message.content}</div>
          
          {message.message_type === 'diagnostic' && message.metadata && (
            <div className="mt-2 space-y-1">
              {message.metadata.suggestions?.map((suggestion: string, idx: number) => (
                <Badge key={idx} variant="outline" className="mr-1 text-xs">
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
          
          {message.message_type === 'quote' && message.metadata?.estimatedPrice && (
            <div className="mt-2 p-2 bg-white bg-opacity-20 rounded">
              <div className="text-xs font-semibold">
                Prix estimé: {message.metadata.estimatedPrice}€
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs opacity-60">
              {new Date(message.created_at).toLocaleTimeString()}
            </div>
            
            {isBot && (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => sendFeedback(message.id, 'helpful')}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => sendFeedback(message.id, 'not_helpful')}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal de satisfaction
  const SatisfactionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-center">Comment s'est passée votre conversation ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((score) => (
              <Button
                key={score}
                variant={satisfactionScore === score ? "default" : "outline"}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => setSatisfactionScore(score)}
              >
                <Star className={cn(
                  "h-4 w-4",
                  satisfactionScore >= score ? "fill-current" : ""
                )} />
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowSatisfactionModal(false);
                setSatisfactionScore(0);
              }}
            >
              Passer
            </Button>
            <Button 
              className="flex-1"
              onClick={async () => {
                await endConversation(satisfactionScore || undefined);
                setShowSatisfactionModal(false);
                setSatisfactionScore(0);
                setIsOpen(false);
              }}
            >
              Valider
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Message de bienvenue par défaut
  const welcomeMessage: ChatbotMessage = {
    id: 'welcome',
    content: "Bonjour ! Je suis l'assistant TopRéparateurs. Comment puis-je vous aider aujourd'hui ?",
    sender_type: 'bot',
    message_type: 'text',
    created_at: new Date().toISOString()
  };

  const messages = currentConversation?.messages || [welcomeMessage];

  if (!isOpen) {
    return (
      <Button
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-blue-600 hover:bg-blue-700",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <>
      <Card className={cn(
        "fixed bottom-6 right-6 z-40 shadow-2xl transition-all duration-300",
        isMinimized ? "w-80 h-16" : "w-96 h-[500px]",
        className
      )}>
        <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/lovable-uploads/0cc1089d-ae78-4aa2-a433-2a364ba71f6d.png" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm">Assistant TopRéparateurs</CardTitle>
              {isTyping && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  En train d'écrire...
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              >
                {isVoiceEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                onClick={() => {
                  if (currentConversation?.messages.length > 1) {
                    setShowSatisfactionModal(true);
                  } else {
                    setIsOpen(false);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-80 p-4">
                {messages.map((message, index) => (
                  <MessageBubble key={message.id || index} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src="/lovable-uploads/0cc1089d-ae78-4aa2-a433-2a364ba71f6d.png" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            <Separator />

            <div className="p-3">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Appuyez sur Entrée pour envoyer</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={startNewConversation}
                >
                  Nouvelle conversation
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {showSatisfactionModal && <SatisfactionModal />}
    </>
  );
};

export default ChatbotWidget;
