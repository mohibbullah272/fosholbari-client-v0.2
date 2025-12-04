// app/kyc/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { KYCData, CreateKYCData, KycStatus } from '@/types/kyc';
import { kycApi } from '@/lib/api/kyc-api';

import { KYCStatus } from '@/components/kyc/kyc-status';
import { ImageUpload } from '@/components/kyc/image-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, Shield, FileText, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

const KYCVerification = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [documentType, setDocumentType] = useState<'nid' | 'birthCertificate' | 'passport'>('nid');
  const [documentNumber, setDocumentNumber] = useState('');
  const [userImage, setUserImage] = useState('');
  const [documentImage, setDocumentImage] = useState('');
  const [additionalDocumentImage, setAdditionalDocumentImage] = useState('');

  // Upload hooks
  const userImageUpload = useCloudinaryUpload();
  const documentImageUpload = useCloudinaryUpload();
  const additionalDocUpload = useCloudinaryUpload();

  // Fetch KYC data
  useEffect(() => {
    const fetchKYCData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const result = await kycApi.getUserKYC(Number(session.user.id));
        
        if (result.success && result.data) {
          setKycData(result.data);
          // Pre-fill form with existing data
          if (result.data.userImage) setUserImage(result.data.userImage);
          if (result.data.nidImage) {
            setDocumentImage(result.data.nidImage);
            setDocumentType('nid');
            if (result.data.nidNumber) setDocumentNumber(result.data.nidNumber.toString());
          }
          if (result.data.passportImage) {
            setDocumentImage(result.data.passportImage);
            setDocumentType('passport');
            if (result.data.passportNumber) setDocumentNumber(result.data.passportNumber.toString());
          }
          if (result.data.birthCertificateImage) {
            setDocumentImage(result.data.birthCertificateImage);
            setDocumentType('birthCertificate');
            if (result.data.birthCertificateNumber) setDocumentNumber(result.data.birthCertificateNumber.toString());
          }
        }
      } catch (err: any) {
        console.error('KYC fetch error:', err);
        // Don't show error if no KYC found (404 is expected for new users)
        if (err.message.includes('404')) {
          setKycData(null);
        } else {
          setError('KYC তথ্য লোড করতে সমস্যা হয়েছে');
        }
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === 'authenticated') {
      fetchKYCData();
    }
  }, [session, sessionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

  
    if (!session?.user?.id) {
      setError('ইউজার তথ্য পাওয়া যায়নি');
      return;
    }
  
    // Validation
    if (!userImage) {
   
      setError('আপনার ছবি আপলোড করা বাধ্যতামূলক');
      return;
    }
  
    if (!documentImage) {
   
      setError('ডকুমেন্ট ছবি আপলোড করা বাধ্যতামূলক');
      return;
    }
  
    if (!documentNumber) {

      setError('ডকুমেন্ট নম্বর প্রদান করা বাধ্যতামূলক');
      return;
    }
  
    setSubmitting(true);
    setError(null);
  
    try {
      const submitData: CreateKYCData = {
        userId: Number(session.user.id),
        userImage,
        status: KycStatus.PENDING,
      };
  
      // Add document-specific data
      if (documentType === 'nid') {
        submitData.nidNumber = parseInt(documentNumber);
        submitData.nidImage = documentImage;
      } else if (documentType === 'birthCertificate') {
        submitData.birthCertificateNumber = parseInt(documentNumber);
        submitData.birthCertificateImage = documentImage;
      } else if (documentType === 'passport') {
        submitData.passportNumber = parseInt(documentNumber);
        submitData.passportImage = documentImage;
      }
  
      // Add additional document if provided
      if (additionalDocumentImage) {
        if (documentType === 'nid') {
          submitData.passportImage = additionalDocumentImage;
        } else if (documentType === 'passport') {
          submitData.birthCertificateImage = additionalDocumentImage;
        }
      }
  
     
  
      const result = await kycApi.createKYC(submitData);
  
      if (result.success) {
        setKycData(result.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.message || 'KYC জমা দিতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error('KYC submission error:', err);
      setError(err.message || 'KYC জমা দিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };
  const canEdit = !kycData || kycData.status === KycStatus.NOTREQUSTED || kycData.status === KycStatus.REJECTED;

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              KYC ভেরিফিকেশন
            </h1>
            <p className="text-muted-foreground">
              আপনার পরিচয় যাচাই করুন এবং সম্পূর্ণ অ্যাকাউন্ট সুবিধা পান
            </p>
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <KYCStatus kycData={kycData} loading={loading} />

      {/* KYC Form */}
      {canEdit ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <User className="h-5 w-5" />
                    ব্যক্তিগত তথ্য
                  </CardTitle>
                  <CardDescription>
                    আপনার পরিচয়পত্রের তথ্য প্রদান করুন
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">পরিচয়পত্রের ধরন *</Label>
                    <Select 
                      value={documentType} 
                      onValueChange={(value: 'nid' | 'birthCertificate' | 'passport') => setDocumentType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="পরিচয়পত্র নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nid">জাতীয় পরিচয়পত্র (NID)</SelectItem>
                        <SelectItem value="birthCertificate">জন্ম নিবন্ধন সনদ</SelectItem>
                        <SelectItem value="passport">পাসপোর্ট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">
                      {documentType === 'nid' && 'জাতীয় পরিচয়পত্র নম্বর *'}
                      {documentType === 'birthCertificate' && 'জন্ম নিবন্ধন নম্বর *'}
                      {documentType === 'passport' && 'পাসপোর্ট নম্বর *'}
                    </Label>
                    <Input
                      id="documentNumber"
                      type="number"
                      placeholder={
                        documentType === 'nid' ? '১৭- বা ১৩-সংখ্যার NID নম্বর' :
                        documentType === 'birthCertificate' ? '১৭-সংখ্যার জন্ম নিবন্ধন নম্বর' :
                        'পাসপোর্ট নম্বর'
                      }
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* User Photo */}
              <ImageUpload
                title="আপনার ছবি *"
                description="সামনের দিকে তোলা স্পষ্ট এবং সম্পূর্ণ মুখ দেখা যাবে এমন ছবি"
                uploadHook={userImageUpload}
                onImageSelect={setUserImage}
                required
                currentImage={kycData?.userImage}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Document Image */}
              <ImageUpload
                title={
                  documentType === 'nid' ? 'জাতীয় পরিচয়পত্রের ছবি *' :
                  documentType === 'birthCertificate' ? 'জন্ম নিবন্ধন সনদের ছবি *' :
                  'পাসপোর্টের ছবি *'
                }
                description={
                  documentType === 'nid' ? 'NID কার্ডের সামনের এবং পিছনের দিকের ছবি' :
                  documentType === 'birthCertificate' ? 'জন্ম নিবন্ধন সনদের সম্পূর্ণ ছবি' :
                  'পাসপোর্টের প্রথম পাতার ছবি'
                }
                uploadHook={documentImageUpload}
                onImageSelect={setDocumentImage}
                required
                currentImage={
                  documentType === 'nid' ? kycData?.nidImage :
                  documentType === 'birthCertificate' ? kycData?.birthCertificateImage :
                  kycData?.passportImage
                }
              />

              {/* Additional Document */}
              <ImageUpload
                title="অতিরিক্ত ডকুমেন্ট (ঐচ্ছিক)"
                description="অতিরিক্ত পরিচয় নিশ্চিতকরণের জন্য অন্য কোন ডকুমেন্ট"
                uploadHook={additionalDocUpload}
                onImageSelect={setAdditionalDocumentImage}
                currentImage={
                  documentType === 'nid' ? kycData?.passportImage :
                  documentType === 'passport' ? kycData?.birthCertificateImage :
                  undefined
                }
              />
            </div>
          </div>

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <FileText className="h-5 w-5" />
                গাইডলাইন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">ছবির প্রয়োজনীয়তা:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• সমস্ত ছবি স্পষ্ট এবং পড়া যাবে এমন হতে হবে</li>
                    <li>• ভাল আলোয় তোলা ছবি ব্যবহার করুন</li>
                    <li>• ছবিতে গ্লার বা রিফ্লেকশন থাকবে না</li>
                    <li>• সম্পূর্ণ ডকুমেন্ট ছবিতে দেখা যাবে</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">ডকুমেন্ট প্রয়োজনীয়তা:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• ডকুমেন্টটি বৈধ এবং মেয়াদোত্তীর্ণ না হতে হবে</li>
                    <li>• সমস্ত তথ্য স্পষ্টভাবে দৃশ্যমান হতে হবে</li>
                    <li>• ডকুমেন্টে আপনার নাম এবং ছবি মিলতে হবে</li>
                    <li>• সরকারি সীল এবং স্বাক্ষর থাকতে হবে</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">KYC জমা দিন</h3>
                  <p className="text-sm text-muted-foreground">
                    সমস্ত তথ্য সঠিকভাবে প্রদান করেছেন তা নিশ্চিত করুন
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">
                      বাতিল করুন
                    </Link>
                  </Button>
                  <Button type="submit" disabled={submitting} className="min-w-[120px]">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitting ? 'জমা হচ্ছে...' : 'KYC জমা দিন'}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  KYC সফলভাবে জমা দেওয়া হয়েছে! রিভিউ সম্পন্ন হতে ২৪-৪৮ ঘন্টা সময় লাগতে পারে।
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      ) : (
        /* View Only Mode */
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {kycData?.status === KycStatus.PENDING ? 'KYC রিভিউ চলছে' : 'KYC যাচাইকৃত'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {kycData?.status === KycStatus.PENDING 
                  ? 'আপনার KYC আবেদনটি বর্তমানে রিভিউ চলছে। রিভিউ সম্পন্ন হতে ২৪-৪৮ ঘন্টা সময় লাগতে পারে।'
                  : 'আপনার KYC সফলভাবে যাচাই করা হয়েছে। আপনি এখন সম্পূর্ণ অ্যাকাউন্ট সুবিধা ভোগ করতে পারবেন।'
                }
              </p>

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KYCVerification;