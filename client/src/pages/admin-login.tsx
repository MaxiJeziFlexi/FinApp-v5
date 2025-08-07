import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, User, Mail, ArrowRight, Crown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';
import { Badge } from '@/components/ui/badge';

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@finapp.demo',
    name: 'FinApp Administrator',
    adminCode: 'ADMIN2025'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, validate admin code
      if (formData.adminCode !== 'ADMIN2025') {
        toast({
          title: "Invalid Admin Code",
          description: "Please use the correct admin access code.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Admin Access Granted",
        description: "Welcome, Administrator! Redirecting to your dashboard...",
      });
      
      setTimeout(() => {
        window.location.href = '/finapp-home?admin=true';
      }, 1500);
    } catch (error) {
      toast({
        title: "Admin Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <FloatingElements />
      
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card3D className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white mr-3">
                  <Crown className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    FinApp
                  </h1>
                  <Badge className="mt-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 border-purple-200">
                    Admin Portal
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-900">Administrator Access</CardTitle>
              <CardDescription>
                Secure admin login for FinApp management and testing
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Demo Credentials</span>
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <p><strong>Email:</strong> admin@finapp.demo</p>
                  <p><strong>Admin Code:</strong> ADMIN2025</p>
                  <p><strong>Access Level:</strong> Max Plan + Admin Features</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-name">Administrator Name</Label>
                  <div className="relative">
                    <Input
                      id="admin-name"
                      type="text"
                      placeholder="Enter admin name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter admin email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-code">Admin Access Code</Label>
                  <div className="relative">
                    <Input
                      id="admin-code"
                      type="password"
                      placeholder="Enter admin code"
                      value={formData.adminCode}
                      onChange={(e) => handleInputChange('adminCode', e.target.value)}
                      className="pl-10"
                    />
                    <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Access Admin Panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <div className="text-sm text-gray-600">
                  <p>Admin access includes:</p>
                  <ul className="text-xs text-gray-500 mt-1 space-y-1">
                    <li>• Max plan features (unlimited)</li>
                    <li>• System administration tools</li>
                    <li>• User management capabilities</li>
                    <li>• Advanced analytics & reporting</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <Link href="/">
                    <Button variant="ghost" size="sm">
                      ← Back to Landing
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </Card3D>
      </div>
    </div>
  );
}