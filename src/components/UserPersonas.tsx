
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Code, Shield, Settings, Clock, Target, AlertCircle } from 'lucide-react';

const UserPersonas = () => {
  const personas = [
    {
      name: "Secure Developer Sarah",
      role: "Frontend/Backend Developer",
      icon: <Code className="h-8 w-8" />,
      avatar: "👩‍💻",
      goals: [
        "Fast, actionable security feedback in IDE",
        "Minimal context switching from development workflow",
        "Automated fix suggestions for common vulnerabilities",
        "Clear security requirements documentation"
      ],
      painPoints: [
        "Security tools slow down development",
        "Too many false positives to investigate",
        "Complex security reports hard to understand",
        "Late-stage security feedback requires major rework"
      ],
      needs: [
        "IDE-integrated security scanning",
        "Real-time vulnerability detection",
        "Automated dependency updates",
        "Clear, actionable remediation guidance"
      ],
      metrics: [
        "Time to fix vulnerabilities",
        "False positive rate",
        "Developer satisfaction score",
        "Security issues caught pre-commit"
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      name: "DevOps Engineer Dave",
      role: "Platform & Infrastructure",
      icon: <Settings className="h-8 w-8" />,
      avatar: "👨‍🔧",
      goals: [
        "Stable, efficient CI/CD pipeline performance",
        "Automated security gates without manual intervention",
        "Consistent deployment processes across environments",
        "Infrastructure as Code security validation"
      ],
      painPoints: [
        "Security scans causing pipeline delays",
        "Manual security approvals blocking deployments",
        "Inconsistent security policies across projects",
        "Complex integration between security tools"
      ],
      needs: [
        "Automated security gate enforcement",
        "Pipeline performance monitoring",
        "Standardized security policies",
        "Infrastructure security scanning"
      ],
      metrics: [
        "Pipeline success rate",
        "Average build time",
        "Security gate effectiveness",
        "Deployment frequency"
      ],
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      name: "Security Analyst Sam",
      role: "Application Security",
      icon: <Shield className="h-8 w-8" />,
      avatar: "🛡️",
      goals: [
        "Comprehensive application security posture visibility",
        "Risk-based vulnerability prioritization",
        "Compliance reporting and audit trails",
        "Proactive threat detection and response"
      ],
      painPoints: [
        "Fragmented security tool reporting",
        "Difficulty prioritizing vulnerabilities by business impact",
        "Manual compliance report generation",
        "Limited visibility into remediation progress"
      ],
      needs: [
        "Centralized security dashboard",
        "Risk-based vulnerability scoring",
        "Automated compliance reporting",
        "Remediation tracking and metrics"
      ],
      metrics: [
        "Mean time to remediation",
        "Vulnerability trend analysis",
        "Compliance score",
        "Security posture improvement"
      ],
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">User Personas</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {personas.map((persona, index) => (
          <Card key={index} className="h-full">
            <CardHeader className={`${persona.bgColor} rounded-t-lg`}>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{persona.avatar}</div>
                <div>
                  <CardTitle className={`${persona.color} text-lg`}>
                    {persona.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{persona.role}</p>
                </div>
                <div className={persona.color}>
                  {persona.icon}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Goals</h4>
                </div>
                <ul className="text-xs space-y-1">
                  {persona.goals.map((goal, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-sm">Pain Points</h4>
                </div>
                <ul className="text-xs space-y-1">
                  {persona.painPoints.map((pain, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm">Key Needs</h4>
                </div>
                <ul className="text-xs space-y-1">
                  {persona.needs.map((need, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Success Metrics</h4>
                <div className="flex flex-wrap gap-1">
                  {persona.metrics.map((metric, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Persona-Driven Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Developer Experience</h4>
              <ul className="text-sm space-y-1">
                <li>• IDE integration (VS Code, IntelliJ)</li>
                <li>• Pre-commit hooks</li>
                <li>• Automated fix suggestions</li>
                <li>• Real-time feedback</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Pipeline Automation</h4>
              <ul className="text-sm space-y-1">
                <li>• Automated security gates</li>
                <li>• Policy as Code</li>
                <li>• Performance optimization</li>
                <li>• Standardized workflows</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Security Governance</h4>
              <ul className="text-sm space-y-1">
                <li>• Centralized reporting</li>
                <li>• Risk-based prioritization</li>
                <li>• Compliance automation</li>
                <li>• Audit trail maintenance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPersonas;
