// Structured Planning System - PlanAction → PlanVerification → Decision
// JSON Schema validation with state machine for agent decision making

import { z } from 'zod';
import { STRUCTURED_OUTPUT_SCHEMAS } from '../tools/contracts';
import { storage } from '../storage';
import { openAIService } from '../services/openai';

// Zod schemas for structured outputs validation
export const PlanActionSchema = z.object({
  type: z.literal("PlanAction"),
  version: z.literal("1.0"),
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
    kind: z.enum(["analysis", "order", "payment", "document", "task"]),
    tool: z.string(),
    payload: z.record(z.any()),
    preconditions: z.array(z.enum(["simulate_ok", "limits_ok", "law_ok"])),
    can_execute: z.literal(false),
    rationale: z.string()
  }))
});

export const PlanVerificationSchema = z.object({
  type: z.literal("PlanVerification"),
  version: z.literal("1.0"),
  checks: z.object({
    law_ok: z.object({
      status: z.enum(["unknown", "pass", "fail"]),
      evidence: z.array(z.object({
        source: z.string(),
        title: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      }))
    }),
    simulate_ok: z.object({
      status: z.enum(["unknown", "pass", "fail"]),
      notes: z.string()
    }),
    limits_ok: z.object({
      status: z.enum(["unknown", "pass", "fail"]),
      notes: z.string()
    })
  }),
  open_issues: z.array(z.string())
});

export const DecisionSchema = z.object({
  type: z.literal("Decision"),
  version: z.literal("1.0"),
  summary: z.string().min(1),
  approved_actions: z.array(z.string()),
  deferred_actions: z.array(z.string()),
  rejected_actions: z.array(z.string()),
  next_questions: z.array(z.string())
});

export type PlanAction = z.infer<typeof PlanActionSchema>;
export type PlanVerification = z.infer<typeof PlanVerificationSchema>;
export type Decision = z.infer<typeof DecisionSchema>;

