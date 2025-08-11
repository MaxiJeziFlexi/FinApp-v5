import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// Middleware do weryfikacji uprawnień administratora
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Sprawdź czy użytkownik jest zalogowany (z sesji lub tokenu)
    const userId = req.headers['x-user-id'] as string || 
                   req.session?.userId || 
                   req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Pobierz dane użytkownika z bazy danych
    const user = await storage.getUser(userId);
    
    if (!user) {
      // For demo purposes, allow admin-user to access admin features
      if (userId === 'admin-user') {
        req.user = {
          id: 'admin-user',
          role: 'admin',
          email: 'admin@finapp.demo'
        };
        return next();
      }
      
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Invalid user credentials'
      });
    }

    // Sprawdź uprawnienia administratora (allow admin-user for demo)
    if (user.role !== 'admin' && userId !== 'admin-user') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Administrator privileges required for this action'
      });
    }

    // Dodaj dane użytkownika do requesta
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email || ''
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

// Middleware do logowania działań administratora (simplified version)
export const logAdminAction = async (userId: string, action: string, data?: any) => {
  console.log(`[ADMIN ACTION] User ${userId} performed: ${action} at ${new Date().toISOString()}`, data);
  
  try {
    // Save to analytics if available
    const { analyticsService } = await import('../services/analyticsService');
    await analyticsService.trackEvent(userId, 'admin_action', {
      action,
      timestamp: new Date().toISOString(),
      ...data
    });
  } catch (error) {
    console.log('Analytics not available for admin action logging');
  }
};

// Middleware do walidacji parametrów AI
export const validateAIParams = (req: Request, res: Response, next: NextFunction) => {
  const { modelType, timeRange, limit } = req.query;
  
  // Walidacja typu modelu
  const validModelTypes = [
    'openai', 'claude', 'advanced_ai', 'emotional_analysis', 
    'jarvis', 'legal', 'translation', 'speech_recognition',
    'decision_tree', 'personalized_tree', 'realtime_data', 'analytics'
  ];
  
  if (modelType && !validModelTypes.includes(modelType as string)) {
    return res.status(400).json({
      error: 'Invalid model type',
      validTypes: validModelTypes
    });
  }
  
  // Walidacja zakresu czasowego
  if (timeRange) {
    const validRanges = ['1h', '24h', '7d', '30d', '90d'];
    if (!validRanges.includes(timeRange as string)) {
      return res.status(400).json({
        error: 'Invalid time range',
        validRanges
      });
    }
  }
  
  // Walidacja limitu
  if (limit) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 1000'
      });
    }
  }
  
  next();
};