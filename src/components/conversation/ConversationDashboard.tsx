'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  PlusCircle,
  Users,
  User,
  BarChart,
} from 'lucide-react';
import { Conversation, UserSession } from '@/types/chat';
import { useConversation } from '@/hooks/useConversation';
import ConversationList from './ConversationList';

interface ConversationDashboardProps {
  session: UserSession;
  initialConversations: Conversation[];
}

export default function ConversationDashboard({
  session,
  initialConversations,
}: ConversationDashboardProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeTab, setActiveTab] = useState('all');
  const { loading, handleCreateConversation, getConversations } =
    useConversation(session);

  const isAdmin = session.role === 'ADMIN';
  const userConversation = conversations.find((c) => c.userId === parseInt(session.id));
  const handleStartConversation = async () => {
    // Simply call the hook function - it will handle redirect internally
    await handleCreateConversation();
  };
  const handleRefresh = async () => {
    const result = await getConversations();
    if (result.success && result.data) {
      setConversations(result.data);
    }
  };

  const stats = {
    total: conversations?.length,
    active: conversations.filter(c => c.messages?.length > 0).length,
    pending: conversations.filter(c => c.messages?.length === 0).length,
    users: new Set(conversations.map(c => c.userId)).size,
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === 'active') return conversation?.messages?.length > 0;
    if (activeTab === 'pending') return conversation?.messages?.length === 0;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? 'Conversations' : 'My Conversation'}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? 'Manage all investor conversations'
                : 'Chat with our support team'}
            </p>
          </div>
          
          {!isAdmin && (
            <Button
              onClick={handleStartConversation}
              disabled={loading || !!userConversation}
              className="gap-2"
            >
              {userConversation ? (
                <>
                  <MessageSquare className="h-4 w-4" />
                  View Conversation
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Start New Conversation
                </>
              )}
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{stats.users}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {isAdmin ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Conversations</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>
          
          <TabsContent value={activeTab}>
            <ConversationList
              conversations={filteredConversations}
              isLoading={loading}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            {userConversation ? (
              <ConversationList conversations={[userConversation]} />
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No conversation yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start a conversation to get help from our support team
                </p>
                <Button
                  onClick={handleStartConversation}
                  disabled={loading}
                  size="lg"
                >
                  Start Conversation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}