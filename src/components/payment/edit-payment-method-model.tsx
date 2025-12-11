// components/payments/edit-payment-method-modal.tsx
import { useState, useEffect } from 'react';
import { PaymentMethod, PaymentMethods, UpdatePaymentMethodData } from '@/types';
import { paymentApi } from '@/lib/api/payment-api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, Smartphone, CreditCard, Building } from 'lucide-react';

// Zod validation schema for update
const updatePaymentMethodSchema = z.object({
  methodName: z.nativeEnum(PaymentMethods, {
    error: "পেমেন্ট মেথড নির্বাচন করুন",
  }).optional(),
  number: z.string()
    .min(1, "নম্বর প্রয়োজন")
    .regex(/^\d+$/, "শুধুমাত্র সংখ্যা allowed")
    .optional(),
  accountName: z.string().min(1, "অ্যাকাউন্ট নাম প্রয়োজন").optional(),
  instruction: z.string().min(10, "নির্দেশনা কমপক্ষে ১০ অক্ষর দীর্ঘ হতে হবে").optional(),
}).refine(data => Object.values(data).some(val => val !== undefined), {
  message: "কমপক্ষে একটি ফিল্ড আপডেট করুন"
});

type UpdatePaymentMethodFormValues = z.infer<typeof updatePaymentMethodSchema>;

interface EditPaymentMethodModalProps {
  paymentMethod: PaymentMethod | null;
  open: boolean;
  onClose: () => void;
  onPaymentMethodUpdated: () => void;
}

export const EditPaymentMethodModal = ({ 
  paymentMethod, 
  open, 
  onClose, 
  onPaymentMethodUpdated 
}: EditPaymentMethodModalProps) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdatePaymentMethodFormValues>({
    resolver: zodResolver(updatePaymentMethodSchema),
    defaultValues: {
      methodName: undefined,
      number: '',
      accountName: '',
      instruction: '',
    },
  });

  // Reset form when payment method changes
  useEffect(() => {
    if (paymentMethod) {
      form.reset({
        methodName: paymentMethod?.methodName,
        number: paymentMethod.number.toString(),
        accountName: paymentMethod.accountName,
        instruction: paymentMethod.instruction,
      });
    }
  }, [paymentMethod, form]);

  const onSubmit = async (data: UpdatePaymentMethodFormValues) => {
    if (!paymentMethod) return;

    setUpdating(true);
    setError(null);

    try {
      const updateData: UpdatePaymentMethodData = {
        ...data,
        number: data?.number,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdatePaymentMethodData] === undefined) {
          delete updateData[key as keyof UpdatePaymentMethodData];
        }
      });

      const result = await paymentApi.updatePaymentMethod(paymentMethod.id, updateData);

      if (result.success) {
        onPaymentMethodUpdated();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  // Payment method options
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

  if (!paymentMethod) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">পেমেন্ট মেথড সংশোধন করুন</DialogTitle>
          <DialogDescription>
            {paymentMethod.accountName} - পেমেন্ট মেথডের তথ্য আপডেট করুন
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Method Type */}
            <FormField
              control={form.control}
              name="methodName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পেমেন্ট মেথড</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="বর্তমান: বিকাশ" />
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
                    পেমেন্ট মেথড টাইপ পরিবর্তন করুন (ঐচ্ছিক)
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
                  <FormLabel>অ্যাকাউন্ট নম্বর</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="বর্তমান নম্বর: ০১৭XXXXXXXX"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    নতুন অ্যাকাউন্ট নম্বর দিন (ঐচ্ছিক)
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
                  <FormLabel>অ্যাকাউন্ট নাম</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="বর্তমান নাম: জন আব্দুল"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    নতুন অ্যাকাউন্ট নাম দিন (ঐচ্ছিক)
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
                  <FormLabel>পেমেন্ট নির্দেশনা</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="নতুন নির্দেশনা লিখুন..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    পেমেন্ট নির্দেশনা আপডেট করুন (ঐচ্ছিক)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updating}
                className="min-w-[120px]"
              >
                {updating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {updating ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updating}
              >
                বাতিল করুন
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};