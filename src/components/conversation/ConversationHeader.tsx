'use client';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, User, MoreVertical, Headset } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types/chat';

interface ConversationHeaderProps {
  conversation: Conversation;
  showBackButton?: boolean;
  isMobile?: boolean;
}

export default function ConversationHeader({
  conversation,
  showBackButton = false,
  isMobile = false,
}: ConversationHeaderProps) {
  const router = useRouter();
  const user = conversation.user;

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {
            user.role ==="INVESTOR"?(<div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Headset className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                হেল্পলাইন
                </h2>
              </div>
              
            </div>
          </div>):(       <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                  {user.name || 'Unnamed User'}
                </h2>
                <Badge
                  variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {user.role}
                </Badge>
 
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{user.phone}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>)
          }
   
        </div>
        

      </div>
    </div>
  );
}