import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/helpers/formatDate';

const AdminDashboardOverview = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/admin/dashboard-overview`, {
    cache: 'no-store',
    credentials:"include"
    
  });
  const overview = await res.json();

  
  if (!overview.success) {
    return <div>ড্যাশবোর্ড লোড করতে সমস্যা হচ্ছে</div>;
  }

  const { stats, latestProject, latestUser } = overview.data;

  // Stats cards data in Bangla
  const statCards = [
    {
      title: "মোট ব্যবহারকারী",
      value: stats.totalUser,
      description: "নিবন্ধিত সকল ব্যবহারকারী",
      className: "border-r-4 border-r-blue-500"
    },
    {
      title: "যাচাইকৃত ব্যবহারকারী",
      value: stats.totalVerifiedUser,
      description: "কেওয়াইসি যাচাইকৃত ব্যবহারকারী",
      className: "border-r-4 border-r-green-500"
    },
    {
      title: "মোট প্রকল্প",
      value: stats.totalProjects,
      description: "সক্রিয় প্রকল্পসমূহ",
      className: "border-r-4 border-r-purple-500"
    },
    {
      title: "কেওয়াইসি বাকি",
      value: stats.totalKycPendingUser,
      description: "যাচাইয়ের জন্য অপেক্ষমান",
      className: "border-r-4 border-r-amber-500"
    }
  ];

  // Format date function for Bangla



  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">ড্যাশবোর্ড ওভারভিউ</h1>
        <p className="text-muted-foreground">
          এডমিন ড্যাশবোর্ডে স্বাগতম। বর্তমান অবস্থা দেখুন।
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={stat.className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest Projects Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-primary">সর্বশেষ প্রকল্প</CardTitle>
            <CardDescription>
              সম্প্রতি যোগকৃত বিনিয়োগ প্রকল্পসমূহ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestProject.map((project: any) => (
                <div key={project.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card">
                  {/* Project Image */}
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-24 sm:h-20 sm:w-20 rounded-lg overflow-hidden">
                      <Image
                        src={project.image[0]}
                        alt={project.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 80px"
                      />
                    </div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="w-fit">
                        {project.location}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">মোট শেয়ার: </span>
                        <span className="text-foreground">{project.totalShare}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">শেয়ার মূল্য: </span>
                        <span className="text-foreground">৳{project.sharePrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">লাভ/শেয়ার: </span>
                        <span className="text-foreground">৳{project.profitPerShare}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">মেয়াদ: </span>
                        <span className="text-foreground">{formatDate(project.Duration)}</span>
                      </div>
                    </div>

                    {/* Progress Updates */}
                    {project.progressUpdate.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-primary">অগ্রগতি হালনাগাদ:</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                          {project.progressUpdate.slice(0, 2).map((update: string, idx: number) => (
                            <li key={idx} className="line-clamp-1">{update}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">সদ্য নিবন্ধিত ব্যবহারকারী</CardTitle>
            <CardDescription>
              সম্প্রতি একাউন্ট খুলেছেন এমন ব্যবহারকারী
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestUser.map((user: any) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {user.photo ? (
                        <Image
                          src={user.photo}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* User Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">
                        {user.name || 'নাম নেই'}
                      </h4>
                      <Badge 
                        variant={user.status === 'PENDING' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.phone || 'ফোন নম্বর নেই'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">দ্রুত পরিসংখ্যান</CardTitle>
            <CardDescription>
              সামগ্রিক অবস্থার সারসংক্ষেপ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">মোট শেয়ার বিক্রয়</span>
                <span className="text-sm font-medium text-primary">
                  {latestProject.reduce((total: number, project: any) => 
                    total + parseInt(project.totalShare.replace(/[^\d]/g, '') || 0), 0).toLocaleString('bn-BD')
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">সক্রিয় প্রকল্প</span>
                <span className="text-sm font-medium text-primary">
                  {stats.totalProjects}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">বিচারাধীন ব্যবহারকারী</span>
                <span className="text-sm font-medium text-primary">
                  {stats.totalKycPendingUser}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">যাচাইকৃত ব্যবহারকারী</span>
                <span className="text-sm font-medium text-primary">
                  {stats.totalVerifiedUser}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;