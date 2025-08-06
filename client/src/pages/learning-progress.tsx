import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Target, 
  Calendar, 
  Brain,
  TrendingUp,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Zap
} from "lucide-react";

export default function LearningProgress() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock learning progress data
  const progressData = {
    overall: {
      completedLessons: 47,
      totalLessons: 120,
      currentStreak: 12,
      totalHours: 68.5,
      averageScore: 87.3,
      skillLevel: 'Intermediate'
    },
    achievements: [
      {
        id: 1,
        title: 'Budgeting Master',
        description: 'Completed all budgeting fundamentals',
        icon: <Trophy className="w-5 h-5" />,
        earned: true,
        date: '2024-12-01'
      },
      {
        id: 2,
        title: 'Investment Explorer',
        description: 'Started learning about investments',
        icon: <TrendingUp className="w-5 h-5" />,
        earned: true,
        date: '2024-11-28'
      },
      {
        id: 3,
        title: 'Savings Champion',
        description: 'Set up emergency fund plan',
        icon: <Target className="w-5 h-5" />,
        earned: false,
        progress: 75
      }
    ],
    recentActivity: [
      {
        id: 1,
        type: 'lesson',
        title: 'Risk Management in Investing',
        score: 92,
        date: '2024-12-06',
        duration: '25 min'
      },
      {
        id: 2,
        type: 'quiz',
        title: 'Personal Finance Basics Quiz',
        score: 88,
        date: '2024-12-05',
        duration: '12 min'
      },
      {
        id: 3,
        type: 'lesson',
        title: 'Understanding Credit Scores',
        score: 95,
        date: '2024-12-04',
        duration: '30 min'
      }
    ],
    skills: [
      { name: 'Budgeting', level: 95, maxLevel: 100 },
      { name: 'Investing', level: 68, maxLevel: 100 },
      { name: 'Saving', level: 82, maxLevel: 100 },
      { name: 'Credit Management', level: 45, maxLevel: 100 },
      { name: 'Tax Planning', level: 23, maxLevel: 100 }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Progress</h1>
        <p className="text-gray-600">Track your financial education journey and achievements</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.overall.completedLessons}/{progressData.overall.totalLessons}
            </div>
            <Progress 
              value={(progressData.overall.completedLessons / progressData.overall.totalLessons) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overall.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overall.totalHours}h</div>
            <p className="text-xs text-muted-foreground">Total time invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.overall.averageScore}%</div>
            <Badge className="mt-2">{progressData.overall.skillLevel}</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Financial Skills Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {progressData.skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-500">{skill.level}/{skill.maxLevel}</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressData.achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{achievement.title}</CardTitle>
                      {achievement.earned && (
                        <Badge className="mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  {achievement.earned ? (
                    <p className="text-xs text-green-600">Earned on {achievement.date}</p>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-gray-500">{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        {activity.type === 'lesson' ? <BookOpen className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-500">{activity.date} • {activity.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{activity.score}%</div>
                      <Badge variant="outline">
                        {activity.score >= 90 ? 'Excellent' : activity.score >= 80 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}