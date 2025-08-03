
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, FileText, MonitorSmartphone } from 'lucide-react';

const PhaseFiveDeploymentCard = () => (
  <Card className="border-2 border-orange-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Rocket className="h-5 w-5 text-orange-600" />
        <span>Phase 5 – Deployment & Monitoring</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-orange-600" /> Deployment Strategy
      </h4>
      <ul className="list-disc pl-6 mb-4 text-sm">
        <li>Deploy new Docker images to secure container registry.</li>
        <li>Update Kubernetes manifests (support blue/green or canary if possible).</li>
        <li>Include security scans (e.g. DAST) at runtime during deployments.</li>
        <li>Support automated rollback to the last good release if a deployment is detected as faulty.</li>
      </ul>
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <MonitorSmartphone className="h-4 w-4 text-orange-600" /> Monitoring & Observability
      </h4>
      <ul className="list-disc pl-6 mb-4 text-sm">
        <li>Set up application and pipeline logging.</li>
        <li>Integrate basic monitoring/alerting tools (example: Prometheus, simple WAF, or cloud alerts).</li>
        <li>Implement post-deployment security monitoring (WAF or RASP, if possible).</li>
      </ul>
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-green-600"></span>
        Deliverables
      </h4>
      <ul className="pl-6 list-decimal text-sm">
        <li>Deployment scripts and configs (Helm chart or Kubernetes YAMLs)</li>
        <li>Proof of successful, secure deployment</li>
        <li>Monitoring and alerting configuration</li>
        <li>Automated rollback support (recommended)</li>
      </ul>
    </CardContent>
  </Card>
);

export default PhaseFiveDeploymentCard;
