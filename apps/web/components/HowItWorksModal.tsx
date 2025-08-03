import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Eye, Users, Calendar, BarChart3, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ open, onClose }) => {
  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Security Dashboard",
      description: "Real-time monitoring of your application's security posture with comprehensive metrics",
      details: [
        "Live vulnerability tracking",
        "Security score calculations", 
        "Compliance status monitoring",
        "Performance metrics visualization"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "DevSecOps Research",
      description: "Comprehensive security tool selection and implementation guidance",
      details: [
        "SAST/DAST tool recommendations",
        "Container security solutions",
        "Infrastructure as Code scanning",
        "Dependency vulnerability analysis"
      ]
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Personas",
      description: "Role-based security perspectives for different team members",
      details: [
        "Developer security workflows",
        "Security engineer dashboards",
        "DevOps integration patterns",
        "Management reporting views"
      ]
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Implementation Timeline",
      description: "Step-by-step roadmap for implementing DevSecOps practices",
      details: [
        "Week-by-week implementation plan",
        "Milestone tracking and validation",
        "Resource allocation guidance",
        "Success metrics definition"
      ]
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Security Scanning",
      description: "Automated security scans run on every code commit",
      icon: <Eye className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Vulnerability Detection",
      description: "AI-powered analysis identifies security issues and vulnerabilities",
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Automated Remediation",
      description: "Intelligent fixes are automatically applied where possible",
      icon: <Zap className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Continuous Monitoring",
      description: "Ongoing security posture monitoring and reporting",
      icon: <RefreshCw className="h-5 w-5" />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-primary" />
            How SecureFlow Works
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Overview */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Comprehensive DevSecOps Pipeline Management</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SecureFlow integrates security into every stage of your development lifecycle, 
              providing real-time monitoring, automated remediation, and comprehensive reporting 
              to ensure your applications remain secure from code to production.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Security Workflow</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step) => (
                <Card key={step.step} className="text-center">
                  <CardHeader className="pb-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <Badge variant="secondary" className="mx-auto w-fit">
                      Step {step.step}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-sm font-medium mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-xs">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Key Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Technology Integration</h4>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Security Tools</div>
                    <div className="text-xs text-muted-foreground">SAST, DAST, SCA</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">CI/CD Integration</div>
                    <div className="text-xs text-muted-foreground">GitHub, GitLab, Jenkins</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Container Security</div>
                    <div className="text-xs text-muted-foreground">Docker, Kubernetes</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Cloud Platforms</div>
                    <div className="text-xs text-muted-foreground">AWS, Azure, GCP</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowItWorksModal;