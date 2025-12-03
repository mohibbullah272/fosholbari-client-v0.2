'use server';

import { UserSession } from '@/types/chat';
import { revalidateTag} from 'next/cache';

const baseApi = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${baseApi}/chat`;

// Create a new conversation (Investor only)
export async function createConversation(session: UserSession) {
  try {
    if (!session.id || !session.role || !session.status) {
      return { success: false, error: 'User session data incomplete' };
    }

    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: parseInt(session.id),
        userRole: session.role,
        userStatus: session.status,
      }),
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("conversations");

    }

    return result;
  } catch (error) {
    console.error('Create conversation error:', error);
    return { success: false, error: 'Failed to create conversation' };
  }
}



// Send a message
export async function sendMessage(
  convoId: number,
  text: string,
  session: UserSession
) {
  try {
    if (!session.id || !session.role) {
      return { success: false, error: 'User session data incomplete' };
    }

    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        convoId,
        text,
        userId: parseInt(session.id),
        userRole: session.role,
        userStatus: session.status,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 🔥 This triggers instant refetch on frontend
      revalidateTag("messages");



      return {
        success: true,
        data: {
          id: result.data?.id,
          text: result.data?.text || text,
          createdAt: result.data?.createdAt || new Date().toISOString(),
        }
      };
    }

    return result;
  } catch (error) {
    console.error('Send message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}



// Fetch all conversations (Admin only)
export async function fetchConversations(session: UserSession) {
  try {
    const response = await fetch(
      `${API_URL}/conversations?userId=${session.id}&userRole=${session.role}&userStatus=${session.status}`,
      {
        next: { tags: ["conversations"] },
        cache: "no-store",
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return { success: false, error: 'Failed to fetch conversations' };
  }
}



// Fetch single conversation with messages
export async function fetchConversation(
  convoId: number,
  session: UserSession
) {
  try {
    const response = await fetch(
      `${API_URL}/conversations/${convoId}?userId=${session.id}&userRole=${session.role}&userStatus=${session.status}`,
      {
        next: { tags: ["messages"] },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: {
          ...result.data,
          messages: Array.isArray(result.data?.messages)
            ? result.data.messages
            : [],
        }
      };
    }

    return { success: false, error: result.error || 'Failed to fetch conversation' };
  } catch (error) {
    console.error('Fetch conversation error:', error);
    return { success: false, error: 'Failed to fetch conversation' };
  }
}



// Fetch user's conversation
export async function fetchUserConversation(session: UserSession) {
  try {
    const response = await fetch(
      `${API_URL}/conversations/user/${session.id}?userId=${session.id}&userRole=${session.role}&userStatus=${session.status}`,
      {
        next: { tags: ["conversations"] },
        cache: 'no-store',
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Fetch user conversation error:', error);
    return { success: false, error: 'Failed to fetch conversation' };
  }
}
