import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { 
  budgets, 
  transactions, 
  transactionCategories, 
  userAccounts, 
  financialGoals,
  debts,
  cashflowPredictions,
  aiRecommendations,
  recurringTransactions
} from '../../shared/schema';
import { eq, and, gte, lte, sql, desc, asc, sum, count } from 'drizzle-orm';

const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

export class BudgetService {
  // Get user's active budget
  async getActiveBudget(userId: string) {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      const budget = await db
        .select()
        .from(budgets)
        .where(
          and(
            eq(budgets.userId, userId),
            eq(budgets.isActive, true),
            lte(budgets.startDate, currentDate),
            gte(budgets.endDate, currentDate)
          )
        )
        .limit(1);

      return budget[0] || null;
    } catch (error) {
      console.error('Error getting active budget:', error);
      return null;
    }
  }

  // Get budget performance for current period
  async getBudgetPerformance(userId: string) {
    try {
      const budget = await this.getActiveBudget(userId);
      if (!budget) return null;

      // Get spending by category for current budget period
      const spending = await db
        .select({
          categoryId: transactions.categoryId,
          totalSpent: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, budget.startDate),
            lte(transactions.transactionDate, budget.endDate),
            sql`${transactions.amountCents} < 0` // Only expenses (negative amounts)
          )
        )
        .groupBy(transactions.categoryId);

      // Calculate category performance
      const categoryLimits = budget.categoryLimits as Record<string, number>;
      const performance = Object.entries(categoryLimits).map(([categoryId, limitCents]) => {
        const spentData = spending.find(s => s.categoryId === categoryId);
        const spentCents = Math.abs(spentData?.totalSpent || 0);
        const percentage = limitCents > 0 ? (spentCents / limitCents) * 100 : 0;
        
        return {
          categoryId,
          limitCents,
          spentCents,
          remainingCents: Math.max(0, limitCents - spentCents),
          percentage,
          status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
        };
      });

      return {
        budget,
        performance,
        totalBudgetCents: budget.totalBudgetCents,
        totalSpentCents: performance.reduce((sum, p) => sum + p.spentCents, 0),
      };
    } catch (error) {
      console.error('Error getting budget performance:', error);
      return null;
    }
  }

  // Create or update budget
  async createOrUpdateBudget(userId: string, budgetData: {
    name: string;
    budgetType: string;
    startDate: string;
    endDate: string;
    categoryLimits: Record<string, number>;
    totalBudgetCents: number;
    alertThresholds?: { warning: number; danger: number };
  }) {
    try {
      // Deactivate existing budgets
      await db
        .update(budgets)
        .set({ isActive: false })
        .where(eq(budgets.userId, userId));

      // Create new budget
      const [newBudget] = await db
        .insert(budgets)
        .values({
          id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          ...budgetData,
        })
        .returning();

      return newBudget;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  // Get transaction categories for user
  async getTransactionCategories(userId: string) {
    try {
      // Get user's custom categories and default categories
      const categories = await db
        .select()
        .from(transactionCategories)
        .where(
          sql`${transactionCategories.userId} = ${userId} OR ${transactionCategories.userId} IS NULL`
        )
        .orderBy(transactionCategories.orderIndex);

      return categories;
    } catch (error) {
      console.error('Error getting transaction categories:', error);
      return [];
    }
  }

  // Predict end-of-month balance
  async predictEndOfMonthBalance(userId: string) {
    try {
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get current account balances
      const accounts = await db
        .select({
          totalBalance: sql<number>`COALESCE(SUM(${userAccounts.currentBalance}), 0)`,
        })
        .from(userAccounts)
        .where(and(
          eq(userAccounts.userId, userId),
          eq(userAccounts.isActive, true)
        ));

      const currentBalance = accounts[0]?.totalBalance || 0;

      // Get spending patterns from this month
      const monthSpending = await db
        .select({
          dailyAverage: sql<number>`COALESCE(AVG(daily_spending.spending), 0)`,
        })
        .from(
          sql`(
            SELECT 
              DATE(${transactions.transactionDate}) as date,
              SUM(${transactions.amountCents}) as spending
            FROM ${transactions}
            WHERE ${transactions.userId} = ${userId}
              AND ${transactions.transactionDate} >= ${startOfMonth.toISOString().split('T')[0]}
              AND ${transactions.transactionDate} <= ${today.toISOString().split('T')[0]}
              AND ${transactions.amountCents} < 0
            GROUP BY DATE(${transactions.transactionDate})
          ) as daily_spending`
        );

      const dailySpendingAverage = Math.abs(monthSpending[0]?.dailyAverage || 0);

      // Get upcoming recurring transactions
      const upcomingRecurring = await db
        .select()
        .from(recurringTransactions)
        .where(
          and(
            eq(recurringTransactions.userId, userId),
            eq(recurringTransactions.isActive, true),
            gte(recurringTransactions.nextDueDate, today.toISOString().split('T')[0]),
            lte(recurringTransactions.nextDueDate, endOfMonth.toISOString().split('T')[0])
          )
        );

      const upcomingRecurringTotal = upcomingRecurring.reduce(
        (sum, transaction) => sum + transaction.amountCents, 0
      );

      // Calculate prediction
      const daysRemaining = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const projectedSpending = dailySpendingAverage * daysRemaining;
      const predictedBalance = currentBalance - projectedSpending + upcomingRecurringTotal;

      // Store prediction
      await db.insert(cashflowPredictions).values({
        id: `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        predictionDate: endOfMonth.toISOString().split('T')[0],
        predictionType: 'end_of_month',
        predictedBalanceCents: Math.round(predictedBalance),
        confidenceLevel: 75, // Basic confidence level
        expectedExpensesCents: Math.round(projectedSpending),
        recurringTransactions: upcomingRecurring.map(t => ({
          name: t.name,
          amount: t.amountCents,
          date: t.nextDueDate
        })),
        modelVersion: 'v1.0'
      });

      return {
        currentBalanceCents: currentBalance,
        predictedBalanceCents: Math.round(predictedBalance),
        projectedSpendingCents: Math.round(projectedSpending),
        upcomingRecurringCents: upcomingRecurringTotal,
        daysRemaining,
        confidenceLevel: 75
      };
    } catch (error) {
      console.error('Error predicting end-of-month balance:', error);
      return null;
    }
  }

  // Generate AI recommendations
  async generateRecommendations(userId: string) {
    try {
      const budget = await this.getBudgetPerformance(userId);
      const prediction = await this.predictEndOfMonthBalance(userId);
      const recommendations = [];

      if (budget) {
        // Check for overspending categories
        const overspendingCategories = budget.performance.filter(p => p.percentage >= 80);
        
        for (const category of overspendingCategories) {
          const severity = category.percentage >= 100 ? 'high' : 'medium';
          
          recommendations.push({
            id: `overspend_${category.categoryId}_${Date.now()}`,
            userId,
            title: `Uwaga: przekroczenie budżetu`,
            description: `Wydałeś już ${category.percentage.toFixed(1)}% budżetu w kategorii. Pozostało ${Math.max(0, category.remainingCents / 100).toFixed(2)} zł.`,
            category: 'budget',
            priority: severity,
            actionSteps: [
              { step: 'Przejrzyj ostatnie wydatki w tej kategorii', completed: false },
              { step: 'Znajdź obszary do oszczędności', completed: false },
              { step: 'Rozważ zwiększenie budżetu lub przesunięcie środków', completed: false }
            ],
            expectedImpact: `Uniknięcie dalszego przekroczenia budżetu`,
            deepLink: '/budget',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }

      if (prediction && prediction.predictedBalanceCents < 0) {
        recommendations.push({
          id: `negative_balance_${Date.now()}`,
          userId,
          title: 'Ostrzeżenie: ujemne saldo do końca miesiąca',
          description: `Przewidywane saldo: ${(prediction.predictedBalanceCents / 100).toFixed(2)} zł. Potrzebujesz planu działania.`,
          category: 'cashflow',
          priority: 'urgent',
          actionSteps: [
            { step: 'Sprawdź nadchodzące płatności', completed: false },
            { step: 'Znajdź możliwości oszczędności', completed: false },
            { step: 'Rozważ przesunięcie większych wydatków', completed: false }
          ],
          expectedImpact: 'Uniknięcie ujemnego salda',
          deepLink: '/cashflow',
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Store recommendations
      for (const rec of recommendations) {
        await db.insert(aiRecommendations).values(rec);
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Get user's financial goals
  async getFinancialGoals(userId: string) {
    try {
      const goals = await db
        .select()
        .from(financialGoals)
        .where(eq(financialGoals.userId, userId))
        .orderBy(desc(financialGoals.priority), asc(financialGoals.targetDate));

      return goals.map(goal => {
        const progressPercentage = goal.targetAmountCents > 0 
          ? (goal.currentAmountCents / goal.targetAmountCents) * 100 
          : 0;
        
        const remainingCents = Math.max(0, goal.targetAmountCents - goal.currentAmountCents);
        
        return {
          ...goal,
          progressPercentage,
          remainingCents,
          isOnTrack: this.calculateGoalProgress(goal)
        };
      });
    } catch (error) {
      console.error('Error getting financial goals:', error);
      return [];
    }
  }

  // Calculate if goal is on track
  private calculateGoalProgress(goal: any) {
    if (!goal.targetDate || goal.status !== 'active') return null;
    
    const now = new Date();
    const target = new Date(goal.targetDate);
    const start = new Date(goal.startDate);
    
    const totalDays = (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    const expectedProgress = Math.min((daysPassed / totalDays) * 100, 100);
    const actualProgress = (goal.currentAmountCents / goal.targetAmountCents) * 100;
    
    return {
      expectedProgress,
      actualProgress,
      isOnTrack: actualProgress >= expectedProgress * 0.9, // 10% tolerance
      daysRemaining: Math.max(0, (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  }

  // Get user's debt summary
  async getDebtSummary(userId: string) {
    try {
      const debtsData = await db
        .select()
        .from(debts)
        .where(and(
          eq(debts.userId, userId),
          eq(debts.isActive, true)
        ))
        .orderBy(desc(debts.interestRate)); // Avalanche method - highest interest first

      const totalDebtCents = debtsData.reduce((sum, debt) => sum + debt.currentBalanceCents, 0);
      const totalMinimumPaymentCents = debtsData.reduce((sum, debt) => sum + debt.minimumPaymentCents, 0);
      const averageInterestRate = debtsData.length > 0 
        ? debtsData.reduce((sum, debt) => sum + Number(debt.interestRate), 0) / debtsData.length 
        : 0;

      return {
        debts: debtsData,
        summary: {
          totalDebtCents,
          totalMinimumPaymentCents,
          averageInterestRate,
          debtCount: debtsData.length
        }
      };
    } catch (error) {
      console.error('Error getting debt summary:', error);
      return { debts: [], summary: null };
    }
  }

  // Calculate debt payoff scenarios (snowball vs avalanche)
  async calculateDebtPayoffScenarios(userId: string, extraPaymentCents: number = 0) {
    try {
      const { debts: debtsData } = await this.getDebtSummary(userId);
      
      if (debtsData.length === 0) return null;

      // Snowball method (lowest balance first)
      const snowballOrder = [...debtsData].sort((a, b) => a.currentBalanceCents - b.currentBalanceCents);
      const snowballResult = this.simulateDebtPayoff(snowballOrder, extraPaymentCents);

      // Avalanche method (highest interest first)
      const avalancheOrder = [...debtsData].sort((a, b) => Number(b.interestRate) - Number(a.interestRate));
      const avalancheResult = this.simulateDebtPayoff(avalancheOrder, extraPaymentCents);

      return {
        snowball: snowballResult,
        avalanche: avalancheResult,
        recommendation: avalancheResult.totalInterestCents < snowballResult.totalInterestCents ? 'avalanche' : 'snowball'
      };
    } catch (error) {
      console.error('Error calculating debt payoff scenarios:', error);
      return null;
    }
  }

  private simulateDebtPayoff(debts: any[], extraPaymentCents: number) {
    let totalPayments = 0;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 600; // 50 years safety limit
    
    // Create working copy
    const workingDebts = debts.map(debt => ({
      ...debt,
      remainingBalance: debt.currentBalanceCents
    })).filter(debt => debt.remainingBalance > 0);

    while (workingDebts.some(debt => debt.remainingBalance > 0) && months < maxMonths) {
      months++;
      let availableExtra = extraPaymentCents;

      for (const debt of workingDebts) {
        if (debt.remainingBalance <= 0) continue;

        // Calculate interest for this month
        const monthlyInterest = Math.round(debt.remainingBalance * (Number(debt.interestRate) / 12));
        totalInterest += monthlyInterest;

        // Minimum payment
        let payment = Math.min(debt.minimumPaymentCents, debt.remainingBalance + monthlyInterest);
        
        // Add extra payment to first debt in order
        if (availableExtra > 0 && debt === workingDebts.find(d => d.remainingBalance > 0)) {
          const extraForThisDebt = Math.min(availableExtra, debt.remainingBalance + monthlyInterest - payment);
          payment += extraForThisDebt;
          availableExtra -= extraForThisDebt;
        }

        totalPayments += payment;
        debt.remainingBalance = Math.max(0, debt.remainingBalance + monthlyInterest - payment);
      }
    }

    return {
      months,
      totalPaymentsCents: totalPayments,
      totalInterestCents: totalInterest,
      payoffDate: new Date(Date.now() + months * 30.44 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
}

export const budgetService = new BudgetService();