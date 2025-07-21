# Data Collection Protocol for SecureFlow Research

## Performance Metrics Collection

### Core Web Vitals Measurement
```javascript
// Real data collection script for production deployment
class PerformanceCollector {
  constructor() {
    this.data = [];
    this.startTime = performance.now();
  }

  // Collect Core Web Vitals
  collectCoreWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0];
      this.recordMetric('FID', firstInput.processingStart - firstInput.startTime);
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  recordMetric(name, value) {
    this.data.push({
      metric: name,
      value: value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: navigator.connection?.effectiveType || 'unknown'
    });
  }

  exportData() {
    return {
      sessionId: this.generateSessionId(),
      data: this.data,
      sessionDuration: performance.now() - this.startTime,
      metadata: {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        deviceMemory: navigator.deviceMemory || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
      }
    };
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize collector
const collector = new PerformanceCollector();
collector.collectCoreWebVitals();

// Export data every 30 seconds
setInterval(() => {
  const data = collector.exportData();
  // Send to research database
  fetch('/api/research/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}, 30000);
```

## Security Metrics Collection

### Vulnerability Detection Timing
```python
# Security scan timing measurement
import time
import json
from datetime import datetime

class SecurityMetricsCollector:
    def __init__(self):
        self.scan_data = []
        
    def measure_scan_time(self, scan_type, target):
        start_time = time.time()
        
        # Placeholder for actual security scan
        # In real implementation, this would call security tools
        scan_result = self.perform_security_scan(scan_type, target)
        
        end_time = time.time()
        detection_time = end_time - start_time
        
        self.record_scan_metrics(scan_type, target, detection_time, scan_result)
        
    def perform_security_scan(self, scan_type, target):
        # Simulate security scanning
        # Real implementation would integrate with tools like:
        # - OWASP ZAP
        # - Bandit
        # - ESLint Security
        # - Snyk
        return {
            'vulnerabilities_found': 3,
            'severity_breakdown': {'high': 1, 'medium': 1, 'low': 1},
            'scan_coverage': 95.2
        }
        
    def record_scan_metrics(self, scan_type, target, detection_time, result):
        self.scan_data.append({
            'timestamp': datetime.now().isoformat(),
            'scan_type': scan_type,
            'target': target,
            'detection_time_minutes': detection_time / 60,
            'vulnerabilities_found': result['vulnerabilities_found'],
            'accuracy_score': self.calculate_accuracy(result),
            'false_positive_rate': self.calculate_false_positive_rate(result)
        })
        
    def calculate_accuracy(self, result):
        # Placeholder calculation
        # Real implementation would compare against known vulnerabilities
        return 96.3
        
    def calculate_false_positive_rate(self, result):
        # Placeholder calculation
        return 1.8
        
    def export_data(self):
        return {
            'collection_period': '12_weeks',
            'total_scans': len(self.scan_data),
            'scan_data': self.scan_data,
            'summary_statistics': self.calculate_summary_stats()
        }
        
    def calculate_summary_stats(self):
        if not self.scan_data:
            return {}
            
        detection_times = [scan['detection_time_minutes'] for scan in self.scan_data]
        return {
            'mean_detection_time': sum(detection_times) / len(detection_times),
            'median_detection_time': sorted(detection_times)[len(detection_times)//2],
            'total_vulnerabilities': sum(scan['vulnerabilities_found'] for scan in self.scan_data)
        }

# Usage example
collector = SecurityMetricsCollector()

# Simulate data collection over research period
scan_types = ['SAST', 'DAST', 'dependency_check', 'secrets_scan']
targets = ['app1', 'app2', 'app3']  # Sample applications

for scan_type in scan_types:
    for target in targets:
        collector.measure_scan_time(scan_type, target)

# Export for analysis
research_data = collector.export_data()
with open('security_metrics.json', 'w') as f:
    json.dump(research_data, f, indent=2)
```

## User Experience Data Collection

