
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, RefreshCw, BookOpen } from 'lucide-react';

const LongTermSupportCard = () => (
  <Card className="border-2 border-purple-700">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Users className="h-5 w-5 text-purple-700" />
        <span>Long-Term Support & Security Culture</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="border-l-4 border-purple-500 pl-4">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Continuous Security Evolution</span>
          </h4>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li>Quarterly threat landscape assessments and pipeline adaptations</li>
            <li>Automated research integration for emerging vulnerabilities (CVE feeds, security advisories)</li>
            <li>Proactive tool evaluation and migration strategies for next-generation security solutions</li>
            <li>Regular red team exercises to validate pipeline effectiveness</li>
          </ul>
        </div>

        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Ongoing Maintenance & Responsibility</span>
          </h4>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li><strong>Security Team:</strong> Pipeline architecture, policy updates, tool configuration management</li>
            <li><strong>DevOps Team:</strong> Infrastructure maintenance, performance optimization, integration support</li>
            <li><strong>Development Teams:</strong> Security champion roles, feedback provision, remediation validation</li>
            <li><strong>Leadership:</strong> Resource allocation, strategic direction, culture reinforcement</li>
          </ul>
        </div>

        <div className="border-l-4 border-emerald-500 pl-4">
          <h4 className="font-semibold text-emerald-800 mb-2 flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Shared Security Culture & Training</span>
          </h4>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li><strong>Security Champions Program:</strong> Embedded security advocates in each development team</li>
            <li><strong>Monthly Security Briefings:</strong> Threat updates, new tools, policy changes, lessons learned</li>
            <li><strong>Hands-on Workshops:</strong> Secure coding practices, tool usage, incident response simulations</li>
            <li><strong>Recognition & Incentives:</strong> Celebrating security contributions, vulnerability discoveries, and proactive security measures</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Culture Success Indicators</h4>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">Security Champions Active:</span>
              <span className="font-medium text-purple-900">12/12 teams</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Training Completion Rate:</span>
              <span className="font-medium text-purple-900">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Proactive Vuln Reports:</span>
              <span className="font-medium text-purple-900">+67% this quarter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Security Policy Adherence:</span>
              <span className="font-medium text-purple-900">98.5%</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default LongTermSupportCard;
