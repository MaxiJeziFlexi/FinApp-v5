import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  MousePointer, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ClickRatioData {
  element: string;
  page: string;
  totalViews: number;
  totalClicks: number;
  clickRatio: number;
  conversionRate: number;
  avgTimeToClick: number;
  bounceRate: number;
}

interface ClickRatioAnalyticsProps {
  data: ClickRatioData[];
  page: string;
}

export default function ClickRatioAnalytics({ data, page }: ClickRatioAnalyticsProps) {
  const [sortBy, setSortBy] = useState<'clickRatio' | 'totalClicks' | 'totalViews' | 'bounceRate'>('clickRatio');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedElement, setSelectedElement] = useState<ClickRatioData | null>(null);

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const getPerformanceColor = (ratio: number): string => {
    if (ratio >= 0.8) return 'text-green-600 bg-green-100';
    if (ratio >= 0.5) return 'text-yellow-600 bg-yellow-100';
    if (ratio >= 0.2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceIcon = (ratio: number) => {
    if (ratio >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (ratio >= 0.5) return <Target className="h-4 w-4 text-yellow-600" />;
    if (ratio >= 0.2) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getPerformanceLabel = (ratio: number): string => {
    if (ratio >= 0.8) return 'Excellent';
    if (ratio >= 0.5) return 'Good';
    if (ratio >= 0.2) return 'Fair';
    return 'Poor';
  };

  const calculateStats = () => {
    const totalElements = data.length;
    const avgClickRatio = totalElements > 0 ? data.reduce((sum, item) => sum + item.clickRatio, 0) / totalElements : 0;
    const highPerforming = data.filter(item => item.clickRatio >= 0.5).length;
    const lowPerforming = data.filter(item => item.clickRatio < 0.2).length;
    const totalInteractions = data.reduce((sum, item) => sum + item.totalClicks, 0);

    return {
      totalElements,
      avgClickRatio,
      highPerforming,
      lowPerforming,
      totalInteractions
    };
  };

  const stats = calculateStats();

  const generateInsights = (): string[] => {
    const insights: string[] = [];
    
    if (stats.avgClickRatio > 0.6) {
      insights.push('Overall click-through performance is strong across elements');
    } else if (stats.avgClickRatio < 0.3) {
      insights.push('Low average click-through rates suggest UX optimization needed');
    }

    if (stats.lowPerforming > stats.totalElements * 0.3) {
      insights.push(`${stats.lowPerforming} elements have poor performance and need attention`);
    }

    if (stats.highPerforming > stats.totalElements * 0.5) {
      insights.push('Majority of elements are performing well - good UI design patterns');
    }

    const highBounceElements = data.filter(item => item.bounceRate > 0.7);
    if (highBounceElements.length > 0) {
      insights.push(`${highBounceElements.length} elements have high bounce rates`);
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Click Ratio Analytics Overview
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of element interaction performance on {page}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalElements}</div>
              <div className="text-sm text-gray-600">Total Elements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(stats.avgClickRatio * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Click Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalInteractions}</div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.highPerforming}</div>
              <div className="text-sm text-gray-600">High Performing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.lowPerforming}</div>
              <div className="text-sm text-gray-600">Need Attention</div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">AI-Generated Insights</span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              {generateInsights().map((insight, index) => (
                <div key={index}>• {insight}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Element Performance Ranking</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSortBy('clickRatio');
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    Sort by Click Ratio {sortBy === 'clickRatio' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSortBy('totalClicks');
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    Sort by Clicks {sortBy === 'totalClicks' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedData.slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item.element}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedElement(item)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getPerformanceIcon(item.clickRatio)}
                          <span className="font-medium text-gray-900">{item.element}</span>
                          <Badge className={getPerformanceColor(item.clickRatio)}>
                            {getPerformanceLabel(item.clickRatio)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            <span>{item.totalClicks} clicks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{item.totalViews} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{(item.clickRatio * 100).toFixed(1)}% CTR</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.avgTimeToClick.toFixed(1)}s avg</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Progress 
                          value={item.clickRatio * 100} 
                          className="w-20 h-2" 
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3">Element</th>
                      <th className="text-right p-3">Views</th>
                      <th className="text-right p-3">Clicks</th>
                      <th className="text-right p-3">CTR</th>
                      <th className="text-right p-3">Avg Time</th>
                      <th className="text-right p-3">Bounce Rate</th>
                      <th className="text-right p-3">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item) => (
                      <tr key={item.element} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.element}</td>
                        <td className="text-right p-3">{item.totalViews}</td>
                        <td className="text-right p-3">{item.totalClicks}</td>
                        <td className="text-right p-3">{(item.clickRatio * 100).toFixed(1)}%</td>
                        <td className="text-right p-3">{item.avgTimeToClick.toFixed(1)}s</td>
                        <td className="text-right p-3">{(item.bounceRate * 100).toFixed(1)}%</td>
                        <td className="text-right p-3">
                          <Badge className={getPerformanceColor(item.clickRatio)}>
                            {getPerformanceLabel(item.clickRatio)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* High Priority Issues */}
                {stats.lowPerforming > 0 && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-900">High Priority Issues</span>
                    </div>
                    <div className="text-sm text-red-800 space-y-1">
                      <div>• {stats.lowPerforming} elements have poor click-through rates (&lt;20%)</div>
                      <div>• Consider redesigning low-performing elements for better visibility</div>
                      <div>• Analyze user behavior to understand interaction barriers</div>
                    </div>
                  </div>
                )}

                {/* Medium Priority */}
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Optimization Opportunities</span>
                  </div>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <div>• A/B test different button colors and sizes for low CTR elements</div>
                    <div>• Improve call-to-action text for better engagement</div>
                    <div>• Consider repositioning important elements to higher visibility areas</div>
                    <div>• Implement hover effects to increase user interaction confidence</div>
                  </div>
                </div>

                {/* Success Areas */}
                {stats.highPerforming > 0 && (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Success Patterns</span>
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      <div>• {stats.highPerforming} elements are performing excellently (&gt;50% CTR)</div>
                      <div>• Apply successful design patterns to other elements</div>
                      <div>• Maintain current positioning and styling for high-performing elements</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Element Detail Modal */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedElement(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedElement.element}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedElement(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Click-Through Rate</div>
                  <div className="text-xl font-bold text-blue-600">
                    {(selectedElement.clickRatio * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                  <div className="text-xl font-bold text-green-600">
                    {selectedElement.totalClicks}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Avg Time to Click</div>
                  <div className="text-lg font-medium">
                    {selectedElement.avgTimeToClick.toFixed(1)}s
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bounce Rate</div>
                  <div className="text-lg font-medium">
                    {(selectedElement.bounceRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <Badge className={getPerformanceColor(selectedElement.clickRatio)}>
                  {getPerformanceIcon(selectedElement.clickRatio)}
                  <span className="ml-1">{getPerformanceLabel(selectedElement.clickRatio)} Performance</span>
                </Badge>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}