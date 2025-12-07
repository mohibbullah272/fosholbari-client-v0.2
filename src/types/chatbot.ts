export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }
  
  export interface ChatResponse {
    response: string;
    sessionId: string;
    timestamp: Date;
  }
  
  export interface ChatRequest {
    message: string;
    sessionId?: string;
  }