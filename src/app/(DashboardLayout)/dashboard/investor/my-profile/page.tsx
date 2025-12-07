// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, UpdateUserData, Status, Role } from '@/types/user';
import { userApi } from '@/lib/api/user-api';
import { ProfileImageUpload } from '@/components/profile/profile-image-upload';
import { UserStatusBadge } from '@/components/profile/user-status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, User as UserIcon, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { formatDate } from '@/helpers/formatDate';

const MyProfile = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');

  // Upload hook for profile image
  const profileImageUpload = useCloudinaryUpload();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const result = await userApi.getUserProfile(Number(session.user.id));
        
        if (result.success) {
          const user = result.data;
          setUserData(user);
          // Pre-fill form with existing data
          setName(user.name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setAddress(user.address || '');
          setPhoto(user.photo || '');
        }
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        setError('প্রোফাইল তথ্য লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === 'authenticated') {
      fetchUserProfile();
    }
  }, [session, sessionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('ইউজার তথ্য পাওয়া যায়নি');
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const updateData: UpdateUserData = {};

      // Only include fields that have changed
      if (name !== userData?.name) updateData.name = name;
      if (email !== userData?.email) updateData.email = email;
      if (phone !== userData?.phone) updateData.phone = phone;
      if (address !== userData?.address) updateData.address = address;
      if (photo !== userData?.photo) updateData.photo = photo;

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setError('কোনো পরিবর্তন করা হয়নি');
        setUpdating(false);
        return;
      }

    

      const result = await userApi.updateUserProfile(Number(session.user.id), updateData);

      if (result.success) {
        setUserData(result.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdating(false);
    }
  };



  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>প্রোফাইল লোড হচ্ছে...</span>
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
              আমার প্রোফাইল
            </h1>
            <p className="text-muted-foreground">
              আপনার ব্যক্তিগত তথ্য দেখুন এবং আপডেট করুন
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Image & Status */}
        <div className="space-y-6">
          {/* Profile Image */}
          <ProfileImageUpload
            uploadHook={profileImageUpload}
            onImageSelect={setPhoto}
            currentImage={userData?.photo}
          />

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">অ্যাকাউন্ট স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData && (
                <UserStatusBadge status={userData.status} role={userData.role} />
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">একাউন্ট তৈরি:</span>
                  <span className="font-medium text-foreground">
                    {userData ? formatDate(userData.createdAt) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ইউজার আইডি:</span>
                  <span className="font-medium text-foreground">
                    #{userData?.id}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">ব্যক্তিগত তথ্য</CardTitle>
                <CardDescription>
                  আপনার ব্যক্তিগত তথ্য আপডেট করুন
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">পুরো নাম</Label>
                    <Input
                      id="name"
                      placeholder="আপনার পুরো নাম"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="আপনার ইমেইল ঠিকানা"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                    <Input
                      id="phone"
                      placeholder="০১৭XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">ঠিকানা</Label>
                    <Textarea
                      id="address"
                      placeholder="আপনার সম্পূর্ণ ঠিকানা"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">প্রোফাইল আপডেট</h3>
                    <p className="text-sm text-muted-foreground">
                      তথ্য আপডেট করতে সেভ বাটনে ক্লিক করুন
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Reset form to original data
                        if (userData) {
                          setName(userData.name || '');
                          setEmail(userData.email || '');
                          setPhone(userData.phone || '');
                          setAddress(userData.address || '');
                          setPhoto(userData.photo || '');
                          profileImageUpload.clear();
                        }
                      }}
                      disabled={updating}
                    >
                      রিসেট করুন
                    </Button>
                    <Button
                      type="submit"
                      disabled={updating}
                      className="min-w-[120px]"
                    >
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {updating ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    প্রোফাইল সফলভাবে আপডেট করা হয়েছে!
                  </div>
                )}
              </CardContent>
            </Card>
          </form>

          {/* Account Information */}
          <Card className='mt-5'>
            <CardHeader>
              <CardTitle className="text-primary">অ্যাকাউন্ট তথ্য</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্ট সম্পর্কিত গুরুত্বপূর্ণ তথ্য
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ইউজার আইডি:</span>
                    <span className="font-medium text-foreground">#{userData?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">অ্যাকাউন্ট স্ট্যাটাস:</span>
                    <span className="font-medium text-foreground">
                      {userData?.status === Status.APPROVED ? 'অনুমোদিত' : 
                       userData?.status === Status.PENDING ? 'বিচারাধীন' : 'ব্লক করা হয়েছে'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">অ্যাকাউন্ট ধরন:</span>
                    <span className="font-medium text-foreground">
                      {userData?.role === Role.INVESTOR ? 'বিনিয়োগকারী' : 'অ্যাডমিন'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">একাউন্ট তৈরি:</span>
                    <span className="font-medium text-foreground">
                      {userData ? formatDate(userData.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;