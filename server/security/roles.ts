// Role-Based Access Control (RBAC) dla systemu LLM-Tools
// Trzy role: analysis_only, confirm_to_execute, auto_execute_with_limits

export type UserRole = 'analysis_only' | 'confirm_to_execute' | 'auto_execute_with_limits';

export interface RiskLimits {
  maxNotionalPerTrade: number;     // Maksymalna wartość pojedynczej transakcji
  maxPositionPercent: number;      // Maksymalny % portfela w jednej pozycji
  maxDailyLoss: number;           // Maksymalna dzienna strata (VaR)
  maxDrawdown: number;            // Maksymalny drawdown
  allowedInstruments: string[];    // Whitelist instrumentów
  maxTradesPerDay: number;        // Limit transakcji dziennie
  requiresConfirmationAbove: number; // Kwota wymagająca potwierdzenia
}

export interface UserRoleConfig {
  role: UserRole;
  description: string;
  canExecute: boolean;
  requiresConfirmation: boolean;
  riskLimits: RiskLimits;
  allowedActions: string[];
  blockedActions: string[];
}

// Domyślne konfiguracje ról
export const DEFAULT_ROLE_CONFIGS: Record<UserRole, UserRoleConfig> = {
  analysis_only: {
    role: 'analysis_only',
    description: 'Tylko analiza - nigdy nie wykonuj żadnych akcji',
    canExecute: false,
    requiresConfirmation: false,
    riskLimits: {
      maxNotionalPerTrade: 0,
      maxPositionPercent: 0,
      maxDailyLoss: 0,
      maxDrawdown: 0,
      allowedInstruments: [],
      maxTradesPerDay: 0,
      requiresConfirmationAbove: 0
    },
    allowedActions: [
      'get_market_data_tradingview',
      'get_quotes_ibkr',
      'get_quotes_xtb',
      'simulate_order',
      'news_search_whitelist',
      'fetch_gov_law',
      'retrieve_document',
      'create_audit_note',
      'get_realtime_updates',
      'setup_realtime_tracking'
    ],
    blockedActions: [
      'place_order_ibkr',
      'place_order_xtb',
      'charge_customer',
      'computer_use_execute'
    ]
  },

  confirm_to_execute: {
    role: 'confirm_to_execute',
    description: 'Wykonuj po potwierdzeniu lub 2FA',
    canExecute: true,
    requiresConfirmation: true,
    riskLimits: {
      maxNotionalPerTrade: 10000,
      maxPositionPercent: 10,
      maxDailyLoss: 1000,
      maxDrawdown: 5,
      allowedInstruments: ['AAPL', 'GOOGL', 'MSFT', 'SPY', 'QQQ'],
      maxTradesPerDay: 10,
      requiresConfirmationAbove: 1000
    },
    allowedActions: [
      'get_market_data_tradingview',
      'get_quotes_ibkr',
      'get_quotes_xtb',
      'simulate_order',
      'place_order_ibkr',
      'place_order_xtb',
      'news_search_whitelist',
      'fetch_gov_law',
      'retrieve_document',
      'create_audit_note',
      'get_realtime_updates',
      'setup_realtime_tracking',
      'computer_use_browse',
      'computer_use_extract'
    ],
    blockedActions: [
      'charge_customer' // Zawsze wymaga dodatkowych uprawnień
    ]
  },

  auto_execute_with_limits: {
    role: 'auto_execute_with_limits',
    description: 'Auto-wykonuj w ramach limitów ryzyka',
    canExecute: true,
    requiresConfirmation: false,
    riskLimits: {
      maxNotionalPerTrade: 5000,
      maxPositionPercent: 5,
      maxDailyLoss: 500,
      maxDrawdown: 3,
      allowedInstruments: ['SPY', 'QQQ', 'IWM', 'TLT'],
      maxTradesPerDay: 5,
      requiresConfirmationAbove: 2000
    },
    allowedActions: [
      'get_market_data_tradingview',
      'get_quotes_ibkr',
      'get_quotes_xtb',
      'simulate_order',
      'place_order_ibkr',
      'place_order_xtb',
      'news_search_whitelist',
      'fetch_gov_law',
      'retrieve_document',
      'create_audit_note',
      'get_realtime_updates',
      'setup_realtime_tracking'
    ],
    blockedActions: [
      'charge_customer',
      'computer_use_execute' // Computer Use zawsze wymaga potwierdzenia
    ]
  }
};

// Role Manager Class
export class RoleManager {
  private userRoles: Map<string, UserRoleConfig> = new Map();

  constructor() {
    // Inicjalizuj domyślne role
    Object.values(DEFAULT_ROLE_CONFIGS).forEach(config => {
      this.userRoles.set(config.role, config);
    });
  }

  // Pobierz konfigurację roli użytkownika
  getUserRoleConfig(userId: string, userRole: UserRole): UserRoleConfig {
    return this.userRoles.get(userRole) || DEFAULT_ROLE_CONFIGS.analysis_only;
  }

