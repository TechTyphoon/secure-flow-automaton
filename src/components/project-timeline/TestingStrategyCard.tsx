
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const TestingStrategyCard = () => (
  <Card className="border-2 border-purple-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-purple-600" />
        <span>Testing Strategy Overview</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-6 text-sm mb-2">
        <li><b>Unit & Integration Testing:</b> Validate functional correctness after security controls are integrated.</li>
        <li><b>Security Testing within CI/CD:</b> Verify SAST, SCA, and container scanners by intentionally introducing known vulnerabilities.</li>
        <li><b>Automated Gating:</b> Confirm policy gates are enforced and builds fail as expected when violations occur.</li>
        <li><b>Remediation Testing:</b> Ensure automated PRs or fixes are triggered on detected issues and succeed in resolving them.</li>
        <li><b>Secrets Management Testing:</b> Test detection and blocking of hardcoded secrets, and verify secure runtime access.</li>
      </ul>
      <p className="text-xs text-muted-foreground">Each stage is accompanied by targeted test cases and clear reporting of all relevant findings.</p>
    </CardContent>
  </Card>
);

export default TestingStrategyCard;
