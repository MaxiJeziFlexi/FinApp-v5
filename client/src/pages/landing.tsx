import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, logout } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  TrendingUp,
  Shield,
  Globe,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  DollarSign,
  Target,
  Users,
  Award,
  Sparkles,
  ChevronDown,
  MessageSquare,
  PieChart,
  BookOpen,
  Calculator,
  CreditCard,
  FileText,
  TrendingDown,
  PiggyBank,
  Coins,
  Trophy,
  GamepadIcon,
  Gift,
  Bitcoin,
  Activity,
  BarChart2,
  Building,
  Briefcase,
  Heart,
  Home,
  GraduationCap,
  Clock,
  Lock,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
  Crown,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import FloatingElements, {
  Card3D,
  Button3D,
  AnimatedNumber3D,
} from "@/components/3d/FloatingElements";
import SignUpModal from "@/components/auth/SignUpModal";

interface FeatureCard {
  icon: any;
  title: string;
  description: string;
  gradient: string;
}

interface StatCard {
  value: string;
  label: string;
  icon: any;
}

interface TestimonialCard {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

const aiUseCases = [
  {
    icon: FileText,
    title: "AI Report Generator",
    description:
      "Generate comprehensive financial reports analyzing your spending, investments, and growth opportunities with AI-powered insights.",
    features: [
      "Monthly financial summaries",
      "Investment performance analysis",
      "Risk assessment reports",
      "Goal progress tracking",
    ],
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: TrendingUp,
    title: "Investment Consultation AI",
    description:
      "Get real-time investment advice based on current market conditions, your risk profile, and financial goals.",
    features: [
      "Portfolio optimization",
      "Market trend analysis",
      "Risk-adjusted recommendations",
      "Diversification strategies",
    ],
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Calculator,
    title: "Tax Optimization & Loopholes",
    description:
      "Stay ahead with up-to-date tax reform analysis and legal optimization strategies updated in real-time.",
    features: [
      "2025 tax reform compliance",
      "Legal loophole identification",
      "Deduction maximization",
      "Tax-loss harvesting",
    ],
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: PiggyBank,
    title: "Safe Retirement Planning",
    description:
      "AI-powered retirement strategies that adapt to changing regulations and market conditions.",
    features: [
      "401(k) optimization",
      "IRA strategies",
      "Social Security maximization",
      "Healthcare cost planning",
    ],
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: GraduationCap,
    title: "Learning Access Hub",
    description:
      "Personalized financial education with adaptive learning paths based on your knowledge level and goals.",
    features: [
      "Interactive courses",
      "Skill assessments",
      "Progress tracking",
      "Certification programs",
    ],
    gradient: "from-teal-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Community & Discussions",
    description:
      "Connect with financial experts and peers in a gamified learning environment with cryptocurrency rewards.",
    features: [
      "Expert Q&A sessions",
      "Peer discussions",
      "Knowledge sharing",
      "Crypto reward system",
    ],
    gradient: "from-pink-500 to-rose-600",
  },
];

const gamificationFeatures = [
  {
    icon: Trophy,
    title: "Achievement Levels",
    description:
      "Unlock new levels as you complete financial milestones and educational modules.",
    reward: "XP + Crypto Tokens",
  },
  {
    icon: Coins,
    title: "Community Points",
    description:
      "Earn points by helping others with detailed financial explanations and insights.",
    reward: "Convertible to Crypto",
  },
  {
    icon: Bitcoin,
    title: "Crypto Rewards",
    description:
      "Transfer earned points to cryptocurrency or use for premium platform features.",
    reward: "BTC, ETH, Custom Token",
  },
  {
    icon: GamepadIcon,
    title: "Learning Challenges",
    description:
      "Complete daily challenges and quests to improve your financial knowledge.",
    reward: "Bonus Multipliers",
  },
];

const features: FeatureCard[] = [
  {
    icon: Brain,
    title: "Advanced AI Financial Advisor",
    description:
      "Get personalized financial advice powered by GPT-4, tailored to your unique situation and goals.",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "Smart Portfolio Management",
    description:
      "AI-driven portfolio optimization with real-time market analysis and automated rebalancing.",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Target,
    title: "Intelligent Goal Tracking",
    description:
      "Set and achieve financial goals with AI-powered insights and automated savings strategies.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "256-bit encryption and multi-factor authentication protect your financial data.",
    gradient: "from-red-500 to-pink-600",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Available in English, German, French, and Polish with culturally-aware financial advice.",
    gradient: "from-orange-500 to-yellow-600",
  },
  {
    icon: Calculator,
    title: "Tax Optimization",
    description:
      "AI-powered tax strategies that automatically find deductions and optimize your returns.",
    gradient: "from-indigo-500 to-purple-600",
  },
];

const stats: StatCard[] = [
  { value: "10,000+", label: "Active Users", icon: Users },
  { value: "$50M+", label: "Assets Managed", icon: DollarSign },
  { value: "15%", label: "Avg. Return Boost", icon: TrendingUp },
  { value: "99.9%", label: "Uptime", icon: Shield },
];

const testimonials: TestimonialCard[] = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Tech Startup",
    content:
      "FinApp's AI advisor helped me optimize my portfolio and save $12,000 in taxes last year. The insights are incredibly accurate.",
    avatar: "👩‍💻",
  },
  {
    name: "Marcus Johnson",
    role: "Small Business Owner",
    company: "Johnson Consulting",
    content:
      "The multilingual support and tax optimization features are game-changers for my international business. Highly recommended!",
    avatar: "👨‍💼",
  },
  {
    name: "Elena Rodriguez",
    role: "Financial Advisor",
    company: "Rodriguez Wealth Management",
    content:
      "I recommend FinApp to all my clients. The AI insights complement traditional financial planning perfectly.",
    avatar: "👩‍💼",
  },
];

