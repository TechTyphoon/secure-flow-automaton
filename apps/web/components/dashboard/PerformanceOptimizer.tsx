import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Settings, 
  CheckCircle,
  XCircle,
  Clock,
  Gauge,
  Cpu,
  HardDrive,
  Wifi,
  Image,
  Code,
  Database,
  Globe,
  Smartphone,
  Monitor,
  AlertTriangle,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

interface OptimizationRule {
  id: string;
  name: string;
  category: 'loading' | 'rendering' | 'network' | 'caching' | 'images' | 'javascript';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  enabled: boolean;
  autoApply: boolean;
  status: 'active' | 'pending' | 'disabled';
  potentialImprovement: string;
  currentValue: number;
  targetValue: number;
  lastApplied?: Date;
}

interface PerformanceInsight {
  id: string;
  type: 'opportunity' | 'diagnostic' | 'warning';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  potentialImprovement: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  estimatedSavings: string;
}

interface OptimizationResult {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: Date;
  success: boolean;
  beforeValue: number;
  afterValue: number;
  improvement: number;
  details: string;
  duration: number; // seconds
}

interface PerformanceBudget {
  metric: string;
  target: number;
  current: number;
  status: 'pass' | 'warn' | 'fail';
  impact: string;
}

const PerformanceOptimizer: React.FC = () => {
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsight[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [performanceBudgets, setPerformanceBudgets] = useState<PerformanceBudget[]>([]);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState(78);

  const generateOptimizationRules = useCallback((): OptimizationRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'Image Compression & WebP Conversion',
        category: 'images',
        description: 'Automatically compress images and convert to WebP format for better loading performance',
        impact: 'high',
        effort: 'low',
        enabled: true,
        autoApply: true,
        status: 'active',
        potentialImprovement: '40% reduction in image size',
        currentValue: 2.5, // MB
        targetValue: 1.5, // MB
        lastApplied: new Date(Date.now() - Math.random() * 86400000)
      },
      {
        id: 'rule-2',
        name: 'JavaScript Bundle Optimization',
        category: 'javascript',
        description: 'Split large bundles, implement tree shaking, and remove unused code',
        impact: 'high',
        effort: 'medium',
        enabled: true,
        autoApply: true,
        status: 'active',
        potentialImprovement: '35% reduction in bundle size',
        currentValue: 850, // KB
        targetValue: 550, // KB
        lastApplied: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        id: 'rule-3',
        name: 'Critical CSS Inlining',
        category: 'rendering',
        description: 'Inline critical CSS to reduce render-blocking resources',
        impact: 'medium',
        effort: 'low',
        enabled: true,
        autoApply: false,
        status: 'pending',
        potentialImprovement: '25% faster First Contentful Paint',
        currentValue: 1.8, // seconds
        targetValue: 1.35, // seconds
      },
      {
        id: 'rule-4',
        name: 'CDN Resource Optimization',
        category: 'network',
        description: 'Optimize CDN configuration and implement intelligent caching strategies',
        impact: 'high',
        effort: 'low',
        enabled: true,
        autoApply: true,
        status: 'active',
        potentialImprovement: '50% reduction in TTFB',
        currentValue: 800, // ms
        targetValue: 400, // ms
        lastApplied: new Date(Date.now() - Math.random() * 7200000)
      },
      {
        id: 'rule-5',
        name: 'Lazy Loading Implementation',
        category: 'loading',
        description: 'Implement lazy loading for images and components below the fold',
        impact: 'medium',
        effort: 'medium',
        enabled: true,
        autoApply: true,
        status: 'active',
        potentialImprovement: '30% faster initial page load',
        currentValue: 3.2, // seconds
        targetValue: 2.24, // seconds
        lastApplied: new Date(Date.now() - Math.random() * 5400000)
      },
      {
        id: 'rule-6',
        name: 'Service Worker Caching',
        category: 'caching',
        description: 'Implement intelligent service worker caching for static and dynamic resources',
        impact: 'high',
        effort: 'high',
        enabled: false,
        autoApply: false,
        status: 'disabled',
        potentialImprovement: '60% faster repeat visits',
        currentValue: 2.1, // seconds
        targetValue: 0.84, // seconds
      },
      {
        id: 'rule-7',
        name: 'Database Query Optimization',
        category: 'loading',
        description: 'Optimize database queries and implement intelligent caching layers',
        impact: 'high',
        effort: 'high',
        enabled: true,
        autoApply: false,
        status: 'pending',
        potentialImprovement: '45% reduction in API response time',
        currentValue: 1200, // ms
        targetValue: 660, // ms
      },
      {
        id: 'rule-8',
        name: 'Preload Critical Resources',
        category: 'loading',
        description: 'Preload critical fonts, images, and scripts to reduce perceived load time',
        impact: 'medium',
        effort: 'low',
        enabled: true,
        autoApply: true,
        status: 'active',
        potentialImprovement: '20% faster perceived performance',
        currentValue: 2.5, // seconds
        targetValue: 2.0, // seconds
        lastApplied: new Date(Date.now() - Math.random() * 1800000)
      }
    ];
  }, []);

  const generatePerformanceInsights = useCallback((): PerformanceInsight[] => {
    return [
      {
        id: 'insight-1',
        type: 'opportunity',
        title: 'Optimize Images',
        description: 'Images are not optimally sized or compressed. Consider using WebP format and responsive images.',
        metric: 'Largest Contentful Paint',
        currentValue: 3.2,
        potentialImprovement: 1.1,
        priority: 'high',
        category: 'Loading Performance',
        actionable: true,
        estimatedSavings: '1.1s faster LCP'
      },
      {
        id: 'insight-2',
        type: 'opportunity',
        title: 'Reduce JavaScript Bundle Size',
        description: 'Large JavaScript bundles are blocking the main thread. Consider code splitting and tree shaking.',
        metric: 'Total Blocking Time',
        currentValue: 450,
        potentialImprovement: 280,
        priority: 'critical',
        category: 'Interactivity',
        actionable: true,
        estimatedSavings: '280ms faster interactivity'
      },
      {
        id: 'insight-3',
        type: 'diagnostic',
        title: 'Enable Text Compression',
        description: 'Text-based resources are not compressed. Enable Gzip or Brotli compression.',
        metric: 'Transfer Size',
        currentValue: 1.8,
        potentialImprovement: 0.9,
        priority: 'medium',
        category: 'Network',
        actionable: true,
        estimatedSavings: '900KB bandwidth saved'
      },
      {
        id: 'insight-4',
        type: 'warning',
        title: 'Cumulative Layout Shift Issues',
        description: 'Elements are shifting during page load, causing poor user experience.',
        metric: 'Cumulative Layout Shift',
        currentValue: 0.25,
        potentialImprovement: 0.15,
        priority: 'high',
        category: 'Visual Stability',
        actionable: true,
        estimatedSavings: '60% better visual stability'
      },
      {
        id: 'insight-5',
        type: 'opportunity',
        title: 'Implement Resource Preloading',
        description: 'Critical resources could be preloaded to improve perceived performance.',
        metric: 'First Contentful Paint',
        currentValue: 2.1,
        potentialImprovement: 0.6,
        priority: 'medium',
        category: 'Loading Performance',
        actionable: true,
        estimatedSavings: '0.6s faster FCP'
      },
      {
        id: 'insight-6',
        type: 'diagnostic',
        title: 'Optimize Third-party Scripts',
        description: 'Third-party scripts are impacting performance. Consider lazy loading or alternatives.',
        metric: 'Total Blocking Time',
        currentValue: 320,
        potentialImprovement: 200,
        priority: 'high',
        category: 'Interactivity',
        actionable: true,
        estimatedSavings: '200ms faster interactions'
      }
    ];
  }, []);

  const generateOptimizationResults = useCallback((): OptimizationResult[] => {
    const rules = generateOptimizationRules();
    const results: OptimizationResult[] = [];
    
    for (let i = 0; i < 8; i++) {
      const rule = rules[Math.floor(Math.random() * rules.length)];
      const beforeValue = rule.currentValue;
      const improvement = Math.random() * 0.3 + 0.1; // 10-40% improvement
      const afterValue = beforeValue * (1 - improvement);
      
      results.push({
        id: `result-${i}`,
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        success: Math.random() > 0.1, // 90% success rate
        beforeValue,
        afterValue,
        improvement: improvement * 100,
        details: `Applied ${rule.name} optimization`,
        duration: Math.floor(Math.random() * 120) + 10
      });
    }
    
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [generateOptimizationRules]);

  const generatePerformanceBudgets = useCallback((): PerformanceBudget[] => {
    return [
      {
        metric: 'Largest Contentful Paint',
        target: 2.5,
        current: 3.2,
        status: 'fail',
        impact: 'User experience significantly impacted by slow loading'
      },
      {
        metric: 'First Input Delay',
        target: 100,
        current: 85,
        status: 'pass',
        impact: 'Good interactivity performance'
      },
      {
        metric: 'Cumulative Layout Shift',
        target: 0.1,
        current: 0.15,
        status: 'warn',
        impact: 'Some visual instability affecting user experience'
      },
      {
        metric: 'Total Bundle Size',
        target: 500,
        current: 850,
        status: 'fail',
        impact: 'Large bundle size affecting load performance'
      },
      {
        metric: 'Time to Interactive',
        target: 3.8,
        current: 4.2,
        status: 'warn',
        impact: 'Slightly delayed interactivity'
      },
      {
        metric: 'Speed Index',
        target: 3.0,
        current: 2.8,
        status: 'pass',
        impact: 'Good visual loading performance'
      }
    ];
  }, []);

  const toggleRule = useCallback((ruleId: string) => {
    setOptimizationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  }, []);

  const toggleAutoApply = useCallback((ruleId: string) => {
    setOptimizationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, autoApply: !rule.autoApply }
          : rule
      )
    );
  }, []);

  const runOptimization = useCallback(async (ruleId?: string) => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (ruleId) {
      // Single rule optimization
      setOptimizationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, status: 'active' as const, lastApplied: new Date() }
            : rule
        )
      );
    } else {
      // Batch optimization
      setOptimizationRules(prev => 
        prev.map(rule => 
          rule.enabled && rule.autoApply 
            ? { ...rule, status: 'active' as const, lastApplied: new Date() }
            : rule
        )
      );
    }
    
    // Update optimization score
    setOptimizationScore(prev => Math.min(prev + Math.floor(Math.random() * 10) + 5, 95));
    
    setIsOptimizing(false);
  }, []);

  useEffect(() => {
    setOptimizationRules(generateOptimizationRules());
    setPerformanceInsights(generatePerformanceInsights());
    setOptimizationResults(generateOptimizationResults());
    setPerformanceBudgets(generatePerformanceBudgets());
  }, [generateOptimizationRules, generatePerformanceInsights, generateOptimizationResults, generatePerformanceBudgets]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images': return <Image className="h-4 w-4" />;
      case 'javascript': return <Code className="h-4 w-4" />;
      case 'rendering': return <Monitor className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'caching': return <Database className="h-4 w-4" />;
      case 'loading': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const activeRules = optimizationRules.filter(rule => rule.enabled && rule.status === 'active').length;
  const totalImprovements = optimizationResults.filter(result => result.success).length;
  const avgImprovement = optimizationResults.length > 0 
    ? optimizationResults.reduce((sum, result) => sum + result.improvement, 0) / optimizationResults.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{optimizationScore}%</div>
            <Progress value={optimizationScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              {optimizationRules.length} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalImprovements}</div>
            <p className="text-xs text-muted-foreground">
              {avgImprovement.toFixed(1)}% avg improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Optimization</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={autoOptimizationEnabled}
                onCheckedChange={setAutoOptimizationEnabled}
              />
              <span className="text-sm">
                {autoOptimizationEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Button 
              onClick={() => runOptimization()}
              disabled={isOptimizing}
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
            >
              {isOptimizing ? 'Optimizing...' : 'Run All'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Performance Insights</TabsTrigger>
          <TabsTrigger value="rules">Optimization Rules</TabsTrigger>
          <TabsTrigger value="budgets">Performance Budgets</TabsTrigger>
          <TabsTrigger value="results">Optimization Results</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
Recommendations to improve your application performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceInsights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <Badge variant={insight.type === 'opportunity' ? 'default' : 'secondary'}>
                            {insight.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span><strong>Metric:</strong> {insight.metric}</span>
                          <span><strong>Current:</strong> {insight.currentValue.toFixed(1)}{insight.metric.includes('Size') ? 'MB' : insight.metric.includes('Time') ? 's' : 'ms'}</span>
                          <span><strong>Potential Savings:</strong> {insight.estimatedSavings}</span>
                        </div>
                      </div>
                      
                      {insight.actionable && (
                        <Button 
                          onClick={() => runOptimization()}
                          variant="outline" 
                          size="sm"
                          disabled={isOptimizing}
                        >
                          Apply Fix
                        </Button>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(insight.potentialImprovement / insight.currentValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Rules Configuration</CardTitle>
              <CardDescription>
                Configure automated performance optimization rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(rule.category)}
                          <h4 className="font-semibold">{rule.name}</h4>
                          <Badge className={getImpactColor(rule.impact)}>
                            {rule.impact.toUpperCase()} IMPACT
                          </Badge>
                          <Badge className={getEffortColor(rule.effort)}>
                            {rule.effort.toUpperCase()} EFFORT
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Potential Improvement:</span>
                            <p className="text-muted-foreground">{rule.potentialImprovement}</p>
                          </div>
                          <div>
                            <span className="font-medium">Current → Target:</span>
                            <p className="text-muted-foreground">
                              {rule.currentValue.toFixed(1)} → {rule.targetValue.toFixed(1)}
                              {rule.category === 'images' || rule.category === 'javascript' ? (rule.currentValue > 100 ? 'KB' : 'MB') : (rule.currentValue > 10 ? 'ms' : 's')}
                            </p>
                          </div>
                        </div>

                        {rule.lastApplied && (
                          <div className="text-xs text-muted-foreground">
                            Last applied: {rule.lastApplied.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={rule.enabled}
                            onCheckedChange={() => toggleRule(rule.id)}
                          />
                          <span className="text-sm">Enabled</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={rule.autoApply}
                            onCheckedChange={() => toggleAutoApply(rule.id)}
                            disabled={!rule.enabled}
                          />
                          <span className="text-sm">Auto Apply</span>
                        </div>

                        {!rule.autoApply && rule.enabled && (
                          <Button 
                            onClick={() => runOptimization(rule.id)}
                            variant="outline" 
                            size="sm"
                            disabled={isOptimizing}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Budgets</CardTitle>
              <CardDescription>
                Monitor performance metrics against defined budgets and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceBudgets.map((budget, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getBudgetStatusIcon(budget.status)}
                        <h4 className="font-medium">{budget.metric}</h4>
                        <Badge variant={budget.status === 'pass' ? 'default' : budget.status === 'warn' ? 'secondary' : 'destructive'}>
                          {budget.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="font-medium">Current:</span> {budget.current.toFixed(1)}
                          {budget.metric.includes('Size') ? 'KB' : budget.metric.includes('Paint') || budget.metric.includes('Interactive') ? 's' : 'ms'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Target:</span> {budget.target.toFixed(1)}
                          {budget.metric.includes('Size') ? 'KB' : budget.metric.includes('Paint') || budget.metric.includes('Interactive') ? 's' : 'ms'}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{budget.impact}</p>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          budget.status === 'pass' ? 'bg-green-600' : 
                          budget.status === 'warn' ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min((budget.current / budget.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results History</CardTitle>
              <CardDescription>
                Track the impact of applied performance optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <h4 className="font-medium">{result.ruleName}</h4>
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{result.timestamp.toLocaleString()}</span>
                          <span>Duration: {result.duration}s</span>
                          {result.success && (
                            <span>Improvement: {result.improvement.toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                      
                      {result.success && (
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="line-through text-muted-foreground">
                              {result.beforeValue.toFixed(1)}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="font-medium text-green-600">
                              {result.afterValue.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.improvement.toFixed(1)}% improvement
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceOptimizer;
