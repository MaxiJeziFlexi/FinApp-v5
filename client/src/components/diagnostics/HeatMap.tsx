import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Activity, Eye, MousePointer, TrendingUp, Zap } from 'lucide-react';

interface HeatMapPoint {
  x: number;
  y: number;
  intensity: number;
  count: number;
}

interface HeatMapProps {
  data: HeatMapPoint[];
  width?: number;
  height?: number;
  page: string;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export default function HeatMap({ 
  data, 
  width = 800, 
  height = 600, 
  page, 
  timeRange = '24h',
  onTimeRangeChange 
}: HeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HeatMapPoint | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    drawHeatMap();
  }, [data, width, height]);

  const drawHeatMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Find max intensity for normalization
    const maxIntensity = Math.max(...data.map(point => point.intensity));

    // Draw heat map points
    data.forEach(point => {
      const normalizedIntensity = point.intensity / maxIntensity;
      const radius = 30 + (normalizedIntensity * 20); // 30-50px radius
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );

      // Color based on intensity (blue to red spectrum)
      const alpha = 0.3 + (normalizedIntensity * 0.4); // 0.3-0.7 alpha
      if (normalizedIntensity < 0.3) {
        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`); // Blue
        gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
      } else if (normalizedIntensity < 0.6) {
        gradient.addColorStop(0, `rgba(245, 158, 11, ${alpha})`); // Orange
        gradient.addColorStop(1, `rgba(245, 158, 11, 0)`);
      } else {
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`); // Red
        gradient.addColorStop(1, `rgba(239, 68, 68, 0)`);
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw point marker
      ctx.fillStyle = normalizedIntensity > 0.6 ? '#dc2626' : normalizedIntensity > 0.3 ? '#d97706' : '#2563eb';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePosition({ x, y });

    // Find closest heat map point
    const closestPoint = data.reduce((closest, point) => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      if (distance < 30 && (!closest || distance < closest.distance)) {
        return { point, distance };
      }
      return closest;
    }, null as { point: HeatMapPoint; distance: number } | null);

    setHoveredPoint(closestPoint?.point || null);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const getIntensityLevel = (intensity: number): string => {
    if (intensity > 0.7) return 'Very High';
    if (intensity > 0.5) return 'High';
    if (intensity > 0.3) return 'Medium';
    return 'Low';
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity > 0.7) return 'bg-red-100 text-red-800';
    if (intensity > 0.5) return 'bg-orange-100 text-orange-800';
    if (intensity > 0.3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const totalClicks = data.reduce((sum, point) => sum + point.count, 0);
  const avgIntensity = data.length > 0 ? data.reduce((sum, point) => sum + point.intensity, 0) / data.length : 0;
  const hotspots = data.filter(point => point.intensity > 0.5).length;

  return (
    <div className="space-y-4">
      {/* Heat Map Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Interaction Heat Map
              </CardTitle>
              <CardDescription>
                Visual representation of user clicks and interactions on {page}
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalClicks}</div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{hotspots}</div>
              <div className="text-sm text-gray-600">Hot Spots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(avgIntensity * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Intensity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.length}</div>
              <div className="text-sm text-gray-600">Active Areas</div>
            </div>
          </div>

          {/* Heat Map Canvas */}
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ width: '100%', height: 'auto', maxWidth: width }}
            />

            {/* Tooltip */}
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10 pointer-events-none"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 80,
                  transform: mousePosition.x > width - 200 ? 'translateX(-100%)' : 'none'
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    <span className="font-medium">Click Data</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Position:</span>
                      <span>({hoveredPoint.x}, {hoveredPoint.y})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clicks:</span>
                      <span className="font-medium">{hoveredPoint.count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Intensity:</span>
                      <Badge className={getIntensityColor(hoveredPoint.intensity)}>
                        {getIntensityLevel(hoveredPoint.intensity)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 border border-gray-200">
              <div className="text-sm font-medium mb-2">Intensity</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Low (0-30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Medium (30-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>High (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Very High (80%+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          {data.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Key Insights</span>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                {hotspots > 5 && (
                  <div>• {hotspots} high-intensity interaction areas detected</div>
                )}
                {avgIntensity > 0.6 && (
                  <div>• High average engagement suggests effective UI design</div>
                )}
                {totalClicks > 100 && (
                  <div>• Strong user engagement with {totalClicks} total interactions</div>
                )}
                {data.some(p => p.y < 100) && (
                  <div>• Above-the-fold content receiving significant attention</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}