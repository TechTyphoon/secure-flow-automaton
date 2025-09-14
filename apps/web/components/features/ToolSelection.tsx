
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Star, GitBranch, Shield, Container, Key, Zap } from 'lucide-react';

const ToolSelection = () => {
  const [selectedCategory, setSelectedCategory] = useState('sast');

  const toolCategories = {
    sast: {
      title: 'Static Application Security Testing (SAST)',
      icon: <Shield className="h-5 w-5" />,
      tools: [
        {
          name: 'SonarQube',
          type: 'Commercial/OSS',
          score: 9.2,
          pros: ['Comprehensive rule sets', 'IDE integration', 'Quality gates'],
          cons: ['Resource intensive', 'Complex setup'],
          integration: 'Excellent',
          falsePositiveRate: 'Low',
          recommended: true
        },
        {
          name: 'Semgrep',
          type: 'Open Source',
          score: 8.8,
          pros: ['Fast execution', 'Custom rules', 'Multi-language'],
          cons: ['Newer ecosystem', 'Limited enterprise features'],
          integration: 'Good',
          falsePositiveRate: 'Medium',
          recommended: true
        },
        {
          name: 'Checkmarx',
          type: 'Commercial',
          score: 8.5,
          pros: ['Enterprise features', 'Deep analysis', 'Compliance reporting'],
          cons: ['Expensive', 'Slow scans'],
          integration: 'Good',
          falsePositiveRate: 'Low',
          recommended: false
        }
      ]
    },
    sca: {
      title: 'Software Composition Analysis (SCA)',
      icon: <GitBranch className="h-5 w-5" />,
      tools: [
        {
          name: 'Snyk',
          type: 'Commercial/OSS',
          score: 9.5,
          pros: ['Excellent vulnerability DB', 'Auto-remediation', 'Developer-friendly'],
          cons: ['Pricing model', 'API rate limits'],
          integration: 'Excellent',
          falsePositiveRate: 'Very Low',
          recommended: true
        },
        {
          name: 'Dependabot',
          type: 'Free (GitHub)',
          score: 8.0,
          pros: ['GitHub native', 'Automatic PRs', 'Zero setup'],
          cons: ['GitHub only', 'Limited customization'],
          integration: 'Perfect',
          falsePositiveRate: 'Low',
          recommended: true
        },
        {
          name: 'OWASP Dependency-Check',
          type: 'Open Source',
          score: 7.5,
          pros: ['Free', 'Multi-format support', 'CLI friendly'],
          cons: ['Manual updates', 'Limited remediation'],
          integration: 'Good',
          falsePositiveRate: 'Medium',
          recommended: false
        }
      ]
    },
    container: {
      title: 'Container Image Scanning',
      icon: <Container className="h-5 w-5" />,
      tools: [
        {
          name: 'Trivy',
          type: 'Open Source',
          score: 9.0,
          pros: ['Fast scanning', 'Multiple formats', 'Easy integration'],
          cons: ['Limited reporting', 'Basic remediation'],
          integration: 'Excellent',
          falsePositiveRate: 'Low',
          recommended: true
        },
        {
          name: 'Aqua Security',
          type: 'Commercial',
          score: 8.8,
          pros: ['Runtime protection', 'Policy engine', 'Compliance'],
          cons: ['Complex setup', 'Expensive'],
          integration: 'Good',
          falsePositiveRate: 'Very Low',
          recommended: false
        },
        {
          name: 'Clair',
          type: 'Open Source',
          score: 7.8,
          pros: ['API-first', 'Registry integration', 'Scalable'],
          cons: ['Complex setup', 'Limited UI'],
          integration: 'Medium',
          falsePositiveRate: 'Medium',
          recommended: false
        }
      ]
    },
    secrets: {
      title: 'Secrets Management',
      icon: <Key className="h-5 w-5" />,
      tools: [
        {
          name: 'HashiCorp Vault',
          type: 'Open Source/Commercial',
          score: 9.5,
          pros: ['Industry standard', 'Flexible', 'Strong encryption'],
          cons: ['Complex setup', 'Learning curve'],
          integration: 'Excellent',
          falsePositiveRate: 'N/A',
          recommended: true
        },
        {
          name: 'AWS Secrets Manager',
          type: 'Cloud Service',
          score: 8.5,
          pros: ['Managed service', 'Auto rotation', 'AWS integration'],
          cons: ['Vendor lock-in', 'Cost'],
          integration: 'Good',
          falsePositiveRate: 'N/A',
          recommended: true
        },
        {
          name: 'GitHub Secrets',
          type: 'Platform Feature',
          score: 7.5,
          pros: ['Native integration', 'Simple setup', 'Free'],
          cons: ['Limited scope', 'GitHub only'],
          integration: 'Perfect',
          falsePositiveRate: 'N/A',
          recommended: false
        }
      ]
    }
  };

  const currentTools = toolCategories[selectedCategory].tools;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Zap className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">DevSecOps Tool Selection Matrix</h2>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 w-full">
          {Object.entries(toolCategories).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
              {category.icon}
              <span className="hidden sm:inline">{key.toUpperCase()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(toolCategories).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                {category.icon}
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool, index) => (
                  <Card key={index} className={`relative ${tool.recommended ? 'ring-2 ring-primary' : ''}`}>
                    {tool.recommended && (
                      <Badge className="absolute -top-2 -right-2 bg-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <Badge variant="outline">{tool.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(tool.score / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{tool.score}/10</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-1">Pros:</h4>
                        <ul className="text-xs space-y-1">
                          {tool.pros.map((pro, i) => (
                            <li key={i} className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-orange-600 mb-1">Cons:</h4>
                        <ul className="text-xs space-y-1">
                          {tool.cons.map((con, i) => (
                            <li key={i} className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Integration:</span>
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {tool.integration}
                          </Badge>
                        </div>
                        {tool.falsePositiveRate !== 'N/A' && (
                          <div>
                            <span className="font-medium">False Positives:</span>
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {tool.falsePositiveRate}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recommended Toolchain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">SAST</h4>
              <p className="text-sm text-muted-foreground">SonarQube + Semgrep</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <GitBranch className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">SCA</h4>
              <p className="text-sm text-muted-foreground">Snyk + Dependabot</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Container className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Container</h4>
              <p className="text-sm text-muted-foreground">Trivy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Key className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Secrets</h4>
              <p className="text-sm text-muted-foreground">HashiCorp Vault</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolSelection;
