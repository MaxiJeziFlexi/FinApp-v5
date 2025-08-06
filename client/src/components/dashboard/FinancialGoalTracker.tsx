import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Plus, Target, Calendar, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'savings' | 'investment' | 'debt' | 'emergency' | 'vacation' | 'home' | 'education';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  monthlyContribution?: number;
}

const categoryColors = {
  savings: 'from-green-500 to-green-600',
  investment: 'from-blue-500 to-blue-600',
  debt: 'from-red-500 to-red-600',
  emergency: 'from-orange-500 to-orange-600',
  vacation: 'from-purple-500 to-purple-600',
  home: 'from-indigo-500 to-indigo-600',
  education: 'from-teal-500 to-teal-600'
};

const categoryIcons = {
  savings: DollarSign,
  investment: TrendingUp,
  debt: Target,
  emergency: Target,
  vacation: Target,
  home: Target,
  education: Target
};

export function FinancialGoalTracker({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: '1',
      title: 'Emergency Fund',
      description: 'Build a 6-month emergency fund for financial security',
      targetAmount: 25000,
      currentAmount: 18500,
      deadline: new Date('2025-12-31'),
      category: 'emergency',
      priority: 'high',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      monthlyContribution: 1500
    },
    {
      id: '2',
      title: 'Dream Vacation',
      description: 'Save for a 2-week European vacation',
      targetAmount: 8000,
      currentAmount: 3200,
      deadline: new Date('2025-08-01'),
      category: 'vacation',
      priority: 'medium',
      status: 'active',
      createdAt: new Date('2025-01-15'),
      monthlyContribution: 800
    },
    {
      id: '3',
      title: 'House Down Payment',
      description: 'Save 20% down payment for first home',
      targetAmount: 80000,
      currentAmount: 45000,
      deadline: new Date('2026-06-01'),
      category: 'home',
      priority: 'high',
      status: 'active',
      createdAt: new Date('2024-06-01'),
      monthlyContribution: 2000
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: 'savings' as FinancialGoal['category'],
    priority: 'medium' as FinancialGoal['priority']
  });

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysLeft = (deadline: Date) => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateMonthlyNeeded = (goal: FinancialGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysLeft = calculateDaysLeft(goal.deadline);
    const monthsLeft = Math.max(daysLeft / 30, 1);
    return remaining / monthsLeft;
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) return;

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: new Date(newGoal.deadline),
      category: newGoal.category,
      priority: newGoal.priority,
      status: 'active',
      createdAt: new Date()
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetAmount: '',
      deadline: '',
      category: 'savings',
      priority: 'medium'
    });
    setShowAddGoal(false);
  };

  const updateGoalAmount = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            currentAmount: Math.min(goal.targetAmount, Math.max(0, amount)),
            status: amount >= goal.targetAmount ? 'completed' : 'active'
          }
        : goal
    ));
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300">Total Progress</CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={overallProgress} suffix="%" decimals={1} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300">Active Goals</CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              {activeGoals.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600 dark:text-green-400">
              {completedGoals.length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300">Total Saved</CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              <AnimatedCounter value={totalCurrentAmount} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              of ${totalTargetAmount.toLocaleString()} target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Financial Goals</h2>
        <Button onClick={() => setShowAddGoal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({...prev, title: e.target.value}))}
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal(prev => ({...prev, targetAmount: e.target.value}))}
                      placeholder="25000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Target Date</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal(prev => ({...prev, deadline: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal(prev => ({...prev, category: e.target.value as any}))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="savings">Savings</option>
                      <option value="investment">Investment</option>
                      <option value="emergency">Emergency Fund</option>
                      <option value="vacation">Vacation</option>
                      <option value="home">Home Purchase</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({...prev, description: e.target.value}))}
                    placeholder="Brief description of your goal"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addGoal}>Create Goal</Button>
                  <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const daysLeft = calculateDaysLeft(goal.deadline);
          const monthlyNeeded = calculateMonthlyNeeded(goal);
          const IconComponent = categoryIcons[goal.category];
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[goal.category]} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {goal.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'outline'}>
                      {goal.status === 'completed' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Active</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress: {progress.toFixed(1)}%</span>
                        <span>
                          <AnimatedCounter value={goal.currentAmount} prefix="$" /> / 
                          ${goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Days Left</p>
                        <p className="font-semibold">
                          {daysLeft > 0 ? `${daysLeft} days` : 'Past due'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Monthly Needed</p>
                        <p className="font-semibold">${monthlyNeeded.toFixed(0)}</p>
                      </div>
                    </div>

                    {goal.status === 'active' && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Add amount"
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const amount = goal.currentAmount + parseFloat(input.value || '0');
                              updateGoalAmount(goal.id, amount);
                              input.value = '';
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            const amount = goal.currentAmount + parseFloat(input.value || '0');
                            updateGoalAmount(goal.id, amount);
                            input.value = '';
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}