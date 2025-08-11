import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { transactions, transactionCategories, userAccounts } from '../../shared/schema';
import { transactionService } from './transactionService';

const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

export class CSVImportService {
  // Parse CSV content to transaction objects
  parseCSV(csvContent: string): Array<{
    date: string;
    amount: number;
    description: string;
    accountName?: string;
    category?: string;
  }> {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const transactions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue;
      
      const transaction: any = {};
      
      // Map common column names
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/['"]/g, '');
        
        switch (header) {
          case 'date':
          case 'data':
          case 'datum':
            transaction.date = this.parseDate(value);
            break;
          case 'amount':
          case 'kwota':
          case 'suma':
          case 'value':
            transaction.amount = parseFloat(value.replace(',', '.')) || 0;
            break;
          case 'description':
          case 'opis':
          case 'tytuł':
          case 'nazwa':
          case 'merchant':
            transaction.description = value || 'Nieznana transakcja';
            break;
          case 'account':
          case 'konto':
          case 'rachunek':
            transaction.accountName = value;
            break;
          case 'category':
          case 'kategoria':
            transaction.category = value;
            break;
        }
      });
      
      // Validate required fields
      if (transaction.date && transaction.amount && transaction.description) {
        transactions.push(transaction);
      }
    }
    
    return transactions;
  }
  
  // Parse various date formats
  private parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    // Try various date formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) { // YYYY-MM-DD
          return dateStr;
        } else { // DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
          const [, day, month, year] = match;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    // Fallback to current date
    return new Date().toISOString().split('T')[0];
  }
  
  // Import transactions with validation
  async importTransactionsFromCSV(userId: string, csvContent: string) {
    try {
      const parsedTransactions = this.parseCSV(csvContent);
      
      if (parsedTransactions.length === 0) {
        return {
          success: false,
          message: 'Nie znaleziono prawidłowych transakcji w pliku CSV',
          imported: 0,
          errors: []
        };
      }
      
      // Use transaction service for actual import
      const result = await transactionService.importTransactions(userId, parsedTransactions);
      
      return {
        success: true,
        message: `Zaimportowano ${result.imported} transakcji`,
        imported: result.imported,
        errors: result.errors,
        duplicatesSkipped: parsedTransactions.length - result.imported - result.errors.length
      };
    } catch (error) {
      console.error('CSV import error:', error);
      throw new Error('Błąd podczas importu pliku CSV');
    }
  }
  
  // Generate sample CSV template
  generateTemplate(): string {
    const headers = ['date', 'amount', 'description', 'account', 'category'];
    const sampleData = [
      ['2025-08-11', '-50.00', 'Biedronka - zakupy spożywcze', 'Konto główne', 'Groceries'],
      ['2025-08-10', '-12.50', 'McDonald\'s', 'Konto główne', 'Dining Out'],
      ['2025-08-09', '3500.00', 'Wynagrodzenie', 'Konto główne', 'Salary'],
      ['2025-08-08', '-200.00', 'Prąd - sierpień', 'Konto główne', 'Utilities']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
}

export const csvImportService = new CSVImportService();