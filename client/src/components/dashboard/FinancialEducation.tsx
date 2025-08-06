import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  TrendingUp,
  Target,
  Award,
  Brain,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  progress: number; // percentage
  completed: boolean;
  category: string;
  rating: number;
  enrolledUsers: number;
  thumbnail: string;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: string[];
  totalDuration: number;
  progress: number;
  estimatedCompletion: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  requirement: number;
}

const difficultyColors = {
  beginner: 'from-green-500 to-green-600',
  intermediate: 'from-orange-500 to-orange-600',
  advanced: 'from-red-500 to-red-600'
};

export function FinancialEducation({ userId }: { userId: string }) {
  const [learningModules] = useState<LearningModule[]>([
    {
      id: '1',
      title: 'Emergency Fund Basics',
      description: 'Learn how to build and maintain an emergency fund that protects you from financial surprises.',
      difficulty: 'beginner',
      duration: 15,
      progress: 85,
      completed: false,
      category: 'Savings',
      rating: 4.8,
      enrolledUsers: 12543,
      thumbnail: '💰'
    },
    {
      id: '2',
      title: 'Investment Portfolio Diversification',
      description: 'Master the art of spreading risk across different asset classes to optimize returns.',
      difficulty: 'intermediate',
      duration: 25,
      progress: 45,
      completed: false,
      category: 'Investing',
      rating: 4.9,
      enrolledUsers: 8932,
      thumbnail: '📊'
    },
    {
      id: '3',
      title: 'Tax Optimization Strategies',
      description: 'Advanced techniques to minimize your tax burden legally and effectively.',
      difficulty: 'advanced',
      duration: 40,
      progress: 0,
      completed: false,
      category: 'Tax Planning',
      rating: 4.7,
      enrolledUsers: 5421,
      thumbnail: '📋'
    },
    {
      id: '4',
      title: 'Debt Management Fundamentals',
      description: 'Practical strategies to eliminate debt and maintain good credit health.',
      difficulty: 'beginner',
      duration: 20,
      progress: 100,
      completed: true,
      category: 'Debt Management',
      rating: 4.6,
      enrolledUsers: 15632,
      thumbnail: '🎯'
    }
  ]);

  const [learningPaths] = useState<LearningPath[]>([
    {
      id: '1',
      name: 'Financial Foundations',
      description: 'Build a solid foundation in personal finance management',
      modules: ['1', '4', '5', '6'],
      totalDuration: 120,
      progress: 65,
      estimatedCompletion: '2 weeks'
    },
    {
      id: '2',
      name: 'Investment Mastery',
      description: 'Become proficient in building and managing investment portfolios',
      modules: ['2', '7', '8', '9'],
      totalDuration: 180,
      progress: 25,
      estimatedCompletion: '3 weeks'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first financial education module',
      icon: '🏁',
      unlocked: true,
      progress: 1,
      requirement: 1
    },
    {
      id: '2',
      title: 'Learning Streak',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      unlocked: false,
      progress: 3,
      requirement: 7
    },
    {
      id: '3',
      title: 'Knowledge Master',
      description: 'Complete 10 modules with 90% or higher scores',
      icon: '🎓',
      unlocked: false,
      progress: 2,
      requirement: 10
    }
  ]);

  const [currentStreak, setCurrentStreak] = useState(3);
  const [totalModulesCompleted, setTotalModulesCompleted] = useState(8);
  const [averageScore, setAverageScore] = useState(87.5);

  const completedModules = learningModules.filter(m => m.completed).length;
  const totalLearningTime = learningModules.reduce((sum, m) => sum + (m.duration * (m.progress / 100)), 0);

  const continueModule = (moduleId: string) => {
    // Simulate continuing a module
    console.log(`Continuing module ${moduleId}`);
  };

  const startModule = (moduleId: string) => {
    // Simulate starting a module
    console.log(`Starting module ${moduleId}`);
  };

  return (
    <div className="space-y-6">
      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Modules Completed
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={completedModules} suffix={`/${learningModules.length}`} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(completedModules / learningModules.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Learning Time
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              <AnimatedCounter value={Math.round(totalLearningTime)} suffix="m" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 dark:text-green-400">
              This month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Average Score
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              <AnimatedCounter value={averageScore} suffix="%" decimals={1} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Excellent performance!
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Streak
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              <AnimatedCounter value={currentStreak} suffix=" days" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Keep it up!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Learning Paths
          </CardTitle>
          <CardDescription>
            Structured courses to advance your financial knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {path.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {path.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {path.estimatedCompletion}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {path.modules.length} modules • {path.totalDuration} minutes
                  </div>
                  <div className="text-sm font-medium">
                    {path.progress}% complete
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={path.progress} className="flex-1 h-2" />
                  <Button size="sm" variant="outline" className="gap-2">
                    Continue
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Modules</CardTitle>
          <CardDescription>Continue your financial education journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{module.thumbnail}</div>
                        <div>
                          <CardTitle className="text-base">{module.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs bg-gradient-to-r ${difficultyColors[module.difficulty]} text-white border-none`}
                            >
                              {module.difficulty}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {module.duration}m
                            </div>
                          </div>
                        </div>
                      </div>
                      {module.completed && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {module.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{module.rating}</span>
                          </div>
                          <span>{module.enrolledUsers.toLocaleString()} enrolled</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        {module.completed ? (
                          <Button variant="outline" size="sm" className="flex-1">
                            Review
                          </Button>
                        ) : module.progress > 0 ? (
                          <Button 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => continueModule(module.id)}
                          >
                            <Play className="h-3 w-3" />
                            Continue
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => startModule(module.id)}
                          >
                            Start Module
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Track your learning milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${achievement.unlocked ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'opacity-75'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-medium text-sm">{achievement.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.requirement}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.requirement) * 100} 
                        className="h-1" 
                      />
                    </div>
                    
                    {achievement.unlocked && (
                      <Badge variant="outline" className="mt-2 bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}