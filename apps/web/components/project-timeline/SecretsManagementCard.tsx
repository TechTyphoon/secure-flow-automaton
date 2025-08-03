
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LockKeyhole } from 'lucide-react';

const SecretsManagementCard = () => (
  <Card className="border-2 border-blue-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <LockKeyhole className="h-5 w-5 text-blue-600" />
        <span>Secrets Management</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Secrets such as API keys and passwords are never stored in code or VCS. They are securely injected at runtime using best practices.
      </p>
      <ul className="pl-6 list-disc space-y-1 text-xs mb-2">
        <li><b>Environment Variables:</b> Secrets are referenced via pipeline or GitHub Actions secrets; not embedded in code.</li>
        <li><b>Secret Stores:</b> Integration with tools like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault is possible via pipeline steps.</li>
        <li><b>Runtime Access:</b> Jobs fetch secrets at build/deploy time, for single-use, ephemeral access.</li>
      </ul>
      <div className="text-xs text-blue-500">
        <b>Example Flow:</b> The pipeline requests required secrets from a secret manager or pipeline environment at runtime, ensuring they are never exposed or stored within repository files or logs.
      </div>
    </CardContent>
  </Card>
);

export default SecretsManagementCard;