function AnimatedCounter({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.floor(progress * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration, inView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const { isAuthenticated, user } = useAuth();

  // Handle authenticated user redirects - but allow them to stay on landing if they want
  useEffect(() => {
    // Don't auto-redirect on landing page - let users see the landing page even when logged in
    // They can manually navigate using the interface if they want
  }, [isAuthenticated, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUpSuccess = () => {
    // After sign-up/sign-in, let the useEffect handle the redirect based on onboarding status
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                <Brain className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinApp
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {/* Product Dropdown */}
              <div className="relative group">
                <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  Product <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <a
                      href="#features"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Features
                    </a>
                    <a
                      href="#pricing"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Pricing
                    </a>
                    <Link href="/security">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Security
                      </span>
                    </Link>
                    <Link href="/api">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        API
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Company Dropdown */}
              <div className="relative group">
                <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  Company <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <Link href="/about">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        About
                      </span>
                    </Link>
                    <Link href="/blog">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Blog
                      </span>
                    </Link>
                    <Link href="/careers">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Careers
                      </span>
                    </Link>
                    <Link href="/contact">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Contact
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Support Dropdown */}
              <div className="relative group">
                <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  Support <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <Link href="/help">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Help Center
                      </span>
                    </Link>
                    <Link href="/documentation">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Documentation
                      </span>
                    </Link>
                    <Link href="/community">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Community
                      </span>
                    </Link>
                    <Link href="/status">
                      <span className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                        Status
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('🔗 Admin login button clicked, clearing user auth and navigating to /admin-login');
                    // Clear any existing user authentication before admin login
                    localStorage.removeItem('finapp_user_auth');
                    localStorage.removeItem('finapp_admin_auth');
                    window.location.href = '/admin-login';
                  }}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
                <Link href="/signin">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Link href="/signin">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Advanced AI Technology
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              The Future of
              <br />
              Financial Intelligence
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to optimize your finances, maximize
              returns, and achieve your financial goals faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={() => (window.location.href = "/signin")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-xl font-semibold"
              >
                <User className="mr-2 h-5 w-5" />
                Complete Profile & Start
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-3"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Demo - August 2025
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Your Personal Demo</DialogTitle>
                    <DialogDescription>
                      Book a 30-minute personalized demo with our financial
                      experts. Available slots this week.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold">Available Times (CEST):</p>
                      <div className="mt-2 space-y-1">
                        <p>• Today, Aug 7 - 2:00 PM, 4:00 PM</p>
                        <p>• Friday, Aug 8 - 10:00 AM, 3:00 PM</p>
                        <p>• Monday, Aug 11 - 9:00 AM, 1:00 PM, 5:00 PM</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Today 2:00 PM
                      </Button>
                      <Button variant="outline" size="sm">
                        Today 4:00 PM
                      </Button>
                      <Button variant="outline" size="sm">
                        Fri 10:00 AM
                      </Button>
                      <Button variant="outline" size="sm">
                        Fri 3:00 PM
                      </Button>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Confirm Demo Booking
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Hero Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">FinApp Dashboard</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">
                    <AnimatedCounter end={127500} />
                  </div>
                  <div className="text-sm opacity-90">Net Worth</div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-lg">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">
                    +<AnimatedCounter end={12} />%
                  </div>
                  <div className="text-sm opacity-90">Portfolio Return</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg">
                  <Target className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">
                    <AnimatedCounter end={87} />%
                  </div>
                  <div className="text-sm opacity-90">Goal Progress</div>
                </div>
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Brain className="h-4 w-4 text-blue-600" />
                  AI Analysis: Your portfolio is optimally balanced for current
                  market conditions
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Smart Alert: Consider tax-loss harvesting to save $2,400 this
                  year
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comprehensive AI Use Cases Section */}
      <section
        id="ai-features"
        className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 relative overflow-hidden"
      >
        <FloatingElements />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 border-purple-200">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered Financial Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              How Our AI Works for You
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Revolutionary AI-powered financial tools that provide real-time
              insights, personalized strategies, and comprehensive analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {aiUseCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card3D key={index} className="group">
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div
                        className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${useCase.gradient} text-white mb-4`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {useCase.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {useCase.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {useCase.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Card3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gamification & Community Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-900 border-orange-200">
              <GamepadIcon className="w-3 h-3 mr-1" />
              Gamified Learning Experience
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-900 to-pink-900 dark:from-white dark:to-pink-100 bg-clip-text text-transparent">
              Earn While You Learn
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get rewarded for your financial knowledge. Answer complex
              questions, help the community, and earn cryptocurrency tokens
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {gamificationFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card3D key={index}>
                  <Card className="text-center hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0">
                    <CardHeader>
                      <div className="mx-auto p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white mb-4 w-fit">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
                        {feature.reward}
                      </Badge>
                    </CardContent>
                  </Card>
                </Card3D>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              Community Q&A Rewards System
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Answer financial questions with detailed explanations and earn
              points convertible to cryptocurrency
            </p>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <AnimatedNumber3D value={500} suffix="+" />
                <p className="text-sm opacity-80">Detailed Answers</p>
              </div>
              <div>
                <AnimatedNumber3D value={1250} suffix=" pts" />
                <p className="text-sm opacity-80">Available for Conversion</p>
              </div>
              <div>
                <AnimatedNumber3D value={75} suffix="%" />
                <p className="text-sm opacity-80">Crypto Conversion Rate</p>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/signin")}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold"
            >
              <Bitcoin className="mr-2 h-5 w-5" />
              Start Earning Crypto - August 2025
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
                Revolutionary Financial Intelligence
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the next generation of financial management with
                AI-powered insights, automated optimization, and personalized
                strategies.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Trusted by Financial Professionals
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                See what our users are saying about their FinApp experience
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-green-200">
              <DollarSign className="w-3 h-3 mr-1" />
              August 2025 Special Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transparent pricing with no hidden fees. Launch special: 30% off
              first 3 months!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card3D>
              <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Free</CardTitle>
                  <CardDescription>Perfect to get started</CardDescription>
                  <div className="text-4xl font-bold text-gray-900">
                    $0<span className="text-lg text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Basic AI financial advice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Portfolio tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Goal setting & progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Community access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">$0.20 API limit/month</span>
                    </div>
                  </div>
                  <Link href="/signin">
                    <Button className="w-full" variant="outline">
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Card3D>

            {/* Pro Plan */}
            <Card3D className="scale-105">
              <Card className="relative h-full bg-white/95 backdrop-blur-sm border-2 border-blue-500 shadow-2xl">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                    Most Popular - 30% Off
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Pro</CardTitle>
                  <CardDescription>For serious investors</CardDescription>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-gray-900">
                      $29<span className="text-lg text-gray-500">/month</span>
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      Save $12/month until Nov 2025
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Advanced AI financial advisor
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Tax optimization strategies
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Real-time market intelligence
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority customer support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        5 AI advisor sessions/month
                      </span>
                    </div>
                  </div>
                  <Link href="/checkout?plan=pro">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Start Pro - $29/mo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Card3D>

            {/* Max Plan */}
            <Card3D>
              <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Max</CardTitle>
                  <CardDescription>For financial professionals</CardDescription>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-gray-900">
                      $99<span className="text-lg text-gray-500">/month</span>
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      Save $30/month until Nov 2025
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Everything in Pro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Unlimited AI advisor sessions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Custom portfolio management
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Direct advisor calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">White-label options</span>
                    </div>
                  </div>
                  <Link href="/checkout?plan=max">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Award className="mr-2 h-4 w-4" />
                      Upgrade to Max - $99/mo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Card3D>
          </div>

          {/* Pricing Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              All plans include 30-day money-back guarantee • Cancel anytime •
              Secure payment via Stripe
            </p>
            <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Bank-level security
              </div>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                SSL encrypted
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have already optimized their finances
              with AI-powered intelligence.
            </p>
            <Link href="/signin">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-6 w-6" />
                <span className="text-xl font-bold">FinApp</span>
              </div>
              <p className="text-gray-400">
                The future of financial intelligence, powered by advanced AI
                technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Security</div>
                <div>API</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
                <div>Contact</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Documentation</div>
                <div>Community</div>
                <div>Status</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 FinApp. All rights reserved. Powered by advanced AI
              technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
