'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (text: string) => Promise<void>;
  onInputChange?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showConnectionStatus?: boolean;
}

export default function MessageInput({
  onSend,
  onInputChange,
  disabled = false,
  placeholder = 'Type your message here...',
  className,
  showConnectionStatus = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSend(message);
      setMessage('');
      // Clear typing indicator
      onInputChange?.('');
      // Focus back on textarea after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    onInputChange?.(value);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'border-t bg-background p-4',
        'sticky bottom-0',
        className
      )}
    >
      {showConnectionStatus && (
        <div className="flex items-center gap-2 text-amber-600 text-sm mb-2 px-2">
          <AlertCircle className="h-4 w-4" />
          <span>Connection lost. Messages will be sent when reconnected.</span>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[44px] max-h-[120px] resize-none pr-12"
            rows={1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8"
            disabled
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11"
          disabled={!message.trim() || disabled || isSending}
        >
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
}