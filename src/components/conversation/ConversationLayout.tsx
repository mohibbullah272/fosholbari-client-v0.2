'use client';

import { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Sidebar } from '../ui/sidebar';


interface ConversationLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  showSidebar?: boolean;
}

export default function ConversationLayout({
  children,
  sidebarContent,
  showSidebar = true,
}: ConversationLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <div className="h-screen">{children}</div>;
  }

  return (
    <div className="h-screen flex">
      {showSidebar && sidebarContent && (
        <div className="w-80 border-r">
          <Sidebar>{sidebarContent}</Sidebar>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}