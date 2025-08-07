import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Server, Key, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

export default function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: "Bank-Level Encryption",
      description: "All data is encrypted with AES-256 encryption, the same standard used by major financial institutions.",
      status: "active"
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "Multi-factor authentication and secure password policies protect your account from unauthorized access.",
      status: "active"
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Our servers are hosted on enterprise-grade cloud infrastructure with 99.9% uptime guarantee.",
      status: "active"
    },
    {
      icon: Key,
      title: "API Security",
      description: "All API communications use TLS 1.3 and are protected with rate limiting and authentication tokens.",
      status: "active"
    },
    {
      icon: Eye,
      title: "Privacy Protection",
      description: "We never sell your data. Your financial information is protected by strict privacy policies.",
      status: "active"
    },
    {
      icon: AlertTriangle,
      title: "Fraud Detection",
      description: "Advanced AI monitors for suspicious activities and unauthorized access attempts in real-time.",
      status: "active"
    }
  ];

  const certifications = [
    { name: "SOC 2 Type II", status: "Certified" },
    { name: "ISO 27001", status: "Certified" },
    { name: "PCI DSS", status: "Compliant" },
    { name: "GDPR", status: "Compliant" },
    { name: "CCPA", status: "Compliant" }
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
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Enterprise Security
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
              Your Security is Our Priority
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              FinApp employs industry-leading security measures to protect your financial data and ensure complete privacy and compliance.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Security Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Comprehensive Security Framework</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every aspect of FinApp is designed with security in mind, from data encryption to infrastructure protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => {
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
                    <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {feature.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {feature.description}
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

      {/* Certifications */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Industry Certifications</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              FinApp meets the highest industry standards for security and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Shield className="h-12 w-12 mx-auto text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {cert.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Contact */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <Card3D className="max-w-2xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">Security Questions?</CardTitle>
                <CardDescription>
                  Our security team is available to address any concerns or questions you may have.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-600">
                    <p><strong>Security Email:</strong> security@finapp.demo</p>
                    <p><strong>Response Time:</strong> Within 24 hours</p>
                    <p><strong>Last Security Audit:</strong> July 2025</p>
                  </div>
                  <Link href="/contact">
                    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      <Shield className="mr-2 h-4 w-4" />
                      Contact Security Team
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