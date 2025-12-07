

'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface ChatbotButtonProps {
  onClick: () => void;
}

export function ChatbotButton({ onClick }: ChatbotButtonProps) {
  const [isPulsing, setIsPulsing] = useState(true);

  // Auto-pulse every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1000);
      return () => clearTimeout(timer);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-8 z-50"
    >
      <div className="relative">
        {/* Ping animation */}
        {isPulsing && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/30"
          />
        )}

        {/* Chat button */}
        <Button
          onClick={onClick}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Chat with Foshol Mitra</span>
        </Button>

        {/* Tooltip */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-md shadow-sm border whitespace-nowrap text-sm">
          Need help? 
        </div>
      </div>
    </motion.div>
  );
}