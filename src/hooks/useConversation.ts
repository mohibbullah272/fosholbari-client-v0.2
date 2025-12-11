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
  
  // ✅ CRITICAL: Track if socket was initialized GLOBALLY (not per-component)
  const socketInitializedGlobal = useRef(false);
  const listenersAttached = useRef(false);

  const messageIdsProcessed = useRef<Set<string>>(new Set());

  const toIdKey = (id: any) => (id === undefined || id === null ? '' : String(id));

  // ---------- socket listeners ----------
  useEffect(() => {
    if (!session) return;

    // ✅ Connect socket ONCE globally (survives component remounts)
    if (!socketInitializedGlobal.current) {
      console.log('🔌 Initializing socket connection (GLOBAL)');
      socketClient.connect(session);
      socketInitializedGlobal.current = true;
    }

    // ✅ Only attach listeners once per hook instance
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    console.log('📡 Attaching socket listeners');

    // Handlers
    const handleAuthenticated = (data: any) => {
      setIsSocketConnected(true);
      console.log('✅ Socket authenticated in hook');
    };

    const handleDisconnected = (data: any) => {
      setIsSocketConnected(false);
      console.log('🔴 Socket disconnected in hook');
    };

    const handleConnectError = (error: any) => {
      console.error('❌ Socket connection error:', error);
      setIsSocketConnected(false);
    };

    const handleOperationError = (err: any) => {
      console.warn('⚠️ Socket operation error:', err?.message || err);
      if (err?.message) toast.error(err.message);
    };

    const handleAuthError = (err: any) => {
      console.warn('🔐 Socket authentication error:', err?.message || err);
      if (err?.message) toast.error(err.message);
    };

    const handleConversationCreated = (data: any) => {
      if (data?.conversation?.userId === parseInt(session.id)) {
        toast.success('Conversation created successfully');
        router.push(`/dashboard/Conversation/${data.conversation.id}`);
      }
    };

    const handleUserStatusChange = (data: any) => {
      console.log('👤 User status changed:', data);
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

    const handleNewMessage = (payload: any) => {
      try {
        const convoId = Number(payload.conversationId);
        const incoming: Message = payload.message;

        const incomingIdKey = toIdKey(incoming.id);
        const fallbackIdKey = incomingIdKey || `noid_${convoId}_${incoming.Text || incoming.Text}_${new Date(incoming.createdAt || Date.now()).getTime()}`;
        const idKey = incomingIdKey || fallbackIdKey;

        if (messageIdsProcessed.current.has(idKey)) {
          return;
        }

        messageIdsProcessed.current.add(idKey);

        setMessagesCache(prev => {
          const existing = prev[convoId] ? [...prev[convoId]] : [];

          const optimisticIndex = existing.findIndex(m =>
            m.isOptimistic &&
            ( (incoming.Text && m.Text === incoming.Text) ||
              (incoming.Text && m.Text === incoming.Text) )
          );

          let newMessages = existing;

          if (optimisticIndex > -1) {
            newMessages = existing.filter((_, idx) => idx !== optimisticIndex);
          }

          const hasById = incoming.id !== undefined && newMessages.some(m => toIdKey(m.id) === toIdKey(incoming.id));
          if (hasById) {
            return { ...prev, [convoId]: newMessages };
          }

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

        const senderId = Number(incoming.senderId ?? incoming?.senderId);
        if (senderId !== parseInt(session.id)) {
          const senderName = incoming.senderRole === 'ADMIN' ? 'Admin' : 'User';
          toast.info(`New message from ${senderName}`);
        }
      } catch (err) {
        console.error('💥 Error handling incoming message:', err);
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

    // Check initial connection state
    if (socketClient.isConnected()) {
      setIsSocketConnected(true);
    }

    // ✅ CRITICAL FIX: Cleanup ONLY removes listeners, NOT the socket connection
    return () => {
      console.log('🧹 Cleaning up listeners (keeping socket alive)');
      
      socketClient.off('authenticated', handleAuthenticated);
      socketClient.off('disconnected', handleDisconnected);
      socketClient.off('connect_error', handleConnectError);
      socketClient.off('operation_error', handleOperationError);
      socketClient.off('authentication_error', handleAuthError);
      socketClient.off('conversation_created', handleConversationCreated);
      socketClient.off('user_status_change', handleUserStatusChange);
      socketClient.off('user_typing', handleUserTyping);
      socketClient.off('new_message', handleNewMessage);

      // ❌ DO NOT DISCONNECT - Let socket live across navigations
      // Only disconnect on actual logout/session end
      
      listenersAttached.current = false;
    };
  }, [session, router]);

  // ✅ NEW: Handle actual session end (logout)
  useEffect(() => {
    // If session becomes null, disconnect the socket
    if (!session && socketInitializedGlobal.current) {
      console.log('🔴 Session ended - disconnecting socket');
      socketClient.disconnect();
      socketInitializedGlobal.current = false;
      listenersAttached.current = false;
      messageIdsProcessed.current.clear();
    }
  }, [session]);

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

      const tempId = Date.now();
      const tempIdKey = String(tempId);

      try {
        const tempMessage: Message = {
          id: tempId,
          Text: text.trim(),
          createdAt: new Date().toISOString(),
          senderId: parseInt(session.id),
          senderRole: session.role as any,
          convoId,
          isOptimistic: true,
        };

        messageIdsProcessed.current.add(tempIdKey);

        setMessagesCache(prev => ({
          ...prev,
          [convoId]: [...(prev[convoId] || []), tempMessage],
        }));

        const socketSuccess = socketClient.sendMessageSocket(convoId, text.trim());
        if (!socketSuccess) {
          console.warn('⚠️ Socket not connected, will fallback to HTTP only');
        }

        const result = await sendMessage(convoId, text.trim(), session);

        if (result.success && result.data) {
          const realIdKey = String(result.data.id ?? `api_${Date.now()}`);

          messageIdsProcessed.current.add(realIdKey);

          setMessagesCache(prev => {
            const existing = prev[convoId] ? [...prev[convoId]] : [];
            const withoutOptimistic = existing.filter(m => !(m.isOptimistic && String(m.id) === tempIdKey));

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
          setMessagesCache(prev => ({
            ...prev,
            [convoId]: (prev[convoId] || []).filter(m => !(m.isOptimistic && String(m.id) === tempIdKey)),
          }));
          messageIdsProcessed.current.delete(tempIdKey);

          toast.error(result.error || 'Failed to send message');
          return result;
        }
      } catch (err) {
        console.error('💥 Unexpected send error:', err);
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

  const clearConversationCache = useCallback((convoId: number) => {
    setMessagesCache(prev => {
      const newC = { ...prev };
      delete newC[convoId];
      return newC;
    });
    console.log('🗑️ Cleared cache for conversation:', convoId);
  }, []);

  const getConversation = useCallback(
    async (convoId: number) => {
      if (!session) return { success: false, error: 'Not authenticated' };

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

    if (isSocketConnected && result.success && result.data) {
      result.data.forEach((conversation: any) => {
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
      console.error('💥 Create conversation error:', err);
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
      socketClient.joinConversation(convoId);
    },
    messagesCache,
  };
}