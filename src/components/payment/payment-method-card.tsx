// components/payments/payment-method-card.tsx
import { PaymentMethod, PaymentMethods } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Copy } from 'lucide-react';
import getIcons from '../paymentMethodsIcons';


interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (methodId: number) => void;
}

export const PaymentMethodCard = ({ paymentMethod, onEdit, onDelete }: PaymentMethodCardProps) => {
  // Payment method display configuration
  const getMethodConfig = (method: PaymentMethods) => {
    const configs = {
      [PaymentMethods.BKASH]: { label: 'বিকাশ',  color: 'bg-pink-400' },
      [PaymentMethods.NAGAD]: { label: 'নগদ',  color: 'bg-red-400' },
      [PaymentMethods.ROCKET]: { label: 'রকেট',  color: 'bg-purple-400' },
      [PaymentMethods.UPAY]: { label: 'উপায়',  color: 'bg-yellow-400' },
      [PaymentMethods.BANK]: { label: 'ব্যাংক',  color: 'bg-gray-400' },
      [PaymentMethods.UCB]: { label: 'ইউসিবি',  color: 'bg-slate-300' },
    };
    return configs[method];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const config = getMethodConfig(paymentMethod?.methodName);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        {/* Header with Method Type */}
        <div className={`${config.color} text-white p-4 rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
       {getIcons(config.label)}
              <h3 className="font-semibold text-lg">{config.label}</h3>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {paymentMethod.number.toString()}
            </Badge>
          </div>
        </div>

        {/* Payment Method Details */}
        <div className="p-4 space-y-4">
          {/* Account Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">অ্যাকাউন্ট নাম:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{paymentMethod.accountName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(paymentMethod.accountName)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">অ্যাকাউন্ট নম্বর:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{paymentMethod.number}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(paymentMethod.number.toString())}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {paymentMethod.instruction && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-foreground mb-2">নির্দেশনা:</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {paymentMethod.instruction}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(paymentMethod)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              সংশোধন
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onDelete(paymentMethod.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              মুছুন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};