import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Target, 
  Users, 
  Zap, 
  ArrowLeft, 
  CheckCircle,
  Star,
  BarChart3,
  Calculator,
  GamepadIcon,
  Bitcoin,
  CreditCard,
  PieChart,
  TrendingDown,
  Activity
} from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

export default function Features() {
  const coreFeatures = [
    {
      icon: Brain,
      title: "AI Financial Advisors",
      description: "Multiple specialized AI advisors trained on the latest financial data and regulations.",
      features: [
        "Personal finance optimization",
        "Investment strategy planning", 
        "Tax planning assistance",
        "Risk assessment analysis",
        "Real-time market insights"
      ],
      tier: "All Plans"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive financial analytics and performance tracking tools.",
      features: [
        "Portfolio performance tracking",
        "Expense categorization",
        "Income vs spending analysis",
        "Investment return calculations",
        "Custom financial reports"
      ],
      tier: "Pro & Max"
    },
    {
      icon: Target,
      title: "Goal Management",
      description: "Set, track, and achieve your financial goals with AI-powered guidance.",
      features: [
        "Smart goal setting",
        "Progress tracking",
        "Milestone celebrations",
        "Automated savings recommendations",
        "Goal achievement predictions"
      ],
      tier: "All Plans"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Bank-level security with complete data privacy and protection.",
      features: [
        "AES-256 encryption",
        "Multi-factor authentication",
        "SOC 2 compliance",
        "GDPR compliance",
        "Zero data selling policy"
      ],
      tier: "All Plans"
    }
  ];

  const advancedFeatures = [
    {
      icon: GamepadIcon,
      title: "Gamified Learning",
      description: "Learn finance through interactive games and challenges",
      highlight: "Age-appropriate content for different user groups"
    },
    {
      icon: Bitcoin,
      title: "Crypto Integration",
      description: "Advanced cryptocurrency portfolio management and analysis",
      highlight: "Real-time market data and sentiment analysis"
    },
    {
      icon: Calculator,
      title: "Tax Optimization",
      description: "AI-powered tax strategies and optimization recommendations",
      highlight: "2025 tax law updates included"
    },
    {
      icon: Users,
      title: "Community Features",
      description: "Connect with other users and financial experts",
      highlight: "Peer-to-peer learning and support"
    },
    {
      icon: PieChart,
      title: "Portfolio Management",
      description: "Sophisticated portfolio analysis and rebalancing tools",
      highlight: "Custom asset allocation strategies"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Live market data and instant financial alerts",
      highlight: "Custom notification preferences"
    }
  ];

  const planComparison = [
    {
      plan: "Free",
      color: "gray",
      features: [
        "1 AI Financial Advisor",
        "Basic portfolio tracking",
        "Goal setting",
        "$0.20 API limit/month",
        "Community access"
      ]
    },
    {
      plan: "Pro",
      color: "blue",
      features: [
        "3 AI Financial Advisors",
        "Advanced analytics",
        "Tax optimization",
        "Priority support",
        "$1.30 API limit/month"
      ]
    },
    {
      plan: "Max",
      color: "purple",
      features: [
        "All AI Financial Advisors",
        "Unlimited API usage",
        "Custom portfolio management",
        "Direct advisor calls",
        "White-label options"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <FloatingElements />
      
      {/* Header */}
      <div className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900 border-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              Powerful Features
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              Everything You Need for Financial Success
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              FinApp combines cutting-edge AI technology with comprehensive financial tools 
              to help you achieve your financial goals faster and smarter.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Core Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Core Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The foundation of FinApp's financial intelligence platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card3D>
                    <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {feature.tier}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.features.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Card3D>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Advanced Capabilities</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Cutting-edge features that set FinApp apart from traditional financial tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card3D>
                    <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl text-center">
                      <CardContent className="p-8">
                        <div className="mx-auto p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white mb-4 w-fit">
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-purple-900">
                            {feature.highlight}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Card3D>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Compare features across our different subscription tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {planComparison.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card3D>
                  <Card className={`h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl ${plan.plan === 'Pro' ? 'scale-105 border-2 border-blue-500' : ''}`}>
                    <CardHeader className="text-center">
                      {plan.plan === 'Pro' && (
                        <Badge className="mb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          Most Popular
                        </Badge>
                      )}
                      <CardTitle className="text-2xl text-gray-900">{plan.plan}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Link href={plan.plan === 'Free' ? '/signin' : `/checkout?plan=${plan.plan.toLowerCase()}`}>
                          <Button 
                            className={`w-full ${
                              plan.plan === 'Pro' 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                            }`}
                          >
                            {plan.plan === 'Free' ? 'Get Started' : `Choose ${plan.plan}`}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience FinApp?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial future with AI-powered guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signin">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  <Star className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}