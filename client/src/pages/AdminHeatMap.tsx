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
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {item.buttonText || 'Unknown Button'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page: {item.page || 'Unknown'} • ID: {item.buttonId || 'unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                          {item.clickCount || 0}
                        </div>
                        <div className="text-gray-500">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                          {item.uniqueUsers || 0}
                        </div>
                        <div className="text-gray-500">Users</div>
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
      </div>
    </div>
  );
}