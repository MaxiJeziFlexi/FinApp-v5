import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  Zap, 
  Rocket, 
  Brain, 
  Target, 
  TrendingUp,
  Lightbulb,
  Star,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Shield,
  Globe,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feature {
  id: string;
  name: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'revolutionary';
  cost: 'free' | 'low' | 'medium' | 'high';
  timeToImplement: string;
  status: 'planned' | 'in-progress' | 'completed' | 'testing';
  category: 'ai' | 'finance' | 'ux' | 'data' | 'security' | 'mobile';
  dependencies: string[];
  userValue: number;
  developerEffort: number;
}

interface FeatureCategory {
  name: string;
  icon: any;
  color: string;
  description: string;
}

const categories: Record<string, FeatureCategory> = {
  ai: {
    name: 'AI & Intelligence',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    description: 'Machine learning and AI-powered features'
  },
  finance: {
    name: 'Financial Tools',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    description: 'Core financial management features'
  },
  ux: {
    name: 'User Experience',
    icon: Star,
    color: 'from-blue-500 to-blue-600',
    description: 'Interface and usability improvements'
  },
  data: {
    name: 'Analytics',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    description: 'Data analysis and reporting'
  },
  security: {
    name: 'Security',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    description: 'Privacy and security enhancements'
  },
  mobile: {
    name: 'Mobile',
    icon: Smartphone,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Mobile experience optimization'
  }
};

const impactColors = {
  low: 'text-gray-600 bg-gray-50 border-gray-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  high: 'text-green-600 bg-green-50 border-green-200',
  revolutionary: 'text-purple-600 bg-purple-50 border-purple-200'
};

const statusColors = {
  planned: 'text-gray-600 bg-gray-50',
  'in-progress': 'text-orange-600 bg-orange-50',
  completed: 'text-green-600 bg-green-50',
  testing: 'text-blue-600 bg-blue-50'
};

