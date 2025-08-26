// Structured Output Validator - Wymusza schemat JSON i bezpieczeństwo
// ZASADA: LLM nigdy niczego sam nie wykonuje - zawsze can_execute=false bez EXECUTE_GRANTED

import { z } from 'zod';

// JSON Schema Definitions for Structured Outputs
export const PlanActionSchema = z.object({
  type: z.literal('PlanAction'),
  version: z.literal('1.0'),
  goal: z.string().min(1),
  assumptions: z.array(z.string()),
  needed_data: z.array(z.object({
    name: z.string(),
    tool: z.string(),
    why: z.string()
  })),
  legal_checks: z.array(z.object({
    jurisdiction: z.string(),
    act_name: z.string(),
    since_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    why: z.string()
  })),
  risk_flags: z.array(z.string()),
  proposed_actions: z.array(z.object({
    id: z.string(),
    kind: z.enum(['analysis', 'order', 'payment', 'document', 'task']),
    tool: z.string(),
    payload: z.object({}),
    preconditions: z.array(z.enum(['simulate_ok', 'limits_ok', 'law_ok'])),
    can_execute: z.literal(false), // WYMUSZONE: nigdy true bez EXECUTE_GRANTED
    rationale: z.string()
  }))
});

export const PlanVerificationSchema = z.object({
  type: z.literal('PlanVerification'),
  version: z.literal('1.0'),
  checks: z.object({
    law_ok: z.object({
      status: z.enum(['unknown', 'pass', 'fail']),
      evidence: z.array(z.object({
        source: z.string(),
        title: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      }))
    }),
    simulate_ok: z.object({
      status: z.enum(['unknown', 'pass', 'fail']),
      notes: z.string()
    }),
    limits_ok: z.object({
      status: z.enum(['unknown', 'pass', 'fail']),
      notes: z.string()
    })
  }),
  open_issues: z.array(z.string())
});

export const DecisionSchema = z.object({
  type: z.literal('Decision'),
  version: z.literal('1.0'),
  summary: z.string(),
  approved_actions: z.array(z.string()),
  deferred_actions: z.array(z.string()),
  rejected_actions: z.array(z.string()),
  next_questions: z.array(z.string()).max(3) // MAX 3 pytania
});

// Typy TypeScript z schemas
export type PlanAction = z.infer<typeof PlanActionSchema>;
export type PlanVerification = z.infer<typeof PlanVerificationSchema>;
export type Decision = z.infer<typeof DecisionSchema>;

// EXECUTE_GRANTED Token System
export interface ExecuteGranted {
  token: string;
  userId: string;
  sessionId: string;
  grantedAt: Date;
  expiresAt: Date;
  actions: string[]; // Lista zatwierdzonych action_id
  grantedBy: 'user_consent' | '2fa_verified' | 'auto_limits_passed';
  riskLevel: 'low' | 'medium' | 'high';
}

// Centralized Validator Class
export class StructuredOutputValidator {
  private executeTokens: Map<string, ExecuteGranted> = new Map();

  // Waliduj PlanAction i wymuś can_execute=false
  validatePlanAction(input: any): { isValid: boolean; data?: PlanAction; errors?: string[] } {
    try {
      const validated = PlanActionSchema.parse(input);
      
      // DODATKOWA KONTROLA: Sprawdź czy wszystkie proposed_actions mają can_execute=false
      const invalidActions = validated.proposed_actions.filter(action => action.can_execute !== false);
      if (invalidActions.length > 0) {
        return {
          isValid: false,
          errors: [`Znaleziono akcje z can_execute=true: ${invalidActions.map(a => a.id).join(', ')}. ZASADA: LLM nigdy niczego sam nie wykonuje!`]
        };
      }

      return { isValid: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        errors: ['Nieoczekiwany błąd walidacji']
      };
    }
  }

  // Waliduj PlanVerification
  validatePlanVerification(input: any): { isValid: boolean; data?: PlanVerification; errors?: string[] } {
    try {
      const validated = PlanVerificationSchema.parse(input);
      return { isValid: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        errors: ['Nieoczekiwany błąd walidacji']
      };
    }
  }

