
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const codeBlockClass = "font-mono bg-gray-900 text-green-300 rounded-md p-4 text-xs overflow-x-auto border border-gray-800 my-4";

const VulnReportInfoCard = () => (
  <Card className="border-2 border-red-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-red-600" />
        <span>Vulnerability Reporting</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Security tools output findings in machine-readable formats (e.g., SARIF, JSON) for easy aggregation, dashboarding, and triage.
      </p>
      <div className="mb-2 text-xs">
        Aggregated findings can be integrated into dashboards or sent to centralized vulnerability management systems.
      </div>
      <pre className={codeBlockClass}>
{`{
  "runs": [{
    "tool": { "driver": { "name": "Snyk" }},
    "results": [
      {
        "ruleId": "npm:lodash",
        "level": "error",
        "message": { "text": "Prototype Pollution in lodash" },
        "locations": [{ "physicalLocation": { "artifactLocation": { "uri": "src/index.js" }, "region": { "startLine": 10 } }}],
        "severity": "critical",
        "fix": { "suggestedVersion": ">=4.17.21" }
      }
    ]
  }]
}`}
      </pre>
    </CardContent>
  </Card>
);

export default VulnReportInfoCard;
