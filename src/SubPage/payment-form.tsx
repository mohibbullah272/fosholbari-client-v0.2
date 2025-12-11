// components/payments/payment-form.tsx
"use client"
import { PaymentMethod, PaymentMethods, CreatePaymentData } from '@/types/payment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, Building, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import getIcons from '@/components/paymentMethodsIcons';
interface PaymentFormProps {
  paymentMethod: PaymentMethod;
  projectId: number;
  sharePrice: number;
  onBack: () => void;
  onSubmit: (data: CreatePaymentData) => void;
  submitting?: boolean;
}

 const PaymentForm = ({ 
  paymentMethod, 
  projectId, 
  sharePrice, 
  onBack, 
  onSubmit, 
  submitting = false 
}: PaymentFormProps) => {
  const [shareBought, setShareBought] = useState(1);
  const [transactionId, setTransactionId] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');

  const totalAmount = shareBought * sharePrice;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId) {
      alert('ট্রানজেকশন আইডি প্রদান করুন');
      return;
    }

    onSubmit({
      userId: 0, // Will be set in main component
      projectId,
      method: paymentMethod?.methodName,
      amount: totalAmount,
      shareBought,
      totalAmount,
    });
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">পেমেন্ট নিশ্চিতকরণ</h2>
          <p className="text-muted-foreground">
            পেমেন্টের তথ্য প্রদান করুন এবং নিশ্চিত করুন
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">পেমেন্ট সারাংশ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                 {getIcons(paymentMethod.methodName)}
                  <div>
                    <p className="font-semibold text-foreground">{paymentMethod?.methodName}</p>
                    <p className="text-sm text-muted-foreground">{paymentMethod?.number}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">শেয়ার সংখ্যা:</span>
                    <span className="font-semibold text-foreground">{shareBought}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">প্রতি শেয়ার মূল্য:</span>
                    <span className="font-semibold text-foreground">৳{sharePrice}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span className="text-foreground font-semibold">মোট পরিমাণ:</span>
                    <span className="text-primary font-bold">৳{totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">শেয়ার নির্বাচন</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="shares">কতটি শেয়ার কিনতে চান?</Label>
                  <Input
                    id="shares"
                    type="number"
                    min="1"
                    value={shareBought}
                    onChange={(e) => setShareBought(parseInt(e.target.value) || 1)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-muted-foreground">
                    সর্বনিম্ন ১টি শেয়ার কিনতে পারবেন
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">পেমেন্ট তথ্য</CardTitle>
                <CardDescription>
                  পেমেন্ট সম্পন্ন করার পর নিচের তথ্য প্রদান করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">ট্রানজেকশন আইডি *</Label>
                  <Input
                    id="transactionId"
                    placeholder="ট্রানজেকশন আইডি লিখুন"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    পেমেন্ট পাওয়া ট্রানজেকশন আইডি/রেফারেন্স নম্বর
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentNumber">আপনার {paymentMethod?.methodName} নম্বর *</Label>
                  <Input
                    id="paymentNumber"
                    placeholder="আপনার মোবাইল/অ্যাকাউন্ট নম্বর"
                    value={paymentNumber}
                    onChange={(e) => setPaymentNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">অতিরিক্ত তথ্য (ঐচ্ছিক)</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="কোনো বিশেষ নির্দেশনা বা তথ্য থাকলে লিখুন..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-blue-800 mb-3">মনোযোগ দিন</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>পেমেন্টের নির্দেশনা properly follow করুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>ট্রানজেকশন আইডি সঠিকভাবে লিখুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>পেমেন্ট approved হতে ২৪-৪৮ ঘন্টা সময় লাগতে পারে</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">পেমেন্ট নিশ্চিত করুন</h3>
                <p className="text-sm text-muted-foreground">
                  সকল তথ্য সঠিকভাবে প্রদান করেছেন তা নিশ্চিত করুন
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  পিছনে যান
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-[150px]"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'সাবমিট হচ্ছে...' : 'পেমেন্ট নিশ্চিত করুন'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};




export default PaymentForm