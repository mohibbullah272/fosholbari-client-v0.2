// components/payments/payment-method-form.tsx
import { useState } from 'react';
import { PaymentMethods, CreatePaymentMethodData } from '@/types';
import { paymentApi } from '@/lib/api/payment-api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, Smartphone, CreditCard, Building } from 'lucide-react';

// Zod validation schema
const paymentMethodSchema = z.object({
  methodName: z.nativeEnum(PaymentMethods, {
    error: "পেমেন্ট মেথড নির্বাচন করুন",
  }),
  number: z.string()
    .min(1, "নম্বর প্রয়োজন")
    .regex(/^\d+$/, "শুধুমাত্র সংখ্যা allowed"),
  
  accountName: z.string().min(1, "অ্যাকাউন্ট নাম প্রয়োজন"),
  instruction: z.string().min(10, "নির্দেশনা কমপক্ষে ১০ অক্ষর দীর্ঘ হতে হবে"),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  onSuccess?: () => void;
}

export const PaymentMethodForm = ({ onSuccess }: PaymentMethodFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      methodName: undefined,
      number: '',
      accountName: '',
      instruction: '',
    },
  });

  const onSubmit = async (data: PaymentMethodFormValues) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const paymentData: CreatePaymentMethodData = {
        ...data,
        number: data?.number,
      };

      const result = await paymentApi.createPaymentMethod(paymentData);

      if (result.success) {
        setSubmitSuccess(true);
        form.reset();
        onSuccess?.();
        
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(result.message);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'পেমেন্ট মেথড তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // Payment method options with icons and descriptions
  const paymentMethodOptions = [
    {
      value: PaymentMethods.BKASH,
      label: 'বিকাশ',
      icon: Smartphone,
      description: 'মোবাইল ফাইন্যান্স সার্ভিস'
    },
    {
      value: PaymentMethods.NAGAD,
      label: 'নগদ',
      icon: Smartphone,
      description: 'মোবাইল ফাইন্যান্স সার্ভিস'
    },
    {
      value: PaymentMethods.ROCKET,
      label: 'রকেট',
      icon: Smartphone,
      description: 'মোবাইল ফাইন্যান্স সার্ভিস'
    },
    {
      value: PaymentMethods.UPAY,
      label: 'উপায়',
      icon: Smartphone,
      description: 'মোবাইল ফাইন্যান্স সার্ভিস'
    },
    {
      value: PaymentMethods.BANK,
      label: 'ব্যাংক',
      icon: Building,
      description: 'ব্যাংক ট্রান্সফার'
    },
    {
      value: PaymentMethods.UCB,
      label: 'ইউসিবি',
      icon: CreditCard,
      description: 'ব্যাংকিং সার্ভিস'
    },
  ];

  const getMethodIcon = (method: PaymentMethods) => {
    const option = paymentMethodOptions.find(opt => opt.value === method);
    return option?.icon || Smartphone;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">নতুন পেমেন্ট মেথড যোগ করুন</CardTitle>
        <CardDescription>
          গ্রাহকদের জন্য নতুন পেমেন্ট অপশন যোগ করুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Method Type */}
            <FormField
              control={form.control}
              name="methodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পেমেন্ট মেথড *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    গ্রাহকরা কোন পদ্ধতিতে পেমেন্ট করতে পারবেন
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Number */}
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>অ্যাকাউন্ট নম্বর *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="উদা: ০১৭XXXXXXXX"
                      {...field}
                      onChange={(e) => {
                        // Allow only numbers
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch('methodName') === PaymentMethods.BANK || 
                     form.watch('methodName') === PaymentMethods.UCB 
                      ? 'ব্যাংক অ্যাকাউন্ট নম্বর' 
                      : 'মোবাইল নম্বর'
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Name */}
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>অ্যাকাউন্ট নাম *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="অ্যাকাউন্ট হোল্ডারের নাম"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    অ্যাকাউন্ট হোল্ডারের পূর্ণ নাম
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পেমেন্ট নির্দেশনা *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="পেমেন্টের জন্য প্রয়োজনীয় নির্দেশনা লিখুন..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    গ্রাহকদের জন্য পেমেন্ট সম্পূর্ণ করার নির্দেশনা
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Card */}
            {form.watch('methodName') && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {(() => {
                      const IconComponent = getMethodIcon(form.watch('methodName')!);
                      const methodInfo = paymentMethodOptions.find(
                        opt => opt.value === form.watch('methodName')
                      );
                      return (
                        <>
                          <IconComponent className="h-4 w-4" />
                          {methodInfo?.label} প্রিভিউ
                        </>
                      );
                    })()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">নম্বর:</span>
                    <span className="font-medium">{form.watch('number') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">নাম:</span>
                    <span className="font-medium">{form.watch('accountName') || 'N/A'}</span>
                  </div>
                  {form.watch('instruction') && (
                    <div>
                      <span className="text-muted-foreground">নির্দেশনা:</span>
                      <p className="text-sm mt-1">{form.watch('instruction')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Submit Success */}
            {submitSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                পেমেন্ট মেথড সফলভাবে তৈরি হয়েছে!
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitting ? 'সাবমিট হচ্ছে...' : 'পেমেন্ট মেথড যোগ করুন'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={submitting}
              >
                রিসেট করুন
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};