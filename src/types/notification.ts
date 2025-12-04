import { DefaultSession } from "next-auth";

export interface Notification {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  isSeen: boolean;
  deliveryId: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  totalSent: number;
  deliveries: {
    id: string;
    userId: number;
    userName: string;
    userEmail: string;
    isSeen: boolean;
  }[];
}

export interface PaginatedResponse<T> {
  notifications: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LatestNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface CreateNotificationInput {
  title: string;
  content: string;
  image?: string;
  userIds: number[];
}

