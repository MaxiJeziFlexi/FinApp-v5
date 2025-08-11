import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { 
  MousePointer, 
  TrendingUp, 
  Users, 
  Activity,
  BarChart3,
  Target,
  Filter,
  RefreshCw,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeatMapData } from '@/services/heatMapService';

interface HeatMapVisualizationProps {
  className?: string;
}

export function HeatMapVisualization({ className }: HeatMapVisualizationProps) {
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'visual'>('grid');

  // Fetch heat map data
  const { data: heatMapData, isLoading, refetch } = useQuery({
    queryKey: ['heatmap', selectedPage],
    queryFn: () => 
      selectedPage === 'all' 
        ? fetch('/api/analytics/heatmap/all-pages').then(res => res.json())
        : fetch(`/api/analytics/heatmap?page=${encodeURIComponent(selectedPage)}`).then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch top clicked elements
  const { data: topClicked, isLoading: topLoading } = useQuery({
    queryKey: ['top-clicked'],
    queryFn: () => fetch('/api/analytics/heatmap/top-clicked?limit=20').then(res => res.json()),
    refetchInterval: 30000,
  });

  const pages = [
    { value: 'all', label: 'All Pages' },
    { value: '/', label: 'Home' },
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/advisor-selection', label: 'AI Advisors' },
    { value: '/investment', label: 'Investment' },
    { value: '/reports', label: 'Reports' },
    { value: '/tax', label: 'Tax' },
    { value: '/retirement', label: 'Retirement' },
    { value: '/crypto', label: 'Crypto' },
    { value: '/community', label: 'Community' },
    { value: '/admin-dashboard', label: 'Admin Dashboard' },
  ];

  const getClickIntensity = (clickCount: number, maxClicks: number): string => {
    const intensity = (clickCount / Math.max(maxClicks, 1)) * 100;
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getAllClickData = (): HeatMapData[] => {
    if (selectedPage === 'all' && heatMapData) {
      return Object.values(heatMapData).flat();
    }
    return heatMapData || [];
  };

  const maxClicks = Math.max(...(getAllClickData().map(item => item.clickCount) || [1]));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <MousePointer className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Heat Map Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Real-time button click tracking from all users</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map(page => (
                <SelectItem key={page.value} value={page.value}>
                  {page.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Total Clicks
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-white">
              {isLoading ? '...' : getAllClickData().reduce((sum, item) => sum + item.clickCount, 0).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs opacity-90">
              Across all tracked elements
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tracked Elements
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-white">
              {isLoading ? '...' : getAllClickData().length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs opacity-90">
              Buttons and interactive elements
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-white">
              {isLoading ? '...' : new Set(getAllClickData().flatMap(item => Array(item.uniqueUsers).fill(0))).size}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs opacity-90">
              Users with tracked clicks
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Hottest Element
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-white">
              {isLoading ? '...' : Math.max(...getAllClickData().map(item => item.clickCount), 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs opacity-90">
              Most clicked element
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Heat Map Overview</TabsTrigger>
          <TabsTrigger value="top-elements">Top Elements</TabsTrigger>
          <TabsTrigger value="page-breakdown">Page Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Heat Map Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Click Heat Map {selectedPage !== 'all' && `- ${pages.find(p => p.value === selectedPage)?.label}`}</CardTitle>
              <CardDescription>
                Visual representation of button clicks. Darker/redder elements have more clicks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : getAllClickData().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No click data available yet.</p>
                  <p className="text-sm">Start clicking buttons to generate heat map data!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {getAllClickData().map((item, index) => (
                      <motion.div
                        key={`${item.page}-${item.buttonId}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        <Card className="hover:shadow-lg transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {item.buttonText}
                                </h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {item.page}
                                </p>
                              </div>
                              <Badge 
                                className={`ml-2 text-white ${getClickIntensity(item.clickCount, maxClicks)}`}
                              >
                                {item.clickCount}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <Progress 
                                value={(item.clickCount / Math.max(maxClicks, 1)) * 100} 
                                className="h-2"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{item.uniqueUsers} users</span>
                                <span>{new Date(item.lastClicked).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-elements">
          <Card>
            <CardHeader>
              <CardTitle>Most Clicked Elements</CardTitle>
              <CardDescription>Ranking of all buttons by total click count</CardDescription>
            </CardHeader>
            <CardContent>
              {topLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {(topClicked || []).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{item.buttonText}</p>
                            <p className="text-sm text-gray-500">{item.page}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{item.clickCount}</p>
                          <p className="text-xs text-gray-500">{item.uniqueUsers} users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="page-breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Page-by-Page Analysis</CardTitle>
              <CardDescription>Breakdown of click activity by page</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : selectedPage === 'all' && heatMapData ? (
                <div className="space-y-4">
                  {Object.entries(heatMapData).map(([page, data]: [string, any]) => (
                    <Card key={page} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{pages.find(p => p.value === page)?.label || page}</h4>
                        <Badge variant="secondary">
                          {data.reduce((sum: number, item: any) => sum + item.clickCount, 0)} clicks
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {data.slice(0, 6).map((item: any, index: number) => (
                          <div key={index} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="font-medium truncate">{item.buttonText}</p>
                            <p className="text-xs text-gray-500">{item.clickCount} clicks</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Select "All Pages" to see page breakdown
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}