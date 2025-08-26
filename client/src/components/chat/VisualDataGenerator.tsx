import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileImage, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Eye,
  Upload,
  Download,
  Sparkles,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualDataProps {
  analysisData?: any;
  fileType?: 'image' | 'pdf' | 'excel' | 'word' | 'powerpoint';
  isGenerating?: boolean;
  className?: string;
}

const chartTypes = [
  { icon: BarChart3, label: 'Bar Chart', color: 'from-blue-500 to-cyan-500' },
  { icon: PieChart, label: 'Pie Chart', color: 'from-purple-500 to-pink-500' },
  { icon: TrendingUp, label: 'Line Chart', color: 'from-green-500 to-emerald-500' },
];

const visualEffects = [
  { id: 1, color: 'bg-blue-400', size: 'w-4 h-4', delay: 0 },
  { id: 2, color: 'bg-purple-400', size: 'w-3 h-3', delay: 0.2 },
  { id: 3, color: 'bg-green-400', size: 'w-5 h-5', delay: 0.4 },
  { id: 4, color: 'bg-orange-400', size: 'w-2 h-2', delay: 0.6 },
  { id: 5, color: 'bg-pink-400', size: 'w-3 h-3', delay: 0.8 },
];

export default function VisualDataGenerator({ 
  analysisData, 
  fileType = 'image',
  isGenerating = false,
  className 
}: VisualDataProps) {
  const [currentChart, setCurrentChart] = useState(0);
  const [generatedCharts, setGeneratedCharts] = useState<string[]>([]);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    duration: number;
  }>>([]);

  // Generate animated particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 500,
      y: Math.random() * 400,
      color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 4 + 2
    }));
    setParticles(newParticles);
  }, [isGenerating]);

  // Cycle through chart types
  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setCurrentChart(prev => (prev + 1) % chartTypes.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateMockCharts = () => {
    return [
      "📊 Trend Analysis: Wzrost 23% w ostatnim kwartale",
      "📈 Performance Metrics: ROI 15.7%, Volatility 8.2%", 
      "🎯 Key Insights: Sektor technologiczny dominuje",
      "💡 Recommendations: Diversyfikacja portfela wskazana",
      "⚡ Market Signals: Silny sygnał kupna dla blue chips"
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={cn(
        "relative p-8 rounded-3xl backdrop-blur-xl border-2",
        "bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80",
        "border-gradient-to-r from-cyan-400 to-purple-500",
        "shadow-4xl shadow-purple-500/50 transform-gpu",
        "hover:shadow-5xl hover:shadow-cyan-500/60 transition-all duration-700",
        className
      )}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full opacity-60 blur-sm"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
            }}
            animate={{
              y: [particle.y, particle.y - 100, particle.y],
              x: [particle.x, particle.x + 50, particle.x - 30, particle.x],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 0.8, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header with 3D brain */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.2, 1],
                rotateX: [0, 15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-600/40 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/50">
                <Brain className="w-10 h-10 text-cyan-300 drop-shadow-2xl" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 blur-2xl animate-pulse" />
              </div>
            </motion.div>
            
            <div>
              <motion.h2 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg"
              >
                Visual Data Analysis
              </motion.h2>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-cyan-200/80 text-lg"
              >
                Generating insights from {fileType?.toUpperCase()} analysis
              </motion.p>
            </div>
          </div>

          {/* File type indicator */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="p-4 rounded-full bg-gradient-to-r from-orange-400/30 to-red-500/40 border border-orange-400/50 shadow-xl"
          >
            {fileType === 'image' && <FileImage className="w-6 h-6 text-orange-300" />}
            {fileType === 'pdf' && <FileText className="w-6 h-6 text-red-300" />}
            {['excel', 'word', 'powerpoint'].includes(fileType) && <FileText className="w-6 h-6 text-green-300" />}
          </motion.div>
        </div>
      </div>

      {/* Chart generation area */}
      <div className="relative z-10 space-y-6">
        {isGenerating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Current chart being generated */}
            <div className="bg-gradient-to-r from-slate-800/50 to-indigo-900/50 rounded-2xl p-6 border border-indigo-400/30 shadow-xl">
              <div className="flex items-center space-x-4 mb-4">
                <motion.div
                  key={currentChart}
                  animate={{
                    scale: [1, 1.3, 1],
                    rotateZ: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  {React.createElement(chartTypes[currentChart].icon, {
                    className: `w-8 h-8 text-transparent bg-gradient-to-r ${chartTypes[currentChart].color} bg-clip-text drop-shadow-lg`
                  })}
                </motion.div>
                <h3 className="text-xl font-bold text-white">
                  Generating {chartTypes[currentChart].label}...
                </h3>
              </div>
              
              {/* Progress animation */}
              <div className="relative bg-slate-700/50 rounded-full h-4 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${chartTypes[currentChart].color} shadow-lg`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Generated insights */}
            <div className="grid gap-4">
              {generateMockCharts().slice(0, 3).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.3, duration: 0.5 }}
                  className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-xl p-4 border border-emerald-400/30 shadow-lg backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-emerald-300" />
                    </motion.div>
                    <p className="text-emerald-100 font-semibold">{insight}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-6"
            >
              <Upload className="w-16 h-16 text-purple-300 mx-auto drop-shadow-2xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to Analyze Files
            </h3>
            <p className="text-purple-200/80">
              Upload JPG, PDF, Excel, Word, or PowerPoint files for visual analysis
            </p>
          </div>
        )}
      </div>

      {/* Floating action effects */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {visualEffects.map((effect) => (
          <motion.div
            key={effect.id}
            className={cn("rounded-full shadow-lg", effect.color, effect.size)}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              delay: effect.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}