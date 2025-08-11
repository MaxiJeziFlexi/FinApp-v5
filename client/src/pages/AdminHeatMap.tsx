import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, MousePointer, Users, Activity } from "lucide-react";

export default function AdminHeatMap() {
  const { data: heatMapData, isLoading, refetch } = useQuery({
    queryKey: ["publicHeatMapData"],
    queryFn: () => fetch("/api/public/analytics/heatmap").then(res => res.json()),
    refetchInterval: 3000 // Auto-refresh every 3 seconds for live demo
  });

  const generateTestData = async () => {
    const testClicks = [
      { buttonId: "nav-dashboard", buttonText: "Dashboard", page: "/dashboard", position: { x: 150, y: 80 } },
      { buttonId: "nav-advisors", buttonText: "AI Advisors", page: "/advisors", position: { x: 250, y: 80 } },
      { buttonId: "advisor-aria", buttonText: "Talk to ARIA", page: "/advisors", position: { x: 300, y: 200 } },
      { buttonId: "advisor-nexus", buttonText: "Talk to NEXUS", page: "/advisors", position: { x: 500, y: 200 } },
      { buttonId: "chat-send", buttonText: "Send Message", page: "/chat", position: { x: 400, y: 350 } }
    ];

    for (const click of testClicks) {
      await fetch("/api/public/analytics/button-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...click,
          timestamp: new Date().toISOString(),
          userId: `user_${Math.floor(Math.random() * 100)}`,
          sessionId: `session_${Date.now()}`
        })
      });
    }
    
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Heat Map Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time button click tracking across your application
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={generateTestData} variant="outline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Generate Test Data
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {heatMapData?.reduce((sum: number, item: any) => sum + (item.clickCount || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tracked Buttons</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{heatMapData?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {heatMapData?.reduce((sum: number, item: any) => sum + (item.uniqueUsers || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heat Map Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Live Click Analytics
            </CardTitle>
            <CardDescription>
              Real-time tracking of button interactions {isLoading && "(Loading...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {heatMapData && heatMapData.length > 0 ? (
              <div className="space-y-4">
                {heatMapData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {item.buttonText || 'Unknown Button'}
                        {item.clickCount > 1 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Hot
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page: <span className="font-medium">{item.page || 'Unknown'}</span> • ID: <span className="font-mono text-xs">{item.buttonId || 'unknown'}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Last clicked: {new Date(item.lastClicked).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className={`font-semibold text-lg ${item.clickCount > 1 ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {item.clickCount || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Clicks</div>
                        {item.positions && (
                          <div className="text-xs text-gray-400 mt-1">
                            {item.positions.length} positions
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                          {item.uniqueUsers || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Users</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.uniqueUsers === 1 ? 'Single user' : 'Multiple users'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                          {item.positions ? Math.round(item.positions.reduce((sum: number, pos: any) => sum + pos.x, 0) / item.positions.length) : 0}
                        </div>
                        <div className="text-gray-500 text-xs">Avg X</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {isLoading ? "Loading heat map data..." : "No click data available yet. Click the 'Generate Test Data' button to see live tracking in action!"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Pages Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Page Performance
            </CardTitle>
            <CardDescription>
              Click activity by page location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {heatMapData && heatMapData.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(
                  heatMapData.reduce((acc: any, item: any) => {
                    const page = item.page || 'Unknown';
                    if (!acc[page]) {
                      acc[page] = { totalClicks: 0, buttons: 0, users: new Set() };
                    }
                    acc[page].totalClicks += item.clickCount || 0;
                    acc[page].buttons += 1;
                    if (item.uniqueUsers) acc[page].users.add(`${item.buttonId}_users_${item.uniqueUsers}`);
                    return acc;
                  }, {})
                )
                .sort(([,a]: any, [,b]: any) => b.totalClicks - a.totalClicks)
                .map(([page, data]: any) => (
                  <div key={page} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{page}</h4>
                      <p className="text-sm text-gray-500">{data.buttons} interactive elements</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-cyan-600 dark:text-cyan-400">{data.totalClicks} total clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No page data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}