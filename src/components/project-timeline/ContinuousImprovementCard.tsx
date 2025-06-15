
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const ContinuousImprovementCard = () => (
  <Card className="border-2 border-yellow-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-yellow-600" />
        <span>Continuous Improvement Processes</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-6 text-sm mb-2">
        <li>Scheduled upgrades of security tool versions, vulnerability databases, and pipeline dependencies.</li>
        <li>Monthly reviews and refinement of policies, gating logic, and remediation automations.</li>
        <li>Quarterly security drills and retrospectives to identify new threats and process gaps.</li>
        <li>Security Champions within dev teams empowered to surface and drive improvement initiatives.</li>
      </ul>
      <p className="text-xs text-muted-foreground">Regular reviews and upgrades ensure the pipeline remains effective against emerging risks.</p>
    </CardContent>
  </Card>
);

export default ContinuousImprovementCard;