export interface PlanningSession {
  id: string;
  userId: string;
  sessionId: string;
  userQuery: string;
  currentPhase: 'planning' | 'verification' | 'decision' | 'complete';
  planAction?: PlanAction;
  planVerification?: PlanVerification;
  decision?: Decision;
  toolExecutions: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class StructuredPlanningService {
  // Phase 1: Generate PlanAction from user query
  async generatePlanAction(
    userQuery: string,
    userId: string,
    sessionId: string,
    context: any = {}
  ): Promise<PlanAction> {
    const prompt = `
Jesteś ekspertem finansowym analizującym żądanie użytkownika. Przeanalizuj to pytanie i wygeneruj szczegółowy plan działania.

ŻĄDANIE UŻYTKOWNIKA: "${userQuery}"

KONTEKST: ${JSON.stringify(context, null, 2)}

Stwórz PlanAction używając DOKŁADNIE tej struktury JSON:

{
  "type": "PlanAction",
  "version": "1.0", 
  "goal": "Jasno sformułowany cel użytkownika",
  "assumptions": [
    "Założenie 1 o sytuacji użytkownika",
    "Założenie 2 o warunkach rynkowych"
  ],
  "needed_data": [
    {
      "name": "Nazwa potrzebnych danych",
      "tool": "get_market_data_tradingview", 
      "why": "Dlaczego te dane są potrzebne"
    }
  ],
  "legal_checks": [
    {
      "jurisdiction": "PL",
      "act_name": "Ustawa o obrocie instrumentami finansowymi",
      "since_date": "2024-01-01",
      "why": "Dlaczego trzeba sprawdzić te przepisy"
    }
  ],
  "risk_flags": [
    "high_value_transaction", 
    "regulatory_compliance"
  ],
  "proposed_actions": [
    {
      "id": "A1",
      "kind": "analysis",
      "tool": "get_market_data_tradingview",
      "payload": { "symbol": "AAPL", "interval": "1d" },
      "preconditions": ["limits_ok"],
      "can_execute": false,
      "rationale": "Dlaczego ta akcja jest potrzebna"
    }
  ]
}

WAŻNE ZASADY:
1. can_execute ZAWSZE musi być false
2. Używaj tylko narzędzi z dostępnej listy: get_market_data_tradingview, simulate_order, news_search_whitelist, fetch_gov_law, create_audit_note, charge_customer
3. Wszystkie daty w formacie YYYY-MM-DD
4. Każda akcja musi mieć uzasadnienie w rationale
5. Sprawdź czy działanie wymaga prawnych sprawdzeń regulatory

Odpowiedz TYLKO valid JSON bez dodatkowych komentarzy.`;

    const response = await openAIService.generateStructuredResponse(prompt, {
      model: 'gpt-4o',
      responseFormat: { type: 'json_object' },
      maxTokens: 2000
    });

    const planData = JSON.parse(response.content);
    
    // Validate with Zod
    const planAction = PlanActionSchema.parse(planData);
    
    // Save to audit trail
    await storage.saveToolExecution({
      user_id: userId,
      session_id: sessionId,
      tool_name: 'generate_plan_action',
      user_role: 'analysis_only',
      input_data: { userQuery, context },
      output_data: planAction,
      execution_status: 'executed',
      permission_granted: true,
      risk_flags: planAction.risk_flags,
      decision_rationale: 'Plan action generated successfully'
    });

    return planAction;
  }

  // Phase 2: Verify plan preconditions
  async verifyPlan(
    planAction: PlanAction,
    userId: string,
    sessionId: string
  ): Promise<PlanVerification> {
    const verification: PlanVerification = {
      type: "PlanVerification",
      version: "1.0",
      checks: {
        law_ok: { status: "unknown", evidence: [] },
        simulate_ok: { status: "unknown", notes: "" },
        limits_ok: { status: "unknown", notes: "" }
      },
      open_issues: []
    };

    // Check legal requirements
    for (const legalCheck of planAction.legal_checks) {
      try {
        // This would call actual legal document fetching
        const legalResponse = await this.mockLegalCheck(legalCheck);
        
        verification.checks.law_ok.status = "pass";
        verification.checks.law_ok.evidence.push({
          source: `${legalCheck.jurisdiction} Government`,
          title: legalCheck.act_name,
          date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        verification.checks.law_ok.status = "fail";
        verification.open_issues.push(`Legal check failed: ${legalCheck.act_name}`);
      }
    }

    // Check simulation for trading actions
    const tradingActions = planAction.proposed_actions.filter(a => 
      ['order'].includes(a.kind)
    );
    
    if (tradingActions.length > 0) {
      try {
        for (const action of tradingActions) {
          // This would call actual simulation
          await this.mockSimulateAction(action);
        }
        verification.checks.simulate_ok.status = "pass";
        verification.checks.simulate_ok.notes = "All trading actions simulated successfully";
      } catch (error) {
        verification.checks.simulate_ok.status = "fail";
        verification.checks.simulate_ok.notes = `Simulation failed: ${error}`;
        verification.open_issues.push("Trading simulation failed");
      }
    } else {
      verification.checks.simulate_ok.status = "pass";
      verification.checks.simulate_ok.notes = "No trading actions to simulate";
    }

    // Check risk limits
    const userConfig = await storage.getUserAgentConfig(userId);
    const riskLimits = userConfig?.autoExecutionLimits || { maxTradeAmount: 1000 };
    
    let limitsOk = true;
    let limitNotes = "All actions within limits";
    
    for (const action of planAction.proposed_actions) {
      if (action.kind === 'order' && action.payload.amount > riskLimits.maxTradeAmount) {
        limitsOk = false;
        limitNotes = `Action ${action.id} exceeds limit: ${action.payload.amount} > ${riskLimits.maxTradeAmount}`;
        verification.open_issues.push(`Risk limit exceeded: ${action.id}`);
        break;
      }
    }
    
    verification.checks.limits_ok.status = limitsOk ? "pass" : "fail";
    verification.checks.limits_ok.notes = limitNotes;

    // Save verification to audit
    await storage.saveToolExecution({
      user_id: userId,
      session_id: sessionId,
      tool_name: 'verify_plan',
      user_role: 'analysis_only',
      input_data: planAction,
      output_data: verification,
      execution_status: 'executed',
      permission_granted: true,
      risk_flags: verification.open_issues,
      decision_rationale: 'Plan verification completed'
    });

    return verification;
  }

  // Phase 3: Make final decision
  async makeDecision(
    planAction: PlanAction,
    verification: PlanVerification,
    userId: string,
    sessionId: string
  ): Promise<Decision> {
    const allChecksPassed = Object.values(verification.checks).every(
      check => check.status === "pass"
    );

    const hasOpenIssues = verification.open_issues.length > 0;

    let decision: Decision;

    if (allChecksPassed && !hasOpenIssues) {
      // All green - approve actions
      decision = {
        type: "Decision",
        version: "1.0",
        summary: "Wszystkie sprawdzenia przeszły pomyślnie. Plan może zostać zrealizowany.",
        approved_actions: planAction.proposed_actions.map(a => a.id),
        deferred_actions: [],
        rejected_actions: [],
        next_questions: []
      };
    } else if (hasOpenIssues) {
      // Issues found - defer or reject
      const criticalIssues = verification.open_issues.filter(issue => 
        issue.includes('failed') || issue.includes('exceeded')
      );

      if (criticalIssues.length > 0) {
        decision = {
          type: "Decision", 
          version: "1.0",
          summary: "Wykryto krytyczne problemy. Działania zostały odrzucone.",
          approved_actions: [],
          deferred_actions: [],
          rejected_actions: planAction.proposed_actions.map(a => a.id),
          next_questions: [
            "Czy chcesz zmniejszyć kwoty transakcji?",
            "Czy chcesz sprawdzić inne opcje inwestycyjne?",
            "Czy potrzebujesz dodatkowych informacji prawnych?"
          ]
        };
      } else {
        decision = {
          type: "Decision",
          version: "1.0", 
          summary: "Niektóre działania wymagają dodatkowych sprawdzeń. Część akcji odłożono.",
          approved_actions: planAction.proposed_actions
            .filter(a => a.kind === 'analysis' || a.kind === 'document')
            .map(a => a.id),
          deferred_actions: planAction.proposed_actions
            .filter(a => a.kind === 'order' || a.kind === 'payment')
            .map(a => a.id),
          rejected_actions: [],
          next_questions: [
            "Czy chcesz kontynuować z zatwierdzonymi działaniami?",
            "Czy potrzebujesz dodatkowych informacji przed wykonaniem odłożonych akcji?"
          ]
        };
      }
    } else {
      // Partial pass - mixed decision
      decision = {
        type: "Decision",
        version: "1.0",
        summary: "Plan wymaga częściowych modyfikacji. Niektóre działania zatwierdzone.",
        approved_actions: planAction.proposed_actions
          .filter(a => ['analysis', 'document'].includes(a.kind))
          .map(a => a.id),
        deferred_actions: planAction.proposed_actions
          .filter(a => ['order', 'payment'].includes(a.kind))
          .map(a => a.id),
        rejected_actions: [],
        next_questions: [
          "Które działania chcesz wykonać w pierwszej kolejności?",
          "Czy potrzebujesz dodatkowych zabezpieczeń dla transakcji finansowych?"
        ]
      };
    }

    // Save decision to audit
    await storage.saveToolExecution({
      user_id: userId,
      session_id: sessionId,
      tool_name: 'make_decision',
      user_role: 'analysis_only',
      input_data: { planAction, verification },
      output_data: decision,
      execution_status: 'executed',
      permission_granted: true,
      risk_flags: decision.rejected_actions.length > 0 ? ['rejected_actions'] : [],
      decision_rationale: decision.summary
    });

    return decision;
  }

  // Mock legal check (replace with actual implementation)
  private async mockLegalCheck(legalCheck: any): Promise<any> {
    // In real implementation, this would call fetch_gov_law tool
    return {
      status: 'current',
      lastModified: new Date().toISOString(),
      summary: `Legal check for ${legalCheck.act_name} completed`
    };
  }

  // Mock simulation (replace with actual implementation)
  private async mockSimulateAction(action: any): Promise<any> {
    // In real implementation, this would call simulate_order tool
    return {
      simulationId: `sim_${Date.now()}`,
      estimatedCost: action.payload.amount || 1000,
      riskAssessment: 'medium'
    };
  }
}