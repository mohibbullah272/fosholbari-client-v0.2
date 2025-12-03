'use client';



import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  MessageSquare,
  User,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
}

export default function ConversationList({
  conversations,
  isLoading = false,
}: ConversationListProps) {
  const router = useRouter();

  // Handle case where conversations is undefined or null
  if (!conversations) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load conversations. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!Array.isArray(conversations) || conversations.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start a conversation to get help from our team
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        // Safe access to messages with optional chaining and default value
        const messages = conversation?.messages || [];
        const lastMessage = messages[0] || null; // Use null instead of empty string
        const user = conversation?.user || {};


        return (
          <Card
            key={conversation.id}
            className="hover:bg-accent/50 transition-colors cursor-pointer group"
            onClick={() => router.push(`/dashboard/Conversation/${conversation.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        user?.role === 'ADMIN' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {user?.role || 'USER'}
                    </Badge>
                    
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {user?.name || 'Unnamed User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{user?.phone || 'No phone'}</span>
                    </div>
                    {user?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>
                  
                  {lastMessage && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm line-clamp-2">
                        {lastMessage?.Text}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(conversation.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span>•</span>
                        <span>{messages.length} messages</span>
                      </div>
                    </div>
                  )}

                  {messages.length === 0 && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground italic">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                </div>
                
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}