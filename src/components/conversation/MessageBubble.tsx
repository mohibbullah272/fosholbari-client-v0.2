'use client';

import { cn } from '@/lib/utils';
import { Message, UserRole } from '@/types/chat';
import { format } from 'date-fns';
import { UserCircle, Shield, User, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isAdmin?: boolean;
  senderRole?: UserRole;
  isOptimistic?: boolean;
}


export default function MessageBubble({
  message,
  isCurrentUser,
  isAdmin = false,
  senderRole = 'INVESTOR',
  isOptimistic = false,
}: MessageBubbleProps) {
  // Determine if message is from admin or investor
  const isMessageFromAdmin = senderRole === 'ADMIN';
  const messageText = message.Text  || '';

  // Different colors and styles for admin vs investor
  const getBubbleStyles = () => {
    if (isOptimistic) {
      // Optimistic messages (being sent)
      return {
        bg: 'bg-gray-200 border border-gray-300', 
        text: 'text-gray-700',
        border: '',
        iconBg: 'bg-gray-300',
        iconColor: 'text-gray-600',
        opacity: 'opacity-80'
      };
    }
    
    if (isCurrentUser) {
      // Messages sent by the current user
      return {
        bg: 'bg-primary',
        text: 'text-primary-foreground',
        border: '',
        iconBg: 'bg-primary/20',
        iconColor: 'text-primary',
        opacity: ''
      };
    } else if (isMessageFromAdmin) {
      // Admin messages
      return {
        bg: 'bg-blue-50 border border-blue-100',
        text: 'text-blue-900',
        border: '',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        opacity: ''
      };
    } else {
      // Investor messages
      return {
        bg: 'bg-gray-50 border border-gray-100',
        text: 'text-gray-900',
        border: '',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        opacity: ''
      };
    }
  };

  const styles = getBubbleStyles();
  
  // Get appropriate icon
  const getIcon = () => {
    if (isOptimistic) {
      return <Clock className="h-5 w-5" />;
    }
    if (isMessageFromAdmin) {
      return <Shield className="h-5 w-5" />;
    }
    return isCurrentUser ? <UserCircle className="h-5 w-5" /> : <User className="h-5 w-5" />;
  };

  // Get sender label
  const getSenderLabel = () => {
    if (isOptimistic) {
      return 'Sending...';
    }
    if (isCurrentUser) {
      return 'You';
    }
    return isMessageFromAdmin ? 'Admin' : 'Investor';
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
        styles.opacity
      )}
    >
      {/* Avatar/Icon */}
      <div className={cn(
        'flex-shrink-0 mt-1',
        'flex items-center justify-center',
        'h-8 w-8 rounded-full',
        styles.iconBg,
        styles.iconColor
      )}>
        {getIcon()}
      </div>

      {/* Message Bubble */}
      <div className={cn(
        'flex flex-col',
        isCurrentUser ? 'items-end' : 'items-start'
      )}>
        {/* Sender Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            'text-xs font-medium',
            isCurrentUser ? 'text-primary' : 
            isMessageFromAdmin ? 'text-blue-600' : 'text-gray-600',
            isOptimistic && 'text-gray-500'
          )}>
            {getSenderLabel()}
          </span>
        </div>

        {/* Message Content */}
        <div className={cn(
      'rounded-2xl px-4 py-3 max-w-xs md:max-w-md lg:max-w-lg',
      'shadow-sm',
      styles.bg,
      styles.text,
      isCurrentUser 
        ? 'rounded-tr-none' 
        : 'rounded-tl-none',
      styles.border
    )}>
      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
        {messageText} {/* Use messageText here */}
      </p>
    </div>

        {/* Timestamp */}
        {!isOptimistic && (
          <span className={cn(
            'text-xs text-muted-foreground mt-1 px-1',
            isCurrentUser ? 'text-right' : 'text-left'
          )}>
            {format(new Date(message.createdAt), 'hh:mm a')}
          </span>
        )}
      </div>
    </div>
  );
}