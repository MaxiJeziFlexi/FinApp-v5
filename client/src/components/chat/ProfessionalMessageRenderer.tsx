import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface MessageData {
  content: string;
  dataVisualization?: {
    type: 'chart' | 'metrics' | 'comparison' | 'recommendation';
    data: any;
    title?: string;
  };
}

interface ProfessionalMessageRendererProps {
  message: MessageData;
  role: 'user' | 'assistant';
}

// Sample data for demonstration - in real use, this would come from the AI response
const generateVisualizationData = (content: string) => {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('investment') || lowerContent.includes('portfolio')) {
    return {
      type: 'chart',
      title: 'Portfolio Performance Analysis',
      data: {
        chartData: [
          { month: 'Jan', value: 4000, benchmark: 3800 },
          { month: 'Feb', value: 4200, benchmark: 3900 },
          { month: 'Mar', value: 4100, benchmark: 4000 },
          { month: 'Apr', value: 4400, benchmark: 4200 },
          { month: 'May', value: 4600, benchmark: 4300 },
          { month: 'Jun', value: 4800, benchmark: 4500 }
        ],
        metrics: {
          totalReturn: '+12.5%',
          sharpeRatio: '1.34',
          volatility: '8.2%',
          maxDrawdown: '-2.1%'
        }
      }
    };
  }
  
  if (lowerContent.includes('budget') || lowerContent.includes('expense')) {
    return {
      type: 'chart',
      title: 'Monthly Budget Breakdown',
      data: {
        pieData: [
          { name: 'Housing', value: 35, color: '#0088FE' },
          { name: 'Food', value: 15, color: '#00C49F' },
          { name: 'Transportation', value: 12, color: '#FFBB28' },
          { name: 'Entertainment', value: 8, color: '#FF8042' },
          { name: 'Savings', value: 20, color: '#8884D8' },
          { name: 'Other', value: 10, color: '#82CA9D' }
        ],
        recommendations: [
          'Consider reducing entertainment budget by 2%',
          'Increase emergency savings allocation',
          'Look for housing cost optimization opportunities'
        ]
      }
    };
  }
  
  if (lowerContent.includes('market') || lowerContent.includes('stock')) {
    return {
      type: 'metrics',
      title: 'Market Analysis Summary',
      data: {
        keyMetrics: [
          { label: 'S&P 500', value: '4,185.47', change: '+1.2%', trend: 'up' },
          { label: 'Nasdaq', value: '12,987.93', change: '-0.8%', trend: 'down' },
          { label: 'VIX', value: '18.42', change: '+2.1%', trend: 'up' },
          { label: 'USD/EUR', value: '1.0892', change: '+0.3%', trend: 'up' }
        ],
        insights: [
          'Tech sector showing consolidation patterns',
          'Financial sector outperforming broader market',
          'Low volatility environment persists'
        ]
      }
    };
  }

  return null;
};

const MetricsDisplay = ({ data }: { data: any }) => (
  <div className="grid grid-cols-2 gap-3 mb-4">
    {data.keyMetrics?.map((metric: any, index: number) => (
      <Card key={index} className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            <p className="text-sm font-bold">{metric.value}</p>
          </div>
          <div className={`flex items-center gap-1 text-xs ${
            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {metric.change}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const ChartDisplay = ({ data }: { data: any }) => {
  if (data.chartData) {
    return (
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
        {data.metrics && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {Object.entries(data.metrics).map(([key, value]) => (
              <div key={key} className="text-center p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="font-semibold text-sm">{value as string}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (data.pieData) {
    return (
      <div className="mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.pieData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};

const RecommendationsList = ({ recommendations }: { recommendations: string[] }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold flex items-center gap-2">
      <Target className="w-4 h-4" />
      Key Recommendations
    </h4>
    {recommendations.map((rec, index) => (
      <div key={index} className="flex items-start gap-2 text-sm">
        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <span>{rec}</span>
      </div>
    ))}
  </div>
);

const InsightsList = ({ insights }: { insights: string[] }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      Market Insights
    </h4>
    {insights.map((insight, index) => (
      <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
        <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
        <span>{insight}</span>
      </div>
    ))}
  </div>
);

export default function ProfessionalMessageRenderer({ message, role }: ProfessionalMessageRendererProps) {
  const visualization = role === 'assistant' ? 
    message.dataVisualization || generateVisualizationData(message.content) : 
    null;

  return (
    <div className="space-y-4">
      {/* Main message content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Data visualization for assistant messages */}
      {visualization && role === 'assistant' && (
        <Card className="bg-gradient-to-br from-background to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {visualization.title || 'Financial Analysis'}
              <Badge variant="secondary" className="ml-auto text-xs">
                AI Generated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visualization.type === 'metrics' && (
              <>
                <MetricsDisplay data={visualization.data} />
                {visualization.data.insights && (
                  <InsightsList insights={visualization.data.insights} />
                )}
              </>
            )}
            
            {visualization.type === 'chart' && (
              <>
                <ChartDisplay data={visualization.data} />
                {visualization.data.recommendations && (
                  <RecommendationsList recommendations={visualization.data.recommendations} />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}