export function InfiniteFeatureTree({ budget = 25 }: { budget?: number }) {
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: '1',
      name: 'AI Financial Health Score',
      description: 'Real-time AI analysis of your complete financial health with personalized recommendations',
      impact: 'high',
      cost: 'medium',
      timeToImplement: '2 weeks',
      status: 'in-progress',
      category: 'ai',
      dependencies: [],
      userValue: 95,
      developerEffort: 60
    },
    {
      id: '2',
      name: 'Smart Bill Predictor',
      description: 'AI predicts upcoming bills and cash flow needs based on historical patterns',
      impact: 'high',
      cost: 'low',
      timeToImplement: '1 week',
      status: 'planned',
      category: 'ai',
      dependencies: ['bank-integration'],
      userValue: 88,
      developerEffort: 40
    },
    {
      id: '3',
      name: 'Voice Financial Assistant',
      description: 'Natural language processing for voice-activated financial queries and actions',
      impact: 'revolutionary',
      cost: 'high',
      timeToImplement: '3 weeks',
      status: 'planned',
      category: 'ai',
      dependencies: ['speech-recognition'],
      userValue: 92,
      developerEffort: 85
    },
    {
      id: '4',
      name: 'Micro-Investment Automation',
      description: 'Automatically invest spare change from transactions into diversified portfolios',
      impact: 'medium',
      cost: 'medium',
      timeToImplement: '2 weeks',
      status: 'planned',
      category: 'finance',
      dependencies: ['bank-integration', 'investment-api'],
      userValue: 82,
      developerEffort: 70
    },
    {
      id: '5',
      name: 'Social Finance Challenges',
      description: 'Gamified saving and budgeting challenges with friends and family',
      impact: 'medium',
      cost: 'low',
      timeToImplement: '1 week',
      status: 'planned',
      category: 'ux',
      dependencies: [],
      userValue: 75,
      developerEffort: 35
    },
    {
      id: '6',
      name: 'Financial Stress Detector',
      description: 'AI monitors spending patterns to detect and prevent financial stress',
      impact: 'high',
      cost: 'low',
      timeToImplement: '1.5 weeks',
      status: 'planned',
      category: 'ai',
      dependencies: ['behavioral-analytics'],
      userValue: 90,
      developerEffort: 45
    },
    {
      id: '7',
      name: '3D Portfolio Visualization',
      description: 'Immersive 3D visualization of investment portfolios and financial data',
      impact: 'medium',
      cost: 'medium',
      timeToImplement: '2 weeks',
      status: 'testing',
      category: 'ux',
      dependencies: ['3d-engine'],
      userValue: 78,
      developerEffort: 65
    },
    {
      id: '8',
      name: 'Crypto Integration Hub',
      description: 'Comprehensive cryptocurrency tracking, analysis, and DeFi integration',
      impact: 'high',
      cost: 'high',
      timeToImplement: '3 weeks',
      status: 'planned',
      category: 'finance',
      dependencies: ['crypto-apis'],
      userValue: 85,
      developerEffort: 80
    },
    {
      id: '9',
      name: 'Smart Contract Budgets',
      description: 'Blockchain-based automatic budget enforcement and rewards',
      impact: 'revolutionary',
      cost: 'high',
      timeToImplement: '4 weeks',
      status: 'planned',
      category: 'security',
      dependencies: ['blockchain-integration'],
      userValue: 88,
      developerEffort: 95
    },
    {
      id: '10',
      name: 'AI Market Sentiment Analysis',
      description: 'Real-time analysis of news and social media for investment timing',
      impact: 'high',
      cost: 'medium',
      timeToImplement: '2 weeks',
      status: 'planned',
      category: 'ai',
      dependencies: ['news-api', 'sentiment-ai'],
      userValue: 87,
      developerEffort: 55
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [budgetUsed, setBudgetUsed] = useState(12.50);
  const [featuresImplemented, setFeaturesImplemented] = useState(3);

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const prioritizedFeatures = [...filteredFeatures].sort((a, b) => {
    const aScore = (a.userValue * 0.6) + ((100 - a.developerEffort) * 0.4);
    const bScore = (b.userValue * 0.6) + ((100 - b.developerEffort) * 0.4);
    return bScore - aScore;
  });

  const generateNewFeature = () => {
    const newFeatureIdeas = [
      {
        name: 'AI Debt Avalanche Optimizer',
        description: 'Machine learning algorithm that continuously optimizes debt payoff strategy',
        category: 'ai',
        impact: 'high',
        userValue: 91
      },
      {
        name: 'Biometric Spending Controls',
        description: 'Use fingerprint/face recognition to authorize large purchases',
        category: 'security',
        impact: 'medium',
        userValue: 76
      },
      {
        name: 'Financial Dream Board',
        description: 'Visual goal-setting with AI-powered achievement paths',
        category: 'ux',
        impact: 'medium',
        userValue: 83
      },
      {
        name: 'Tax Optimization Autopilot',
        description: 'AI automatically implements tax-saving strategies throughout the year',
        category: 'ai',
        impact: 'revolutionary',
        userValue: 96
      }
    ];

    const randomIdea = newFeatureIdeas[Math.floor(Math.random() * newFeatureIdeas.length)];
    const newFeature: Feature = {
      id: (features.length + 1).toString(),
      ...randomIdea,
      cost: 'medium',
      timeToImplement: `${Math.floor(Math.random() * 3) + 1} weeks`,
      status: 'planned',
      dependencies: [],
      developerEffort: Math.floor(Math.random() * 40) + 30
    };

    setFeatures(prev => [newFeature, ...prev]);
  };

  const implementFeature = (featureId: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId 
        ? { ...f, status: 'in-progress' as const }
        : f
    ));
    setFeaturesImplemented(prev => prev + 1);
    setBudgetUsed(prev => prev + 2.5);
  };

  const categoryStats = Object.entries(categories).map(([key, cat]) => ({
    ...cat,
    key,
    count: features.filter(f => f.category === key).length,
    completed: features.filter(f => f.category === key && f.status === 'completed').length
  }));

  const budgetRemaining = budget - budgetUsed;
  const averageUserValue = features.reduce((sum, f) => sum + f.userValue, 0) / features.length;

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Total Features
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              <AnimatedCounter value={features.length} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              In development pipeline
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Implemented
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              <AnimatedCounter value={featuresImplemented} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(featuresImplemented / features.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Used
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={budgetUsed} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              ${budgetRemaining.toFixed(2)} remaining
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg User Value
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              <AnimatedCounter value={averageUserValue} suffix="%" decimals={0} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Impact score
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Feature Categories
          </CardTitle>
          <CardDescription>Distribution of features across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryStats.map((cat, index) => {
              const IconComponent = cat.icon;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${cat.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{cat.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {cat.count} features
                      </p>
                    </div>
                  </div>
                  <Progress value={(cat.completed / cat.count) * 100} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
        </div>
        
        <Button onClick={generateNewFeature} className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Generate New Feature
        </Button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {prioritizedFeatures.slice(0, 8).map((feature, index) => {
            const category = categories[feature.category];
            const IconComponent = category.icon;
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={impactColors[feature.impact]}>
                              {feature.impact} impact
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {feature.timeToImplement}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className={statusColors[feature.status]}>
                        {feature.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">User Value</p>
                        <div className="flex items-center gap-2">
                          <Progress value={feature.userValue} className="h-2 flex-1" />
                          <span className="text-xs font-medium">{feature.userValue}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">Complexity</p>
                        <div className="flex items-center gap-2">
                          <Progress value={feature.developerEffort} className="h-2 flex-1" />
                          <span className="text-xs font-medium">{feature.developerEffort}%</span>
                        </div>
                      </div>
                    </div>

                    {feature.dependencies.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Dependencies:</p>
                        <div className="flex flex-wrap gap-1">
                          {feature.dependencies.map((dep, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {feature.status === 'planned' ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => implementFeature(feature.id)}
                          disabled={budgetRemaining < 2.5}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Implement
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          <Clock className="h-3 w-3 mr-1" />
                          {feature.status}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Achievement System */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Development Achievements
          </CardTitle>
          <CardDescription>Unlock rewards as you build amazing features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-medium">Feature Pioneer</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Implement 5 features
              </div>
              <div className="mt-2">
                <Progress value={(featuresImplemented / 5) * 100} className="h-2" />
              </div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">Budget Master</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Stay under budget
              </div>
              <div className="mt-2">
                <Progress value={(budgetUsed / budget) * 100} className="h-2" />
              </div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-medium">Quality Focused</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Average 85%+ user value
              </div>
              <div className="mt-2">
                <Progress value={averageUserValue} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}