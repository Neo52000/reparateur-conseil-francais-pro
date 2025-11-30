import React, { useEffect } from 'react';
import BenChatWidget from './chatbot/BenChatWidget';
import { useProactiveChatTrigger } from '@/hooks/useProactiveChatTrigger';

const ChatbotLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Proactive engagement triggers (idle 15s or 50% scroll)
  useProactiveChatTrigger(true);

  // Optional: focus the widget when event fires (if widget listens to this event)
  useEffect(() => {
    const onOpen = () => {
      // Custom event the widget can listen to
      // If AlexChatWidget exposes an API, we could call it here.
    };
    window.addEventListener('open-chatbot', onOpen);
    return () => window.removeEventListener('open-chatbot', onOpen);
  }, []);

  return (
    <>
      {children}
      {/* TODO: Réactiver quand plan Supabase upgradé - Chatbot désactivé temporairement */}
      {/* <BenChatWidget /> */}
    </>
  );
};

export default ChatbotLayout;