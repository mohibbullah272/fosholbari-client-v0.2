// components/payments/payment-details.tsx
"use client"
import { PaymentMethod, PaymentMethods } from '@/types/payment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {  CreditCard,  Copy, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import getIcons from '@/components/paymentMethodsIcons';


interface PaymentDetailsProps {
  paymentMethod: PaymentMethod | null;
  onBack: () => void;
  onProceed: () => void;
}

const PaymentDetails = ({ paymentMethod, onBack, onProceed }: PaymentDetailsProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Safe method configuration with fallbacks
  const getMethodConfig = (method: PaymentMethods) => {
    const defaultConfig = { 
      label: 'পেমেন্ট মেথড', 
      icon: CreditCard, 
      color: 'bg-gray-500',
      steps: [
        'পেমেন্ট অ্যাপে লগইন করুন',
        'Send Money এ ক্লিক করুন',
        'প্রয়োজনীয় নম্বর দিন',
        'সঠিক পরিমাণ লিখুন',
        'রেফারেন্স যোগ করুন',
        'ট্রানজেকশন কনফার্ম করুন'
      ]
    };

    const configs = {
      [PaymentMethods.BKASH]: { 
        label: 'বিকাশ', 
 
        color: 'bg-red-500',
        steps: [
          'বিকাশ অ্যাপে লগইন করুন',
          'Send Money এ ক্লিক করুন',
          `নম্বর: ${paymentMethod?.number || 'প্রয়োজনীয় নম্বর'} দিন`,
          `পরিমাণ: [আপনার পরিমাণ] দিন`,
          `রেফারেন্স: আপনার নাম লিখুন`,
          'পিন নম্বর দিয়ে কনফার্ম করুন'
        ]
      },
      [PaymentMethods.NAGAD]: { 
        label: 'নগদ', 
 
        color: 'bg-purple-500',
        steps: [
          'নগদ অ্যাপে লগইন করুন',
          'Send Money এ ক্লিক করুন',
          `নম্বর: ${paymentMethod?.number || 'প্রয়োজনীয় নম্বর'} দিন`,
          `পরিমাণ: [আপনার পরিমাণ] দিন`,
          `রেফারেন্স: আপনার নাম লিখুন`,
          'পিন নম্বর দিয়ে কনফার্ম করুন'
        ]
      },
      [PaymentMethods.ROCKET]: { 
        label: 'রকেট', 

        color: 'bg-blue-500',
        steps: [
          'রকেট অ্যাপে লগইন করুন',
          'Send Money এ ক্লিক করুন',
          `নম্বর: ${paymentMethod?.number || 'প্রয়োজনীয় নম্বর'} দিন`,
          `পরিমাণ: [আপনার পরিমাণ] দিন`,
          `রেফারেন্স: আপনার নাম লিখুন`,
          'পিন নম্বর দিয়ে কনফার্ম করুন'
        ]
      },
      [PaymentMethods.UPAY]: { 
        label: 'উপায়', 

        color: 'bg-green-500',
        steps: [
          'উপায় অ্যাপে লগইন করুন',
          'Send Money এ ক্লিক করুন',
          `নম্বর: ${paymentMethod?.number || 'প্রয়োজনীয় নম্বর'} দিন`,
          `পরিমাণ: [আপনার পরিমাণ] দিন`,
          `রেফারেন্স: আপনার নাম লিখুন`,
          'পিন নম্বর দিয়ে কনফার্ম করুন'
        ]
      },
      [PaymentMethods.BANK]: { 
        label: 'ব্যাংক', 
     
        color: 'bg-gray-500',
        steps: [
          'আপনার ব্যাংক অ্যাপ/ইন্টারনেট ব্যাংকিং এ লগইন করুন',
          'Send Money/Fund Transfer নির্বাচন করুন',
          `অ্যাকাউন্ট নম্বর: ${paymentMethod?.number || 'প্রয়োজনীয় নম্বর'} দিন`,
          `পরিমাণ: [আপনার পরিমাণ] দিন`,
          `অ্যাকাউন্ট নাম: ${paymentMethod?.accountName || 'প্রয়োজনীয় নাম'}`,
          'ট্রানজেকশন কনফার্ম করুন'
        ]
      },
      [PaymentMethods.UCB]: { 
        label: 'ইউসিবি', 
   
        color: 'bg-orange-500',
        steps: [
          'ইউসিবি অ্যাপ/ইন্টারনেট ব্যাংকিং এ লগইন করুন',
          'Fund Transfer নির্বাচন করুন',
          `অ্যাকাউন্ট নম্বর: ${paymentMethod?.number || 'প্রয়োজনীয় নম্বর'} দিন`,
          `পরিমাণ: [আপনার পরিমাণ] দিন`,
          `অ্যাকাউন্ট নাম: ${paymentMethod?.accountName || 'প্রয়োজনীয় নাম'}`,
          'ট্রানজেকশন কনফার্ম করুন'
        ]
      },
    };

    return configs[method] || defaultConfig;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Return loading state if paymentMethod is not available
  if (!paymentMethod) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">পেমেন্ট নির্দেশনা</h2>
            <p className="text-muted-foreground">পেমেন্ট মেথড লোড হচ্ছে...</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">পেমেন্ট তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const config = getMethodConfig(paymentMethod.methodName);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">পেমেন্ট নির্দেশনা</h2>
          <p className="text-muted-foreground">
            {config.label} এর মাধ্যমে পেমেন্ট সম্পন্ন করুন
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Payment Information */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full  text-white`}>
             {getIcons(config.label)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{config.label}</h3>
                  <p className="text-muted-foreground">পেমেন্ট মেথড</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">অ্যাকাউন্ট নম্বর</p>
                    <p className="font-semibold text-foreground text-lg">
                      {paymentMethod.number || 'N/A'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paymentMethod.number?.toString() || '', 'number')}
                    className="flex items-center gap-2"
                    disabled={!paymentMethod.number}
                  >
                    {copiedField === 'number' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    কপি
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">অ্যাকাউন্ট নাম</p>
                    <p className="font-semibold text-foreground">
                      {paymentMethod.accountName || 'N/A'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paymentMethod.accountName || '', 'name')}
                    className="flex items-center gap-2"
                    disabled={!paymentMethod.accountName}
                  >
                    {copiedField === 'name' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    কপি
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Instructions */}
          {paymentMethod.instruction && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-foreground mb-4">বিশেষ নির্দেশনা</h4>
                <div className="prose prose-sm text-muted-foreground">
                  <p>{paymentMethod.instruction}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Payment Steps */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">পেমেন্ট স্টেপস</CardTitle>
              <CardDescription>
                নিচের স্টেপস ফলো করে পেমেন্ট সম্পন্ন করুন
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-sm text-foreground pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-amber-800 mb-3">গুরুত্বপূর্ণ নোট</h4>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>পেমেন্টের সময় সঠিক অ্যাকাউন্ট নম্বর নিশ্চিত করুন</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>ট্রানজেকশন আইডি/রেফারেন্স নম্বর সেভ করে রাখুন</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>পেমেন্ট সম্পন্ন হলে নিচের ফর্মটি পূরণ করুন</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proceed Button */}
      <div className="flex justify-end">
        <Button onClick={onProceed} size="lg" className="min-w-[200px]">
          পরবর্তী ধাপ
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentDetails;