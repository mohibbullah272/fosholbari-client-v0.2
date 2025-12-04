// components/projects/progress-update-modal.tsx
import { useState, useEffect } from 'react';
import { IProject, ProgressUpdateData } from '@/types';
import { projectApi } from '@/lib/api/project-api';
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, X, Plus, Minus, Calendar } from 'lucide-react';
import Image from 'next/image';

interface ProgressUpdateModalProps {
  project: IProject | null;
  open: boolean;
  onClose: () => void;
  onProgressUpdated: () => void;
}

export const ProgressUpdateModal = ({ 
  project, 
  open, 
  onClose, 
  onProgressUpdated 
}: ProgressUpdateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<{ text: string; date: string }[]>([{ text: '', date: '' }]);
  
  const { 
    images, 
    uploading, 
    error: uploadError, 
    handleFileChange, 
    removeImage,
    clearImages 
  } = useCloudinaryUpload();

  // Initialize with existing progress data
  useEffect(() => {
    if (project && open) {
      const existingUpdates = project?.progressUpdate?.map((text, index) => ({
        text,
        date: project?.progressUpdateDate?.[index] ? 
              new Date(project.progressUpdateDate[index]).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0]
      })) || [];
      
      setUpdates(existingUpdates.length > 0 ? existingUpdates : [{ text: '', date: new Date().toISOString().split('T')[0] }]);
    }
  }, [project, open]);

  // Convert date string to full ISO DateTime
  const convertToISODateTime = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();
    
    try {
      // Add time part to make it a full DateTime
      const date = new Date(dateString);
      // If it's already a full ISO string, return as is
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      // If it's just a date string (YYYY-MM-DD), add time
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyRegex.test(dateString)) {
        return new Date(dateString + 'T00:00:00.000Z').toISOString();
      }
      
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    // Filter out empty updates
    const filteredUpdates = updates.filter(update => update.text?.trim() !== '');
    
    if (filteredUpdates.length === 0 && images.length === 0) {
      setError('কমপক্ষে একটি অগ্রগতি হালনাগাদ বা ছবি যোগ করুন');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: ProgressUpdateData = {
        progressUpdateImage: [
          ...(project?.progressUpdateImage || []),
          ...images
        ],
        progressUpdate: [
          ...(project?.progressUpdate || []),
          ...filteredUpdates.map(update => update.text)
        ],
        progressUpdateDate: [
          ...(project?.progressUpdateDate || []),
          ...filteredUpdates.map(update => convertToISODateTime(update.date))
        ]
      };

   

      const result = await projectApi.updateProjectProgress(project?.id, updateData);

      if (result?.success) {
        onProgressUpdated();
        onClose();
        clearImages();
        setUpdates([{ text: '', date: new Date().toISOString().split('T')[0] }]);
      } else {
        setError(result?.message || 'আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      setError(err?.message || 'আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChange = (index: number, field: 'text' | 'date', value: string) => {
    const newUpdates = [...updates];
    newUpdates[index] = {
      ...newUpdates[index],
      [field]: value
    };
    setUpdates(newUpdates);
  };

  const addUpdateField = () => {
    setUpdates(prev => [...prev, { text: '', date: new Date().toISOString().split('T')[0] }]);
  };

  const removeUpdateField = (index: number) => {
    if (updates.length > 1) {
      setUpdates(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">অগ্রগতি হালনাগাদ করুন</DialogTitle>
          <DialogDescription>
            {project?.name} - প্রকল্পের অগ্রগতি সম্পর্কিত তথ্য যোগ করুন
          </DialogDescription>
        </DialogHeader>

        {/* Project Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-foreground">{project?.name}</h4>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{project?.location}</Badge>
            <span>মোট শেয়ার: {project?.totalShare}</span>
            <span>শেয়ার মূল্য: ৳{project?.sharePrice}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress Images Section */}
          <div className="space-y-4">
            <Label>অগ্রগতির ছবি যোগ করুন</Label>
            
            {/* Current Progress Images */}
            {project?.progressUpdateImage?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">বর্তমান অগ্রগতির ছবি:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {project?.progressUpdateImage?.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={img}
                        alt={`অগ্রগতি ছবি ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="progress-images"
              />
              <label
                htmlFor="progress-images"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">নতুন ছবি আপলোড করুন</span>
                  <br />
                  সর্বোচ্চ ৪টি ছবি (PNG, JPG, JPEG)
                </div>
              </label>
            </div>

            {/* New Images Preview */}
            {images?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">নতুন ছবি:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images?.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden border">
                        <Image
                          src={imageUrl}
                          alt={`নতুন ছবি ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>ছবি আপলোড হচ্ছে...</span>
              </div>
            )}
          </div>

          {/* Progress Updates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>অগ্রগতি হালনাগাদ</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUpdateField}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                নতুন হালনাগাদ
              </Button>
            </div>

            <div className="space-y-3">
              {updates?.map((update, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Textarea
                          value={update?.text}
                          onChange={(e) => handleUpdateChange(index, 'text', e.target.value)}
                          placeholder="অগ্রগতি সম্পর্কিত বিস্তারিত লিখুন..."
                          className="min-h-[80px]"
                        />
                      </div>
                      {updates?.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeUpdateField(index)}
                          className="flex-shrink-0 h-10 w-10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={formatDateForInput(update?.date)}
                        onChange={(e) => handleUpdateChange(index, 'date', e.target.value)}
                        className="w-40"
                      />
                      <span className="text-sm text-muted-foreground">
                        হালনাগাদের তারিখ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {(uploadError || error) && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {uploadError || error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading || uploading}
              className="min-w-[120px]"
            >
              {(loading || uploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {loading ? 'সেভ হচ্ছে...' : 'হালনাগাদ করুন'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              বাতিল করুন
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};