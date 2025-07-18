import React, { useEffect, useRef } from 'react';
import { useAdvancedChatbot } from '@/hooks/useAdvancedChatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star } from 'lucide-react';

export const AdvancedChatbotInterface = () => {
  const {
    messages,
    isLoading,
    isTyping,
    conversationId,
    conversationMemory,
    sendMessage,
    startConversation,
    requestLocation
  } = useAdvancedChatbot();

  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) {
      startConversation();
    }
  }, [conversationId, startConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleActionClick = (action: any) => {
    switch (action.action) {
      case 'request_location':
        requestLocation();
        break;
      case 'show_repairers':
        sendMessage('Montrez-moi les réparateurs près de moi');
        break;
      default:
        sendMessage(action.label);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto h-96 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Ben - Assistant IA Avancé</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              Stage: {conversationMemory.conversationContext.diagnosisStage}
            </Badge>
            <Badge variant="outline">
              Confiance: {conversationMemory.emotionalJourney.confidenceLevel}%
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              
              {message.diagnosticData && (
                <div className="mt-2 space-y-1">
                  {message.diagnosticData.estimatedCost && (
                    <Badge variant="outline" className="text-xs">
                      💰 {message.diagnosticData.estimatedCost}
                    </Badge>
                  )}
                  {message.diagnosticData.urgency && (
                    <Badge 
                      variant={message.diagnosticData.urgency === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      ⚡ {message.diagnosticData.urgency}
                    </Badge>
                  )}
                </div>
              )}

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs mr-1 mb-1"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-1">
                  {message.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.type === 'location' ? 'default' : 'secondary'}
                      size="sm"
                      className="text-xs mr-1"
                      onClick={() => handleActionClick(action)}
                    >
                      {action.type === 'location' && <MapPin className="w-3 h-3 mr-1" />}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez votre problème..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            Envoyer
          </Button>
        </div>
      </div>
    </Card>
  );
};