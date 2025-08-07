import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Users, 
  MessageCircle, 
  ThumbsUp, 
  Award, 
  Star,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Brain,
  DollarSign,
  Bookmark,
  Share,
  Flag,
  Crown
} from 'lucide-react';

export default function CommunityDiscussions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const { data: communityStats, isLoading } = useQuery({
    queryKey: ['/api/community/stats'],
    refetchInterval: 300000,
  });

  const { data: discussions } = useQuery({
    queryKey: ['/api/community/discussions', selectedCategory, searchTerm],
    refetchInterval: 60000,
  });

  const { data: experts } = useQuery({
    queryKey: ['/api/community/experts'],
    refetchInterval: 300000,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/community/leaderboard'],
    refetchInterval: 300000,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('/api/community/create-post', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/discussions'] });
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-purple-600" />
          Community & Discussions
        </h1>
        <p className="text-gray-600">Connect with financial experts and peers in a gamified learning environment with cryptocurrency rewards</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8,247</div>
            <p className="text-xs text-gray-600 mt-1">+347 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              Discussions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,523</div>
            <p className="text-xs text-gray-600 mt-1">456 active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Expert Advisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">142</div>
            <p className="text-xs text-gray-600 mt-1">Certified professionals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              Crypto Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">24,891</div>
            <p className="text-xs text-gray-600 mt-1">FinCoins distributed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Main Discussion Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="investing">Investing</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="taxes">Taxes</option>
                    <option value="retirement">Retirement</option>
                    <option value="budgeting">Budgeting</option>
                    <option value="real-estate">Real Estate</option>
                  </select>
                  <Button onClick={() => setShowNewPost(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Post Form */}
          {showNewPost && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Discussion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Discussion title..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Share your thoughts, ask questions, or start a discussion..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => createPostMutation.mutate({
                      title: newPostTitle,
                      content: newPostContent,
                      category: selectedCategory === 'all' ? 'general' : selectedCategory
                    })}
                    disabled={!newPostTitle || !newPostContent || createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? 'Posting...' : 'Post Discussion'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discussion Posts */}
          <div className="space-y-4">
            {/* Featured/Pinned Post */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/avatars/expert1.jpg" />
                      <AvatarFallback>SE</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Sarah Chen, CFP</span>
                        <Badge className="bg-purple-600">Expert</Badge>
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="text-sm text-gray-600">Financial Planning Expert • 2 hours ago</div>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Pinned</Badge>
                </div>
                <CardTitle className="text-lg mt-3">2025 Tax Reform: What Every Investor Needs to Know</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  The recent tax reforms have introduced significant changes that will impact investment strategies. 
                  Here's a comprehensive breakdown of the key changes and how they affect different types of investments...
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>247</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>89 replies</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>156 saved</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Taxes</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Regular Posts */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/avatars/user1.jpg" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Michael Rodriguez</span>
                      <Badge variant="outline">Active Member</Badge>
                    </div>
                    <div className="text-sm text-gray-600">Investment Enthusiast • 4 hours ago</div>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">Best crypto portfolio allocation for 2025?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  I'm looking to rebalance my crypto portfolio for the new year. Currently holding 60% BTC, 25% ETH, 15% alts. 
                  Considering the market trends and regulatory changes, what allocation would you recommend? 
                  Any thoughts on emerging DeFi protocols?
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>34</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>12 replies</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Crypto</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/avatars/expert2.jpg" />
                    <AvatarFallback>JL</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Dr. James Liu</span>
                      <Badge className="bg-blue-600">Expert</Badge>
                    </div>
                    <div className="text-sm text-gray-600">Economics Professor • 6 hours ago</div>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">Federal Reserve Policy Impact on Real Estate Investment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  With the recent Fed decisions on interest rates, I wanted to share some analysis on how this affects 
                  real estate investment strategies. Key points to consider include mortgage rates, REIT performance, 
                  and commercial property valuations...
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>128</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>43 replies</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Real Estate</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/avatars/user2.jpg" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Amy Smith</span>
                      <Badge variant="outline">New Member</Badge>
                    </div>
                    <div className="text-sm text-gray-600">Getting Started • 8 hours ago</div>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">Retirement planning at 25 - where to start?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Just started my first job and want to get serious about retirement planning. Everyone says to start early, 
                  but I'm overwhelmed with all the options - 401k, IRA, Roth IRA. What should be my priority? 
                  Any beginner-friendly resources?
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>67</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>28 replies</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Retirement</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Expert Advisors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Expert Advisors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src="/avatars/expert1.jpg" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Sarah Chen, CFP</div>
                    <div className="text-xs text-gray-600">Tax & Investment Planning</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">4.9 • 234 answers</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src="/avatars/expert2.jpg" />
                    <AvatarFallback>JL</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Dr. James Liu</div>
                    <div className="text-xs text-gray-600">Economics & Markets</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">4.8 • 189 answers</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src="/avatars/expert3.jpg" />
                    <AvatarFallback>RT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Robert Taylor</div>
                    <div className="text-xs text-gray-600">Crypto & Blockchain</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">4.7 • 156 answers</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full" variant="outline">
                View All Experts
              </Button>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Community Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Alex Johnson</div>
                    <div className="text-xs text-gray-600">2,847 FinCoins</div>
                  </div>
                  <Crown className="w-4 h-4 text-yellow-500" />
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Maria Garcia</div>
                    <div className="text-xs text-gray-600">2,134 FinCoins</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">David Kim</div>
                    <div className="text-xs text-gray-600">1,923 FinCoins</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg border">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">7</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">You</div>
                    <div className="text-xs text-gray-600">1,247 FinCoins</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 rounded border-l-2 border-blue-500">
                  <span className="text-sm font-medium">#TaxReform2025</span>
                  <Badge variant="outline" className="text-xs">Hot</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border-l-2 border-green-500">
                  <span className="text-sm font-medium">#CryptoETFs</span>
                  <Badge variant="outline" className="text-xs">Rising</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border-l-2 border-purple-500">
                  <span className="text-sm font-medium">#RetirementPlanning</span>
                  <Badge variant="outline" className="text-xs">Popular</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border-l-2 border-orange-500">
                  <span className="text-sm font-medium">#RealEstateMarket</span>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border-l-2 border-red-500">
                  <span className="text-sm font-medium">#InflationHedge</span>
                  <Badge variant="outline" className="text-xs">Trending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                Earn FinCoins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span>Answer questions</span>
                  <Badge className="bg-green-100 text-green-800">+10 FC</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span>Quality posts</span>
                  <Badge className="bg-blue-100 text-blue-800">+25 FC</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span>Expert verification</span>
                  <Badge className="bg-purple-100 text-purple-800">+100 FC</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span>Daily login</span>
                  <Badge className="bg-yellow-100 text-yellow-800">+5 FC</Badge>
                </div>
              </div>
              <div className="text-center pt-2 border-t">
                <div className="text-sm text-gray-600">Your Balance</div>
                <div className="text-xl font-bold text-yellow-600">1,247 FinCoins</div>
                <Button size="sm" className="mt-2 w-full" variant="outline">
                  Redeem Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}