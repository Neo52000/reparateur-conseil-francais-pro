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
import { useMessages } from '@/hooks/useMessages';

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  message_text: string;
  attachments: any;
  read_at: string | null;
  created_at: string;
}

interface MessageThreadProps {
  quoteId: string;
  senderType: 'client' | 'repairer';
  recipientName: string;
  recipientAvatar?: string;
  onClose?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  quoteId,
  senderType,
  recipientName,
  recipientAvatar,
  onClose
}) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage } = useMessages(quoteId);


  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      const validatedData = messageSchema.parse({
        content: newMessage,
        recipientId: user?.id || ''
      });

      await sendMessage(validatedData.content, senderType);
      setNewMessage('');
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
                         <AvatarImage src={recipientAvatar} />
                         <AvatarFallback>{recipientName[0]}</AvatarFallback>
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
                         <p className="text-sm">{message.message_text}</p>
                       </div>
                       <span className="text-xs text-muted-foreground px-2">
                         {formatMessageTime(message.created_at)}
                       </span>
                     </div>
                   </motion.div>
                 );
               })}
             </AnimatePresence>
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
