'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';
import { createNotification } from '@/actions/notification-action';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  image: z.string().optional(),
  userIds: z.string().optional(),
});

export default function CreateNotificationModal({ children }:{children:any}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Use the hook
  const cloudinary = useCloudinaryUpload();
  const uploadedImage = cloudinary.images[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      image: '',
      userIds: '',
    },
  });

  // Handle image upload
  // const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   try {
  //     const url = await cloudinary.handleFileChange(e);
  //     if (url) {
  //       form.setValue('image', url);
  //     }
  //   } catch (err) {
  //     console.error('Upload failed:', err);
  //   }
  // };

  // Submit form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    
    try {
      // Parse user IDs
      const userIds = values.userIds 
        ? values.userIds.split(',').map(id => {
            const num = parseInt(id.trim());
            return isNaN(num) ? null : num;
          }).filter((id): id is number => id !== null)
        : [];

      // Prepare data
      const notificationData = {
        title: values.title,
        content: values.content,
        image: uploadedImage || values.image || undefined,
        userIds,
      };

      // Create notification
      await createNotification(notificationData);
      
      // Success
      toast.success('Notification created successfully!');
      
      // Reset
      form.reset();
      cloudinary.clearImages();
      setOpen(false);
      
    } catch (error) {
      toast.error('Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
          <DialogDescription>Send notification to users</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Simple form fields - just like your login form */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Simple image upload */}
            <div>
              <FormLabel>Image (Optional)</FormLabel>
              
              {uploadedImage && (
                <div className="mb-2 relative">
                  <Image
                    src={uploadedImage}
                    alt="Preview"
                    width={200}
                    height={150}
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1"
                    onClick={() => {
                      cloudinary.removeImage(0);
                      form.setValue('image', '');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

       

              <p className="text-sm text-muted-foreground mt-1">
               enter URL:
              </p>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User IDs (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="1,2,3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading || cloudinary.uploading}>
                {loading || cloudinary.uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}