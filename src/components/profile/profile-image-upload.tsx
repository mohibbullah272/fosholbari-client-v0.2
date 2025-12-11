// components/profile/profile-image-upload.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UseCloudinaryUploadReturn } from '@/hooks/useCloudinaryUpload';

interface ProfileImageUploadProps {
  uploadHook: UseCloudinaryUploadReturn;
  onImageSelect: (url: string) => void;
  currentImage?: string;
}

export const ProfileImageUpload = ({
  uploadHook,
  onImageSelect,
  currentImage
}: ProfileImageUploadProps) => {
  const { images, uploading, error, handleFileChange, removeImage } = uploadHook;
  const [localImage, setLocalImage] = useState<string | null>(null);

  useEffect(() => {
    if (images) {
      setLocalImage(images);
      onImageSelect(images);
    }
  }, [images, onImageSelect]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = await handleFileChange(e);
    if (imageUrl) {
      setLocalImage(imageUrl);
      onImageSelect(imageUrl);
    }
  };

  const handleRemove = () => {
    removeImage();
    setLocalImage(null);
    onImageSelect('');
  };

  const displayImage = localImage || currentImage;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">প্রোফাইল ছবি</Label>
            <p className="text-sm text-muted-foreground mt-1">
              আপনার প্রোফাইল ছবি আপলোড করুন
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {displayImage ? (
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20">
                  <Image
                    src={displayImage}
                    alt="প্রোফাইল ছবি"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              {displayImage && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="profile-image-upload"
                disabled={uploading}
              />
              
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={uploading}
              >
                <label htmlFor="profile-image-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {displayImage ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}
                </label>
              </Button>
            </div>

            {uploading && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>ছবি আপলোড হচ্ছে...</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 text-center">
            <p className="font-medium">প্রয়োজনীয়তা:</p>
            <ul className="space-y-1">
              <li>• স্পষ্ট এবং সামনের দিকে তোলা ছবি ব্যবহার করুন</li>
              <li>• ফাইল সাইজ ৫MB এর কম হতে হবে</li>
              <li>• JPG, PNG, JPEG ফাইল গ্রহণযোগ্য</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};