export type UserRole = 'ADMIN' | 'INVESTOR';
export type UserStatus = 'PENDING' | 'APPROVED' | 'BLOCKED';

// In your types/chat.ts
// In your types/chat.ts
export interface Message {
  id: number;
  Text: string;
  createdAt: string;
  senderId?: number;
  senderRole?: UserRole;
  convoId?: number; // Add this for optimistic updates
  isOptimistic?: boolean; // Add this for optimistic updates
}

export interface Conversation {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string;
    role: UserRole;
    status: UserStatus;
  };
  messages: Message[];
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserSession {
  id: string;
  name?: string | null;
  phone?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
}