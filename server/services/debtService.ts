import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { debts, userAccounts } from '../../shared/schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';

const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

export interface DebtPayoffScenario {
  months: number;
  totalPaymentsCents: number;
  totalInterestCents: number;
  payoffDate: string;
}

export class DebtService {
  // Create new debt
  async createDebt(userId: string, debtData: {
    debtName: string;
    debtType: string;
    creditorName?: string;
    originalBalanceCents: number;
    currentBalanceCents: number;
    minimumPaymentCents: number;
    interestRate: number;
    paymentDueDate: number;
    linkedAccountId?: string;
  }) {
    try {
      const [newDebt] = await db
        .insert(debts)
        .values({
          id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          ...debtData,
          payoffDate: null,
          totalInterestCents: null,
        })
        .returning();

      // Calculate initial payoff projections
      await this.calculatePayoffProjections(newDebt.id);

      return newDebt;
    } catch (error) {
      console.error('Error creating debt:', error);
      throw error;
    }
  }

  // Get user's debts with calculated metrics
  async getUserDebts(userId: string) {
    try {
      const userDebts = await db
        .select()
        .from(debts)
        .where(and(
          eq(debts.userId, userId),
          eq(debts.isActive, true)
        ))
        .orderBy(desc(debts.interestRate));

      // Add calculated metrics
      const debtsWithMetrics = userDebts.map(debt => ({
        ...debt,
        monthsToPayoff: this.calculateMonthsToPayoff(
          debt.currentBalanceCents,
          debt.minimumPaymentCents,
          Number(debt.interestRate)
        ),
        totalInterestIfMinimum: this.calculateTotalInterest(
          debt.currentBalanceCents,
          debt.minimumPaymentCents,
          Number(debt.interestRate)
        ),
        nextPaymentDate: this.calculateNextPaymentDate(debt.paymentDueDate),
        utilizationRatio: debt.debtType === 'credit_card' 
          ? (debt.currentBalanceCents / debt.originalBalanceCents) * 100 
          : null
      }));

      return debtsWithMetrics;
    } catch (error) {
      console.error('Error getting user debts:', error);
      return [];
    }
  }

  // Calculate debt payoff scenarios (snowball vs avalanche)
  async calculatePayoffScenarios(userId: string, extraPaymentCents: number = 0): Promise<{
    snowball: DebtPayoffScenario;
    avalanche: DebtPayoffScenario;
    recommendation: 'snowball' | 'avalanche';
    savings: number;
  } | null> {
    try {
      const userDebts = await this.getUserDebts(userId);
      
      if (userDebts.length === 0) return null;

      // Snowball method (lowest balance first)
      const snowballOrder = [...userDebts].sort((a, b) => a.currentBalanceCents - b.currentBalanceCents);
      const snowballResult = this.simulateDebtPayoff(snowballOrder, extraPaymentCents);

      // Avalanche method (highest interest first)
      const avalancheOrder = [...userDebts].sort((a, b) => Number(b.interestRate) - Number(a.interestRate));
      const avalancheResult = this.simulateDebtPayoff(avalancheOrder, extraPaymentCents);

      const interestSavings = snowballResult.totalInterestCents - avalancheResult.totalInterestCents;
      
      return {
        snowball: snowballResult,
        avalanche: avalancheResult,
        recommendation: interestSavings > 0 ? 'avalanche' : 'snowball',
        savings: Math.abs(interestSavings)
      };
    } catch (error) {
      console.error('Error calculating payoff scenarios:', error);
      return null;
    }
  }

