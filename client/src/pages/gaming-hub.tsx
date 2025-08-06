import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Trophy, 
  Star, 
  Target, 
  Users, 
  Zap,
  Crown,
  Medal,
  Gift,
  Calendar,
  TrendingUp,
  Brain,
  Coins,
  Flame,
  Award,
  PlayCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

interface UserGameProfile {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  streak: number;
  badges: GameBadge[];
  rank: number;
  age: number;
  cryptoEarned: number;
}

interface GameBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  xpReward: number;
  cryptoReward: number;
  timeLimit: number;
  ageGroup: 'young' | 'experienced' | 'all';
  category: string;
  status: 'available' | 'in_progress' | 'completed';
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
  badges: number;
  cryptoEarned: number;
  ageGroup: 'young' | 'experienced';
}

export default function GamingHub() {
  const [activeTab, setActiveTab] = useState('challenges');
  const [userAge, setUserAge] = useState(22); // This would come from user profile
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine age group
  const ageGroup = userAge <= 25 ? 'young' : 'experienced';

  // Mock user game profile
  const userProfile: UserGameProfile = {
    level: 12,
    xp: 2450,
    xpToNext: 550,
    totalXp: 12450,
    streak: 7,
    badges: [
      {
        id: '1',
        name: 'First Steps',
        description: 'Completed your first financial challenge',
        icon: '🎯',
        rarity: 'common',
        earnedAt: '2025-08-01T10:00:00Z'
      },
      {
        id: '2',
        name: 'Crypto Collector',
        description: 'Earned your first cryptocurrency',
        icon: '₿',
        rarity: 'rare',
        earnedAt: '2025-08-03T14:30:00Z'
      },
      {
        id: '3',
        name: 'Tax Master',
        description: 'Solved 10 complex tax optimization challenges',
        icon: '📊',
        rarity: 'epic',
        earnedAt: '2025-08-05T16:45:00Z'
      }
    ],
    rank: 47,
    age: userAge,
    cryptoEarned: 0.0234
  };

  // Mock challenges based on age group
  const youngChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Budget Basics Quest',
      description: 'Learn to create your first budget through an interactive game',
      difficulty: 2,
      xpReward: 100,
      cryptoReward: 0.001,
      timeLimit: 15,
      ageGroup: 'young',
      category: 'Budgeting',
      status: 'available'
    },
    {
      id: '2',
      title: 'Crypto Treasure Hunt',
      description: 'Discover how cryptocurrency works through fun puzzles',
      difficulty: 3,
      xpReward: 150,
      cryptoReward: 0.0015,
      timeLimit: 20,
      ageGroup: 'young',
      category: 'Cryptocurrency',
      status: 'available'
    },
    {
      id: '3',
      title: 'Investment Adventure',
      description: 'Start your investment journey with virtual portfolio management',
      difficulty: 4,
      xpReward: 200,
      cryptoReward: 0.002,
      timeLimit: 30,
      ageGroup: 'young',
      category: 'Investing',
      status: 'in_progress'
    }
  ];

  const experiencedChallenges: Challenge[] = [
    {
      id: '4',
      title: 'Tax Optimization Master',
      description: 'Solve complex tax scenarios using 2025 reforms and spectrum analysis',
      difficulty: 8,
      xpReward: 500,
      cryptoReward: 0.01,
      timeLimit: 60,
      ageGroup: 'experienced',
      category: 'Tax Planning',
      status: 'available'
    },
    {
      id: '5',
      title: 'Quantum Portfolio Challenge',
      description: 'Use quantum mathematics to optimize a million-dollar portfolio',
      difficulty: 9,
      xpReward: 750,
      cryptoReward: 0.015,
      timeLimit: 90,
      ageGroup: 'experienced',
      category: 'Advanced Investing',
      status: 'available'
    },
    {
      id: '6',
      title: 'Market Prediction Tournament',
      description: 'Predict market movements using AI-powered analysis tools',
      difficulty: 10,
      xpReward: 1000,
      cryptoReward: 0.02,
      timeLimit: 120,
      ageGroup: 'experienced',
      category: 'Market Analysis',
      status: 'completed'
    }
  ];

  const allChallenges = ageGroup === 'young' ? youngChallenges : experiencedChallenges;

  // Mock leaderboard
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'CryptoGenius_19', level: 25, xp: 45000, badges: 15, cryptoEarned: 0.567, ageGroup: 'young' },
    { rank: 2, username: 'TaxMaster_Pro', level: 28, xp: 52000, badges: 22, cryptoEarned: 0.892, ageGroup: 'experienced' },
    { rank: 3, username: 'InvestmentWiz_22', level: 23, xp: 41000, badges: 13, cryptoEarned: 0.445, ageGroup: 'young' },
    { rank: 4, username: 'QuantumTrader', level: 31, xp: 67000, badges: 28, cryptoEarned: 1.234, ageGroup: 'experienced' },
    { rank: 5, username: 'BudgetBoss_20', level: 18, xp: 32000, badges: 10, cryptoEarned: 0.321, ageGroup: 'young' }
  ];

  const startChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return apiRequest('POST', '/api/gaming/start-challenge', { challengeId });
    },
    onSuccess: () => {
      toast({
        title: "Challenge Started!",
        description: "Good luck! Complete the challenge to earn XP and crypto rewards.",
      });
    }
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100';
    if (difficulty <= 8) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
      <FloatingElements />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Gamepad2 className="h-12 w-12 text-purple-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gaming Hub
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {ageGroup === 'young' 
                ? "Learn financial skills through fun, interactive games and challenges designed for young learners!"
                : "Master advanced financial strategies through sophisticated simulations and complex challenges!"
              }
            </p>
          </motion.div>
        </div>

        {/* User Profile Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="h-6 w-6 text-yellow-600 mr-1" />
                  <span className="text-2xl font-bold text-yellow-600">
                    {userProfile.level}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Level</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-blue-600 mr-1" />
                  <span className="text-2xl font-bold text-blue-600">
                    {userProfile.xp.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">XP</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Flame className="h-6 w-6 text-orange-600 mr-1" />
                  <span className="text-2xl font-bold text-orange-600">
                    {userProfile.streak}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Medal className="h-6 w-6 text-green-600 mr-1" />
                  <span className="text-2xl font-bold text-green-600">
                    {userProfile.badges.length}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Badges</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="h-6 w-6 text-purple-600 mr-1" />
                  <span className="text-2xl font-bold text-purple-600">
                    {userProfile.cryptoEarned}
                  </span>
                </div>
                <div className="text-sm text-gray-600">BTC Earned</div>
              </CardContent>
            </Card>
          </Card3D>
        </div>

        {/* XP Progress */}
        <Card3D className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress to Level {userProfile.level + 1}</span>
                <span className="text-sm text-gray-600">
                  {userProfile.xp} / {userProfile.xp + userProfile.xpToNext} XP
                </span>
              </div>
              <Progress 
                value={(userProfile.xp / (userProfile.xp + userProfile.xpToNext)) * 100} 
                className="h-3"
              />
            </CardContent>
          </Card>
        </Card3D>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid gap-6">
              {allChallenges.map((challenge) => (
                <Card3D key={challenge.id}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <PlayCircle className="h-5 w-5" />
                            {challenge.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {challenge.description}
                          </CardDescription>
                        </div>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          Difficulty {challenge.difficulty}/10
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">+{challenge.xpReward} XP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">+{challenge.cryptoReward} BTC</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">{challenge.timeLimit} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{challenge.category}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => startChallengeMutation.mutate(challenge.id)}
                        disabled={challenge.status === 'completed' || startChallengeMutation.isPending}
                        className={`w-full ${
                          challenge.status === 'completed' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : challenge.status === 'in_progress'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600'
                        }`}
                      >
                        {challenge.status === 'completed' && <Trophy className="mr-2 h-4 w-4" />}
                        {challenge.status === 'in_progress' && <PlayCircle className="mr-2 h-4 w-4" />}
                        {challenge.status === 'available' && <Star className="mr-2 h-4 w-4" />}
                        
                        {challenge.status === 'completed' 
                          ? 'Completed' 
                          : challenge.status === 'in_progress'
                          ? 'Continue Challenge'
                          : 'Start Challenge'
                        }
                      </Button>
                    </CardContent>
                  </Card>
                </Card3D>
              ))}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {userProfile.badges.map((badge) => (
                <Card3D key={badge.id}>
                  <Card className={`border-2 ${getRarityColor(badge.rarity)}`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-4">{badge.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                      <Badge className={getRarityColor(badge.rarity)}>
                        {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-2">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Card3D>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top players across all age groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1 ? 'bg-yellow-500 text-white' :
                            entry.rank === 2 ? 'bg-gray-400 text-white' :
                            entry.rank === 3 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-sm text-gray-600">
                              Level {entry.level} • {entry.ageGroup === 'young' ? 'Young Learner' : 'Experienced'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{entry.xp.toLocaleString()} XP</div>
                          <div className="text-sm text-gray-600">
                            {entry.badges} badges • {entry.cryptoEarned} BTC
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Daily Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Login Streak Bonus</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          +{userProfile.streak * 10} XP
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Daily Challenge</span>
                        <Button size="sm" variant="outline">Claim 150 XP</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Community Contribution</span>
                        <Button size="sm" variant="outline">Available</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Weekly Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Complete 5 Challenges</span>
                        <Badge className="bg-green-100 text-green-800">3/5</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Earn 1000 XP</span>
                        <Badge className="bg-blue-100 text-blue-800">750/1000</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Help 3 Community Members</span>
                        <Badge className="bg-purple-100 text-purple-800">1/3</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}