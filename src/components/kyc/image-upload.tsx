// components/kyc/image-upload.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Eye } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { UseCloudinaryUploadReturn } from '@/hooks/useCloudinaryUpload';

interface ImageUploadProps {
  title: string;
  description: string;
  uploadHook: UseCloudinaryUploadReturn;
  onImageSelect: (url: string) => void;
  required?: boolean;
  currentImage?: string;
}

export const ImageUpload = ({
  title,
  description,
  uploadHook,
  onImageSelect,
  required = false,
  currentImage
}: ImageUploadProps) => {
  const { images, uploading, error, handleFileChange, removeImage } = uploadHook;
  const [localImage, setLocalImage] = useState<string | null>(null);

  // Update local image when hook image changes
  useEffect(() => {
    if (images) {
      setLocalImage(images);
      onImageSelect(images); // Call the callback when image is ready
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
            <Label className="text-base font-medium">
              {title}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>

          {currentImage && !localImage && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">বর্তমান ছবি:</p>
              <div className="relative inline-block">
                <div className="relative h-40 w-64 rounded-lg overflow-hidden border">
                  <Image
                    src={currentImage}
                    alt="বর্তমান ছবি"
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                  asChild
                >
                  <a href={currentImage} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`upload-${title.replace(/\s+/g, '-')}`}
              disabled={uploading}
            />
            
            {!displayImage ? (
              <label
                htmlFor={`upload-${title.replace(/\s+/g, '-')}`}
                className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  uploading ? 'opacity-50' : ''
                }`}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">ক্লিক করুন আপলোড করতে</span>
                  <br />
                  JPG, PNG, JPEG (সর্বোচ্চ ৫MB)
                </div>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <div className="relative h-40 w-64 rounded-lg overflow-hidden border mx-auto">
                    <Image
                      src={displayImage}
                      alt="আপলোডকৃত ছবি"
                      fill
                      className="object-cover"
                      sizes="256px"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  ছবি আপলোড সম্পন্ন হয়েছে
                </div>
              </div>
            )}

            {uploading && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>ছবি আপলোড হচ্ছে...</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg mt-2">
                {error}
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">প্রয়োজনীয়তা:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>ছবিটি স্পষ্ট এবং পড়া যাবে এমন হতে হবে</li>
              <li>ফাইল সাইজ ৫MB এর কম হতে হবে</li>
              <li>শুধুমাত্র JPG, PNG, JPEG ফাইল গ্রহণযোগ্য</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};