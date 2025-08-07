import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, Target, Lightbulb, ArrowLeft, Award, Globe, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

export default function About() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former Goldman Sachs quantitative analyst with 15+ years in fintech innovation.",
      avatar: "👩‍💼"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Google AI engineer specializing in financial machine learning models.",
      avatar: "👨‍💻"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of AI Research",
      bio: "PhD in Financial Economics from MIT, leading our AI development team.",
      avatar: "👩‍🔬"
    },
    {
      name: "James Wilson",
      role: "Head of Security",
      bio: "Former cybersecurity consultant for major financial institutions.",
      avatar: "👨‍🛡️"
    }
  ];

  const milestones = [
    { year: "2023", event: "FinApp founded with $2M seed funding", icon: Lightbulb },
    { year: "2024", event: "Launched beta with 10,000+ users", icon: Users },
    { year: "2024", event: "Achieved SOC 2 compliance certification", icon: Award },
    { year: "2025", event: "Reached 100,000+ active users globally", icon: Globe },
  ];

  const values = [
    {
      icon: Target,
      title: "User-Centric Innovation",
      description: "Every feature we build is designed with our users' financial success in mind."
    },
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "We leverage cutting-edge AI to provide personalized, actionable financial insights."
    },
    {
      icon: Users,
      title: "Financial Inclusivity",
      description: "Making sophisticated financial tools accessible to everyone, regardless of background."
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "We're committed to evolving with the financial landscape and user needs."
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
              <Brain className="w-3 h-3 mr-1" />
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              Revolutionizing Financial Intelligence
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              FinApp was born from a simple belief: everyone deserves access to sophisticated financial guidance. 
              We're building the future of AI-powered financial advisory services.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Statement */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <Card3D className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To democratize financial intelligence by providing AI-powered tools that help individuals 
                  make informed decisions, optimize their financial strategies, and achieve their long-term goals. 
                  We believe that with the right guidance and technology, everyone can build a secure financial future.
                </p>
              </CardContent>
            </Card>
          </Card3D>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do at FinApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card3D>
                    <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl text-center">
                      <CardHeader>
                        <div className="mx-auto p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white mb-4 w-fit">
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl text-gray-900">{value.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {value.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Card3D>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The passionate experts building the future of financial technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card3D>
                  <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl text-center">
                    <CardHeader>
                      <div className="text-6xl mb-4">{member.avatar}</div>
                      <CardTitle className="text-xl text-gray-900">{member.name}</CardTitle>
                      <CardDescription className="text-blue-600 font-semibold">
                        {member.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {member.bio}
                      </p>
                    </CardContent>
                  </Card>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 px-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Key milestones in our mission to revolutionize financial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => {
              const IconComponent = milestone.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-white mb-4 w-fit">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <p className="text-sm text-gray-600">{milestone.event}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <Card3D className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
                <p className="text-lg mb-6 opacity-90">
                  Ready to be part of the financial intelligence revolution?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signin">
                    <Button size="lg" variant="secondary">
                      Get Started Today
                    </Button>
                  </Link>
                  <Link href="/careers">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      View Careers
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Card3D>
        </div>
      </section>
    </div>
  );
}