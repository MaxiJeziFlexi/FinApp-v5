import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  CreditCard, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  AlertTriangle,
  DollarSign,
  Calendar,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Gamepad2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  date: Date;
  merchant: string;
  amount: number;
  category: string;
  subcategory: string;
  account: string;
}

interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  change: number;
  transactions: number;
  avgTransaction: number;
}

interface BankingData {
  totalSpending: number;
  monthlyChange: number;
  topCategories: SpendingPattern[];
  unusualTransactions: Transaction[];
  budgetAlerts: Array<{
    category: string;
    spent: number;
    budget: number;
    status: 'warning' | 'danger' | 'ok';
  }>;
}

const categoryIcons = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Shopping': ShoppingCart,
  'Housing': Home,
  'Entertainment': Gamepad2,
  'Other': DollarSign
};

const categoryColors = {
  'Food & Dining': 'from-orange-500 to-orange-600',
  'Transportation': 'from-blue-500 to-blue-600',
  'Shopping': 'from-purple-500 to-purple-600',
  'Housing': 'from-green-500 to-green-600',
  'Entertainment': 'from-pink-500 to-pink-600',
  'Other': 'from-gray-500 to-gray-600'
};

export function BankingInsights({ userId }: { userId: string }) {
  const [bankingData, setBankingData] = useState<BankingData>({
    totalSpending: 3247.89,
    monthlyChange: -8.3,
    topCategories: [
      {
        category: 'Food & Dining',
        amount: 847.32,
        percentage: 26.1,
        change: 12.5,
        transactions: 23,
        avgTransaction: 36.84
      },
      {
        category: 'Transportation',
        amount: 623.45,
        percentage: 19.2,
        change: -4.2,
        transactions: 8,
        avgTransaction: 77.93
      },
      {
        category: 'Shopping',
        amount: 589.67,
        percentage: 18.2,
        change: 28.7,
        transactions: 12,
        avgTransaction: 49.14
      },
      {
        category: 'Housing',
        amount: 1200.00,
        percentage: 36.9,
        change: 0,
        transactions: 1,
        avgTransaction: 1200.00
      }
    ],
    unusualTransactions: [
      {
        id: '1',
        date: new Date('2025-08-06T14:30:00'),
        merchant: 'PREMIUM ELECTRONICS',
        amount: 1299.99,
        category: 'Shopping',
        subcategory: 'Electronics',
        account: 'Chase Freedom'
      },
      {
        id: '2',
        date: new Date('2025-08-05T09:15:00'),
        merchant: 'LUXURY RESTAURANT',
        amount: 287.45,
        category: 'Food & Dining',
        subcategory: 'Fine Dining',
        account: 'Chase Sapphire'
      }
    ],
    budgetAlerts: [
      {
        category: 'Food & Dining',
        spent: 847.32,
        budget: 800.00,
        status: 'warning'
      },
      {
        category: 'Shopping',
        spent: 589.67,
        budget: 500.00,
        status: 'danger'
      }
    ]
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getBudgetAlertColor = (status: string) => {
    switch (status) {
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Monthly Spending
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={bankingData.totalSpending} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center text-sm ${
              bankingData.monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {bankingData.monthlyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>
                {bankingData.monthlyChange > 0 ? '+' : ''}
                {bankingData.monthlyChange.toFixed(1)}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Top Category
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              {bankingData.topCategories[0]?.category || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 dark:text-green-400">
              ${bankingData.topCategories[0]?.amount.toFixed(2)} 
              ({bankingData.topCategories[0]?.percentage.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Budget Alerts
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {bankingData.budgetAlerts.filter(alert => alert.status !== 'ok').length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Categories over budget
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Avg Transaction
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              ${(bankingData.totalSpending / bankingData.topCategories.reduce((sum, cat) => sum + cat.transactions, 0)).toFixed(0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Across all categories
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
          <CardDescription>Your spending patterns by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {bankingData.topCategories.map((category, index) => {
              const IconComponent = categoryIcons[category.category as keyof typeof categoryIcons] || DollarSign;
              
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[category.category as keyof typeof categoryColors] || categoryColors.Other} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {category.category}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.transactions} transactions • Avg ${category.avgTransaction.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${category.amount.toFixed(2)}
                      </p>
                      <div className={`text-sm flex items-center justify-end gap-1 ${
                        category.change >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {category.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      {bankingData.budgetAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Budget Alerts
            </CardTitle>
            <CardDescription>Categories that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankingData.budgetAlerts.map((alert, index) => (
                <motion.div
                  key={alert.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getBudgetAlertColor(alert.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{alert.category}</h4>
                      <p className="text-sm opacity-75">
                        Spent ${alert.spent.toFixed(2)} of ${alert.budget.toFixed(2)} budget
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getBudgetAlertColor(alert.status)}>
                        {((alert.spent / alert.budget) * 100).toFixed(0)}%
                      </Badge>
                      <p className="text-sm mt-1">
                        ${(alert.budget - alert.spent).toFixed(2)} remaining
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(alert.spent / alert.budget) * 100} 
                    className="h-2 mt-3" 
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unusual Transactions */}
      {bankingData.unusualTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unusual Transactions</CardTitle>
            <CardDescription>Transactions that are significantly larger than your usual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankingData.unusualTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {transaction.merchant}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(transaction.date)} • {transaction.account}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {transaction.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Review
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}