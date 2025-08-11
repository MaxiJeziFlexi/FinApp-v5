import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';
import TransactionImport from '@/components/budget/TransactionImport';
import BudgetCreator from '@/components/budget/BudgetCreator';
import DebtAnalyzer from '@/components/budget/DebtAnalyzer';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Plus,
  Calendar,
  PieChart,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calculator,
  Upload,
  Settings
} from 'lucide-react';

interface BudgetPerformance {
  budget: {
    id: string;
    name: string;
    budgetType: string;
    startDate: string;
    endDate: string;
    totalBudgetCents: number;
  };
  performance: Array<{
    categoryId: string;
    limitCents: number;
    spentCents: number;
    remainingCents: number;
    percentage: number;
    status: 'good' | 'warning' | 'over';
  }>;
  totalBudgetCents: number;
  totalSpentCents: number;
}

interface CashflowPrediction {
  currentBalanceCents: number;
  predictedBalanceCents: number;
  projectedSpendingCents: number;
  upcomingRecurringCents: number;
  daysRemaining: number;
  confidenceLevel: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionSteps: Array<{
    step: string;
    completed: boolean;
    link?: string;
  }>;
  expectedImpact: string;
  deepLink?: string;
}

export default function BudgetDashboard() {
  const [showBudgetCreator, setShowBudgetCreator] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  // Fetch budget performance
  const { data: budgetData, isLoading: budgetLoading } = useQuery<BudgetPerformance>({
    queryKey: ['budget-performance'],
    queryFn: () => apiRequest('/api/budget/performance'),
  });

  // Fetch cashflow prediction
  const { data: cashflowData, isLoading: cashflowLoading } = useQuery<CashflowPrediction>({
    queryKey: ['cashflow-prediction'],
    queryFn: () => apiRequest('/api/budget/cashflow-prediction'),
  });

  // Fetch AI recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery<AIRecommendation[]>({
    queryKey: ['ai-recommendations'],
    queryFn: () => apiRequest('/api/budget/recommendations'),
  });

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(cents / 100);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'over': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (budgetLoading || cashflowLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
            <div className="text-xl font-semibold mb-2">Ładowanie budżetu...</div>
            <div className="text-gray-600 dark:text-gray-400">
              Przygotowujemy Twoje dane finansowe
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Budżet & Cashflow
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automatyczne zarządzanie finansami i przewidywanie salda
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImporter(!showImporter)}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowBudgetCreator(!showBudgetCreator)}>
              <Plus className="w-4 h-4 mr-2" />
              Nowy budżet
            </Button>
          </div>
        </div>

        {/* Cashflow Prediction Alert */}
        {cashflowData && cashflowData.predictedBalanceCents < 0 && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Uwaga!</strong> Przewidywane saldo do końca miesiąca: {' '}
              <span className="font-bold">{formatCurrency(cashflowData.predictedBalanceCents)}</span>
              . Pozostało {cashflowData.daysRemaining} dni.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktualny balans</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cashflowData ? formatCurrency(cashflowData.currentBalanceCents) : '--'}
              </div>
            </CardContent>
          </Card>

          {/* Budget Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budżet wykorzystany</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {budgetData ? 
                  `${((budgetData.totalSpentCents / budgetData.totalBudgetCents) * 100).toFixed(1)}%` 
                  : '--'
                }
              </div>
              {budgetData && (
                <Progress 
                  value={(budgetData.totalSpentCents / budgetData.totalBudgetCents) * 100} 
                  className="mt-2" 
                />
              )}
            </CardContent>
          </Card>

          {/* Predicted End Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Przewidywane saldo</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                cashflowData && cashflowData.predictedBalanceCents < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {cashflowData ? formatCurrency(cashflowData.predictedBalanceCents) : '--'}
              </div>
              {cashflowData && (
                <p className="text-xs text-muted-foreground">
                  Pewność: {cashflowData.confidenceLevel}%
                </p>
              )}
            </CardContent>
          </Card>

          {/* Days Remaining */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dni do końca miesiąca</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cashflowData ? cashflowData.daysRemaining : '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Creator */}
        {showBudgetCreator && (
          <BudgetCreator onSuccess={() => setShowBudgetCreator(false)} />
        )}

        {/* CSV Importer */}
        {showImporter && <TransactionImport />}

        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="budget">Budżet</TabsTrigger>
            <TabsTrigger value="predictions">Przewidywania</TabsTrigger>
            <TabsTrigger value="recommendations">AI Porady</TabsTrigger>
            <TabsTrigger value="debts">Długi</TabsTrigger>
            <TabsTrigger value="goals">Cele</TabsTrigger>
          </TabsList>

          {/* Budget Performance */}
          <TabsContent value="budget">
            <div className="space-y-6">
              {budgetData && (
                <Card>
                  <CardHeader>
                    <CardTitle>{budgetData.budget.name}</CardTitle>
                    <CardDescription>
                      {budgetData.budget.startDate} - {budgetData.budget.endDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budgetData.performance.map((category) => (
                        <div key={category.categoryId} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Kategoria {category.categoryId}</span>
                            <Badge className={getStatusColor(category.status)}>
                              {formatCurrency(category.spentCents)} / {formatCurrency(category.limitCents)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{category.percentage.toFixed(1)}% wykorzystane</span>
                            <span>Pozostało: {formatCurrency(category.remainingCents)}</span>
                          </div>
                          <Progress 
                            value={category.percentage} 
                            className={`h-2 ${category.status === 'over' ? 'bg-red-200' : ''}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Cashflow Predictions */}
          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle>Analiza cashflow</CardTitle>
                <CardDescription>
                  Przewidywanie salda na podstawie historycznych danych i nadchodzących płatności
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cashflowData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowDownRight className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            Przewidywane wydatki
                          </span>
                        </div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {formatCurrency(cashflowData.projectedSpendingCents)}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900 dark:text-green-100">
                            Nadchodzące wpływy
                          </span>
                        </div>
                        <div className="text-xl font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(cashflowData.upcomingRecurringCents)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-purple-600 dark:text-purple-300 mb-2">
                          Przewidywane saldo końcowe
                        </div>
                        <div className={`text-3xl font-bold mb-2 ${
                          cashflowData.predictedBalanceCents < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {formatCurrency(cashflowData.predictedBalanceCents)}
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-300">
                          Pewność modelu: {cashflowData.confidenceLevel}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Recommendations */}
          <TabsContent value="recommendations">
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </div>
                      <Badge 
                        variant={rec.priority === 'urgent' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <strong>Oczekiwany efekt:</strong> {rec.expectedImpact}
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Kroki do wykonania:</div>
                        <ul className="space-y-1">
                          {rec.actionSteps.map((step, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <input 
                                type="checkbox" 
                                checked={step.completed}
                                className="rounded"
                                readOnly
                              />
                              <span className={step.completed ? 'line-through text-muted-foreground' : ''}>
                                {step.step}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {rec.deepLink && (
                        <Button size="sm" variant="outline">
                          Przejdź do akcji
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {recommendations.length === 0 && !recommendationsLoading && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Brak nowych rekomendacji
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Twoje finanse wyglądają dobrze! AI nie wykryło obszarów wymagających uwagi.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Debt Analysis */}
          <TabsContent value="debts">
            <DebtAnalyzer />
          </TabsContent>

          {/* Financial Goals */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Cele finansowe</CardTitle>
                <CardDescription>
                  Śledź postępy w realizacji swoich celów finansowych
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Cele w przygotowaniu
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Funkcjonalność celów finansowych zostanie wkrótce uruchomiona
                  </p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj pierwszy cel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}