import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, X, Target, Calendar, PieChart } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budgetable: boolean;
}

interface BudgetData {
  name: string;
  budgetType: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  categoryLimits: Record<string, number>;
  totalBudgetCents: number;
}

export default function BudgetCreator({ onSuccess }: { onSuccess?: () => void }) {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    name: '',
    budgetType: 'monthly',
    startDate: '',
    endDate: '',
    categoryLimits: {},
    totalBudgetCents: 0
  });

  const [categoryLimits, setCategoryLimits] = useState<Array<{ categoryId: string; limitPLN: string }>>([]);
  const queryClient = useQueryClient();

  // Fetch available categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['transaction-categories'],
    queryFn: () => apiRequest('/api/budget/categories'),
  });

  // Set default dates when budget type changes
  useEffect(() => {
    const now = new Date();
    let startDate, endDate;

    switch (budgetData.budgetType) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default: // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setBudgetData(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  }, [budgetData.budgetType]);

  // Calculate total budget when category limits change
  useEffect(() => {
    const total = categoryLimits.reduce((sum, item) => {
      return sum + (parseFloat(item.limitPLN) || 0) * 100; // Convert to cents
    }, 0);

    setBudgetData(prev => ({
      ...prev,
      totalBudgetCents: total,
      categoryLimits: Object.fromEntries(
        categoryLimits.map(item => [item.categoryId, (parseFloat(item.limitPLN) || 0) * 100])
      )
    }));
  }, [categoryLimits]);

  const createBudgetMutation = useMutation({
    mutationFn: (data: BudgetData) => apiRequest('/api/budget/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-performance'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow-prediction'] });
      onSuccess?.();
    }
  });

  const addCategoryLimit = () => {
    if (categories.length === 0) return;
    
    const availableCategories = categories.filter(cat => 
      cat.budgetable && !categoryLimits.some(item => item.categoryId === cat.id)
    );
    
    if (availableCategories.length > 0) {
      setCategoryLimits(prev => [...prev, {
        categoryId: availableCategories[0].id,
        limitPLN: '0'
      }]);
    }
  };

  const removeCategoryLimit = (index: number) => {
    setCategoryLimits(prev => prev.filter((_, i) => i !== index));
  };

  const updateCategoryLimit = (index: number, field: string, value: string) => {
    setCategoryLimits(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetData.name.trim() || categoryLimits.length === 0) {
      alert('Proszę wypełnić nazwę budżetu i dodać przynajmniej jedną kategorię');
      return;
    }
    createBudgetMutation.mutate(budgetData);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(cents / 100);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Tworzenie budżetu
        </CardTitle>
        <CardDescription>
          Ustaw limity wydatków dla różnych kategorii i śledź swoje finanse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="budget-name">Nazwa budżetu</Label>
            <Input
              id="budget-name"
              value={budgetData.name}
              onChange={(e) => setBudgetData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="np. Budżet sierpień 2025"
              required
            />
          </div>

          {/* Budget Type */}
          <div className="space-y-2">
            <Label>Typ budżetu</Label>
            <Select 
              value={budgetData.budgetType}
              onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
                setBudgetData(prev => ({ ...prev, budgetType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Tygodniowy</SelectItem>
                <SelectItem value="monthly">Miesięczny</SelectItem>
                <SelectItem value="yearly">Roczny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data początkowa</Label>
              <Input
                id="start-date"
                type="date"
                value={budgetData.startDate}
                onChange={(e) => setBudgetData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data końcowa</Label>
              <Input
                id="end-date"
                type="date"
                value={budgetData.endDate}
                onChange={(e) => setBudgetData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Category Limits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Limity kategorii</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addCategoryLimit}
                disabled={categoryLimits.length >= categories.filter(c => c.budgetable).length}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj kategorię
              </Button>
            </div>

            <div className="space-y-3">
              {categoryLimits.map((item, index) => {
                const categoryInfo = getCategoryInfo(item.categoryId);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      {categoryInfo && (
                        <Badge 
                          style={{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }}
                          className="text-xs"
                        >
                          {categoryInfo.icon} {categoryInfo.name}
                        </Badge>
                      )}
                    </div>
                    
                    <Select 
                      value={item.categoryId}
                      onValueChange={(value) => updateCategoryLimit(index, 'categoryId', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat.budgetable).map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.limitPLN}
                        onChange={(e) => updateCategoryLimit(index, 'limitPLN', e.target.value)}
                        placeholder="0.00"
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">zł</span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategoryLimit(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {categoryLimits.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Dodaj kategorie, aby utworzyć budżet</p>
              </div>
            )}
          </div>

          {/* Total Budget Display */}
          {budgetData.totalBudgetCents > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Całkowity budżet
                  </span>
                </div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(budgetData.totalBudgetCents)}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={createBudgetMutation.isPending || !budgetData.name.trim() || categoryLimits.length === 0}
          >
            {createBudgetMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Tworzenie budżetu...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Utwórz budżet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}