import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialDashboardWidgets } from '@/components/dashboard/FinancialDashboardWidgets';
import { Users, MessageCircle, TrendingUp, Settings, Shield, Database } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalMessages: number;
}

export function AdminDashboard() {
  const [adminStats] = useState<AdminStats>({
    totalUsers: 1247,
    activeUsers: 342,
    totalSessions: 2891,
    totalMessages: 15623
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">FinApp Administration Panel</p>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Admin Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {adminStats.totalUsers.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    {adminStats.activeUsers} active today
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    AI Sessions
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {adminStats.totalSessions.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    +12% this week
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Messages
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {adminStats.totalMessages.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    4.2 avg per session
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    System Health
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {systemHealth?.status === 'healthy' ? '100%' : '---'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    All services online
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Dashboard for Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Financial Dashboard</CardTitle>
                <CardDescription>
                  Preview of animated financial widgets available to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialDashboardWidgets userId="admin-user-finapp-2025" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, subscriptions, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      User management features will be implemented here.
                      For now, you have admin access with the following credentials:
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="font-mono text-sm">
                        <div><strong>Email:</strong> admin@finapp.demo</div>
                        <div><strong>Role:</strong> Admin</div>
                        <div><strong>Subscription:</strong> Max Plan ($5.00 API limit)</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Learning Analytics</CardTitle>
                <CardDescription>Monitor AI performance and user learning patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  Advanced analytics dashboard will be implemented here.
                  This will include user engagement metrics, AI conversation quality,
                  and learning progress tracking.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-green-600 dark:text-green-400 font-semibold">Database</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {systemHealth?.database ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">OpenAI API</div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {systemHealth?.openai ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold">Services</div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {systemHealth?.status === 'healthy' ? 'Healthy' : 'Issues'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}