import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { storage } from '../storage';
import type { BankAccount, BankTransaction, BankConnection } from '@shared/schema';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: process.env.NODE_ENV === 'production' ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export class PlaidService {
  // Create link token for Plaid Link
  async createLinkToken(userId: string): Promise<{ link_token: string; expiration: string }> {
    try {
      const request = {
        user: {
          client_user_id: userId,
        },
        client_name: 'FinApp - AI Financial Education',
        products: [Products.Transactions, Products.Auth, Products.Identity],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL || '',
        redirect_uri: process.env.PLAID_REDIRECT_URI || '',
      };

      const response = await plaidClient.linkTokenCreate(request);
      return {
        link_token: response.data.link_token,
        expiration: response.data.expiration,
      };
    } catch (error) {
      console.error('Error creating link token:', error);
      throw new Error('Failed to create link token');
    }
  }

  // Exchange public token for access token and store account information
  async exchangePublicToken(userId: string, publicToken: string): Promise<{ accounts: BankAccount[]; itemId: string }> {
    try {
      // Exchange public token for access token
      const tokenResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = tokenResponse.data.access_token;
      const itemId = tokenResponse.data.item_id;

      // Get account information
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
      });

      // Get institution information
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id: accountsResponse.data.item.institution_id!,
        country_codes: [CountryCode.Us],
      });

      const institution = institutionResponse.data.institution;
      const accounts: BankAccount[] = [];

      // Store each account
      for (const account of accountsResponse.data.accounts) {
        const bankAccount = await storage.createBankAccount({
          id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          plaidAccessToken: accessToken,
          plaidAccountId: account.account_id,
          plaidItemId: itemId,
          institutionId: institution.institution_id,
          institutionName: institution.name,
          accountName: account.name,
          accountType: account.type,
          accountSubtype: account.subtype || '',
          mask: account.mask || '',
          availableBalance: account.balances.available?.toString() || '0',
          currentBalance: account.balances.current?.toString() || '0',
          isoCurrencyCode: account.balances.iso_currency_code || 'USD',
        });
        accounts.push(bankAccount);
      }

      // Create bank connection record
      await storage.createBankConnection({
        id: `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        plaidItemId: itemId,
        institutionId: institution.institution_id,
        institutionName: institution.name,
        status: 'connected',
      });

      return { accounts, itemId };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error('Failed to link bank account');
    }
  }

  // Fetch transactions for a user's accounts
  async syncTransactions(userId: string, accountId?: string): Promise<BankTransaction[]> {
    try {
      const accounts = accountId 
        ? [await storage.getBankAccount(accountId)]
        : await storage.getUserBankAccounts(userId);

      const transactions: BankTransaction[] = [];

      for (const account of accounts) {
        if (!account) continue;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Last 30 days

        const request = {
          access_token: account.plaidAccessToken,
          start_date: startDate.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        };

        const response = await plaidClient.transactionsGet(request);

        for (const transaction of response.data.transactions) {
          // Check if transaction already exists
          const existingTransaction = await storage.getBankTransactionByPlaidId(transaction.transaction_id);
          if (existingTransaction) continue;

          const bankTransaction = await storage.createBankTransaction({
            id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            accountId: account.id,
            plaidTransactionId: transaction.transaction_id,
            amount: transaction.amount.toString(),
            isoCurrencyCode: transaction.iso_currency_code || 'USD',
            date: transaction.date,
            name: transaction.name,
            merchantName: transaction.merchant_name || '',
            primaryCategory: transaction.category?.[0] || '',
            detailedCategory: transaction.category?.[1] || '',
            confidenceLevel: transaction.personal_finance_category?.confidence_level || '',
            locationData: transaction.location || {},
            paymentChannel: transaction.payment_channel || '',
            paymentMethod: transaction.payment_meta?.payment_method || '',
            accountOwner: transaction.account_owner || '',
            pending: transaction.pending,
            educationalTags: this.generateEducationalTags(transaction),
          });

          transactions.push(bankTransaction);
        }

        // Update last sync date
        await storage.updateBankAccount(account.id, {
          lastSyncDate: new Date(),
        });
      }

      return transactions;
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw new Error('Failed to sync transactions');
    }
  }

  // Generate educational tags for transactions
  private generateEducationalTags(transaction: any): string[] {
    const tags: string[] = [];
    const category = transaction.category?.[0]?.toLowerCase() || '';
    const amount = transaction.amount;

    // Category-based tags
    if (category.includes('food')) {
      tags.push('dining', 'budget_food');
      if (amount > 50) tags.push('expensive_meal');
    } else if (category.includes('gas') || category.includes('transportation')) {
      tags.push('transportation', 'commute_cost');
    } else if (category.includes('groceries') || category.includes('supermarket')) {
      tags.push('groceries', 'essential_spending');
    } else if (category.includes('entertainment')) {
      tags.push('entertainment', 'discretionary_spending');
    } else if (category.includes('subscription')) {
      tags.push('subscription', 'recurring_expense');
    }

    // Amount-based tags
    if (amount > 100) tags.push('large_expense');
    if (amount < 10) tags.push('small_purchase');

    // Payment method tags
    if (transaction.payment_channel === 'online') {
      tags.push('online_purchase');
    }

    return tags;
  }

  // Get account balances
  async getAccountBalances(userId: string): Promise<{ totalBalance: number; accounts: any[] }> {
    try {
      const accounts = await storage.getUserBankAccounts(userId);
      let totalBalance = 0;
      const accountBalances = [];

      for (const account of accounts) {
        const response = await plaidClient.accountsGet({
          access_token: account.plaidAccessToken,
        });

        const plaidAccount = response.data.accounts[0];
        const balance = plaidAccount.balances.current || 0;
        totalBalance += balance;

        accountBalances.push({
          ...account,
          currentBalance: balance,
          availableBalance: plaidAccount.balances.available || 0,
        });

        // Update stored balance
        await storage.updateBankAccount(account.id, {
          currentBalance: balance.toString(),
          availableBalance: (plaidAccount.balances.available || 0).toString(),
        });
      }

      return { totalBalance, accounts: accountBalances };
    } catch (error) {
      console.error('Error getting account balances:', error);
      throw new Error('Failed to get account balances');
    }
  }

  // Disconnect bank account
  async disconnectAccount(userId: string, accountId: string): Promise<void> {
    try {
      const account = await storage.getBankAccount(accountId);
      if (!account || account.userId !== userId) {
        throw new Error('Account not found or not authorized');
      }

      // Deactivate account in our database
      await storage.updateBankAccount(accountId, {
        isActive: false,
      });

      // Update connection status
      const connection = await storage.getBankConnectionByItemId(account.plaidItemId);
      if (connection) {
        await storage.updateBankConnection(connection.id, {
          status: 'disconnected',
        });
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      throw new Error('Failed to disconnect account');
    }
  }
}

export const plaidService = new PlaidService();