  // Sprawdź czy użytkownik może wykonać akcję
  canUserExecuteAction(userRole: UserRole, actionName: string): {
    allowed: boolean;
    reason?: string;
    requiresConfirmation: boolean;
  } {
    const config = this.userRoles.get(userRole);
    if (!config) {
      return {
        allowed: false,
        reason: 'Nieznana rola użytkownika',
        requiresConfirmation: false
      };
    }

    if (config.blockedActions.includes(actionName)) {
      return {
        allowed: false,
        reason: `Akcja ${actionName} jest zablokowana dla roli ${userRole}`,
        requiresConfirmation: false
      };
    }

    if (!config.allowedActions.includes(actionName)) {
      return {
        allowed: false,
        reason: `Akcja ${actionName} nie jest dozwolona dla roli ${userRole}`,
        requiresConfirmation: false
      };
    }

    return {
      allowed: true,
      requiresConfirmation: config.requiresConfirmation
    };
  }

  // Sprawdź limity ryzyka
  checkRiskLimits(
    userRole: UserRole,
    action: {
      type: 'trade' | 'payment' | 'other';
      notional?: number;
      instrument?: string;
      positionPercent?: number;
    }
  ): {
    withinLimits: boolean;
    violations: string[];
    requiresConfirmation: boolean;
  } {
    const config = this.userRoles.get(userRole);
    if (!config) {
      return {
        withinLimits: false,
        violations: ['Nieznana rola użytkownika'],
        requiresConfirmation: false
      };
    }

    const violations: string[] = [];
    let requiresConfirmation = false;

    if (action.type === 'trade' && action.notional) {
      // Sprawdź limit notional
      if (action.notional > config.riskLimits.maxNotionalPerTrade) {
        violations.push(`Przekroczono maksymalną wartość transakcji: ${action.notional} > ${config.riskLimits.maxNotionalPerTrade}`);
      }

      // Sprawdź czy wymaga potwierdzenia
      if (action.notional > config.riskLimits.requiresConfirmationAbove) {
        requiresConfirmation = true;
      }

      // Sprawdź whitelist instrumentów
      if (action.instrument && config.riskLimits.allowedInstruments.length > 0) {
        if (!config.riskLimits.allowedInstruments.includes(action.instrument)) {
          violations.push(`Instrument ${action.instrument} nie jest na liście dozwolonych`);
        }
      }

      // Sprawdź procent pozycji
      if (action.positionPercent && action.positionPercent > config.riskLimits.maxPositionPercent) {
        violations.push(`Przekroczono maksymalny % pozycji: ${action.positionPercent}% > ${config.riskLimits.maxPositionPercent}%`);
      }
    }

    return {
      withinLimits: violations.length === 0,
      violations,
      requiresConfirmation: requiresConfirmation || config.requiresConfirmation
    };
  }

  // Sprawdź czy rola może auto-wykonać bez EXECUTE_GRANTED
  canAutoExecute(userRole: UserRole): boolean {
    const config = this.userRoles.get(userRole);
    return config?.canExecute && !config?.requiresConfirmation || false;
  }

  // Middleware autoryzacji
  authorizeAction(actionName: string) {
    return (req: any, res: any, next: any) => {
      const userRole: UserRole = req.body.userRole || req.user?.role || 'analysis_only';
      const userId = req.body.userId || req.user?.id || 'demo-user';

      // Sprawdź uprawnienia do akcji
      const actionCheck = this.canUserExecuteAction(userRole, actionName);
      if (!actionCheck.allowed) {
        return res.status(403).json({
          error: 'Brak uprawnień do wykonania akcji',
          code: 'ACTION_FORBIDDEN',
          reason: actionCheck.reason,
          userRole,
          actionName
        });
      }

      // Sprawdź limity ryzyka dla akcji transakcyjnych
      if (['place_order_ibkr', 'place_order_xtb'].includes(actionName)) {
        const orderPayload = req.body.order_payload || req.body;
        const riskCheck = this.checkRiskLimits(userRole, {
          type: 'trade',
          notional: orderPayload.qty * (orderPayload.limit_price || 100),
          instrument: orderPayload.symbol,
          positionPercent: 0 // TODO: Calculate based on portfolio
        });

        if (!riskCheck.withinLimits) {
          return res.status(403).json({
            error: 'Przekroczono limity ryzyka',
            code: 'RISK_LIMITS_EXCEEDED',
            violations: riskCheck.violations,
            userRole
          });
        }

        // Dodaj informację o wymaganym potwierdzeniu
        req.requiresConfirmation = riskCheck.requiresConfirmation;
      }

      // Dodaj informacje o roli do request
      req.userRoleConfig = this.getUserRoleConfig(userId, userRole);
      req.userRole = userRole;
      
      next();
    };
  }

  // Zdefiniuj niestandardowe limity dla użytkownika
  setCustomRiskLimits(userRole: UserRole, limits: Partial<RiskLimits>): void {
    const config = this.userRoles.get(userRole);
    if (config) {
      config.riskLimits = { ...config.riskLimits, ...limits };
      this.userRoles.set(userRole, config);
    }
  }
}

// Singleton instance
export const roleManager = new RoleManager();