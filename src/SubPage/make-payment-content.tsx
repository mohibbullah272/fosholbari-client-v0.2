// app/payments/make-payment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentMethod, CreatePaymentData } from '@/types/payment';
import { paymentApi } from '@/lib/api/payment-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';


import PaymentDetails from '@/SubPage/payment-details';
import PaymentForm from '@/SubPage/payment-form';
import PaymentMethodCard from '@/SubPage/payment-method-card';
import { toast } from 'sonner';


const MakePaymentContent = () => {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get project details from URL params
  const projectId = searchParams?.get('projectId') ?? '';
  const projectName = searchParams?.get('projectName') ?? '';
  const sharePrice = parseFloat(searchParams?.get('sharePrice') ?? '0');

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        const result = await paymentApi.getAllPaymentMethods();
        
        if (result.success) {
          setPaymentMethods(result?.data);
        } else {
          setError('পেমেন্ট মেথড লোড করতে সমস্যা হয়েছে');
        }
      } catch (err: any) {
        console.error('Payment methods fetch error:', err);
        setError('পেমেন্ট মেথড লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowForm(false);
  };

  const handleProceedToForm = () => {
    setShowForm(true);
  };

  const handleBackToMethods = () => {
    setSelectedMethod(null);
    setShowForm(false);
  };

  const handleBackToDetails = () => {
    setShowForm(false);
  };

  const handleSubmit = async (data: CreatePaymentData) => {
    if (!session?.user?.id) {
      setError('ইউজার তথ্য পাওয়া যায়নি');
      return;
    }

    if (!projectId) {
      setError('প্রকল্প আইডি পাওয়া যায়নি');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const paymentData: CreatePaymentData = {
        ...data,
        userId: Number(session.user.id),
        projectId: Number(projectId),
      };

     

      const result = await paymentApi.createPayment(paymentData);

      if (result.success) {
        // Redirect to success page or investments page
        toast.success("payment successful")
        router.push('/projects');
      } else {
        setError(result.message || 'পেমেন্ট সাবমিট করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error('Payment submission error:', err);
      setError(err.message || 'পেমেন্ট সাবমিট করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!projectId || !sharePrice) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="text-destructive">প্রকল্প তথ্য পাওয়া যায়নি</div>
        <Button asChild className="mt-4">
          <Link href="/projects">
            প্রকল্প পেজে ফিরে যান
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              পেমেন্ট করুন
            </h1>
            <p className="text-muted-foreground">
              {projectName} - পেমেন্ট সম্পন্ন করুন
            </p>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{projectName}</h3>
              <p className="text-muted-foreground">প্রতি শেয়ার মূল্য: ৳{sharePrice}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-foreground">পেমেন্ট প্রক্রিয়া</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!selectedMethod ? (
        // Payment Methods Selection
        <div className="space-y-6 ">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">পেমেন্ট মেথড নির্বাচন করুন</h2>
              <p className="text-muted-foreground mb-6">
                আপনার পছন্দের পেমেন্ট মেথড নির্বাচন করুন
              </p>

              {paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  কোনো পেমেন্ট মেথড পাওয়া যায়নি
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      paymentMethod={method}
                      onSelect={handleMethodSelect}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : showForm ? (
        // Payment Form
        <PaymentForm
          paymentMethod={selectedMethod}
          projectId={Number(projectId)}
          sharePrice={sharePrice}
          onBack={handleBackToDetails}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : (
        // Payment Details
        <PaymentDetails
          paymentMethod={selectedMethod}
          onBack={handleBackToMethods}
          onProceed={handleProceedToForm}
        />
      )}
    </div>
  );
};

export default MakePaymentContent;