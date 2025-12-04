'use server';


import { revalidatePath } from 'next/cache';
import { CreateNotificationInput } from '@/types/notification';

import { getUserFromSession } from '@/helpers/getUserSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchWithUser(url: string, options: RequestInit = {}) {
  const user = await getUserFromSession();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add user info to query params for GET requests
  if (options.method === 'GET' || !options.method || options.method === 'DELETE') {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}userId=${user.id}&userRole=${user.role}&userStatus=${user.status}`;
  }

  // For non-GET requests, add user info to body
  let body = options.body;
  if (options.method && options.method !== 'GET' && body) {
    const parsedBody = JSON.parse(body as string);
    body = JSON.stringify({
      ...parsedBody,
      userId: user.id,
      userRole: user.role,
      userStatus: user.status,
    });
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    const error = await response.json();
   
    throw new Error(error.message || 'Request failed');
  }

  return response;
}

// Admin Actions
export async function createNotification(data: CreateNotificationInput) {
  try {
    const response = await fetchWithUser('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    revalidatePath('/dashboard/admin/notifications');
    return await response.json();
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
}

export async function getAdminNotifications(page: number = 1, search?: string) {
  try {
    const url = `/notifications/admin/all?page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    const response = await fetchWithUser(url);
    return await response.json();
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return { 
      notifications: [], 
      meta: { 
        total: 0, 
        page: 1, 
        limit: 10, 
        totalPages: 0 
      } 
    };
  }
}

export async function deleteNotification(id: string) {
  try {
    const response = await fetchWithUser(`/notifications/${id}`, {
      method: 'DELETE',
    });

    revalidatePath('/dashboard/admin/notification');
   
    return await response.json();
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
}

// User Actions
export async function getUserNotifications(page: number = 1) {
  try {
    const user = await getUserFromSession();
    const url = `/notifications/user/${user.id}?page=${page}&limit=10`;
    const response = await fetchWithUser(url);
    return await response.json();
  } catch (error) {
    console.error('Fetch user notifications error:', error);
    return { 
      notifications: [], 
      meta: { 
        total: 0, 
        page: 1, 
        limit: 10, 
        totalPages: 0 
      } 
    };
  }
}

export async function getLatestNotifications() {
  try {
    const user = await getUserFromSession();
    const url = `/notifications/user/${user.id}/latest?limit=5`;
    const response = await fetchWithUser(url);
    return await response.json();
  } catch (error) {
    console.error('Fetch latest notifications error:', error);
    return { 
      notifications: [], 
      unreadCount: 0 
    };
  }
}

export async function markAsSeen(notificationId: string) {
  try {
    const response = await fetchWithUser(`/notifications/${notificationId}/seen`, {
      method: 'PATCH',
    });
    return await response.json();
  } catch (error) {
    console.error('Mark as seen error:', error);
    throw error;
  }
}

export async function markAllAsSeen(notificationIds: string[]) {
  try {
    const promises = notificationIds.map(id => markAsSeen(id));
    await Promise.all(promises);
    revalidatePath('/dashboard/investor/notifications');
  } catch (error) {
    console.error('Mark all as seen error:', error);
    throw error;
  }
}