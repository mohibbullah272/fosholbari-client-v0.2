import { fetchConversations, fetchUserConversation } from '@/actions/chat-actions';
import ConversationDashboard from '@/components/conversation/ConversationDashboard';
import { authOptions } from '@/helpers/authOption';
import { UserSession } from '@/types/chat';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';


export default async function ConversationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/signin');
  }

  // Fetch data based on user role
  let conversations = [];
  
  if (session.user.role === 'ADMIN') {
    const result = await fetchConversations(session.user as UserSession);
    if (result.success) {
      conversations = result.data || [];
    }
  } else {
    const result = await fetchUserConversation(session.user as UserSession);
    if (result.success && result.data) {
      conversations = [result.data];
    }
  }

  return (
    <ConversationDashboard
      session={session.user as UserSession}
      initialConversations={conversations}
    />
  );
}