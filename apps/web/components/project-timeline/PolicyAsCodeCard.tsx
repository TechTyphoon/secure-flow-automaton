
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

const codeBlockClass = "font-mono bg-gray-900 text-green-300 rounded-md p-4 text-xs overflow-x-auto border border-gray-800 my-4";

const PolicyAsCodeCard = () => (
  <Card className="border-2 border-pink-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Target className="h-5 w-5 text-pink-600" />
        <span>Policy-as-Code Examples</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">OPA Security Gate Policy</h4>
          <pre className={codeBlockClass}>
{`# security-gates.rego - Open Policy Agent policy
package pipeline.security

# Allow build only if no critical vulnerabilities
allow_build {
  input.sast.critical == 0
  input.sca.critical == 0
  input.container.critical == 0
}

# Generate detailed failure message
deny[msg] {
  input.sast.critical > 0
  msg := sprintf("Critical SAST vulnerabilities: %d", [input.sast.critical])
}

deny[msg] {
  input.sca.critical > 0
  msg := sprintf("Critical dependency vulnerabilities: %d", [input.sca.critical])
}`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">Semgrep Custom Security Rule</h4>
          <pre className={codeBlockClass}>
{`# semgrep-rules.yml - Custom security pattern detection
rules:
  - id: hardcoded-api-key
    patterns:
      - pattern: |
          const $VAR = "$VALUE"
      - metavariable-regex:
          metavariable: $VAR
          regex: (?i)(api_key|secret|token|password)
      - metavariable-regex:
          metavariable: $VALUE
          regex: ^[a-zA-Z0-9]{20,}$
    message: "Potential hardcoded API key or secret detected"
    severity: ERROR
    languages: [javascript, typescript]`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">Container Security Policy</h4>
          <pre className={codeBlockClass}>
{`# .trivyignore - Container scan policy configuration
# Ignore specific CVEs after risk assessment
CVE-2023-1234  # Low impact, vendor patch pending
CVE-2023-5678  # Mitigated by network controls

# trivy-config.yaml
severity: HIGH,CRITICAL
ignore-unfixed: true
timeout: 10m
cache-dir: /tmp/trivy-cache`}
          </pre>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PolicyAsCodeCard;
