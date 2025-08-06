import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, CreditCard, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardData {
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
  creditScore: number;
  investments: number;
  emergencyFund: number;
  netWorth: number;
  savingsRate: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

export function FinancialDashboardWidgets({ userId }: { userId: string }) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSavings: 45250,
    monthlyIncome: 8500,
    monthlyExpenses: 6200,
    savingsGoal: 100000,
    creditScore: 742,
    investments: 28750,
    emergencyFund: 18500,
    netWorth: 156780,
    savingsRate: 27.1
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading financial data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const savingsProgress = (dashboardData.totalSavings / dashboardData.savingsGoal) * 100;
  const emergencyFundMonths = dashboardData.emergencyFund / dashboardData.monthlyExpenses;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Net Worth Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Net Worth
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter 
                value={dashboardData.netWorth} 
                prefix="$" 
                duration={2000}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5% this year</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Savings Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Total Savings
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              <AnimatedCounter 
                value={dashboardData.totalSavings} 
                prefix="$" 
                duration={2500}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Goal Progress</span>
                <span>{savingsProgress.toFixed(1)}%</span>
              </div>
              <Progress value={savingsProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Income Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Income
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              <AnimatedCounter 
                value={dashboardData.monthlyIncome} 
                prefix="$" 
                duration={1800}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+5.2% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Investments Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Investments
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              <AnimatedCounter 
                value={dashboardData.investments} 
                prefix="$" 
                duration={2200}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-red-600 dark:text-red-400">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-2.1% this month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Fund Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 border-teal-200 dark:border-teal-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Emergency Fund
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-teal-900 dark:text-teal-100">
              <AnimatedCounter 
                value={dashboardData.emergencyFund} 
                prefix="$" 
                duration={1900}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-teal-600 dark:text-teal-400">
              {emergencyFundMonths.toFixed(1)} months of expenses covered
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Credit Score Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Score
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              <AnimatedCounter 
                value={dashboardData.creditScore} 
                duration={3000}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Excellent</span>
                <span>740-850</span>
              </div>
              <Progress value={(dashboardData.creditScore / 850) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Savings Rate Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-800 border-rose-200 dark:border-rose-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Savings Rate
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              <AnimatedCounter 
                value={dashboardData.savingsRate} 
                suffix="%" 
                decimals={1}
                duration={2800}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-rose-600 dark:text-rose-400">
              Above recommended 20%
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Expenses Widget */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Monthly Expenses
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              <AnimatedCounter 
                value={dashboardData.monthlyExpenses} 
                prefix="$" 
                duration={2100}
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-3.2% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}