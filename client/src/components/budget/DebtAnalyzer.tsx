import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  CreditCard,
  TrendingDown,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Calculator,
  AlertTriangle
} from 'lucide-react';

interface DebtSummary {
  totalDebtCents: number;
  totalMinimumPaymentCents: number;
  averageInterestRate: number;
  debtCount: number;
  creditUtilization: number;
  debts: Array<{
    id: string;
    debtName: string;
    debtType: string;
    currentBalanceCents: number;
    minimumPaymentCents: number;
    interestRate: number;
    monthsToPayoff: number;
    totalInterestIfMinimum: number;
    nextPaymentDate: string;
    utilizationRatio?: number;
  }>;
}

interface PayoffScenarios {
  snowball: {
    months: number;
    totalPaymentsCents: number;
    totalInterestCents: number;
    payoffDate: string;
  };
  avalanche: {
    months: number;
    totalPaymentsCents: number;
    totalInterestCents: number;
    payoffDate: string;
  };
  recommendation: 'snowball' | 'avalanche';
  savings: number;
}

export default function DebtAnalyzer() {
  const [extraPayment, setExtraPayment] = useState('0');

  // Fetch debt summary
  const { data: debtSummary, isLoading: debtLoading } = useQuery({
    queryKey: ['debt-summary'],
    queryFn: () => apiRequest('/api/budget/debts') as Promise<DebtSummary>,
  });

  // Fetch payoff scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['debt-scenarios', extraPayment],
    queryFn: () => apiRequest(`/api/budget/debt-scenarios?extraPayment=${extraPayment}`) as Promise<PayoffScenarios>,
    enabled: !!debtSummary && debtSummary.debtCount > 0,
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(cents / 100);
  };

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0) {
      return `${years} ${years === 1 ? 'rok' : 'lata'} ${remainingMonths} ${remainingMonths === 1 ? 'miesiąc' : 'miesięcy'}`;
    }
    return `${remainingMonths} ${remainingMonths === 1 ? 'miesiąc' : 'miesięcy'}`;
  };

  const getDebtTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return '💳';
      case 'personal_loan': return '🏦';
      case 'mortgage': return '🏠';
      case 'auto_loan': return '🚗';
      case 'student_loan': return '🎓';
      default: return '💰';
    }
  };

  const getDebtTypeName = (type: string) => {
    switch (type) {
      case 'credit_card': return 'Karta kredytowa';
      case 'personal_loan': return 'Pożyczka osobista';
      case 'mortgage': return 'Kredyt hipoteczny';
      case 'auto_loan': return 'Kredyt samochodowy';
      case 'student_loan': return 'Kredyt studencki';
      default: return 'Inne';
    }
  };

  if (debtLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <div className="text-lg font-medium mb-2">Analizuję zadłużenie...</div>
          <div className="text-gray-600 dark:text-gray-400">
            Obliczam strategie spłaty długów
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!debtSummary || debtSummary.debtCount === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Świetnie! Nie masz długów
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Twój portfel jest wolny od zadłużenia. To idealny moment na budowanie oszczędności i inwestowanie.
          </p>
          <Button className="mt-4">
            <Target className="w-4 h-4 mr-2" />
            Ustaw cele finansowe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debt Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Całkowite zadłużenie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(debtSummary.totalDebtCents)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Minimalne płatności</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(debtSummary.totalMinimumPaymentCents)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">miesięcznie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Średnie oprocentowanie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {debtSummary.averageInterestRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wykorzystanie kredytu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {debtSummary.creditUtilization.toFixed(1)}%
            </div>
            <Progress value={debtSummary.creditUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Debt List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista długów</CardTitle>
          <CardDescription>
            Szczegółowe informacje o Twoim zadłużeniu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debtSummary.debts.map((debt) => (
              <div key={debt.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getDebtTypeIcon(debt.debtType)}</div>
                    <div>
                      <div className="font-medium">{debt.debtName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getDebtTypeName(debt.debtType)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={debt.interestRate > 15 ? 'destructive' : debt.interestRate > 8 ? 'secondary' : 'default'}>
                    {debt.interestRate}% APR
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Saldo</div>
                    <div className="font-semibold">{formatCurrency(debt.currentBalanceCents)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Min. płatność</div>
                    <div className="font-semibold">{formatCurrency(debt.minimumPaymentCents)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Spłata w</div>
                    <div className="font-semibold">
                      {debt.monthsToPayoff === Infinity ? 'Nigdy' : formatMonths(debt.monthsToPayoff)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Następna płatność</div>
                    <div className="font-semibold">{new Date(debt.nextPaymentDate).toLocaleDateString('pl-PL')}</div>
                  </div>
                </div>

                {debt.totalInterestIfMinimum !== Infinity && (
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Całkowite odsetki przy min. płatnościach: {formatCurrency(debt.totalInterestIfMinimum)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payoff Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Strategie spłaty długów</CardTitle>
          <CardDescription>
            Porównaj różne metody spłaty i zobacz które przyniosą największe oszczędności
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Extra Payment Input */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Label htmlFor="extra-payment">Dodatkowa płatność miesięcznie (PLN)</Label>
              <Input
                id="extra-payment"
                type="number"
                step="10"
                min="0"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="0"
                className="mt-2"
              />
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Ile dodatkowych złotych możesz przeznaczyć na spłatę długów?
              </p>
            </div>

            {/* Scenarios Comparison */}
            {scenarios && !scenariosLoading && (
              <Tabs defaultValue={scenarios.recommendation} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="avalanche" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Lawina (Najwyższe odsetki)
                    {scenarios.recommendation === 'avalanche' && <Badge variant="secondary">Polecane</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="snowball" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Kula śniegowa (Najmniejsze salda)
                    {scenarios.recommendation === 'snowball' && <Badge variant="secondary">Polecane</Badge>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="avalanche" className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold">Metoda Lawiny</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Spłacaj najpierw długi z najwyższym oprocentowaniem. To matematycznie optymalna strategia.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Czas spłaty</div>
                        <div className="font-semibold">{formatMonths(scenarios.avalanche.months)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Całkowite płatności</div>
                        <div className="font-semibold">{formatCurrency(scenarios.avalanche.totalPaymentsCents)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Odsetki</div>
                        <div className="font-semibold text-orange-600">{formatCurrency(scenarios.avalanche.totalInterestCents)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Data zakończenia</div>
                        <div className="font-semibold">{new Date(scenarios.avalanche.payoffDate).toLocaleDateString('pl-PL')}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="snowball" className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Metoda Kuli Śniegowej</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Spłacaj najpierw najmniejsze długi. Zapewnia motywację poprzez szybkie eliminowanie długów.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Czas spłaty</div>
                        <div className="font-semibold">{formatMonths(scenarios.snowball.months)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Całkowite płatności</div>
                        <div className="font-semibold">{formatCurrency(scenarios.snowball.totalPaymentsCents)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Odsetki</div>
                        <div className="font-semibold text-orange-600">{formatCurrency(scenarios.snowball.totalInterestCents)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Data zakończenia</div>
                        <div className="font-semibold">{new Date(scenarios.snowball.payoffDate).toLocaleDateString('pl-PL')}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Savings Display */}
            {scenarios && scenarios.savings > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Potencjalne oszczędności
                  </span>
                </div>
                <div className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(scenarios.savings)}
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Wybierając metodę {scenarios.recommendation === 'avalanche' ? 'lawiny' : 'kuli śniegowej'} 
                  zaoszczędzisz na odsetkach
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}