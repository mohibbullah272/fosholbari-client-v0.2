'use client';

import { useState } from 'react';
import { ChatbotButton } from './chatbotButton';
import { ChatbotDialog } from './chatbotDialouge';


export function ChatbotProvider() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatbotButton onClick={() => setIsOpen(true)} />
      <ChatbotDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}