import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  BookOpen, 
  Award, 
  Target, 
  Clock,
  Star,
  Play,
  CheckCircle,
  Brain,
  TrendingUp,
  Users,
  Search,
  Filter,
  Download,
  Trophy
} from 'lucide-react';

export default function LearningHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: learningProgress, isLoading } = useQuery({
    queryKey: ['/api/learning/progress'],
    refetchInterval: 300000,
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/learning/courses', selectedLevel, selectedCategory],
    refetchInterval: 600000,
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/learning/achievements'],
    refetchInterval: 300000,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest('/api/learning/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId })
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning/progress'] });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Learning Access Hub
        </h1>
        <p className="text-gray-600">Personalized financial education with adaptive learning paths and certification programs</p>
      </div>

      {/* Learning Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">73%</div>
            <Progress value={73} className="mt-2" />
            <p className="text-xs text-gray-600 mt-1">8 of 11 modules completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">5</div>
            <p className="text-xs text-gray-600 mt-1">Financial Planning Certified</p>
            <Badge className="mt-2 bg-green-100 text-green-800">Expert Level</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">47h</div>
            <p className="text-xs text-gray-600 mt-1">This month</p>
            <div className="text-xs text-green-600 mt-1">+15% vs last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              Knowledge Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">892</div>
            <p className="text-xs text-gray-600 mt-1">Top 15% of learners</p>
            <Badge className="mt-2 bg-yellow-100 text-yellow-800">Advanced</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="investing">Investing</option>
                    <option value="budgeting">Budgeting</option>
                    <option value="retirement">Retirement</option>
                    <option value="taxes">Taxes</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured Course */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600">Featured</Badge>
                  <Badge variant="outline">4.9 ⭐</Badge>
                </div>
                <CardTitle className="text-lg">Advanced Portfolio Theory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>6.5 hours</span>
                    <Users className="w-4 h-4 ml-2" />
                    <span>2,847 students</span>
                  </div>
                  <p className="text-sm text-gray-700">Master modern portfolio theory, risk-return optimization, and advanced diversification strategies.</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800">Advanced</Badge>
                    <Button size="sm" onClick={() => enrollMutation.mutate('portfolio-theory')}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regular Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">4.7 ⭐</Badge>
                  <Badge className="bg-green-100 text-green-800">In Progress</Badge>
                </div>
                <CardTitle className="text-lg">Tax Strategy Fundamentals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>4.2 hours</span>
                    <Users className="w-4 h-4 ml-2" />
                    <span>1,523 students</span>
                  </div>
                  <p className="text-sm text-gray-700">Learn legal tax optimization strategies, deductions, and planning techniques.</p>
                  <Progress value={65} className="h-2" />
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800">Intermediate</Badge>
                    <Button size="sm" variant="outline">Continue</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">4.8 ⭐</Badge>
                  <Badge className="bg-purple-100 text-purple-800">New</Badge>
                </div>
                <CardTitle className="text-lg">Retirement Income Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>5.8 hours</span>
                    <Users className="w-4 h-4 ml-2" />
                    <span>892 students</span>
                  </div>
                  <p className="text-sm text-gray-700">Create sustainable retirement income through Social Security optimization and withdrawal strategies.</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800">Intermediate</Badge>
                    <Button size="sm" onClick={() => enrollMutation.mutate('retirement-income')}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">4.6 ⭐</Badge>
                  <Badge className="bg-red-100 text-red-800">Premium</Badge>
                </div>
                <CardTitle className="text-lg">Real Estate Investment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>8.3 hours</span>
                    <Users className="w-4 h-4 ml-2" />
                    <span>634 students</span>
                  </div>
                  <p className="text-sm text-gray-700">Complete guide to real estate investing, REITs, and property analysis.</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800">Advanced</Badge>
                    <Button size="sm" onClick={() => enrollMutation.mutate('real-estate')}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">4.9 ⭐</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">Bestseller</Badge>
                </div>
                <CardTitle className="text-lg">Emergency Fund Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-yellow-500 to-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>2.1 hours</span>
                    <Users className="w-4 h-4 ml-2" />
                    <span>4,234 students</span>
                  </div>
                  <p className="text-sm text-gray-700">Build and optimize your emergency fund for financial security.</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                    <Button size="sm" variant="outline">Completed</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">4.7 ⭐</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Interactive</Badge>
                </div>
                <CardTitle className="text-lg">Stock Analysis Masterclass</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>7.2 hours</span>
                    <Users className="w-4 h-4 ml-2" />
                    <span>1,876 students</span>
                  </div>
                  <p className="text-sm text-gray-700">Learn fundamental and technical analysis for informed stock selection.</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800">Advanced</Badge>
                    <Button size="sm" onClick={() => enrollMutation.mutate('stock-analysis')}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Knowledge Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Investment Fundamentals</h4>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">25 questions • 30 minutes</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Score: 92%</span>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Tax Planning Strategies</h4>
                      <Badge className="bg-blue-100 text-blue-800">Available</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">30 questions • 45 minutes</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unlock after course completion</span>
                      <Button size="sm">Start Assessment</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Portfolio Management</h4>
                      <Badge variant="outline">Locked</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">35 questions • 60 minutes</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Complete prerequisite courses</span>
                      <Button size="sm" variant="outline" disabled>Locked</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Level Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Investment Knowledge</span>
                      <span className="text-sm text-gray-600">Advanced (92%)</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Tax Planning</span>
                      <span className="text-sm text-gray-600">Intermediate (78%)</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Retirement Planning</span>
                      <span className="text-sm text-gray-600">Advanced (89%)</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Risk Management</span>
                      <span className="text-sm text-gray-600">Intermediate (65%)</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Estate Planning</span>
                      <span className="text-sm text-gray-600">Beginner (34%)</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Recommended Focus</h4>
                  <p className="text-sm text-blue-700">Complete Estate Planning fundamentals to achieve well-rounded financial literacy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-600">Earned</Badge>
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Personal Finance Fundamentals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm text-gray-600">Earned: March 15, 2025</div>
                  <div className="text-sm text-gray-600">Valid until: March 15, 2027</div>
                </div>
                <Button size="sm" className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600">In Progress</Badge>
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Investment Advisor Specialist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <Progress value={73} className="mb-2" />
                  <div className="text-sm text-gray-600">73% Complete</div>
                  <div className="text-sm text-gray-600">Est. completion: April 2025</div>
                </div>
                <Button size="sm" className="w-full">Continue Learning</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Available</Badge>
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
                <CardTitle className="text-lg">Advanced Tax Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600">Requirements:</div>
                  <div className="text-xs text-gray-500">• Tax Strategy Fundamentals</div>
                  <div className="text-xs text-gray-500">• 2 Assessment Passes</div>
                </div>
                <Button size="sm" className="w-full" variant="outline">
                  View Requirements
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Available</Badge>
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
                <CardTitle className="text-lg">Retirement Planning Expert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600">Requirements:</div>
                  <div className="text-xs text-gray-500">• 5 Completed Courses</div>
                  <div className="text-xs text-gray-500">• 90%+ Assessment Score</div>
                </div>
                <Button size="sm" className="w-full" variant="outline">
                  Start Program
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Certified Financial Planner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm text-gray-600">Professional Certification</div>
                  <div className="text-xs text-gray-500">• 18-month program</div>
                  <div className="text-xs text-gray-500">• Industry recognized</div>
                </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-100 text-orange-800">Premium</Badge>
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Estate Planning Specialist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm text-gray-600">Advanced Certification</div>
                  <div className="text-xs text-gray-500">• 12-month program</div>
                  <div className="text-xs text-gray-500">• Legal partnerships</div>
                </div>
                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Learning Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-semibold">Courses Completed</div>
                    <div className="text-2xl font-bold text-blue-700">12</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-sm font-semibold">Hours Studied</div>
                    <div className="text-2xl font-bold text-green-700">47</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 text-sm font-semibold">Assessments Passed</div>
                    <div className="text-2xl font-bold text-purple-700">8</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-orange-600 text-sm font-semibold">Streak (days)</div>
                    <div className="text-2xl font-bold text-orange-700">23</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Weekly Learning Goal</h4>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">5 hours per week</span>
                    <span className="text-sm">3.2 / 5.0 hours</span>
                  </div>
                  <Progress value={64} className="h-3" />
                  <div className="text-xs text-gray-600">2 days remaining this week</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Learning Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Investment Fundamentals</div>
                      <div className="text-xs text-gray-600">Completed March 10</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Tax Strategy Fundamentals</div>
                      <div className="text-xs text-gray-600">In Progress (65%)</div>
                      <Progress value={65} className="h-1 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Retirement Income Planning</div>
                      <div className="text-xs text-gray-600">Unlocks after current course</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">4</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Advanced Portfolio Theory</div>
                      <div className="text-xs text-gray-600">Final course in path</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-1">Path Completion Reward</h4>
                  <p className="text-sm text-purple-700">Investment Advisor Specialist Certification</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 border-gold bg-yellow-50">
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Knowledge Master</CardTitle>
                  <p className="text-sm text-gray-600">Score 90%+ on 5 assessments</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className="bg-yellow-100 text-yellow-800">Legendary</Badge>
                  <div className="text-xs text-gray-600 mt-2">Earned March 20, 2025</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Speed Learner</CardTitle>
                  <p className="text-sm text-gray-600">Complete 3 courses in one month</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className="bg-blue-100 text-blue-800">Epic</Badge>
                  <div className="text-xs text-gray-600 mt-2">Earned March 5, 2025</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Consistency Champion</CardTitle>
                  <p className="text-sm text-gray-600">Study for 30 consecutive days</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Progress value={77} className="mb-2" />
                  <div className="text-sm text-gray-600">23 / 30 days</div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Perfect Score</CardTitle>
                  <p className="text-sm text-gray-600">Achieve 100% on any assessment</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className="bg-purple-100 text-purple-800">Rare</Badge>
                  <div className="text-xs text-gray-600 mt-2">Earned February 28, 2025</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Theory Expert</CardTitle>
                  <p className="text-sm text-gray-600">Master advanced financial concepts</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Progress value={45} className="mb-2" />
                  <div className="text-sm text-gray-600">2 / 4 courses</div>
                  <Badge variant="outline">In Progress</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">Community Helper</CardTitle>
                  <p className="text-sm text-gray-600">Help 10 fellow learners</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Progress value={30} className="mb-2" />
                  <div className="text-sm text-gray-600">3 / 10 helped</div>
                  <Badge variant="outline">Locked</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}