  // Waliduj Decision z limitem 3 pytań
  validateDecision(input: any): { isValid: boolean; data?: Decision; errors?: string[] } {
    try {
      const validated = DecisionSchema.parse(input);
      
      if (validated.next_questions.length > 3) {
        return {
          isValid: false,
          errors: ['Maksymalnie 3 pytania dozwolone w next_questions']
        };
      }

      return { isValid: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        errors: ['Nieoczekiwany błąd walidacji']
      };
    }
  }

  // Generuj EXECUTE_GRANTED token
  generateExecuteToken(
    userId: string,
    sessionId: string,
    actions: string[],
    grantedBy: ExecuteGranted['grantedBy'],
    riskLevel: ExecuteGranted['riskLevel'],
    durationMinutes: number = 5
  ): ExecuteGranted {
    const token = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const executeGranted: ExecuteGranted = {
      token,
      userId,
      sessionId,
      grantedAt: now,
      expiresAt,
      actions,
      grantedBy,
      riskLevel
    };

    this.executeTokens.set(token, executeGranted);
    
    // Auto-cleanup po ekspiracji
    setTimeout(() => {
      this.executeTokens.delete(token);
    }, durationMinutes * 60 * 1000 + 1000);

    return executeGranted;
  }

  // Sprawdź czy token EXECUTE_GRANTED jest ważny
  validateExecuteToken(token: string, actionId: string, userId: string): { 
    isValid: boolean; 
    granted?: ExecuteGranted; 
    reason?: string 
  } {
    const granted = this.executeTokens.get(token);
    
    if (!granted) {
      return { isValid: false, reason: 'Token EXECUTE_GRANTED nie istnieje' };
    }

    if (granted.expiresAt < new Date()) {
      this.executeTokens.delete(token);
      return { isValid: false, reason: 'Token EXECUTE_GRANTED wygasł' };
    }

    if (granted.userId !== userId) {
      return { isValid: false, reason: 'Token EXECUTE_GRANTED należy do innego użytkownika' };
    }

    if (!granted.actions.includes(actionId)) {
      return { isValid: false, reason: `Akcja ${actionId} nie jest zatwierdzona w tokenie` };
    }

    return { isValid: true, granted };
  }

  // Revoke token (panic button)
  revokeExecuteToken(token: string): boolean {
    return this.executeTokens.delete(token);
  }

  // Revoke wszystkie tokeny użytkownika (panic button)
  revokeAllUserTokens(userId: string): number {
    let revoked = 0;
    for (const [token, granted] of this.executeTokens.entries()) {
      if (granted.userId === userId) {
        this.executeTokens.delete(token);
        revoked++;
      }
    }
    return revoked;
  }

  // Middleware do sprawdzania structured outputs
  validateStructuredOutput(outputType: 'PlanAction' | 'PlanVerification' | 'Decision') {
    return (req: any, res: any, next: any) => {
      const { output } = req.body;
      
      if (!output) {
        return res.status(400).json({
          error: 'Brak wymaganego pola "output" w structured output',
          code: 'MISSING_OUTPUT'
        });
      }

      let validationResult;
      switch (outputType) {
        case 'PlanAction':
          validationResult = this.validatePlanAction(output);
          break;
        case 'PlanVerification':
          validationResult = this.validatePlanVerification(output);
          break;
        case 'Decision':
          validationResult = this.validateDecision(output);
          break;
        default:
          return res.status(400).json({
            error: 'Nieznany typ structured output',
            code: 'INVALID_OUTPUT_TYPE'
          });
      }

      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Błędy walidacji structured output',
          code: 'VALIDATION_FAILED',
          errors: validationResult.errors
        });
      }

      // Dodaj zwalidowane dane do request
      req.validatedOutput = validationResult.data;
      next();
    };
  }
}

// Singleton instance
export const structuredValidator = new StructuredOutputValidator();