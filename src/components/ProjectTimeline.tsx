import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Calendar, Target, FileText } from 'lucide-react';

const ProjectTimeline = () => {
  const [activeWeek, setActiveWeek] = useState(1);

  const phases = [
    {
      weeks: "1-2",
      title: "Tool Research & Pipeline Setup",
      status: "in-progress",
      progress: 75,
      deliverables: [
        { name: "Tool Selection Matrix", status: "completed", type: "research" },
        { name: "Architecture Diagram", status: "completed", type: "design" },
        { name: "Basic CI/CD Pipeline", status: "in-progress", type: "implementation" },
        { name: "Environment Setup", status: "in-progress", type: "infrastructure" }
      ],
      tasks: [
        "Research SAST tools (SonarQube, Semgrep, Checkmarx)",
        "Evaluate SCA solutions (Snyk, Dependabot, OWASP)",
        "Compare container scanning tools (Trivy, Aqua, Clair)",
        "Analyze secrets management options (Vault, AWS, Azure)",
        "Setup basic CI/CD pipeline structure",
        "Configure development environment"
      ],
      keyMilestones: [
        "Tool selection finalized",
        "Basic pipeline operational",
        "Development environment ready"
      ]
    },
    {
      weeks: "3-4",
      title: "SAST & SCA Integration",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "SAST Integration", status: "pending", type: "implementation" },
        { name: "SCA Implementation", status: "pending", type: "implementation" },
        { name: "Security Gates Definition", status: "pending", type: "policy" },
        { name: "Quality Metrics Dashboard", status: "pending", type: "monitoring" }
      ],
      tasks: [
        "Integrate SonarQube with CI/CD pipeline",
        "Configure Semgrep for custom security rules",
        "Setup Snyk for dependency scanning",
        "Implement Dependabot for automated updates",
        "Define security gate criteria (fail on critical/high)",
        "Create vulnerability reporting mechanisms"
      ],
      keyMilestones: [
        "SAST tools operational",
        "Dependency scanning active",
        "Security gates enforced"
      ]
    },
    {
      weeks: "5-6",
      title: "Container Scanning & Auto-Remediation",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "Container Image Scanning", status: "pending", type: "implementation" },
        { name: "Automated Remediation Engine", status: "pending", type: "automation" },
        { name: "PR Generation System", status: "pending", type: "automation" },
        { name: "Vulnerability Tracking", status: "pending", type: "monitoring" }
      ],
      tasks: [
        "Integrate Trivy for container vulnerability scanning",
        "Setup Docker image security policies",
        "Implement automated dependency update PRs",
        "Create code fix suggestion system",
        "Build vulnerability tracking dashboard",
        "Setup automated testing for remediation"
      ],
      keyMilestones: [
        "Container scanning operational",
        "Auto-remediation working",
        "PR automation functional"
      ]
    },
    {
      weeks: "7-8",
      title: "Secrets Management & Advanced Features",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "HashiCorp Vault Integration", status: "pending", type: "infrastructure" },
        { name: "Secrets Scanning", status: "pending", type: "security" },
        { name: "Advanced Reporting", status: "pending", type: "monitoring" },
        { name: "Compliance Framework", status: "pending", type: "governance" }
      ],
      tasks: [
        "Deploy and configure HashiCorp Vault",
        "Implement secrets rotation policies",
        "Setup secrets scanning in code repositories",
        "Create advanced security dashboards",
        "Implement compliance reporting (SOC2, PCI-DSS)",
        "Setup security event alerting"
      ],
      keyMilestones: [
        "Vault operational",
        "Secrets management complete",
        "Compliance reporting ready"
      ]
    },
    {
      weeks: "9-10",
      title: "Testing, Documentation & Demo Prep",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "Comprehensive Testing", status: "pending", type: "testing" },
        { name: "Documentation Suite", status: "pending", type: "documentation" },
        { name: "Demo Environment", status: "pending", type: "demo" },
        { name: "Training Materials", status: "pending", type: "training" }
      ],
      tasks: [
        "End-to-end pipeline testing",
        "Security tool effectiveness validation",
        "Performance benchmarking",
        "User documentation creation",
        "Demo environment setup",
        "Training material development"
      ],
      keyMilestones: [
        "All tests passing",
        "Documentation complete",
        "Demo ready for presentation"
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeliverableIcon = (type) => {
    switch (type) {
      case 'research': return <FileText className="h-4 w-4" />;
      case 'design': return <Target className="h-4 w-4" />;
      case 'implementation': return <CheckCircle className="h-4 w-4" />;
      case 'infrastructure': return <Circle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Project Timeline & Milestones</h2>
      </div>

      <div className="grid gap-6">
        {phases.map((phase, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all duration-200 ${
              activeWeek === index + 1 ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => setActiveWeek(index + 1)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="font-mono">
                    Week {phase.weeks}
                  </Badge>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <Badge className={getStatusColor(phase.status)}>
                    {phase.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {phase.progress}% Complete
                </div>
              </div>
              <Progress value={phase.progress} className="w-full" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Key Tasks</span>
                  </h4>
                  <ul className="text-sm space-y-1">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Deliverables</span>
                  </h4>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center space-x-2">
                          {getDeliverableIcon(deliverable.type)}
                          <span className="text-sm">{deliverable.name}</span>
                        </div>
                        <Badge className={getStatusColor(deliverable.status)}>
                          {deliverable.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Key Milestones</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {phase.keyMilestones.map((milestone, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {milestone}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">15%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-muted-foreground">Active Phases</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">18</div>
              <div className="text-sm text-muted-foreground">Total Deliverables</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">10</div>
              <div className="text-sm text-muted-foreground">Weeks Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;
