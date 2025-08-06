import React from 'react';
import AlexChatWidget from './chatbot/AlexChatWidget';

const ChatbotLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <AlexChatWidget />
    </>
  );
};

export default ChatbotLayout;