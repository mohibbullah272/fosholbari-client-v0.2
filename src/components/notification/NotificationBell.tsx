'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Notification } from '@/types/notification';
import { getLatestNotifications, markAllAsSeen } from '@/actions/notification-action';
import { toast } from 'sonner';


export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const data = await getLatestNotifications();
      setNotifications(data?.data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAllAsSeen = async () => {
    if (unreadCount === 0) return;
    
    setIsLoading(true);
    try {
      const unreadIds = notifications
        .filter(n => !n.isSeen)
        .map(n => n.id);
      
      await markAllAsSeen(unreadIds);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isSeen: true })));
      setUnreadCount(0);

    } catch (error) {
      toast(
      'Failed to mark notifications as read',
     
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return format(date, 'MMM dd');
    }
  };

  if (!session?.user || session.user.role !== 'INVESTOR') {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsSeen}
              disabled={isLoading}
              className="h-auto p-0 text-xs"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-3 mb-1 cursor-default"
                  onClick={() => {
                    // Navigate to notification or mark as seen
                    if (!notification.isSeen) {
                      // You can add individual mark as seen here
                    }
                  }}
                >
                  <div className="flex items-start w-full">
                    {notification.image && (
                      <div className="relative h-10 w-10 mr-3 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={notification.image}
                          alt={notification.title}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.isSeen && (
                          <div className="w-2 h-2 rounded-full bg-primary ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
  
      </DropdownMenuContent>
    </DropdownMenu>
  );
}