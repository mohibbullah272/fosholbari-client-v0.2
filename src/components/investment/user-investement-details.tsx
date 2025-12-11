// components/investments/investment-details-modal.tsx
import { useState, useEffect } from 'react';

import { investmentApi } from '@/lib/api/investment-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, User, Phone, Calendar, CreditCard, Share2, DollarSign, MapPin, Copy, Download } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/helpers/formatDate';
import { downloadPdf } from '@/helpers/DownloadPdf';



interface InvestmentDetailsModalProps {
  investmentId: number | null;
  open: boolean;
  onClose: () => void;
}

export const InvestmentDetailsModal = ({ investmentId, open, onClose }: InvestmentDetailsModalProps) => {
  const [details, setDetails] = useState<any  | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!investmentId || !open) return;

      setLoading(true);
      setError(null);
      setDetails(null);

      try {
        const result = await investmentApi.getInvestmentDetails(investmentId);
        
        if (result.success) {
          setDetails(result.data);
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
  }, [investmentId, open]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!investmentId) return null;
const pdfData ={
 investmentId,
 investmentStatus:details?.status,
 totalShareBought : details?.shareBought,
 totalAmount : details?.totalAmount,
 paymentMethod:details?.method,
 userName : details?.user?.name,
 userPhone : details?.user?.phone,
 projectName : details?.project?.name,
 projectLocation:details?.project?.location,
 projectDuration:details?.project?.Duration,
 investmentDate : details?.createdAt,
 ROI : details?.project?.estimatedROI


}
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">বিনিয়োগের বিস্তারিত তথ্য</DialogTitle>
          <DialogDescription>
            বিনিয়োগ # {investmentId} - সম্পূর্ণ বিবরণ
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
        ) : details ? (
          <div id='user_investment' className="space-y-6">
            {/* Status Banner */}
            <Card className={`border-l-4 ${
              details.status === 'APPROVED' ? 'border-l-green-500' :
              details.status === 'REJECTED' ? 'border-l-red-500' :
              'border-l-amber-500'
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">বিনিয়োগ অবস্থা</h3>
                    <p className="text-sm text-muted-foreground">
                      আপনার বিনিয়োগের বর্তমান স্ট্যাটাস
                    </p>
                  </div>
                  <Badge variant={getStatusConfig(details.status).variant} className="text-lg py-2 px-4">
                    {getStatusConfig(details.status).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 ">
              {/* Left Column - Investment & Payment Info */}
              <div className="space-y-6">
                {/* Investment Information */}
                <Card >
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      বিনিয়োগ তথ্য
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <Share2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="font-bold text-foreground text-xl">{details.shareBought}</div>
                          <div className="text-muted-foreground">শেয়ার সংখ্যা</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                          <div className="font-bold text-foreground text-xl">
                            ৳{formatCurrency(details.totalAmount)}
                          </div>
                          <div className="text-muted-foreground">মোট বিনিয়োগ</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      পেমেন্ট বিবরণ
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{details.method}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(details.Method)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">পেমেন্ট নম্বর:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{details.user.phone}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(details.user.phone)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    
                    </div>
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      আপনার তথ্য
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">নাম:</span>
                        <span className="font-medium text-foreground">{details.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ফোন নম্বর:</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {details.user.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ইউজার আইডি:</span>
                        <span className="font-medium text-foreground">#{details.userId}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Project Info */}
              <div className="space-y-6">
                {/* Project Information */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4">প্রকল্প তথ্য</h4>
                    
                    {/* Project Image */}
                    {details.project.image.length > 0 && (
                      <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
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

                {/* Project Financials */}
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-foreground mb-4">আর্থিক তথ্য</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="font-bold text-foreground text-lg">{ parseInt(details.project.estimatedROI).toFixed()}%</div>
                        <div className="text-muted-foreground">গড় লাভ</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="font-bold text-foreground text-lg">৳{details.project.sharePrice}</div>
                        <div className="text-muted-foreground">শেয়ার মূল্য</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="font-bold text-foreground text-lg">৳{details.project.profitPerShare}</div>
                        <div className="text-muted-foreground">লাভ/শেয়ার</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="font-bold text-foreground text-lg">
                          ৳{formatCurrency(parseFloat(details.shareBought) * parseFloat(details.project.profitPerShare))}
                        </div>
                        <div className="text-muted-foreground">আনুমানিক লাভ</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

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
                    <span className="font-medium text-foreground">{formatDate(details.createdAt)}</span>
                  </div>
          
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">প্রকল্প মেয়াদ:</span>
                    <span className="font-medium text-foreground">{formatDate(details.project.expireDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">সম্পূর্ণ হওয়ার তারিখ:</span>
                    <span className="font-medium text-foreground">{formatDate(details.project.Duration)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Close Button */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            বন্ধ করুন
          </Button>
          <Button onClick={()=>downloadPdf({
            type:"investment",
            data:pdfData
          })}>
            <Download />
            পিডিএফ ডাউনলোড করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};