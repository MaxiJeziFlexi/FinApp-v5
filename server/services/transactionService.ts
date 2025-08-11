import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { transactions, transactionCategories, userAccounts } from '../../shared/schema';
import { eq, and, gte, lte, sql, desc, count, sum } from 'drizzle-orm';
import crypto from 'crypto';

const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

export class TransactionService {
  // Import transactions from CSV data (idempotent)
  async importTransactions(userId: string, transactionData: Array<{
    date: string;
    amount: number;
    description: string;
    accountName?: string;
    category?: string;
  }>) {
    try {
      const importedTransactions = [];
      const errors = [];

      for (const txn of transactionData) {
        try {
          // Create import hash for idempotency
          const hashData = `${txn.date}|${Math.round(txn.amount * 100)}|${txn.description}|${userId}`;
          const importHash = crypto.createHash('sha256').update(hashData).digest('hex');

          // Check if transaction already exists
          const existing = await db
            .select()
            .from(transactions)
            .where(eq(transactions.importHash, importHash))
            .limit(1);

          if (existing.length > 0) {
            continue; // Skip duplicate
          }

          // Get or create account
          let accountId = await this.getOrCreateAccount(userId, txn.accountName || 'Primary Account');

          // Categorize transaction
          const categoryId = await this.categorizeTransaction(userId, txn.description, txn.category);

          // Convert amount to cents
          const amountCents = Math.round(txn.amount * 100);

          // Create transaction
          const [newTransaction] = await db
            .insert(transactions)
            .values({
              id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId,
              accountId,
              amountCents,
              currency: 'PLN',
              transactionDate: txn.date,
              description: txn.description,
              categoryId,
              importHash,
              importSource: 'csv',
              transactionType: amountCents >= 0 ? 'credit' : 'debit',
              status: 'completed',
            })
            .returning();

          importedTransactions.push(newTransaction);
        } catch (error) {
          errors.push({
            transaction: txn,
            error: error.message
          });
        }
      }

      return {
        imported: importedTransactions.length,
        errors,
        success: true
      };
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw error;
    }
  }

