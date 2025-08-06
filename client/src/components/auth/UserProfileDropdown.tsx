import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  Crown,
  CreditCard,
  BarChart3,
  Shield,
  HelpCircle,
  LogOut,
  Bell,
  Zap,
  Star,
  Activity
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface UserProfileDropdownProps {
  user: UserType;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenSubscription?: () => void;
}

export default function UserProfileDropdown({ 
  user, 
  onLogout, 
  onOpenSettings, 
  onOpenSubscription 
}: UserProfileDropdownProps) {
  // Get user initials for avatar fallback
  const getInitials = (firstName?: string, lastName?: string, name?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      const nameParts = name.split(' ');
      return nameParts.length >= 2 
        ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();
    }
    return user.email ? user.email.substring(0, 2).toUpperCase() : 'DU';
  };

  // Get subscription tier info
  const getSubscriptionInfo = () => {
    switch (user.subscriptionTier) {
      case 'pro':
        return {
          label: 'Pro',
          icon: <Crown className="w-4 h-4" />,
          color: 'bg-purple-600 text-white',
          description: 'Pro Plan - Advanced AI Features'
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: <Star className="w-4 h-4" />,
          color: 'bg-gold-600 text-white',
          description: 'Premium Plan - Enhanced Learning'
        };
      default:
        return {
          label: 'Free',
          icon: <Zap className="w-4 h-4" />,
          color: 'bg-gray-500 text-white',
          description: 'Free Plan - Basic Features'
        };
    }
  };

  const subscriptionInfo = getSubscriptionInfo();
  const userInitials = getInitials(user.firstName, user.lastName, user.name);

  // Check if user has notifications (mock for now)
  const hasNotifications = false; // This would come from your notifications system

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
            <AvatarImage src={user.profileImageUrl} alt={user.name || user.email} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {hasNotifications && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* User Info Header */}
        <div className="flex items-center space-x-3 p-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImageUrl} alt={user.name || user.email} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.name || 'User'}
              </p>
              <Badge className={`${subscriptionInfo.color} text-xs px-2 py-0.5 flex items-center gap-1`}>
                {subscriptionInfo.icon}
                {subscriptionInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.username && (
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Account Management */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
          Account
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onOpenSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
          {hasNotifications && (
            <Badge variant="destructive" className="ml-auto text-xs">
              New
            </Badge>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Shield className="mr-2 h-4 w-4" />
          <span>Privacy & Security</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Premium Features */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
          Premium Features
        </DropdownMenuLabel>

        {user.subscriptionTier === 'free' && (
          <DropdownMenuItem onClick={onOpenSubscription} className="cursor-pointer">
            <Crown className="mr-2 h-4 w-4 text-purple-600" />
            <div className="flex flex-col">
              <span className="font-medium">Upgrade to Premium</span>
              <span className="text-xs text-muted-foreground">Unlock advanced AI features</span>
            </div>
          </DropdownMenuItem>
        )}

        {user.subscriptionTier !== 'free' && (
          <DropdownMenuItem onClick={onOpenSubscription} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Subscription Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="cursor-pointer">
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Analytics Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Activity className="mr-2 h-4 w-4" />
          <span>Learning Progress</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Support & Info */}
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
          Support
        </DropdownMenuLabel>

        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help Center</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Zap className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>AI Learning Experiment</span>
            <span className="text-xs text-muted-foreground">
              Contribution: {user.preferences?.privacy?.dataSharing ? 'Active' : 'Inactive'}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={onLogout} 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>

        {/* Footer Info */}
        <div className="p-2 pt-4 border-t">
          <div className="text-center text-xs text-muted-foreground">
            <p>FinApp v3.0 - AI Financial Education</p>
            <p className="mt-1">
              Account Status: {' '}
              <span className={`font-medium ${
                user.accountStatus === 'active' ? 'text-green-600' : 
                user.accountStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {user.accountStatus?.charAt(0).toUpperCase() + user.accountStatus?.slice(1) || 'Active'}
              </span>
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}