
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SecurityReport: React.FC = () => {
  // Simulate fetching report data (dummy, replace with API if backend is set up)
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    setTimeout(() => {
      setData({
        summary: { totalVulns: 7, critical: 2, high: 3, medium: 2, lastScan: "2024-06-14T10:00:00Z" },
        vulnerabilities: [
          {
            id: "abcd", cve: "CVE-2024-1234", title: "SQL Injection", severity: "Critical",
            file: "/src/routes/auth.js", line: 17, component: "express-session",
            remediation: "Upgrade to v1.18.0", status: "Open", confidence: 98, detected: "2024-06-14T10:00:00Z"
          },
        ],
        remediation: [
          { id: "rem-42", vulnId: "abcd", status: "fixed", date: "2024-06-14T11:00:00Z" },
        ]
      });
    }, 800);
  }, []);
  if (!data) return <div className="p-10">Loading full report...</div>;
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Security Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div>
              <div className="font-bold text-2xl">{data.summary.totalVulns}</div>
              <div className="text-xs">Total Vulnerabilities</div>
            </div>
            <div>
              <div>Critical: <b>{data.summary.critical}</b></div>
              <div>High: <b>{data.summary.high}</b></div>
              <div>Medium: <b>{data.summary.medium}</b></div>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              Last Scan: {new Date(data.summary.lastScan).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th>CVE</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Location</th>
                <th>Component</th>
                <th>Remediation</th>
              </tr>
            </thead>
            <tbody>
              {data.vulnerabilities.map((vuln: any) => (
                <tr key={vuln.id}>
                  <td className="font-mono">{vuln.cve}</td>
                  <td>{vuln.title}</td>
                  <td>{vuln.severity}</td>
                  <td>{vuln.status}</td>
                  <td>{vuln.file}:{vuln.line}</td>
                  <td>{vuln.component}</td>
                  <td>{vuln.remediation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Remediation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs space-y-2">
            {data.remediation.map((rem: any) => (
              <li key={rem.id}>
                Vulnerability <b>{rem.vulnId}</b> was <span className={rem.status === "fixed" ? "text-security-secure" : "text-destructive"}>{rem.status}</span> at {new Date(rem.date).toLocaleString()}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityReport;