  // Get or create user account
  private async getOrCreateAccount(userId: string, accountName: string): Promise<string> {
    try {
      // Try to find existing account
      const existing = await db
        .select()
        .from(userAccounts)
        .where(
          and(
            eq(userAccounts.userId, userId),
            eq(userAccounts.accountName, accountName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0].id;
      }

      // Create new account
      const [newAccount] = await db
        .insert(userAccounts)
        .values({
          id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          accountName,
          accountType: 'checking',
          currentBalance: 0,
          currency: 'PLN',
          isActive: true,
        })
        .returning();

      return newAccount.id;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  // Categorize transaction using AI/rules
  async categorizeTransaction(userId: string, description: string, suggestedCategory?: string): Promise<string | null> {
    try {
      // If category suggested, try to find it
      if (suggestedCategory) {
        const category = await db
          .select()
          .from(transactionCategories)
          .where(
            and(
              sql`(${transactionCategories.userId} = ${userId} OR ${transactionCategories.userId} IS NULL)`,
              sql`LOWER(${transactionCategories.name}) = ${suggestedCategory.toLowerCase()}`
            )
          )
          .limit(1);

        if (category.length > 0) {
          return category[0].id;
        }
      }

      // Simple rule-based categorization
      const rules = [
        { pattern: /sklep|market|biedronka|żabka|lidl|kaufland/i, category: 'Groceries' },
        { pattern: /paliwo|orlen|bp|shell|tank/i, category: 'Fuel' },
        { pattern: /restauracja|pizza|mcdonald|kfc|uber eats|glovo/i, category: 'Dining Out' },
        { pattern: /lekarz|apteka|hospital|clinic/i, category: 'Healthcare' },
        { pattern: /prąd|gaz|woda|internet|telefon|play|orange|t-mobile/i, category: 'Utilities' },
        { pattern: /transport|uber|bolt|taxi|mpk|zkm/i, category: 'Transportation' },
        { pattern: /netflix|spotify|amazon|apple|google/i, category: 'Subscriptions' },
        { pattern: /pensja|wynagrodzenie|salary|income/i, category: 'Salary', isIncome: true },
        { pattern: /wypłata atm|bankomat/i, category: 'ATM Withdrawal' },
        { pattern: /przelew|transfer/i, category: 'Transfer' },
      ];

      for (const rule of rules) {
        if (rule.pattern.test(description)) {
          const category = await this.getOrCreateCategory(userId, rule.category, rule.isIncome);
          return category.id;
        }
      }

      // Default to "Other" category
      const defaultCategory = await this.getOrCreateCategory(userId, 'Other');
      return defaultCategory.id;
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return null;
    }
  }

  // Get or create transaction category
  private async getOrCreateCategory(userId: string, categoryName: string, isIncome: boolean = false) {
    try {
      // Check if category exists
      const existing = await db
        .select()
        .from(transactionCategories)
        .where(
          and(
            sql`(${transactionCategories.userId} = ${userId} OR ${transactionCategories.userId} IS NULL)`,
            eq(transactionCategories.name, categoryName)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Create new category
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
      const icons = ['💳', '🛒', '⛽', '🍕', '🏥', '🏠', '🚗', '📱', '💰', '📊'];
      
      const [newCategory] = await db
        .insert(transactionCategories)
        .values({
          id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId, // User-specific category
          name: categoryName,
          color: colors[Math.floor(Math.random() * colors.length)],
          icon: icons[Math.floor(Math.random() * icons.length)],
          isIncome,
          budgetable: !isIncome,
          isDefault: false,
        })
        .returning();

      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Get transaction summary for period
  async getTransactionSummary(userId: string, startDate: string, endDate: string) {
    try {
      const summary = await db
        .select({
          categoryId: transactions.categoryId,
          categoryName: transactionCategories.name,
          categoryIcon: transactionCategories.icon,
          categoryColor: transactionCategories.color,
          totalAmount: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`,
          transactionCount: count(transactions.id),
          isIncome: transactionCategories.isIncome,
        })
        .from(transactions)
        .leftJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate)
          )
        )
        .groupBy(
          transactions.categoryId,
          transactionCategories.name,
          transactionCategories.icon,
          transactionCategories.color,
          transactionCategories.isIncome
        )
        .orderBy(sql`ABS(SUM(${transactions.amountCents})) DESC`);

      const totalIncome = summary
        .filter(s => s.isIncome)
        .reduce((sum, s) => sum + s.totalAmount, 0);

      const totalExpenses = Math.abs(summary
        .filter(s => !s.isIncome)
        .reduce((sum, s) => sum + Math.abs(s.totalAmount), 0));

      const netAmount = totalIncome - totalExpenses;

      return {
        summary,
        totals: {
          totalIncomeCents: totalIncome,
          totalExpensesCents: totalExpenses,
          netAmountCents: netAmount,
          transactionCount: summary.reduce((sum, s) => sum + s.transactionCount, 0)
        }
      };
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return null;
    }
  }

  // Get recent transactions
  async getRecentTransactions(userId: string, limit: number = 10) {
    try {
      const recentTxns = await db
        .select({
          id: transactions.id,
          amountCents: transactions.amountCents,
          currency: transactions.currency,
          transactionDate: transactions.transactionDate,
          description: transactions.description,
          merchantName: transactions.merchantName,
          categoryName: transactionCategories.name,
          categoryIcon: transactionCategories.icon,
          categoryColor: transactionCategories.color,
          accountName: userAccounts.accountName,
        })
        .from(transactions)
        .leftJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
        .leftJoin(userAccounts, eq(transactions.accountId, userAccounts.id))
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
        .limit(limit);

      return recentTxns;
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  // Update account balances based on transactions
  async updateAccountBalances(userId: string) {
    try {
      const accounts = await db
        .select()
        .from(userAccounts)
        .where(and(
          eq(userAccounts.userId, userId),
          eq(userAccounts.isActive, true)
        ));

      for (const account of accounts) {
        const balance = await db
          .select({
            totalBalance: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`
          })
          .from(transactions)
          .where(eq(transactions.accountId, account.id));

        await db
          .update(userAccounts)
          .set({ 
            currentBalance: balance[0]?.totalBalance || 0,
            lastSynced: new Date().toISOString()
          })
          .where(eq(userAccounts.id, account.id));
      }

      return true;
    } catch (error) {
      console.error('Error updating account balances:', error);
      return false;
    }
  }

  // Detect transaction anomalies
  async detectAnomalies(userId: string, transactionId: string) {
    try {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (!transaction) return null;

      // Get historical spending in same category
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const historicalData = await db
        .select({
          avgAmount: sql<number>`AVG(ABS(${transactions.amountCents}))`,
          maxAmount: sql<number>`MAX(ABS(${transactions.amountCents}))`,
          transactionCount: count(transactions.id)
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.categoryId, transaction.categoryId),
            gte(transactions.transactionDate, thirtyDaysAgo),
            sql`${transactions.id} != ${transactionId}`
          )
        );

      const historical = historicalData[0];
      if (!historical || historical.transactionCount < 3) {
        return null; // Not enough data
      }

      const currentAmount = Math.abs(transaction.amountCents);
      const avgAmount = historical.avgAmount;
      const anomalyScore = avgAmount > 0 ? (currentAmount / avgAmount) : 1;

      let anomalyType = null;
      if (anomalyScore >= 3) {
        anomalyType = 'unusually_high';
      } else if (anomalyScore <= 0.3) {
        anomalyType = 'unusually_low';
      }

      if (anomalyType) {
        // Update transaction with anomaly score
        await db
          .update(transactions)
          .set({ anomalyScore: Number(anomalyScore.toFixed(2)) })
          .where(eq(transactions.id, transactionId));

        return {
          transactionId,
          anomalyType,
          anomalyScore: Number(anomalyScore.toFixed(2)),
          currentAmount: currentAmount,
          averageAmount: Math.round(avgAmount),
          message: anomalyType === 'unusually_high' 
            ? `Ta transakcja jest ${anomalyScore.toFixed(1)}x większa niż zwykle w tej kategorii`
            : `Ta transakcja jest nietypowo mała dla tej kategorii`
        };
      }

      return null;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return null;
    }
  }
}

export const transactionService = new TransactionService();