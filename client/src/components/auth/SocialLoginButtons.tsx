import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Chrome, 
  Github, 
  Facebook, 
  MessageSquare as Discord,
  Mail,
  ArrowRight,
  Zap
} from "lucide-react";

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: string) => void;
  isLoading?: boolean;
}

export default function SocialLoginButtons({ 
  onSocialLogin, 
  isLoading = false 
}: SocialLoginButtonsProps) {
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'hover:bg-red-50 hover:border-red-200',
      iconColor: 'text-red-500'
    },
    {
      id: 'github',
      name: 'GitHub', 
      icon: Github,
      color: 'hover:bg-gray-50 hover:border-gray-200',
      iconColor: 'text-gray-700'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 hover:border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: Discord,
      color: 'hover:bg-indigo-50 hover:border-indigo-200',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Quick Access Demo Button */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <Button
            onClick={() => onSocialLogin('demo')}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            Quick Demo Access
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-purple-600 mt-2 text-center">
            Instant access to explore FinApp's AI features
          </p>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {socialProviders.map((provider) => {
          const Icon = provider.icon;
          return (
            <Button
              key={provider.id}
              variant="outline"
              onClick={() => onSocialLogin(provider.id)}
              disabled={isLoading}
              className={`h-12 transition-all duration-200 ${provider.color}`}
            >
              <Icon className={`h-5 w-5 ${provider.iconColor}`} />
              <span className="ml-2 hidden sm:inline font-medium">
                {provider.name}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or use email
          </span>
        </div>
      </div>

      {/* Email Login Button */}
      <Button
        variant="outline"
        onClick={() => onSocialLogin('email')}
        disabled={isLoading}
        className="w-full h-12 hover:bg-gray-50 hover:border-gray-200"
      >
        <Mail className="mr-2 h-5 w-5 text-gray-600" />
        Continue with Email
      </Button>

      <div className="text-xs text-center text-muted-foreground space-y-1">
        <p>By continuing, you agree to our Terms of Service</p>
        <p>Social logins are coming soon - use email for now</p>
      </div>
    </div>
  );
}