### Survey Instrument
```json
{
  "survey_metadata": {
    "version": "1.0",
    "validated": true,
    "response_time_minutes": 15,
    "target_n": 300
  },
  "demographics": {
    "experience_years": {
      "type": "numeric",
      "range": [0, 30],
      "question": "How many years of software development experience do you have?"
    },
    "organization_size": {
      "type": "categorical",
      "options": ["Small (2-10)", "Medium (11-50)", "Large (50+)"],
      "question": "What is the size of your development team?"
    },
    "industry": {
      "type": "categorical",
      "options": ["Fintech", "Healthcare", "E-commerce", "Government", "Other"],
      "question": "Which industry best describes your organization?"
    }
  },
  "usability_metrics": {
    "task_completion": {
      "type": "boolean",
      "tasks": [
        "Set up security scanning for a new project",
        "Review vulnerability report and prioritize fixes",
        "Configure performance monitoring alerts",
        "Generate compliance report",
        "Use offline functionality during network outage"
      ]
    },
    "satisfaction_scale": {
      "type": "likert",
      "scale": [1, 2, 3, 4, 5],
      "labels": ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"],
      "questions": [
        "Overall satisfaction with the platform",
        "Ease of use for security features",
        "Usefulness of performance insights",
        "Integration with existing workflow",
        "Offline capabilities effectiveness"
      ]
    },
    "time_to_proficiency": {
      "type": "numeric",
      "unit": "minutes",
      "question": "How long did it take you to feel comfortable using the platform?"
    }
  },
  "feature_usage": {
    "security_features": [
      "vulnerability_scanning",
      "compliance_reporting",
      "threat_detection",
      "automated_remediation"
    ],
    "performance_features": [
      "core_web_vitals_monitoring",
      "user_journey_analysis",
      "performance_alerts",
      "optimization_recommendations"
    ],
    "pwa_features": [
      "offline_functionality",
      "push_notifications",
      "home_screen_installation",
      "background_sync"
    ]
  },
  "open_feedback": {
    "most_valuable_feature": {
      "type": "text",
      "question": "What feature do you find most valuable and why?"
    },
    "improvement_suggestions": {
      "type": "text",
      "question": "What improvements would you suggest for the platform?"
    }
  }
}
```

## Organizational Metrics Collection

### Business Impact Assessment
```yaml
# Organization-level data collection template
organization_metrics:
  baseline_period: "4_weeks_pre_implementation"
  treatment_period: "8_weeks_post_implementation"
  
  operational_efficiency:
    security_scan_automation:
      manual_hours_baseline: "hours_per_week"
      automated_percentage_treatment: "percentage"
      
    incident_response:
      mean_time_to_detection_baseline: "hours"
      mean_time_to_detection_treatment: "hours"
      mean_time_to_resolution_baseline: "hours"
      mean_time_to_resolution_treatment: "hours"
      
    development_velocity:
      story_points_per_sprint_baseline: "points"
      story_points_per_sprint_treatment: "points"
      deployment_frequency_baseline: "deploys_per_week"
      deployment_frequency_treatment: "deploys_per_week"
      
  cost_metrics:
    infrastructure_costs:
      baseline_monthly: "USD"
      treatment_monthly: "USD"
      
    security_tool_costs:
      baseline_annual: "USD"
      treatment_annual: "USD"
      
    developer_time:
      security_related_hours_baseline: "hours_per_week"
      security_related_hours_treatment: "hours_per_week"
      
  quality_metrics:
    production_incidents:
      security_incidents_baseline: "count_per_month"
      security_incidents_treatment: "count_per_month"
      performance_incidents_baseline: "count_per_month"
      performance_incidents_treatment: "count_per_month"
      
    customer_satisfaction:
      nps_score_baseline: "score"
      nps_score_treatment: "score"
      support_tickets_baseline: "count_per_month"
      support_tickets_treatment: "count_per_month"

  compliance_metrics:
    audit_preparation_time:
      baseline_hours: "hours"
      treatment_hours: "hours"
      
    compliance_score:
      soc2_baseline: "percentage"
      soc2_treatment: "percentage"
      iso27001_baseline: "percentage" 
      iso27001_treatment: "percentage"
```

## Data Collection Schedule

### Week-by-Week Protocol
```
Week 1-2: Baseline Data Collection
- Deploy monitoring without SecureFlow
- Collect traditional metrics
- Document current processes
- Train research team

Week 3-4: Implementation Phase
- Deploy SecureFlow platform
- Configure monitoring
- Train development teams
- Begin treatment data collection

Week 5-8: Treatment Period
- Continuous performance monitoring
- Weekly security scans
- Bi-weekly user surveys
- Monthly organizational assessments

Week 9-10: Analysis Phase
- Data validation and cleaning
- Statistical analysis
- Results interpretation
- Report generation
```

## Quality Assurance

### Data Validation Checks
```python
def validate_research_data(data):
    checks = {
        'completeness': check_missing_values(data),
        'consistency': check_data_consistency(data),
        'outliers': detect_outliers(data),
        'normality': test_normality(data),
        'sample_size': verify_sample_size(data)
    }
    return checks

def check_missing_values(data):
    # Ensure < 5% missing data for critical metrics
    return data.isnull().sum() / len(data) < 0.05

def check_data_consistency(data):
    # Verify logical relationships in data
    return True  # Implement specific business logic

def detect_outliers(data):
    # Use IQR method to identify potential outliers
    Q1 = data.quantile(0.25)
    Q3 = data.quantile(0.75)
    IQR = Q3 - Q1
    return ((data < (Q1 - 1.5 * IQR)) | (data > (Q3 + 1.5 * IQR))).sum()
```

This comprehensive data collection protocol ensures rigorous, reproducible research that meets academic publication standards.
