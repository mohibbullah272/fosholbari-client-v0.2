'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  createConversation,
  sendMessage,
  fetchConversations,
  fetchConversation,
  fetchUserConversation,
} from '@/actions/chat-actions';
import { UserSession, Message } from '@/types/chat';
import { useRouter } from 'next/navigation';
import { socketClient } from '@/lib/socket-client';

export function useConversation(session: UserSession | null) {
  const [loading, setLoading] = useState(false);
  const [messagesCache, setMessagesCache] = useState<Record<number, Message[]>>({});
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<number, number[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const router = useRouter();
  const socketInitialized = useRef(false);

  // Track processed message ids (stringified) to avoid duplicates
  const messageIdsProcessed = useRef<Set<string>>(new Set());

  // Helper: stringify id safely
  const toIdKey = (id: any) => (id === undefined || id === null ? '' : String(id));

  // ---------- socket listeners ----------
  useEffect(() => {
    if (!session || socketInitialized.current) return;

    socketInitialized.current = true;

    // connect socket
    socketClient.connect(session);

    // Handlers (stable refs not required because we remove by reference on cleanup)
    const handleAuthenticated = (data: any) => {
      setIsSocketConnected(true);
  
      // server auto-joins user's conversation rooms on authenticate; no need to join client-side
    };

    const handleDisconnected = (data: any) => {
      setIsSocketConnected(false);
 
    };

    const handleConnectError = (error: any) => {
      console.error('Socket connection error:', error);
      setIsSocketConnected(false);
    };

    const handleOperationError = (err: any) => {
      console.warn('Socket operation error:', err?.message || err);
      // show toast for operation errors (non-fatal)
      if (err?.message) toast.error(err.message);
    };

    const handleAuthError = (err: any) => {
      console.warn('Socket authentication error:', err?.message || err);
      if (err?.message) toast.error(err.message);
    };

    const handleConversationCreated = (data: any) => {
      
      if (data?.conversation?.userId === parseInt(session.id)) {
        toast.success('Conversation created successfully');
        router.push(`/dashboard/Conversation/${data.conversation.id}`);
      }
    };

    const handleUserStatusChange = (data: any) => {
      console.log('User status changed:', data);
      setOnlineUsers(prev => {
        if (data.isOnline) {
          return Array.from(new Set([...prev, data.userId]));
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    };

    const handleUserTyping = (data: any) => {
      setTypingUsers(prev => {
        const cur = prev[data.conversationId] || [];
        if (data.isTyping) {
          if (!cur.includes(data.userId)) {
            return { ...prev, [data.conversationId]: [...cur, data.userId] };
          }
          return prev;
        } else {
          return { ...prev, [data.conversationId]: cur.filter(id => id !== data.userId) };
        }
      });
    };

    // New message handler: server emits transformed message { conversationId, message }
    const handleNewMessage = (payload: any) => {
      try {
        // payload shape: { conversationId, message }
        const convoId = Number(payload.conversationId);
        const incoming: Message = payload.message;

        // Normalize id to string key
        const incomingIdKey = toIdKey(incoming.id);

        // If no id provided (shouldn't happen from server), create key from content+ts
        const fallbackIdKey = incomingIdKey || `noid_${convoId}_${incoming.Text || incoming.Text}_${new Date(incoming.createdAt || Date.now()).getTime()}`;

        const idKey = incomingIdKey || fallbackIdKey;

        if (messageIdsProcessed.current.has(idKey)) {
      
          return;
        }

        messageIdsProcessed.current.add(idKey);

        setMessagesCache(prev => {
          const existing = prev[convoId] ? [...prev[convoId]] : [];

          // If incoming message id matches an optimistic message (same text and isOptimistic),
          // remove optimistic and push real.
          const optimisticIndex = existing.findIndex(m =>
            m.isOptimistic &&
            ( (incoming.Text && m.Text === incoming.Text) ||
              (incoming.Text && m.Text === incoming.Text) )
          );

          let newMessages = existing;

          if (optimisticIndex > -1) {
            // remove optimistic
            newMessages = existing.filter((_, idx) => idx !== optimisticIndex);
          }

          // ensure we don't already have this real message by id
          const hasById = incoming.id !== undefined && newMessages.some(m => toIdKey(m.id) === toIdKey(incoming.id));
          if (hasById) {
    
            return { ...prev, [convoId]: newMessages };
          }

          // push message
          const normalized: Message = {
            id: incoming.id,
            Text: incoming.Text || (incoming.Text as string) || '',
            createdAt: incoming.createdAt || new Date().toISOString(),
            senderId: incoming.senderId ?? incoming?.senderId ,
            senderRole: incoming.senderRole ?? incoming.senderRole,
            convoId,
          };

          return { ...prev, [convoId]: [...newMessages, normalized] };
        });

        // show toast if not from self
        const senderId = Number(incoming.senderId ?? incoming?.senderId);
        if (senderId !== parseInt(session.id)) {
          const senderName = incoming.senderRole === 'ADMIN' ? 'Admin' : 'User';
          toast.info(`New message from ${senderName}`);
        }
      } catch (err) {
        console.error('Error handling incoming message:', err);
      }
    };

    // Register listeners
    socketClient.on('authenticated', handleAuthenticated);
    socketClient.on('disconnected', handleDisconnected);
    socketClient.on('connect_error', handleConnectError);
    socketClient.on('operation_error', handleOperationError);
    socketClient.on('authentication_error', handleAuthError);
    socketClient.on('conversation_created', handleConversationCreated);
    socketClient.on('user_status_change', handleUserStatusChange);
    socketClient.on('user_typing', handleUserTyping);
    socketClient.on('new_message', handleNewMessage);

    // cleanup
    return () => {
      socketClient.off('authenticated', handleAuthenticated);
      socketClient.off('disconnected', handleDisconnected);
      socketClient.off('connect_error', handleConnectError);
      socketClient.off('operation_error', handleOperationError);
      socketClient.off('authentication_error', handleAuthError);
      socketClient.off('conversation_created', handleConversationCreated);
      socketClient.off('user_status_change', handleUserStatusChange);
      socketClient.off('user_typing', handleUserTyping);
      socketClient.off('new_message', handleNewMessage);

      // disconnect socket to avoid duplicate connections on HMR/unmount
      if (socketInitialized.current) {
        socketClient.disconnect();
        socketInitialized.current = false;
      }

      // clear processed ids (optional)
      messageIdsProcessed.current.clear();
    };
  }, [session, router]);

  // ---------- send message (optimistic + socket + HTTP) ----------
  const handleSendMessageOptimized = useCallback(
    async (convoId: number, text: string) => {
      if (!session) {
        toast.error('Please sign in to send messages');
        return { success: false, error: 'Not authenticated' };
      }

      if (!text.trim()) {
        toast.error('Message cannot be empty');
        return { success: false, error: 'Message is empty' };
      }

      setLoading(true);

      const tempId = Date.now(); // numeric temp id
      const tempIdKey = String(tempId);

      try {
        // optimistic message
        const tempMessage: Message = {
          id: tempId,
          Text: text.trim(),
          createdAt: new Date().toISOString(),
          senderId: parseInt(session.id),
          senderRole: session.role as any,
          convoId,
          isOptimistic: true,
        };

        // mark processed to avoid duplicate from socket if server broadcasts quickly
        messageIdsProcessed.current.add(tempIdKey);

        // add to cache
        setMessagesCache(prev => ({
          ...prev,
          [convoId]: [...(prev[convoId] || []), tempMessage],
        }));

        // try socket first (non-blocking)
        const socketSuccess = socketClient.sendMessageSocket(convoId, text.trim());
        if (!socketSuccess) {
          console.warn('Socket not connected, will fallback to HTTP only');
        }

        // always call backend HTTP to ensure persistence & authorative id
        const result = await sendMessage(convoId, text.trim(), session);

        if (result.success && result.data) {
          const realIdKey = String(result.data.id ?? `api_${Date.now()}`);

          // mark real id processed (avoid adding again later)
          messageIdsProcessed.current.add(realIdKey);

          // update cache: remove optimistic and add real message if not exists
          setMessagesCache(prev => {
            const existing = prev[convoId] ? [...prev[convoId]] : [];

            // remove optimistic messages that match by tempId
            const withoutOptimistic = existing.filter(m => !(m.isOptimistic && String(m.id) === tempIdKey));

            // if real message already exists by id or text (safety), don't duplicate
            const alreadyHasReal = withoutOptimistic.some(m => String(m.id) === realIdKey ||
              (m.Text === (result.data.text || result.data.Text) && !m.isOptimistic));

            if (alreadyHasReal) {
              return { ...prev, [convoId]: withoutOptimistic };
            }

            const realMessage: Message = {
              id: result.data.id,
              Text: result.data.text || result.data.Text || text.trim(),
              createdAt: result.data.createdAt || new Date().toISOString(),
              senderId: parseInt(session.id),
              senderRole: session.role as any,
              convoId,
            };

            return { ...prev, [convoId]: [...withoutOptimistic, realMessage] };
          });

          toast.success('Message sent');
          socketClient.setTyping(convoId, false);

          return { success: true, data: result.data };
        } else {
          // failure: remove optimistic message and unmark processed
          setMessagesCache(prev => ({
            ...prev,
            [convoId]: (prev[convoId] || []).filter(m => !(m.isOptimistic && String(m.id) === tempIdKey)),
          }));
          messageIdsProcessed.current.delete(tempIdKey);

          toast.error(result.error || 'Failed to send message');
          return result;
        }
      } catch (err) {
        console.error('Unexpected send error:', err);
        // rollback optimistic
        setMessagesCache(prev => ({
          ...prev,
          [convoId]: (prev[convoId] || []).filter(m => !(m.isOptimistic && String(m.id) === tempIdKey)),
        }));
        messageIdsProcessed.current.delete(tempIdKey);

        toast.error('An unexpected error occurred');
        return { success: false, error: 'Unexpected error' };
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  // Clear conversation cache
  const clearConversationCache = useCallback((convoId: number) => {
    setMessagesCache(prev => {
      const newC = { ...prev };
      delete newC[convoId];
      return newC;
    });
    console.log('Cleared cache for conversation:', convoId);
  }, []);

  // fetch conversation (server already auto-joined on authenticate; no need to join)
  const getConversation = useCallback(
    async (convoId: number) => {
      if (!session) return { success: false, error: 'Not authenticated' };

      // Use cache if present
      if (messagesCache[convoId]) {
        return {
          success: true,
          data: {
            messages: messagesCache[convoId],
            typingUsers: typingUsers[convoId] || [],
          },
        };
      }

      const result = await fetchConversation(convoId, session);

      if (result.success && result.data?.messages) {
        setMessagesCache(prev => ({
          ...prev,
          [convoId]: result.data.messages,
        }));
      }

      return {
        ...result,
        data: {
          ...result.data,
          typingUsers: typingUsers[convoId] || [],
        },
      };
    },
    [session, messagesCache, typingUsers]
  );

  const handleTyping = useCallback((convoId: number, isTyping: boolean) => {
    if (!session || !isSocketConnected) return;
    socketClient.setTyping(convoId, isTyping);
  }, [session, isSocketConnected]);

  const getConversations = useCallback(async () => {
    if (!session) return { success: false, error: 'Not authenticated' };

    const result = await fetchConversations(session);

    // server auto-joins on authenticate; but we still ensure local join for rooms if needed
    if (isSocketConnected && result.success && result.data) {
      result.data.forEach((conversation: any) => {
        // idempotent: socketClient.joinConversation will no-op if already joined or socket not connected
        socketClient.joinConversation(conversation.id);
      });
    }

    return result;
  }, [session, isSocketConnected]);

  const getUserConversation = useCallback(async () => {
    if (!session) return { success: false, error: 'Not authenticated' };
    if (session.role !== 'INVESTOR') {
      return { success: false, error: 'Only investors have conversations' };
    }

    const result = await fetchUserConversation(session);

    if (result.success && result.data && isSocketConnected) {
      socketClient.joinConversation(result.data.id);
    }

    return result;
  }, [session, isSocketConnected]);

  const handleCreateConversation = useCallback(async () => {
    if (!session) {
      toast.error('Please sign in to start a conversation');
      return { success: false, error: 'Not authenticated' };
    }

    if (session.role !== 'INVESTOR') {
      toast.error('Only investors can start conversations');
      return { success: false, error: 'Unauthorized' };
    }

    setLoading(true);
    try {
      const result = await createConversation(session);

      if (result.success) {
        toast.success(result.message || 'Conversation started successfully');

        if (result.data?.id) {
          socketClient.joinConversation(result.data.id);
          router.push(`/dashboard/Conversation/${result.data.id}`);
        }
      } else {
        toast.error(result.error || 'Failed to start conversation');

        if (result.message?.includes('Existing conversation found') && result.data?.id) {
          socketClient.joinConversation(result.data.id);
          router.push(`/dashboard/Conversation/${result.data.id}`);
        }
      }

      return result;
    } catch (err) {
      console.error('Create conversation error:', err);
      toast.error('An unexpected error occurred');
      return { success: false, error: 'Unexpected error' };
    } finally {
      setLoading(false);
    }
  }, [session, router]);

  return {
    loading,
    isSocketConnected,
    typingUsers,
    onlineUsers,
    handleCreateConversation,
    handleSendMessage: handleSendMessageOptimized,
    handleTyping,
    getConversations,
    getConversation,
    getUserConversation,
    clearConversationCache,
    joinConversationRoom: (convoId: number) => {
      // idempotent: server auto-joins on authenticate; this is a no-op if already joined
      socketClient.joinConversation(convoId);
    },
    // expose messages cache for UI
    messagesCache,
  };
}
