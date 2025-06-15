
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const SecureCodingStandardsCard = () => (
  <Card className="border-primary border-2">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <span>Secure Coding Standards</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Ensuring secure coding practices throughout development helps prevent vulnerabilities at the source. The standards below are enforced through SAST tools in our pipeline.
      </p>
      <ul className="list-disc pl-6 space-y-1 mb-2">
        <li>Follow <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="underline text-primary">OWASP Top 10</a> security categories (e.g., Injection, XSS, Broken Authentication)</li>
        <li>Validate and sanitize all inputs</li>
        <li>Apply output encoding and escaping</li>
        <li>Avoid secrets/hardcoded credentials in code</li>
        <li>Use least-privilege for all resources and APIs</li>
        <li>Implement comprehensive error handling & logging</li>
        <li>Keep dependencies up to date and monitored</li>
        <li>Enforce code reviews for all pull requests</li>
      </ul>
      <div className="text-xs text-green-500">
        <span className="font-semibold">SAST Enforcement:</span> SAST tools like SonarQube and Semgrep are integrated into our pipeline and scan source code on every push/PR, blocking insecure code according to configured policies.
      </div>
    </CardContent>
  </Card>
);

export default SecureCodingStandardsCard;
