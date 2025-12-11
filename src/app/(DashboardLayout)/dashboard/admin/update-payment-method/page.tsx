// app/payments/update/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { PaymentMethod, PaymentMethods } from '@/types';
import { paymentApi } from '@/lib/api/payment-api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { PaymentMethodCard } from '@/components/payment/payment-method-card';
import { EditPaymentMethodModal } from '@/components/payment/edit-payment-method-model';
import { DeletePaymentMethodDialog } from '@/components/payment/delete-payment-method-dialog';

const UpdatePaymentMethod = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<PaymentMethods | 'all'>('all');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const result = await paymentApi.getAllPaymentMethods();
      
      if (result.success) {
        setPaymentMethods(result.data);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('পেমেন্ট মেথড লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [refreshTrigger]);

  // Filter payment methods
  const filteredMethods = paymentMethods
    .filter(method => {
      const matchesSearch = 
        method.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.number.toString().includes(searchTerm) ||
        method?.methodName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || method?.methodName === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.id - b.id);

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
  };

  const handleDelete = (methodId: number) => {
    const method = paymentMethods.find(m => m.id === methodId);
    setDeletingMethod(method || null);
  };

  const handleMethodUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingMethod(null);
  };

  const handleMethodDeleted = () => {
    setRefreshTrigger(prev => prev + 1);
    setDeletingMethod(null);
  };

  // Statistics
  const stats = {
    total: paymentMethods.length,
    bkash: paymentMethods.filter(m => m.methodName === PaymentMethods.BKASH).length,
    nagad: paymentMethods.filter(m => m.methodName === PaymentMethods.NAGAD).length,
    rocket: paymentMethods.filter(m => m.methodName === PaymentMethods.ROCKET).length,
    upay: paymentMethods.filter(m => m.methodName === PaymentMethods.UPAY).length,
    bank: paymentMethods.filter(m => m.methodName === PaymentMethods.BANK).length,
    ucb: paymentMethods.filter(m => m.methodName === PaymentMethods.UCB).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>পেমেন্ট মেথড লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">পেমেন্ট মেথড ব্যবস্থাপনা</h1>
        <p className="text-muted-foreground">
          সকল পেমেন্ট মেথড দেখুন এবং সংশোধন করুন
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-sm text-muted-foreground">মোট পেমেন্ট মেথড</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.bkash + stats.nagad + stats.rocket + stats.upay}</div>
            <p className="text-sm text-muted-foreground">মোবাইল ফাইন্যান্স</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.bank + stats.ucb}</div>
            <p className="text-sm text-muted-foreground">ব্যাংকিং সার্ভিস</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">সক্রিয় মেথড</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-primary">সকল পেমেন্ট মেথড</CardTitle>
              <CardDescription>
                {filteredMethods.length}টি মেথড দেখানো হচ্ছে
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Filter Buttons */}
              <div className="flex gap-1 bg-muted p-1 rounded-lg flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="text-xs"
                >
                  সকল
                </Button>
                <Button
                  variant={filter === PaymentMethods.BKASH ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(PaymentMethods.BKASH)}
                  className="text-xs"
                >
                  বিকাশ
                </Button>
                <Button
                  variant={filter === PaymentMethods.NAGAD ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(PaymentMethods.NAGAD)}
                  className="text-xs"
                >
                  নগদ
                </Button>
                <Button
                  variant={filter === PaymentMethods.ROCKET ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(PaymentMethods.ROCKET)}
                  className="text-xs"
                >
                  রকেট
                </Button>
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="পেমেন্ট মেথড খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/dashboard/admin/add-payment-method">
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন যোগ করুন
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
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

      {/* Payment Methods Grid */}
      {filteredMethods.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">কোনো পেমেন্ট মেথড পাওয়া যায়নি</p>
              <p className="text-sm mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'অনুসন্ধান বা ফিল্টার পরিবর্তন করুন' 
                  : 'কোনো পেমেন্ট মেথড নেই'
                }
              </p>
              <Button asChild>
                <Link href="/payments/add">
                  <Plus className="h-4 w-4 mr-2" />
                  প্রথম পেমেন্ট মেথড যোগ করুন
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditPaymentMethodModal
        paymentMethod={editingMethod}
        open={!!editingMethod}
        onClose={() => setEditingMethod(null)}
        onPaymentMethodUpdated={handleMethodUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePaymentMethodDialog
        paymentMethod={deletingMethod}
        open={!!deletingMethod}
        onClose={() => setDeletingMethod(null)}
        onPaymentMethodDeleted={handleMethodDeleted}
      />
    </div>
  );
};

export default UpdatePaymentMethod;