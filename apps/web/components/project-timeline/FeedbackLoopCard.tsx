
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Circle } from 'lucide-react';

const FeedbackLoopCard = () => (
  <Card className="border-2 border-emerald-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Circle className="h-5 w-5 text-emerald-600" />
        <span>Feedback Loop Strategy</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-6 text-sm mb-2">
        <li>Dedicated feedback channels for Dev, Sec, Ops, and users to report pipeline issues, false positives, or improvement suggestions (e.g., Slack, GitHub Issues).</li>
        <li>Security team regularly reviews and prioritizes feedback for integration into the pipeline.</li>
        <li>Transparent communication of pipeline/policy changes to developers via announcements or docs updates.</li>
        <li>User-reported pain points addressed in scheduled sprint cycles.</li>
      </ul>
      <p className="text-xs text-muted-foreground">An active feedback loop ensures continuous learning and rapid adaptation of security processes.</p>
    </CardContent>
  </Card>
);

export default FeedbackLoopCard;
