import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  Calculator, 
  TrendingDown, 
  Calendar, 
  FileText, 
  DollarSign, 
  PieChart,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TaxOptimization {
  id: string;
  strategy: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'complex';
  timeToImplement: string;
  deadline?: Date;
  implemented: boolean;
  category: 'deductions' | 'credits' | 'timing' | 'structure' | 'retirement';
  requirements: string[];
}

interface TaxSummary {
  estimatedTax: number;
  potentialSavings: number;
  currentDeductions: number;
  taxBracket: string;
  filingStatus: string;
  yearToDateWithholdings: number;
}

const categoryIcons = {
  deductions: FileText,
  credits: DollarSign,
  timing: Clock,
  structure: PieChart,
  retirement: Target
};

const categoryColors = {
  deductions: 'from-blue-500 to-blue-600',
  credits: 'from-green-500 to-green-600',
  timing: 'from-orange-500 to-orange-600',
  structure: 'from-purple-500 to-purple-600',
  retirement: 'from-indigo-500 to-indigo-600'
};

const difficultyColors = {
  easy: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-orange-600 bg-orange-50 border-orange-200',
  complex: 'text-red-600 bg-red-50 border-red-200'
};

export function TaxOptimizationTools({ userId }: { userId: string }) {
  const [taxSummary] = useState<TaxSummary>({
    estimatedTax: 28450,
    potentialSavings: 4380,
    currentDeductions: 18500,
    taxBracket: '24%',
    filingStatus: 'Single',
    yearToDateWithholdings: 21200
  });

  const [optimizations] = useState<TaxOptimization[]>([
    {
      id: '1',
      strategy: 'Maximize 401(k) Contributions',
      description: 'Increase your 401(k) contributions to reduce taxable income. You can contribute up to $23,000 for 2024.',
      potentialSavings: 1680,
      difficulty: 'easy',
      timeToImplement: '1 day',
      deadline: new Date('2024-12-31'),
      implemented: false,
      category: 'retirement',
      requirements: ['Employer 401(k) plan', 'Sufficient income']
    },
    {
      id: '2',
      strategy: 'Tax-Loss Harvesting',
      description: 'Sell underperforming investments to offset capital gains and reduce your tax liability.',
      potentialSavings: 950,
      difficulty: 'medium',
      timeToImplement: '2-3 days',
      deadline: new Date('2024-12-31'),
      implemented: false,
      category: 'timing',
      requirements: ['Taxable investment account', 'Capital gains this year']
    },
    {
      id: '3',
      strategy: 'HSA Contribution Optimization',
      description: 'Maximize your Health Savings Account contributions for triple tax benefits.',
      potentialSavings: 840,
      difficulty: 'easy',
      timeToImplement: '1 day',
      deadline: new Date('2025-04-15'),
      implemented: false,
      category: 'deductions',
      requirements: ['High-deductible health plan', 'HSA account']
    },
    {
      id: '4',
      strategy: 'Charitable Donation Bundling',
      description: 'Bundle multiple years of charitable donations into a donor-advised fund for larger deductions.',
      potentialSavings: 720,
      difficulty: 'medium',
      timeToImplement: '1 week',
      deadline: new Date('2024-12-31'),
      implemented: false,
      category: 'deductions',
      requirements: ['Itemized deductions', 'Charitable giving history']
    },
    {
      id: '5',
      strategy: 'Roth IRA Conversion',
      description: 'Consider converting traditional IRA funds to Roth IRA during lower income years.',
      potentialSavings: 1200,
      difficulty: 'complex',
      timeToImplement: '2 weeks',
      implemented: false,
      category: 'structure',
      requirements: ['Traditional IRA balance', 'Tax planning analysis']
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filteredOptimizations = selectedCategory === 'all' 
    ? optimizations 
    : optimizations.filter(opt => opt.category === selectedCategory);

  const implementedCount = optimizations.filter(opt => opt.implemented).length;
  const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);

  const implementOptimization = (id: string) => {
    console.log(`Implementing tax optimization: ${id}`);
    // Implementation logic would go here
  };

  const calculateDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Tax Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Estimated Tax
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-red-900 dark:text-red-100">
              <AnimatedCounter value={taxSummary.estimatedTax} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-600 dark:text-red-400">
              {taxSummary.taxBracket} bracket • {taxSummary.filingStatus}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Potential Savings
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              <AnimatedCounter value={totalPotentialSavings} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 dark:text-green-400">
              {optimizations.length} strategies identified
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Current Deductions
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={taxSummary.currentDeductions} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Standard: $13,850
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Implemented
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {implementedCount}/{optimizations.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(implementedCount / optimizations.length) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tax Year Progress */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            2024 Tax Year Progress
          </CardTitle>
          <CardDescription>Important deadlines and year-to-date status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {calculateDaysUntilDeadline(new Date('2024-12-31'))} days
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Until tax year end</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {calculateDaysUntilDeadline(new Date('2025-04-15'))} days
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Until filing deadline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(taxSummary.yearToDateWithholdings)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">YTD withholdings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium">Filter by category:</span>
        <div className="flex gap-2">
          {(['all', 'deductions', 'credits', 'timing', 'structure', 'retirement'] as const).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tax Optimization Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOptimizations.map((optimization, index) => {
          const IconComponent = categoryIcons[optimization.category];
          const daysUntilDeadline = optimization.deadline 
            ? calculateDaysUntilDeadline(optimization.deadline) 
            : null;
          
          return (
            <motion.div
              key={optimization.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[optimization.category]} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{optimization.strategy}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={difficultyColors[optimization.difficulty]}>
                            {optimization.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {optimization.timeToImplement}
                          </span>
                        </div>
                      </div>
                    </div>
                    {optimization.implemented ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(optimization.potentialSavings)}
                        </div>
                        <div className="text-xs text-gray-500">potential savings</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {optimization.description}
                  </p>
                  
                  {daysUntilDeadline && (
                    <div className={`flex items-center gap-2 p-2 rounded-md ${
                      daysUntilDeadline <= 30 ? 'bg-red-50 text-red-700 dark:bg-red-900/20' : 
                      daysUntilDeadline <= 90 ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20' : 
                      'bg-blue-50 text-blue-700 dark:bg-blue-900/20'
                    }`}>
                      {daysUntilDeadline <= 30 ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span className="text-xs">
                        {daysUntilDeadline} days until deadline
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requirements:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {optimization.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {optimization.implemented ? (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Implemented
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => implementOptimization(optimization.id)}
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Implement
                        </Button>
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-100">
            Quick Tax Actions
          </CardTitle>
          <CardDescription>
            High-impact actions you can take right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Tax Calculator</div>
                <div className="text-xs text-gray-600">Estimate your 2024 taxes</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-medium">Document Checklist</div>
                <div className="text-xs text-gray-600">Prepare for tax season</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <div className="font-medium">Strategy Planner</div>
                <div className="text-xs text-gray-600">Plan your tax moves</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}