'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { Conversation, Message, UserRole, UserSession } from '@/types/chat';
import { useConversation } from '@/hooks/useConversation';
import ConversationHeader from './ConversationHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ConversationDetailProps {
  conversation: Conversation;
  session: UserSession;
}

export default function ConversationDetail({
  conversation,
  session,
}: ConversationDetailProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedMessageIds = useRef<Set<number>>(new Set());

  const { 
    loading, 
    handleSendMessage, 
    getConversation, 
    handleTyping,
    isSocketConnected,
    typingUsers 
  } = useConversation(session);

  const [messages, setMessages] = useState<Message[]>(
    conversation.messages || []
  );
  const [isTyping, setIsTyping] = useState(false);

  const isAdmin = session.role === 'ADMIN';
  const isUserConversation = conversation?.userId === parseInt(session.id);

  // Check access
  useEffect(() => {
    if (!isAdmin && !isUserConversation) {
      router.replace('/dashboard/Conversation');
    }
  }, [isAdmin, isUserConversation, router]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to deduplicate messages
  const deduplicateMessages = useCallback((messageList: Message[]): Message[] => {
    const seen = new Set<number>();
    const uniqueMessages: Message[] = [];
    
    for (const message of messageList) {
      if (!message.id) continue;
      
      // If we haven't seen this ID before, add it
      if (!seen.has(message.id)) {
        seen.add(message.id);
        uniqueMessages.push(message);
      } else {
        console.log('Removing duplicate message with ID:', message.id);
      }
    }
    
    return uniqueMessages;
  }, []);

  // Sync messages with local cache from hook
  useEffect(() => {
    async function syncMessages() {
      const result = await getConversation(conversation.id);
      if (result.success && 'data' in result && result.data?.messages) {
        // Deduplicate messages before setting
        const deduplicated = deduplicateMessages(result.data.messages);
        setMessages(deduplicated);
      }
    }
    syncMessages();
  }, [conversation.id, getConversation, deduplicateMessages]);

  // Get typing users for this conversation
  const currentTypingUsers = typingUsers[conversation.id] || [];
  const otherUsersTyping = currentTypingUsers.filter(id => id !== parseInt(session.id));

  const handleSend = async (text: string) => {
    const result = await handleSendMessage(conversation.id, text);

    if (result.success && 'data' in result && result.data) {
      // Stop typing indicator
      setIsTyping(false);
      handleTyping(conversation.id, false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // Handle typing indicator
  const handleInputChange = (text: string) => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator if there's text
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      handleTyping(conversation.id, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      handleTyping(conversation.id, false);
    }
    
    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        handleTyping(conversation.id, false);
      }
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const isMessageFromCurrentUser = (message: Message): boolean => {
    if (message.senderId) {
      return message.senderId === parseInt(session.id);
    }
    return (isAdmin && message.senderRole === 'ADMIN') ||
           (!isAdmin && message.senderRole === 'INVESTOR');
  };

  // Generate unique key for each message
  const getMessageKey = (message: Message, index: number): string => {
    if (message.id) {
      return `msg_${message.id}`;
    }
    // Fallback: use timestamp and index
    return `msg_${message.createdAt}_${index}_${message.Text?.substring(0, 10)}`;
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile back button with connection status */}
      <div className="md:hidden border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {isSocketConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop connection status */}
      <div className="hidden md:flex items-center justify-end px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {isSocketConnected ? (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-600">Real-time active</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-600">Connection lost</span>
            </>
          )}
        </div>
      </div>

      <ConversationHeader
        conversation={conversation}
        showBackButton={false}
        isMobile={false}
        {...(isSocketConnected !== undefined && { isSocketConnected })}
      />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="min-h-full p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No messages yet
                </h3>
                <p className="text-muted-foreground">
                  Be the first to start the conversation
                </p>
                {!isSocketConnected && (
                  <p className="text-sm text-amber-600 mt-2">
                    Note: Real-time features are currently disabled
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message, index) => {
                  const isCurrentUser = isMessageFromCurrentUser(message);
                  const senderRole =
                    message.senderRole ||
                    (isCurrentUser ? session.role as UserRole : isAdmin ? 'INVESTOR' : 'ADMIN');

                  return (
                    <MessageBubble
                      key={getMessageKey(message, index)}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      isAdmin={senderRole === 'ADMIN'}
                      senderRole={senderRole}
                      isOptimistic={message.isOptimistic}
                    />
                  );
                })}
                
                {/* Typing indicator */}
                {otherUsersTyping.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span>
                      {otherUsersTyping.length === 1 
                        ? 'Someone is typing...' 
                        : `${otherUsersTyping.length} people are typing...`}
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <MessageInput
        onSend={handleSend}
        onInputChange={handleInputChange}
        disabled={loading}
        placeholder={
          isAdmin
            ? 'Reply to investor...'
            : 'Type your message to support...'
        }
        showConnectionStatus={!isSocketConnected}
      />
    </div>
  );
}