  // Simulate debt payoff with specific strategy
  private simulateDebtPayoff(debts: any[], extraPaymentCents: number): DebtPayoffScenario {
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

        // Calculate monthly interest
        const monthlyInterest = Math.round(debt.remainingBalance * (Number(debt.interestRate) / 12));
        totalInterest += monthlyInterest;

        // Minimum payment
        let payment = Math.min(debt.minimumPaymentCents, debt.remainingBalance + monthlyInterest);
        
        // Add extra payment to first debt in strategy order
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

  // Calculate months to payoff with minimum payments
  private calculateMonthsToPayoff(balanceCents: number, paymentCents: number, annualRate: number): number {
    if (paymentCents <= 0 || annualRate <= 0) return Infinity;
    
    const monthlyRate = annualRate / 12;
    const monthlyInterest = Math.round(balanceCents * monthlyRate);
    
    if (paymentCents <= monthlyInterest) return Infinity; // Never pays off
    
    // Use amortization formula
    const months = -Math.log(1 - (balanceCents * monthlyRate) / paymentCents) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  }

  // Calculate total interest with minimum payments
  private calculateTotalInterest(balanceCents: number, paymentCents: number, annualRate: number): number {
    const months = this.calculateMonthsToPayoff(balanceCents, paymentCents, annualRate);
    if (months === Infinity) return Infinity;
    
    return Math.max(0, (paymentCents * months) - balanceCents);
  }

  // Calculate next payment date
  private calculateNextPaymentDate(dayOfMonth: number): string {
    const now = new Date();
    const nextPayment = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    
    // If payment date has passed this month, move to next month
    if (nextPayment < now) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    
    return nextPayment.toISOString().split('T')[0];
  }

  // Calculate payoff projections for a specific debt
  private async calculatePayoffProjections(debtId: string) {
    try {
      const [debt] = await db
        .select()
        .from(debts)
        .where(eq(debts.id, debtId))
        .limit(1);

      if (!debt) return;

      const months = this.calculateMonthsToPayoff(
        debt.currentBalanceCents,
        debt.minimumPaymentCents,
        Number(debt.interestRate)
      );

      const totalInterest = this.calculateTotalInterest(
        debt.currentBalanceCents,
        debt.minimumPaymentCents,
        Number(debt.interestRate)
      );

      const payoffDate = months !== Infinity 
        ? new Date(Date.now() + months * 30.44 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;

      await db
        .update(debts)
        .set({
          payoffDate,
          totalInterestCents: totalInterest !== Infinity ? totalInterest : null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(debts.id, debtId));
    } catch (error) {
      console.error('Error calculating payoff projections:', error);
    }
  }

  // Update debt payment
  async recordPayment(debtId: string, paymentCents: number, paymentDate: string = new Date().toISOString().split('T')[0]) {
    try {
      const [debt] = await db
        .select()
        .from(debts)
        .where(eq(debts.id, debtId))
        .limit(1);

      if (!debt) throw new Error('Debt not found');

      const newBalance = Math.max(0, debt.currentBalanceCents - paymentCents);

      await db
        .update(debts)
        .set({
          currentBalanceCents: newBalance,
          lastPaymentDate: paymentDate,
          lastPaymentAmountCents: paymentCents,
          updatedAt: new Date().toISOString(),
          // Mark as inactive if fully paid
          isActive: newBalance > 0
        })
        .where(eq(debts.id, debtId));

      // Recalculate projections
      await this.calculatePayoffProjections(debtId);

      return { success: true, newBalance };
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Get debt summary statistics
  async getDebtSummary(userId: string) {
    try {
      const userDebts = await this.getUserDebts(userId);
      
      const totalDebt = userDebts.reduce((sum, debt) => sum + debt.currentBalanceCents, 0);
      const totalMinimumPayment = userDebts.reduce((sum, debt) => sum + debt.minimumPaymentCents, 0);
      const averageInterestRate = userDebts.length > 0 
        ? userDebts.reduce((sum, debt) => sum + Number(debt.interestRate), 0) / userDebts.length 
        : 0;
      
      const debtToIncomeRatio = null; // Would need user income data
      const creditUtilization = userDebts
        .filter(debt => debt.debtType === 'credit_card')
        .reduce((sum, debt) => sum + (debt.utilizationRatio || 0), 0) / 
        Math.max(1, userDebts.filter(debt => debt.debtType === 'credit_card').length);

      return {
        totalDebtCents: totalDebt,
        totalMinimumPaymentCents: totalMinimumPayment,
        averageInterestRate,
        debtCount: userDebts.length,
        creditUtilization: isNaN(creditUtilization) ? 0 : creditUtilization,
        debts: userDebts
      };
    } catch (error) {
      console.error('Error getting debt summary:', error);
      return {
        totalDebtCents: 0,
        totalMinimumPaymentCents: 0,
        averageInterestRate: 0,
        debtCount: 0,
        creditUtilization: 0,
        debts: []
      };
    }
  }
}

export const debtService = new DebtService();