// components/investments/investment-card.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, CreditCard, Share2, DollarSign } from 'lucide-react';
import { Investment } from '@/types/investemnt';
import { formatDate } from '@/helpers/formatDate';

interface InvestmentCardProps {
  investment: Investment;
  onViewDetails: (investmentId: number) => void;
}

export const InvestmentCard = ({ investment, onViewDetails }: InvestmentCardProps) => {


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'PENDING': { 
        label: 'বিচারাধীন', 
        variant: 'secondary' as const, 
        description: 'আপনার বিনিয়োগ রিভিউ চলছে' 
      },
      'APPROVED': { 
        label: 'অনুমোদিত', 
        variant: 'default' as const, 
        description: 'বিনিয়োগ সফলভাবে গ্রহণ করা হয়েছে' 
      },
      'REJECTED': { 
        label: 'প্রত্যাখ্যাত', 
        variant: 'destructive' as const, 
        description: 'বিনিয়োগ গ্রহণ করা হয়নি' 
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(investment.status);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardContent className="p-0">
        {/* Header with Status */}
        <div className="bg-muted/50 p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                বিনিয়োগ #{investment.id}
              </h3>
              <p className="text-sm text-muted-foreground">
                ট্রানজেকশন: {investment.user?.phone}
              </p>
            </div>
            <Badge variant={statusConfig.variant} className="w-fit">
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Investment Details */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Share2 className="h-6 w-6 mx-auto mb-1 text-primary" />
              <div className="font-bold text-foreground text-lg">{investment.shareBought}</div>
              <div className="text-xs text-muted-foreground">শেয়ার</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <div className="font-bold text-foreground text-lg">
                ৳{formatCurrency(investment.totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground">পরিমাণ</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <CreditCard className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <div className="font-bold text-foreground text-sm">{investment.method}</div>
              <div className="text-xs text-muted-foreground">পদ্ধতি</div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              পেমেন্ট তথ্য
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
                <p className="font-medium text-foreground">{investment.method}</p>
              </div>
              <div>
                <span className="text-muted-foreground">পেমেন্ট নম্বর:</span>
                <p className="font-medium text-foreground">{investment.paymentNumber}</p>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">
              {statusConfig.description}
            </p>
          </div>

          {/* Date and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(investment.createdAt)}</span>
            </div>
            
            <Button
              onClick={() => onViewDetails(investment.id)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              বিস্তারিত দেখুন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};