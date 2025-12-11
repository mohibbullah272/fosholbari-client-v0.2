import { fetchConversation } from '@/actions/chat-actions';
import ConversationDetail from '@/components/conversation/ConversationDetails';
import { authOptions } from '@/helpers/authOption';
import { UserSession } from '@/types/chat';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';



export default async function ConversationDetailPage({ params }:{
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/signin');
  }

  const { id } =await params;

  const convoId = parseInt(id);
console.log(convoId,"found")
  if (isNaN(convoId)) {
    notFound();
  }

  const result = await fetchConversation(convoId, session.user as UserSession);
console.log(result,".........")
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <ConversationDetail
      conversation={result.data}
      session={session.user as UserSession}
    />
  );
}
