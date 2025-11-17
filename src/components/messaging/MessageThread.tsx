import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Image as ImageIcon, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { messageSchema } from '@/lib/validations/quote';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  attachments?: Array<{ url: string; type: string; name: string }>;
  read: boolean;
}

interface MessageThreadProps {
  threadId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientId: string;
  onClose?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  threadId,
  recipientName,
  recipientAvatar,
  recipientId,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Mock messages for demo
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: recipientId,
        sender_name: recipientName,
        sender_avatar: recipientAvatar,
        content: 'Bonjour ! J\'ai bien reçu votre demande de devis.',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: '2',
        sender_id: user?.id || '',
        sender_name: 'Vous',
        content: 'Merci ! Quel est le délai estimé ?',
        created_at: new Date(Date.now() - 3000000).toISOString(),
        read: true
      },
      {
        id: '3',
        sender_id: recipientId,
        sender_name: recipientName,
        sender_avatar: recipientAvatar,
        content: 'Je peux vous proposer un rendez-vous demain matin. La réparation prendra environ 2 heures.',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        read: true
      }
    ];
    setMessages(mockMessages);
  }, [recipientId, recipientName, recipientAvatar, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    try {
      // Validation avec zod
      const validatedData = messageSchema.parse({
        content: newMessage,
        recipientId: recipientId
      });

      const message: Message = {
        id: Date.now().toString(),
        sender_id: user?.id || '',
        sender_name: 'Vous',
        content: validatedData.content,
        created_at: new Date().toISOString(),
        read: false
      };

      setMessages([...messages, message]);
      setNewMessage('');

      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        enhancedToast.error({
          title: 'Message invalide',
          description: error.errors[0]?.message || 'Le message est trop long',
        });
      }
    }
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm', { locale: fr });
    }
    return format(messageDate, 'dd MMM HH:mm', { locale: fr });
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{recipientName}</CardTitle>
              <p className="text-sm text-muted-foreground">En ligne</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwnMessage && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender_avatar} />
                        <AvatarFallback>{message.sender_name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground px-2">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={recipientAvatar} />
                  <AvatarFallback>{recipientName[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon" className="shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
