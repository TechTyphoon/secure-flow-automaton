import axios from 'axios';
import { SecurityConfigManager } from './config';

export interface SecurityAlert {
  id: string;
  type: 'critical_vulnerability' | 'security_hotspot' | 'dependency_risk' | 'container_issue';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: 'sonarqube' | 'snyk' | 'container' | 'system';
  component?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export class SecurityNotificationService {
  private config = SecurityConfigManager.getInstance();

  async sendAlert(alert: SecurityAlert): Promise<boolean> {
    const notificationConfig = this.config.getNotificationConfig();
    let success = false;

    // Send to Slack if configured
    if (notificationConfig.slack.enabled) {
      success = await this.sendSlackAlert(alert, notificationConfig.slack) || success;
    }

    // Send to Teams if configured
    if (notificationConfig.teams.enabled) {
      success = await this.sendTeamsAlert(alert, notificationConfig.teams) || success;
    }

    // Fallback: Log to console if no services configured
    if (!notificationConfig.slack.enabled && !notificationConfig.teams.enabled) {
      console.warn('⚠️ Security Alert (No notification services configured):', {
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        source: alert.source,
      });
      return false;
    }

    return success;
  }

  private async sendSlackAlert(alert: SecurityAlert, slackConfig: any): Promise<boolean> {
    try {
      const color = this.getSeverityColor(alert.severity);
      const icon = this.getSeverityIcon(alert.severity);
      
      const payload = {
        channel: slackConfig.channel,
        username: 'SecureFlow Security',
        icon_emoji: ':shield:',
        attachments: [{
          color,
          title: `${icon} ${alert.title}`,
          text: alert.description,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Source',
              value: alert.source.toUpperCase(),
              short: true,
            },
            {
              title: 'Component',
              value: alert.component || 'Unknown',
              short: true,
            },
            {
              title: 'Time',
              value: new Date(alert.createdAt).toLocaleString(),
              short: true,
            }
          ],
          footer: 'SecureFlow Automaton',
          ts: Math.floor(new Date(alert.createdAt).getTime() / 1000),
        }]
      };

      await axios.post(slackConfig.webhookUrl, payload, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`✅ Security alert sent to Slack: ${alert.title}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send Slack alert:', error);
      return false;
    }
  }

  private async sendTeamsAlert(alert: SecurityAlert, teamsConfig: any): Promise<boolean> {
    try {
      const color = this.getSeverityColor(alert.severity);
      const icon = this.getSeverityIcon(alert.severity);

      const payload = {
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        summary: `Security Alert: ${alert.title}`,
        themeColor: color.replace('#', ''),
        sections: [{
          activityTitle: `${icon} Security Alert`,
          activitySubtitle: alert.title,
          activityImage: "https://raw.githubusercontent.com/TechTyphoon/secure-flow-automaton/main/public/shield-icon.png",
          facts: [
            { name: "Severity", value: alert.severity.toUpperCase() },
            { name: "Source", value: alert.source.toUpperCase() },
            { name: "Component", value: alert.component || 'Unknown' },
            { name: "Time", value: new Date(alert.createdAt).toLocaleString() }
          ],
          text: alert.description
        }],
        potentialAction: [{
          "@type": "ActionCard",
          name: "View Dashboard",
          targets: [{
            os: "default",
            uri: `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard`
          }]
        }]
      };

      await axios.post(teamsConfig.webhookUrl, payload, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`✅ Security alert sent to Teams: ${alert.title}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send Teams alert:', error);
      return false;
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#FF0000';
      case 'high': return '#FF6600';
      case 'medium': return '#FFAA00';
      case 'low': return '#00AA00';
      default: return '#808080';
    }
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '🔍';
    }
  }

  async sendBulkSummary(alerts: SecurityAlert[]): Promise<boolean> {
    if (alerts.length === 0) return true;

    const summary = this.generateAlertSummary(alerts);
    
    const summaryAlert: SecurityAlert = {
      id: `summary-${Date.now()}`,
      type: 'critical_vulnerability',
      severity: this.getHighestSeverity(alerts),
      title: `Security Scan Summary: ${alerts.length} Issues Found`,
      description: summary,
      source: 'system',
      createdAt: new Date().toISOString(),
    };

    return this.sendAlert(summaryAlert);
  }

  private generateAlertSummary(alerts: SecurityAlert[]): string {
    const bySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = alerts.reduce((acc, alert) => {
      acc[alert.source] = (acc[alert.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
**Severity Breakdown:**
${Object.entries(bySeverity).map(([sev, count]) => `• ${sev.toUpperCase()}: ${count}`).join('\n')}

**Source Breakdown:**
${Object.entries(bySource).map(([src, count]) => `• ${src.toUpperCase()}: ${count}`).join('\n')}

View full details in the SecureFlow dashboard.
    `.trim();
  }

  private getHighestSeverity(alerts: SecurityAlert[]): 'critical' | 'high' | 'medium' | 'low' {
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    
    for (const severity of severityOrder) {
      if (alerts.some(alert => alert.severity === severity)) {
        return severity as any;
      }
    }
    
    return 'low';
  }
}
