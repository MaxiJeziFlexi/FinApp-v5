// Permission system for tool execution with role-based access control

export type UserRole = 'analysis_only' | 'confirm_to_execute' | 'auto_execute_with_limits';

export type Permission = 
  | 'market_data' | 'ibkr_read' | 'ibkr_trade' | 'xtb_read' | 'xtb_trade' 
  | 'trade_simulate' | 'news_read' | 'legal_research' | 'document_read'
  | 'audit_write' | 'task_create' | 'billing_propose';

export interface RiskLimits {
  max_trade_amount_usd: number;
  max_daily_trades: number;
  max_position_size_percent: number;
  allowed_instruments: string[];
  blacklisted_instruments: string[];
  require_simulation: boolean;
  require_confirmation: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'analysis_only': [
    'market_data', 'ibkr_read', 'xtb_read', 'news_read', 
    'legal_research', 'document_read', 'audit_write'
  ],
  'confirm_to_execute': [
    'market_data', 'ibkr_read', 'xtb_read', 'trade_simulate',
    'news_read', 'legal_research', 'document_read', 
    'audit_write', 'task_create', 'billing_propose'
  ],
  'auto_execute_with_limits': [
    'market_data', 'ibkr_read', 'ibkr_trade', 'xtb_read', 'xtb_trade',
    'trade_simulate', 'news_read', 'legal_research', 'document_read',
    'audit_write', 'task_create', 'billing_propose'
  ]
};

export const DEFAULT_RISK_LIMITS: Record<UserRole, RiskLimits> = {
  'analysis_only': {
    max_trade_amount_usd: 0,
    max_daily_trades: 0,
    max_position_size_percent: 0,
    allowed_instruments: [],
    blacklisted_instruments: ['*'],
    require_simulation: true,
    require_confirmation: true
  },
  'confirm_to_execute': {
    max_trade_amount_usd: 10000,
    max_daily_trades: 5,
    max_position_size_percent: 10,
    allowed_instruments: ['AAPL', 'GOOGL', 'MSFT', 'SPY', 'QQQ'],
    blacklisted_instruments: ['CRYPTO', 'PENNY'],
    require_simulation: true,
    require_confirmation: true
  },
  'auto_execute_with_limits': {
    max_trade_amount_usd: 50000,
    max_daily_trades: 20,
    max_position_size_percent: 25,
    allowed_instruments: ['*'],
    blacklisted_instruments: ['PENNY', 'OTC'],
    require_simulation: true,
    require_confirmation: false
  }
};

export interface PermissionCheck {
  granted: boolean;
  reason?: string;
  requires_confirmation?: boolean;
  risk_override_needed?: boolean;
}

export function checkPermission(
  userRole: UserRole, 
  permission: Permission, 
  context?: any
): PermissionCheck {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  if (!rolePermissions.includes(permission)) {
    return {
      granted: false,
      reason: `Role ${userRole} does not have permission ${permission}`
    };
  }
  
  // Additional context-based checks
  if (permission.includes('trade') && context?.amount) {
    const limits = DEFAULT_RISK_LIMITS[userRole];
    if (context.amount > limits.max_trade_amount_usd) {
      return {
        granted: false,
        reason: `Trade amount ${context.amount} exceeds limit ${limits.max_trade_amount_usd}`,
        risk_override_needed: true
      };
    }
  }
  
  return {
    granted: true,
    requires_confirmation: userRole === 'confirm_to_execute'
  };
}

export function canExecute(userRole: UserRole, toolName: string, payload: any): boolean {
  // High-risk tools always require explicit permission
  const highRiskTools = ['place_order_ibkr', 'place_order_xtb', 'charge_customer'];
  
  if (highRiskTools.includes(toolName)) {
    return userRole === 'auto_execute_with_limits';
  }
  
  return true;
}

export function requiresSimulation(toolName: string): boolean {
  const simulationRequired = ['place_order_ibkr', 'place_order_xtb', 'charge_customer'];
  return simulationRequired.includes(toolName);
}

export interface AuditEntry {
  timestamp: string;
  user_id: string;
  user_role: UserRole;
  tool_name: string;
  input_hash: string;
  output_hash: string;
  permission_granted: boolean;
  execution_status: 'simulated' | 'executed' | 'rejected' | 'pending_confirmation';
  risk_flags: string[];
  decision_rationale: string;
}

export function createAuditEntry(
  userId: string,
  userRole: UserRole,
  toolName: string,
  input: any,
  output: any,
  status: AuditEntry['execution_status'],
  riskFlags: string[] = [],
  rationale: string = ''
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    user_id: userId,
    user_role: userRole,
    tool_name: toolName,
    input_hash: hashObject(input),
    output_hash: hashObject(output),
    permission_granted: status !== 'rejected',
    execution_status: status,
    risk_flags: riskFlags,
    decision_rationale: rationale
  };
}

function hashObject(obj: any): string {
  // Simple hash for audit trail - in production use crypto.createHash
  return JSON.stringify(obj).length.toString(36);
}