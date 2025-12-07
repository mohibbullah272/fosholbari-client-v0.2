'use server';

import { ChatResponse } from '@/types/chatbot';
import { revalidatePath } from 'next/cache';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<{ success: boolean; data?: ChatResponse; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
        sessionId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send message');
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getIntroduction(): Promise<{ 
  success: boolean; 
  data?: { introduction: string }; 
  error?: string 
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/introduction`, {
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get introduction');
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Introduction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}