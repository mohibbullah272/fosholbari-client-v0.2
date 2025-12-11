// components/kyc/manage-kyc.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KYC } from '@/types/kyc';
import KYCViewModal from '@/components/kyc/kyc-veiw-model';
import KYCResponseModal from '@/components/kyc/kyc-response-model';
import { toast } from 'sonner';


const ManageKyc = () => {
  const [kycList, setKycList] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKyc, setSelectedKyc] = useState<KYC | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);

  useEffect(() => {
    fetchKycList();
  }, [searchTerm]);

  const fetchKycList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kyc/all?searchTerm=${searchTerm}`);
      const data = await response.json();
      setKycList(data.data);
    } catch (error) {
      console.error('KYC লিস্ট লোড করতে সমস্যা:', error);
      toast.error('KYC লিস্ট লোড করতে সমস্যা:')
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'বিচারাধীন', variant: 'secondary' as const },
      APPROVED: { label: 'অনুমোদিত', variant: 'default' as const },
      REJECTED: { label: 'বাতিল', variant: 'destructive' as const },
      NOTREQUSTED: { label: 'অনুরোধ করা হয়নি', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = async (kycId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kyc/${kycId}`);
      const kycDetails = await response.json();
      setSelectedKyc(kycDetails.data);
      setViewModalOpen(true);
    } catch (error:any) {
      console.error('KYC বিস্তারিত দেখতে সমস্যা:', error);
      toast.error(error?.message)
    }
  };

  const handleResponse = (kyc: KYC) => {
    setSelectedKyc(kyc);
    setResponseModalOpen(true);
  };
  
  const filteredKycList = kycList?.filter(kyc => 
    kyc.status === 'PENDING' || kyc.status === 'APPROVED' || kyc.status === 'REJECTED'
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">KYC ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">ব্যবহারকারীদের KYC যাচাই ও অনুমোদন ব্যবস্থাপনা</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ফোন নম্বর দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              ফিল্টার
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KYC List Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC অনুরোধ তালিকা</CardTitle>
          <CardDescription>
            মোট {filteredKycList.length} টি KYC অনুরোধ পাওয়া গেছে
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>আইডি</TableHead>
                    <TableHead>ব্যবহারকারী</TableHead>
                    <TableHead>ফোন নম্বর</TableHead>
                    <TableHead>KYC টাইপ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
               
                    <TableHead>একশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKycList.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell className="font-medium">#{kyc.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{kyc.user.name || 'নাম নেই'}</div>
                          <div className="text-sm text-muted-foreground">{kyc.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{kyc.user.phone}</TableCell>
                      <TableCell>
                        {kyc.nidNumber && 'NID'}
                        {kyc.passportNumber && 'পাসপোর্ট'}
                        {kyc.birthCertificateNumber && 'জন্ম নিবন্ধন'}
                      </TableCell>
                      <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                  
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(kyc.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {kyc.status === 'PENDING' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleResponse(kyc)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredKycList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'কোন KYC অনুরোধ পাওয়া যায়নি' : 'কোন KYC অনুরোধ নেই'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <KYCViewModal
        kyc={selectedKyc}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        onResponse={() => {
          setViewModalOpen(false);
          handleResponse(selectedKyc!);
        }}
      />

      <KYCResponseModal
        kyc={selectedKyc}
        open={responseModalOpen}
        onOpenChange={setResponseModalOpen}
        onSuccess={() => {
          setResponseModalOpen(false);
          fetchKycList();
        }}
      />
    </div>
  );
};

export default ManageKyc;