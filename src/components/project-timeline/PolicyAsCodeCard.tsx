
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

const codeBlockClass = "font-mono bg-gray-900 text-green-300 rounded-md p-4 text-xs overflow-x-auto border border-gray-800 my-4";

const PolicyAsCodeCard = () => (
  <Card className="border-2 border-pink-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Target className="h-5 w-5 text-pink-600" />
        <span>Policy-as-Code Example</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-xs mb-2">
        Example Open Policy Agent (OPA) policy for enforcing security gates: <br />
        <pre className={codeBlockClass}>
{`# Example: Policy-as-Code with OPA (Open Policy Agent) - allow build only if critical vulns = 0

package pipeline.security

allow = input.sast.critical == 0
deny[msg] {
  input.sast.critical > 0
  msg = "Critical SAST vulnerabilities found!"
}`}
        </pre>
      </div>
    </CardContent>
  </Card>
);

export default PolicyAsCodeCard;
