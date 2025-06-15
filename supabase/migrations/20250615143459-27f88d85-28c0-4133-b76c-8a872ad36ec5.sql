
-- Create tables for DevSecOps dashboard data

-- Table for storing security scans
CREATE TABLE public.security_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL, -- 'sast', 'sca', 'container', 'secrets'
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
  project_name TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  commit_hash TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_vulnerabilities INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  scan_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing individual vulnerabilities
CREATE TABLE public.vulnerabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES public.security_scans(id) ON DELETE CASCADE,
  cve_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  component TEXT,
  file_path TEXT,
  line_number INTEGER,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'fixed', 'ignored', 'false_positive'
  remediation_advice TEXT,
  auto_fixable BOOLEAN DEFAULT false,
  confidence_score INTEGER DEFAULT 0,
  first_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fixed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing pipeline metrics
CREATE TABLE public.pipeline_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  status TEXT NOT NULL, -- 'success', 'failed', 'running', 'cancelled'
  duration_seconds INTEGER,
  security_gate_passed BOOLEAN DEFAULT false,
  build_number INTEGER,
  triggered_by TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metrics JSONB, -- Store detailed metrics like test coverage, scan times, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing remediation activities
CREATE TABLE public.remediation_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vulnerability_id UUID REFERENCES public.vulnerabilities(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'auto_fix', 'manual_fix', 'ignore', 'false_positive'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  pr_url TEXT,
  fix_description TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remediation_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (making data public for now, can be restricted later with auth)
CREATE POLICY "Allow all access to security_scans" ON public.security_scans FOR ALL USING (true);
CREATE POLICY "Allow all access to vulnerabilities" ON public.vulnerabilities FOR ALL USING (true);
CREATE POLICY "Allow all access to pipeline_metrics" ON public.pipeline_metrics FOR ALL USING (true);
CREATE POLICY "Allow all access to remediation_activities" ON public.remediation_activities FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_security_scans_project_branch ON public.security_scans(project_name, branch);
CREATE INDEX idx_vulnerabilities_severity ON public.vulnerabilities(severity);
CREATE INDEX idx_vulnerabilities_status ON public.vulnerabilities(status);
CREATE INDEX idx_pipeline_metrics_project ON public.pipeline_metrics(project_name);

-- Insert some sample data for demonstration
INSERT INTO public.security_scans (scan_type, status, project_name, branch, commit_hash, completed_at, total_vulnerabilities, critical_count, high_count, medium_count, low_count) VALUES
('sast', 'completed', 'web-frontend', 'main', 'abc123def', now() - interval '1 hour', 12, 2, 4, 5, 1),
('sca', 'completed', 'web-frontend', 'main', 'abc123def', now() - interval '45 minutes', 8, 1, 2, 3, 2),
('container', 'running', 'web-frontend', 'main', 'abc123def', null, 0, 0, 0, 0, 0),
('sast', 'completed', 'auth-service', 'main', 'def456ghi', now() - interval '2 hours', 5, 1, 1, 2, 1);

INSERT INTO public.vulnerabilities (scan_id, cve_id, title, severity, component, status, auto_fixable, confidence_score) VALUES
((SELECT id FROM public.security_scans WHERE scan_type = 'sast' AND project_name = 'web-frontend' LIMIT 1), 'CVE-2024-1234', 'SQL Injection in user authentication', 'critical', 'auth-service', 'open', true, 95),
((SELECT id FROM public.security_scans WHERE scan_type = 'sca' AND project_name = 'web-frontend' LIMIT 1), 'CVE-2024-5678', 'Outdated dependency with known exploits', 'high', 'payment-service', 'fixed', true, 100),
((SELECT id FROM public.security_scans WHERE scan_type = 'sast' AND project_name = 'web-frontend' LIMIT 1), 'CVE-2024-9012', 'Insecure direct object reference', 'medium', 'user-service', 'open', false, 78),
((SELECT id FROM public.security_scans WHERE scan_type = 'sast' AND project_name = 'web-frontend' LIMIT 1), 'CVE-2024-3456', 'Missing security headers', 'low', 'web-frontend', 'open', true, 99);

INSERT INTO public.pipeline_metrics (pipeline_id, project_name, status, duration_seconds, security_gate_passed, build_number, triggered_by, completed_at) VALUES
('pipeline-001', 'web-frontend', 'success', 420, true, 156, 'github-actions', now() - interval '1 hour'),
('pipeline-002', 'auth-service', 'failed', 180, false, 89, 'github-actions', now() - interval '2 hours'),
('pipeline-003', 'payment-service', 'success', 380, true, 234, 'manual', now() - interval '3 hours');
