'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  X,
  RefreshCcw
} from 'lucide-react';
import { ChatMessage } from '@/types/chatbot';
import { getIntroduction, sendMessage } from '@/actions/chatbot-actions';

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatbotDialog({ open, onOpenChange }: ChatbotDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load initial introduction
  useEffect(() => {
    if (open && messages.length === 0) {
      loadIntroduction();
    }
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadIntroduction = async () => {
    try {
      const result = await getIntroduction();
      if (result.success && result.data?.introduction) {
        addMessage({
          id: Date.now().toString(),
          content: result.data.introduction,
          role: 'assistant',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to load introduction:', error);
    }
  };

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: trimmedInput,
      role: 'user',
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setError(undefined);

    try {
      // Send to API
      const result = await sendMessage(trimmedInput, sessionId);
      
      if (result.success && result.data) {
        // Update session ID
        if (result.data.sessionId) {
          setSessionId(result.data.sessionId);
        }

        // Add AI response
        addMessage({
          id: (Date.now() + 1).toString(),
          content: result.data.response,
          role: 'assistant',
          timestamp: new Date(result.data.timestamp),
        });
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
      
      // Add error message
      addMessage({
        id: (Date.now() + 2).toString(),
        content: `I apologize, but I'm having trouble responding right now. Please try again later.`,
        role: 'assistant',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setError(undefined);
    loadIntroduction();
  };

  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[85vh] max-h-[700px] p-0 gap-0 flex flex-col border-none">
        <DialogHeader className="px-4 py-3 border-b bg-primary/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9 bg-primary/10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse border border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold truncate flex items-center gap-1.5">
                  Foshol Mitra
                  <Sparkles className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                </DialogTitle>
                <DialogDescription className="text-xs truncate">
                  Your digital farming assistant
                </DialogDescription>
              </div>
            </div>
            <div className="mt-5 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-7 w-7 rounded-full"
                title="Clear chat"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </Button>
     
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages Container */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full p-4"
          >
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className={`h-8 w-8 shrink-0 ${message.role === 'user' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <AvatarFallback className="bg-transparent">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[calc(100%-3.5rem)]`}>
                    <div className="flex flex-col gap-1 w-full">
                      <Card className={`border-0 shadow-none ${message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted rounded-tl-none'
                      } max-w-full overflow-hidden`}>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap `wrap-break-word">
                            {message.content}
                          </p>
                        </CardContent>
                      </Card>
                      <span className={`text-[10px] text-muted-foreground ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8 bg-primary/10 shrink-0">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="bg-muted border-0 rounded-tl-none max-w-[calc(100%-3.5rem)]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Invisible div for auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t shrink-0">
            <p className="text-xs text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 bg-background shrink-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about farming or Fosholbari services..."
                disabled={isLoading}
                className="pr-10 min-h-10"
              />
 
            </div>
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line • Each conversation is fresh
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}