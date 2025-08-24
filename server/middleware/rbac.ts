import type { Request, Response, NextFunction } from "express";
import { UserRole, SystemRole, ROLE_PERMISSIONS, SYSTEM_ROLE_PERMISSIONS } from "@shared/schema";
import { storage } from "../storage";

// Interface for RBAC user
interface RBACUser {
  id: string;
  role: UserRole;
  subscriptionTier: UserRole;
  systemRole?: SystemRole;
  onboardingCompleted?: boolean;
}

// Permission check function
export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // ADMIN has all permissions
  if (permissions.includes('*')) {
    return true;
  }
  
  // Check specific permission
  return permissions.includes(requiredPermission);
}

// System role permission check function
export function hasSystemPermission(systemRole: SystemRole, requiredPermission: string): boolean {
  const permissions = SYSTEM_ROLE_PERMISSIONS[systemRole] || [];
  
  // Check if user has admin access (all permissions)
  if (permissions.includes('*')) {
    return true;
  }
  
  // Check if user has specific permission
  return permissions.includes(requiredPermission);
}

// Middleware to require specific permission
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const userRole = (user as any).role as UserRole;
      const systemRole = (user as any).systemRole as SystemRole || 'USER';
      const onboardingCompleted = (user as any).onboardingCompleted || false;
      
      // Check system-level permissions first
      if (!hasSystemPermission(systemRole, permission)) {
        return res.status(403).json({ 
          message: 'Insufficient system permissions', 
          required: permission,
          current: systemRole 
        });
      }
      
      // For USER role, check if onboarding is completed for certain permissions
      if (systemRole === 'USER' && !onboardingCompleted) {
        const onboardingRequiredPerms = ['chat:access'];
        if (onboardingRequiredPerms.includes(permission)) {
          return res.status(403).json({ 
            message: 'Onboarding required', 
            required: 'onboarding_completion'
          });
        }
      }
      
      // Attach user to request for further use
      req.user = {
        id: user.id,
        role: userRole,
        subscriptionTier: user.subscriptionTier as UserRole,
        systemRole,
        onboardingCompleted
      };
      
      next();
    } catch (error) {
      console.error('RBAC permission check error:', error);
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
}

// Middleware to check usage quotas
export async function checkUsageQuota(counterType: string, userRole: UserRole): Promise<{ allowed: boolean; current: number; limit: number }> {
  // Define limits per role
  const LIMITS: Record<UserRole, Record<string, number>> = {
    FREE: {
      transactions_import: 500,
      chat_messages: 10,
      export_requests: 5
    },
    PRO: {
      transactions_import: 10000,
      chat_messages: 100,
      export_requests: 50
    },
    MAX_PRO: {
      transactions_import: -1, // unlimited
      chat_messages: 500,
      export_requests: -1 // unlimited
    },
    ADMIN: {
      transactions_import: -1, // unlimited
      chat_messages: -1, // unlimited
      export_requests: -1 // unlimited
    }
  };

  const limit = LIMITS[userRole][counterType];
  
  // If unlimited (-1), always allow
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }
  
  // For specific limits, check current usage
  // This would need to be implemented in storage layer
  return { allowed: true, current: 0, limit }; // Placeholder for now
}

// Quota middleware factory
export function requireQuota(counterType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const quota = await checkUsageQuota(counterType, req.user.role);
      
      if (!quota.allowed) {
        return res.status(429).json({ 
          message: 'Usage quota exceeded',
          counterType,
          current: quota.current,
          limit: quota.limit 
        });
      }
      
      next();
    } catch (error) {
      console.error('Quota check error:', error);
      res.status(500).json({ message: 'Quota check failed' });
    }
  };
}