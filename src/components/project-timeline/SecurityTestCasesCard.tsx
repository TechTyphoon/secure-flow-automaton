
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';

const SecurityTestCasesCard = () => (
  <Card className="border-2 border-green-500">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <TestTube className="h-5 w-5 text-green-500" />
        <span>Security Test Cases</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ol className="list-decimal pl-6 space-y-2 text-sm mb-2">
        <li>
          <b>SAST:</b> Commit code with a known SQL injection; verify pipeline blocks/flags as expected.
        </li>
        <li>
          <b>SCA:</b> Add a dependency with a critical CVE; confirm flag and auto-remediation are triggered.
        </li>
        <li>
          <b>Container:</b> Build image with outdated/vulnerable base; ensure scanner blocks deployment.
        </li>
        <li>
          <b>Secrets:</b> Attempt to hardcode a secret; expect detection and pipeline blockage.
        </li>
        <li>
          <b>Remediation Success:</b> Verify automated dependency upgrade PR is created and resolves the vulnerability.
        </li>
      </ol>
      <p className="text-xs text-muted-foreground">Each case includes tracking of findings, logs, and remediation outcomes in the test report.</p>
    </CardContent>
  </Card>
);

export default SecurityTestCasesCard;
