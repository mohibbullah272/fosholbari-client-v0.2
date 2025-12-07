// components/investments/investment-details-modal.tsx
import { useState, useEffect } from 'react';
import { Investment, InvestmentDetails } from '@/types';
import { investmentApi } from '@/lib/api/investment-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, User, Phone, Calendar, CreditCard, MapPin, Share2, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { formatDate } from '@/helpers/formatDate';

interface InvestmentDetailsModalProps {
  investment: Investment | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void; // Optional callback to refresh parent component
}

export const InvestmentDetailsModal = ({ 
  investment, 
  open, 
  onClose, 
  onStatusUpdate 
}: InvestmentDetailsModalProps) => {
  const [details, setDetails] = useState<InvestmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showStatusSelect, setShowStatusSelect] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>("PENDING");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!investment || !open) return;

      setLoading(true);
      setError(null);

      try {
        const result = await investmentApi.getInvestmentDetails(investment.id);
        
        if (result.success) {
          setDetails(result.data);
          setSelectedStatus(result.data.status); // Set initial status
        } else {
          setError(result.message);
        }
      } catch (err: any) {
        setError('বিস্তারিত লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [investment, open]);

  const handleStatusUpdate = async () => {
    if (!investment || !selectedStatus) return;

    setStatusUpdating(true);
    try {
      const result = await investmentApi.updateInvestmentStatus(investment.id, selectedStatus);
      
      if (result.success) {
        // Update local state
        if (details) {
          setDetails({
            ...details,
            status: selectedStatus
          });
        }
        
        // Close the select form
        setShowStatusSelect(false);
        
      toast.success('status updated')
        setError(null);
        
        // Call parent callback to refresh data if provided
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleStatusBadgeClick = () => {
    if (investment?.status === 'APPROVED') return; // Don't allow changes for approved status if needed
    setShowStatusSelect(true);
    setSelectedStatus(investment?.status || 'PENDING');
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'PENDING': { label: 'বিচারাধীন', variant: 'secondary' as const },
      'APPROVED': { label: 'অনুমোদিত', variant: 'default' as const },
      'REJECTED': { label: 'প্রত্যাখ্যাত', variant: 'destructive' as const },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  if (!investment) return null;

  const statusConfig = getStatusConfig(details?.status || investment.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">বিনিয়োগের বিস্তারিত তথ্য</DialogTitle>
          <DialogDescription>
            ট্রানজেকশন: {details?.user.phone}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>বিস্তারিত লোড হচ্ছে...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            <Card className={`border-l-4 ${
              (details?.status || investment.status) === 'APPROVED' ? 'border-l-green-500' :
              (details?.status || investment.status) === 'REJECTED' ? 'border-l-red-500' :
              'border-l-yellow-500'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">বর্তমান অবস্থা</h3>
                    <p className="text-sm text-muted-foreground">
                      বিনিয়োগের বর্তমান স্ট্যাটাস
                    </p>
                  </div>
                  
                  {showStatusSelect ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                        disabled={statusUpdating}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">বিচারাধীন</SelectItem>
                          <SelectItem value="APPROVED">অনুমোদিত</SelectItem>
                          <SelectItem value="REJECTED">প্রত্যাখ্যাত</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleStatusUpdate}
                        disabled={statusUpdating}
                        size="sm"
                      >
                        {statusUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'আপডেট'
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowStatusSelect(false)}
                        variant="outline"
                        size="sm"
                        disabled={statusUpdating}
                      >
                        বাতিল
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={handleStatusBadgeClick}
                    >
                      <Badge variant={statusConfig.variant} className="text-lg py-1 px-3">
                        {statusConfig.label}
                      </Badge>
                      {(details?.status || investment.status) !== 'APPROVED' && (
                        <span className="text-xs text-muted-foreground">(ক্লিক করে পরিবর্তন করুন)</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - User & Payment Info */}
              <div className="space-y-6">
                {/* User Information */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      বিনিয়োগকারীর তথ্য
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">নাম:</span>
                        <span className="font-medium text-foreground">{investment.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ফোন নম্বর:</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {investment.user.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ইউজার আইডি:</span>
                        <span className="font-medium text-foreground">#{investment.userId}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      পেমেন্ট তথ্য
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
                        <span className="font-medium text-foreground">{investment.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">পেমেন্ট নম্বর:</span>
                        <span className="font-medium text-foreground">{investment.user.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Project Info */}
              <div className="space-y-6">
                {details?.project && (
                  <>
                    {/* Project Information */}
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-foreground mb-4">প্রকল্পের তথ্য</h4>
                        
                        {/* Project Image */}
                        {details.project.image.length > 0 && (
                          <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                            <Image
                              src={details.project.image[0]}
                              alt={details.project.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <span className="text-muted-foreground">প্রকল্পের নাম:</span>
                            <p className="font-medium text-foreground">{details.project.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">অবস্থান:</span>
                            <span className="font-medium text-foreground">{details.project.location}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">বর্ণনা:</span>
                            <p className="text-sm text-foreground mt-1 line-clamp-3">
                              {details.project.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Investment Summary */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  বিনিয়োগ সারাংশ
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">শেয়ার সংখ্যা:</span>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-foreground text-lg">{investment.shareBought}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">মোট বিনিয়োগ:</span>
                    <span className="font-bold text-foreground text-lg">
                      {formatCurrency(investment.totalAmount)}
                    </span>
                  </div>
                  {details?.project && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">প্রতি শেয়ার মূল্য:</span>
                      <span className="font-medium text-foreground">
                        ৳{details.project.sharePrice}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Information */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  সময়রেখা
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বিনিয়োগের তারিখ:</span>
                    <span className="font-medium text-foreground">{formatDate(investment.createdAt)}</span>
                  </div>
                 
                  {details?.project && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">মেয়াদ উত্তীর্ণ:</span>
                        <span className="font-medium text-foreground">{formatDate(details.project.expireDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">সম্পূর্ণ হওয়ার তারিখ:</span>
                        <span className="font-medium text-foreground">{formatDate(details.project.Duration)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};