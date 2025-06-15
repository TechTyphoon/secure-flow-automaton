
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitPullRequest } from 'lucide-react';

const RemediationPOCCard = () => (
  <Card className="border-2 border-pink-500">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <GitPullRequest className="h-5 w-5 text-pink-500" />
        <span>Proof-of-Concept: Automated Remediation</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-6 text-sm mb-2">
        <li>Dependency with critical CVE deliberately introduced.</li>
        <li>SCA (Snyk) scan failed the build; triggered auto-remediation workflow.</li>
        <li>Automated PR <span className="text-muted-foreground">(<b>#46</b>)</span> created and reviewed.</li>
        <li>Merge of the PR re-ran SCA, which then passed.</li>
        <li>All results documented in the test report.</li>
      </ul>
      <div className="bg-gray-900 text-green-200 font-mono rounded mt-2 p-2 text-xs">
        <span>✔️ Auto-remediation PoC successful: Vulnerability fixed & verified pipeline recovery.</span>
      </div>
    </CardContent>
  </Card>
);

export default RemediationPOCCard;
