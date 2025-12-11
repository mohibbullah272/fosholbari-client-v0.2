


import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { getAdminNotifications } from '@/actions/notification-action';
import CreateNotificationModal from '@/components/notification/NotificationModal';
import NotificationTable from '@/components/notification/notificationTable';



export default async function NotificationPage({
  searchParams,
}:any) {


  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  
  const data = await getAdminNotifications(page, search);


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Manage and send notifications to users
          </p>
        </div>
        <CreateNotificationModal>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </CreateNotificationModal>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <NotificationTable
          notifications={data?.data?.notifications} 
          meta={data?.meta}
          search={search}
        />
      </div>
    </div>
  );
}