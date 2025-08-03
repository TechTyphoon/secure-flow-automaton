
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const DocumentationCard = () => (
  <Card className="border-2 border-cyan-700">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-cyan-700" />
        <span>Documentation Approach</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-6 text-sm mb-2">
        <li>All pipeline configurations, security tool settings, and remediation runbooks are version-controlled in the repository.</li>
        <li>Documentation is automatically updated alongside code changes (docs-as-code principle).</li>
        <li>Accessible guides for onboarding new contributors, troubleshooting pipeline issues, and understanding security architecture.</li>
        <li>Periodic audits to ensure documentation reflects current practices and system state.</li>
      </ul>
      <p className="text-xs text-muted-foreground">Comprehensive, current documentation supports knowledge transfer, fast onboarding, and robust incident response.</p>
    </CardContent>
  </Card>
);

export default DocumentationCard;
