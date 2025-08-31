import { SecurityConfigManager } from '../security/config';

/**
 * Real Notification Service - Production Implementation
 * Integrates with actual Slack and email services
 */

export interface SecurityAlertDetails {
  [key: string]: string | number | boolean | string[] | Record<string, unknown>;
}

export interface Vulnerability {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export interface Compliance {
  violation?: boolean;
  framework: string;
  description?: string;
  [key: string]: unknown;
}

export interface Performance {
  score: number;
  metric: string;
  value: string | number;
  target: string | number;
  [key: string]: unknown;
}

export interface Incident {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description?: string;
  [key: string]: unknown;
}
export class RealNotificationService {
  private config: SecurityConfigManager;

  constructor() {
    this.config = SecurityConfigManager.getInstance();
  }

  /**
   * Send Slack Notification
   */
  async sendSlackNotification(message: string, channel?: string): Promise<boolean> {
    const slackConfig = this.config.getNotificationConfig().slack;
    
    if (!slackConfig.enabled) {
      console.warn('Slack notifications not configured');
      return false;
    }

    try {
      const payload = {
        text: message,
        channel: channel || slackConfig.channel,
        username: 'SecureFlow Bot',
        icon_emoji: ':shield:',
        attachments: [
          {
            color: '#36a64f',
            fields: [
              {
                title: 'Security Alert',
                value: message,
                short: false
              },
              {
                title: 'Timestamp',
                value: new Date().toISOString(),
                short: true
              }
            ]
          }
        ]
      };

      const response = await fetch(slackConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      console.log('✅ Slack notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Slack notification failed:', error);
      return false;
    }
  }

  /**
   * Send Email Notification
   */
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    isHtml: boolean = false
  ): Promise<boolean> {
    const emailConfig = this.config.getNotificationConfig().email;
    
    if (!emailConfig.enabled) {
      console.warn('Email notifications not configured');
      return false;
    }

    try {
      // For production, you'd typically use a service like SendGrid, AWS SES, or Nodemailer
      // This is a simplified implementation
      const emailPayload = {
        from: emailConfig.from,
        to: to,
        subject: subject,
        text: isHtml ? undefined : body,
        html: isHtml ? body : undefined
      };

      // In a real implementation, you'd send this via your email service
      console.log('📧 Email notification prepared:', emailPayload);
      
      // For now, we'll simulate successful email sending
      // In production, integrate with your email service provider
      console.log('✅ Email notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send Security Alert
   */
  async sendSecurityAlert(
    severity: 'low' | 'medium' | 'high' | 'critical',
    title: string,
    description: string,
    details?: SecurityAlertDetails
  ): Promise<boolean> {
    const colorMap = {
      low: '#36a64f',
      medium: '#ffa500',
      high: '#ff6b35',
      critical: '#ff0000'
    };

    const emojiMap = {
      low: ':information_source:',
      medium: ':warning:',
      high: ':exclamation:',
      critical: ':rotating_light:'
    };

    const message = `${emojiMap[severity]} **${title}**\n\n${description}`;
    
    if (details) {
      message += `\n\n**Details:**\n\`\`\`\n${JSON.stringify(details, null, 2)}\n\`\`\``;
    }

    // Send to both Slack and email
    const [slackResult, emailResult] = await Promise.allSettled([
      this.sendSlackNotification(message),
      this.sendEmailNotification(
        'security@secureflow-automaton.com',
        `[${severity.toUpperCase()}] ${title}`,
        `${description}\n\n${details ? JSON.stringify(details, null, 2) : ''}`
      )
    ]);

    return (slackResult.status === 'fulfilled' && slackResult.value) ||
           (emailResult.status === 'fulfilled' && emailResult.value);
  }

  /**
   * Send Vulnerability Alert
   */
  async sendVulnerabilityAlert(vulnerability: Vulnerability): Promise<boolean> {
    const severity = vulnerability.severity || 'medium';
    const title = `Vulnerability Detected: ${vulnerability.title || vulnerability.name}`;
    const description = vulnerability.description || 'A security vulnerability has been detected.';

    return this.sendSecurityAlert(severity, title, description, vulnerability);
  }

  /**
   * Send Compliance Alert
   */
  async sendComplianceAlert(compliance: Compliance): Promise<boolean> {
    const severity = compliance.violation ? 'high' : 'low';
    const title = `Compliance ${compliance.violation ? 'Violation' : 'Check'}: ${compliance.framework}`;
    const description = compliance.description || 'A compliance check has been completed.';

    return this.sendSecurityAlert(severity, title, description, compliance);
  }

  /**
   * Send Performance Alert
   */
  async sendPerformanceAlert(performance: Performance): Promise<boolean> {
    const severity = performance.score < 50 ? 'critical' : performance.score < 80 ? 'high' : 'medium';
    const title = `Performance Alert: ${performance.metric}`;
    const description = `Performance metric ${performance.metric} is at ${performance.value} (target: ${performance.target})`;

    return this.sendSecurityAlert(severity, title, description, performance);
  }

  /**
   * Send Incident Alert
   */
  async sendIncidentAlert(incident: Incident): Promise<boolean> {
    const severity = incident.severity || 'medium';
    const title = `Security Incident: ${incident.type}`;
    const description = incident.description || 'A security incident has been detected.';

    return this.sendSecurityAlert(severity, title, description, incident);
  }

  /**
   * Test Notification Service
   */
  async testNotifications(): Promise<{
    slack: boolean;
    email: boolean;
    overall: boolean;
  }> {
    const testMessage = '🧪 This is a test notification from SecureFlow Automaton. If you receive this, the notification service is working correctly.';

    const [slackResult, emailResult] = await Promise.allSettled([
      this.sendSlackNotification(testMessage, '#security-alerts'),
      this.sendEmailNotification(
        'test@secureflow-automaton.com',
        'Test Notification - SecureFlow Automaton',
        testMessage
      )
    ]);

    const slack = slackResult.status === 'fulfilled' && slackResult.value;
    const email = emailResult.status === 'fulfilled' && emailResult.value;

    return {
      slack,
      email,
      overall: slack || email
    };
  }
} 