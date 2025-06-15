
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TestReportExampleCard = () => (
  <Card className="border-2 border-cyan-500">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-cyan-500" />
        <span>Sample Test Report Format</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <pre className="font-mono bg-gray-900 text-cyan-200 p-3 rounded text-xs overflow-x-auto border border-gray-800">
{`# Test Report Example

## Test Run: 2024-06-15

| Scenario    | Tool      | Result        | Finding                                      | Remediation                        | Status    |
|-------------|-----------|---------------|----------------------------------------------|------------------------------------|-----------|
| SAST        | Semgrep   | FAIL          | SQL Injection detected in LoginController.js | Issue fixed, PR #45 merged         | PASSED    |
| SCA         | Snyk      | FAIL/TRIGGER  | Critical vuln in lodash@4.17.15              | Auto-PR #46, upgraded to 4.17.21   | PASSED    |
| Container   | Trivy     | FAIL BLOCK    | Vulnerable Ubuntu 20.04 base                 | Dockerfile updated to 22.04        | PASSED    |
| Secrets     | Semgrep   | FAIL BLOCK    | Hardcoded AWS key in config.js               | Secret removed, moved to env vars  | PASSED    |
| Remediation | GitHub    | SUCCESS       | PR created and merged                        | Dependency upgraded                | PASSED    |
`}
      </pre>
      <p className="text-xs mt-2 text-muted-foreground">
        Formal reports are versioned and findings cross-referenced with remediation PRs and pipeline logs.
      </p>
    </CardContent>
  </Card>
);

export default TestReportExampleCard;
