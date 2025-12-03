'use client';

import { io, Socket } from 'socket.io-client';
import { Message, UserSession } from '@/types/chat';

type EventCallback = (...args: any[]) => void;

class SocketClient {
  private socket: Socket | null = null;
  private userId: number | null = null;
  // Map of public listeners (event -> Set of callbacks)
  private listeners = new Map<string, Set<EventCallback>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseUrl: string;
  // track joined conversation ids locally (to avoid duplicate emits)
  private joinedConversations = new Set<number>();

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
    this.baseUrl = this.baseUrl.replace(/\/api\/v1$/, '').replace(/\/$/, '');
    console.log('🔌 Socket will connect to:', this.baseUrl);
  }

  connect(session: UserSession) {
    // don't reconnect if already connected
    if (this.socket && this.socket.connected) return;

    this.userId = parseInt(session.id);

    console.log('🔌 Connecting to socket server at:', this.baseUrl);
    console.log('🔌 User ID:', this.userId);

    // Use websocket-only transport to avoid polling causing duplicate behavior.
    this.socket = io(this.baseUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      path: '/socket.io/',
      auth: { userId: this.userId },
      // autoConnect true by default
    });

    // ensure we attach event handlers only once
    this.setupEventListeners();
  }

  // Transform the server new_message payload to your Message interface
  private transformSocketMessage(data: any): { conversationId: number; message: Message } {
    const transformedMessage: Message = {
      id: data.message.id,
      Text: data.message.text || data.message.Text || '',
      createdAt: data.message.createdAt || new Date().toISOString(),
      senderId: data.message.senderId ?? data.message.sender?.id,
      senderRole: data.message.senderRole ?? data.message.sender?.role,
      convoId: data.conversationId
    };

    return {
      conversationId: data.conversationId,
      message: transformedMessage
    };
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // avoid stacking handlers on HMR by removing existing low-level handlers first
    this.socket.removeAllListeners();

    // connection lifecycle
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // authenticate right after connect
      this.socket?.emit('authenticate', { userId: this.userId });
    });

    this.socket.on('authenticated', (data: any) => {
      // pass to our subscribers
      this.emit('authenticated', data);
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('🔴 Socket disconnected:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('❌ Socket connection error:', err);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Max reconnection attempts reached, disconnecting socket');
        this.socket?.disconnect();
      }
      this.emit('connect_error', err);
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      this.emit('reconnect_attempt', attemptNumber);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      this.emit('reconnected', attemptNumber);
    });

    // handle server operation_error / authentication_error as non-fatal events
    this.socket.on('operation_error', (data: any) => {
      console.warn('server operation_error', data);
      this.emit('operation_error', data);
    });

    this.socket.on('authentication_error', (data: any) => {
      console.warn('server authentication_error', data);
      this.emit('authentication_error', data);
    });

    // chat events
    this.socket.on('new_message', (data: any) => {
      // transform before emitting to keep client hooks simpler
      const transformed = this.transformSocketMessage(data);
      this.emit('new_message', transformed);
    });

    this.socket.on('user_typing', (data: any) => {
      this.emit('user_typing', data);
    });

    this.socket.on('conversation_created', (data: any) => {
      this.emit('conversation_created', data);
    });

    this.socket.on('conversation_joined', (data: any) => {
      // server replies when join_conversation happens; still emit
      this.emit('conversation_joined', data);
    });

    this.socket.on('conversation_data', (data: any) => {
      this.emit('conversation_data', data);
    });

    this.socket.on('user_status_change', (data: any) => {
      this.emit('user_status_change', data);
    });

    this.socket.on('message_read', (data: any) => {
      this.emit('message_read', data);
    });

    // Important: do NOT listen to generic "error" for fatal socket errors;
    // we handle server-sent operation/auth errors above.
    // still forward if server somehow emits a raw error payload:
    this.socket.on('error', (payload: any) => {
      console.warn('raw socket error event:', payload);
      // forward to subscribers under a safer name (operation_error)
      this.emit('operation_error', payload);
    });
  }

  // PUBLIC API for modules to subscribe/unsubscribe
  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: EventCallback) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(callback);
    if (set.size === 0) this.listeners.delete(event);
  }

  private emit(event: string, ...args: any[]) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach(cb => {
      try { cb(...args); } catch (err) { console.error(`Error in ${event} callback`, err); }
    });
  }

  // Join conversation (idempotent, avoids duplicate emits)
  joinConversation(conversationId: number) {
    if (!this.socket?.connected || !this.userId) {
      console.warn('Cannot join conversation: Socket not connected');
      return;
    }

    if (this.joinedConversations.has(conversationId)) {
      // already joined locally; skip emit
      console.debug('Already joined conversation (local cache):', conversationId);
      return;
    }

    // mark as joined (optimistic) and emit
    this.joinedConversations.add(conversationId);
    this.socket.emit('join_conversation', { conversationId, userId: this.userId });
    console.log('Joined conversation:', conversationId);
  }

  leaveConversation(conversationId: number) {
    if (!this.socket?.connected) return;
    if (this.joinedConversations.has(conversationId)) {
      this.joinedConversations.delete(conversationId);
    }
    this.socket.emit('leave_conversation', conversationId);
  }

  sendMessageSocket(conversationId: number, text: string) {
    if (!this.socket?.connected || !this.userId) {
      console.warn('Cannot send message: Socket not connected');
      return false;
    }

    this.socket.emit('send_message', {
      conversationId,
      text,
      userId: this.userId
    });

    return true;
  }

  setTyping(conversationId: number, isTyping: boolean) {
    if (!this.socket?.connected || !this.userId) return;
    this.socket.emit('typing', { conversationId, isTyping, userId: this.userId });
  }

  requestConversation(conversationId: number) {
    if (!this.socket?.connected || !this.userId) return;
    this.socket.emit('get_conversation', { conversationId, userId: this.userId });
  }

  markAsRead(messageId: number, conversationId: number) {
    if (!this.socket?.connected) return;
    this.socket.emit('message_read', { messageId, conversationId });
  }

  disconnect() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (err) {
        console.warn('Error while disconnecting socket', err);
      }
      this.socket = null;
    }
    this.listeners.clear();
    this.joinedConversations.clear();
    this.userId = null;
    console.log('Socket disconnected (client cleanup)');
  }

  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export const socketClient = new SocketClient();
