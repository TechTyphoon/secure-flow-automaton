
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const AutomatedRemediationCard = () => (
  <Card className="border-2 border-yellow-500">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        <span>Automated Remediation</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Automated remediation enhances security by fixing certain classes of vulnerabilities as soon as they're detected, reducing mean time to resolution.
      </p>
      <ol className="list-decimal pl-6 mb-2 text-xs">
        <li><b>Automated Dependency PRs:</b> For outdated or vulnerable dependencies, a bot (like Dependabot or a custom action) can open a Pull Request to update to a safe version automatically.</li>
        <li><b>Suggested Fixes:</b> For misconfigurations or code weaknesses, the bot can suggest code changes, shown as review comments or PR suggestions.</li>
        <li><b>Configurable Actions:</b> Optionally, policies can allow auto-merging trusted dependency updates or reverting changes that introduce vulnerabilities.</li>
      </ol>
      <div className="text-xs text-yellow-600">
        The auto-remediation logic is implemented via GitHub Actions and custom scripts, integrated directly into the security workflow.
      </div>
    </CardContent>
  </Card>
);

export default AutomatedRemediationCard;
