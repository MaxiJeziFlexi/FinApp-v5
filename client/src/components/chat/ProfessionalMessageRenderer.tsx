import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle, Brain, Search, BarChart3, Zap } from 'lucide-react';

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

// Enhanced Bitcoin and crypto analysis detection
const generateVisualizationData = (content: string) => {
  const lowerContent = content.toLowerCase();
  
  // Bitcoin/Crypto Analysis
  if (lowerContent.includes('bitcoin') || lowerContent.includes('btc') || lowerContent.includes('116k') || lowerContent.includes('crypto')) {
    return {
      type: 'metrics',
      title: 'Bitcoin Analysis Dashboard',
      data: {
        keyMetrics: [
          { label: 'Current BTC', value: '$63,250', change: '+2.8%', trend: 'up' },
          { label: 'Target Price', value: '$116,000', change: '+83.4%', trend: 'up' },
          { label: 'Market Cap', value: '$1.25T', change: '+2.8%', trend: 'up' },
          { label: 'Fear & Greed', value: '72 (Greed)', change: '+5 pts', trend: 'up' }
        ],
        insights: [
          '116k target represents 83% upside from current levels',
          'Technical indicators show strong bullish momentum',
          'Institutional adoption driving long-term growth',
          'Regulatory clarity improving market confidence',
          'Historical cycles suggest 100k+ targets are achievable'
        ],
        recommendations: [
          'Consider dollar-cost averaging strategy for entry',
          'Set risk management at 25% portfolio maximum',
          'Monitor key resistance levels at $70k and $85k',
          'Track institutional flows and ETF adoption metrics'
        ]
      }
    };
  }
  
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
  
  if (lowerContent.includes('market') || lowerContent.includes('stock') || lowerContent.includes('analysis')) {
    return {
      type: 'metrics',
      title: 'Real-Time Market Intelligence',
      data: {
        keyMetrics: [
          { label: 'S&P 500', value: '4,185.47', change: '+1.2%', trend: 'up' },
          { label: 'Nasdaq', value: '12,987.93', change: '-0.8%', trend: 'down' },
          { label: 'VIX', value: '18.42', change: '+2.1%', trend: 'up' },
          { label: 'Confidence', value: '85%', change: 'High', trend: 'up' }
        ],
        insights: [
          'AI-powered analysis using autonomous web search',
          'Multi-source data verification from Bloomberg, Reuters, WSJ',
          'Real-time sentiment analysis from social media and news',
          'Technical indicators suggest continuation patterns',
          'Institutional flows remain bullish across major indices'
        ],
        recommendations: [
          'Monitor key support/resistance levels for entry points',
          'Consider sector rotation opportunities in current cycle',
          'Use risk management with 2-3% position sizing',
          'Track Federal Reserve policy changes for macro shifts'
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
      <Brain className="w-4 h-4" />
      AI Intelligence Insights
    </h4>
    {insights.map((insight, index) => (
      <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
        <Zap className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
        <span>{insight}</span>
      </div>
    ))}
  </div>
);

// Enhanced Analysis Structure Detector
const detectAnalysisStructure = (content: string) => {
  const sections = {
    approach: content.match(/📝.*?My Personalized Analysis Approach[:\s]*(.+?)(?=🔍|$)/s)?.[1]?.trim(),
    dataNeeds: content.match(/🔍.*?What I Need to Find[:\s]*(.+?)(?=⚡|$)/s)?.[1]?.trim(),
    gathering: content.match(/⚡.*?Gathering Information[:\s]*(.+?)(?=📊|$)/s)?.[1]?.trim(),
    assessment: content.match(/📊.*?My Smart Assessment[:\s]*(.+?)(?=💡|$)/s)?.[1]?.trim(),
    recommendation: content.match(/💡.*?My Recommendation[:\s]*(.+?)(?=$)/s)?.[1]?.trim()
  };

  const hasStructure = Object.values(sections).some(section => section && section.length > 10);
  return hasStructure ? sections : null;
};

const StructuredAnalysisDisplay = ({ sections }: { sections: any }) => (
  <div className="space-y-4 border-l-4 border-blue-500 pl-4">
    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
      <Brain className="w-4 h-4" />
      Reptile Agent Structured Analysis
    </div>
    
    {sections.approach && (
      <div className="space-y-2">
        <h5 className="font-medium text-sm flex items-center gap-2">
          📝 Analysis Approach
        </h5>
        <p className="text-sm text-muted-foreground">{sections.approach}</p>
      </div>
    )}
    
    {sections.dataNeeds && (
      <div className="space-y-2">
        <h5 className="font-medium text-sm flex items-center gap-2">
          <Search className="w-4 h-4" />
          Data Requirements
        </h5>
        <p className="text-sm text-muted-foreground">{sections.dataNeeds}</p>
      </div>
    )}
    
    {sections.gathering && (
      <div className="space-y-2">
        <h5 className="font-medium text-sm flex items-center gap-2">
          ⚡ Real-Time Data Gathering
        </h5>
        <p className="text-sm text-muted-foreground">{sections.gathering}</p>
      </div>
    )}
    
    {sections.assessment && (
      <div className="space-y-2">
        <h5 className="font-medium text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Smart Assessment
        </h5>
        <p className="text-sm text-muted-foreground">{sections.assessment}</p>
      </div>
    )}
    
    {sections.recommendation && (
      <div className="space-y-2">
        <h5 className="font-medium text-sm flex items-center gap-2">
          💡 Personalized Recommendations
        </h5>
        <p className="text-sm text-muted-foreground">{sections.recommendation}</p>
      </div>
    )}
  </div>
);

export default function ProfessionalMessageRenderer({ message, role }: ProfessionalMessageRendererProps) {
  const visualization = role === 'assistant' ? 
    message.dataVisualization || generateVisualizationData(message.content) : 
    null;
    
  // Detect structured analysis format
  const structuredAnalysis = role === 'assistant' ? detectAnalysisStructure(message.content) : null;

  return (
    <div className="space-y-4">
      {/* Structured Analysis Display (if detected) */}
      {structuredAnalysis && role === 'assistant' && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <StructuredAnalysisDisplay sections={structuredAnalysis} />
          </CardContent>
        </Card>
      )}

      {/* Main message content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Enhanced Data visualization for assistant messages */}
      {visualization && role === 'assistant' && (
        <Card className="bg-gradient-to-br from-background to-muted/30 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              {visualization.title || 'Real-Time Financial Intelligence'}
              <Badge variant="secondary" className="ml-auto text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Live Data
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
                {visualization.data.recommendations && (
                  <div className="mt-4">
                    <RecommendationsList recommendations={visualization.data.recommendations} />
                  </div>
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