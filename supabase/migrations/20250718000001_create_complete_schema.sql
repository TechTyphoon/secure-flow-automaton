-- Create security_scans table first (referenced by vulnerabilities)
CREATE TABLE security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    scan_type TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    total_vulnerabilities INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    scan_results JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vulnerabilities table (references security_scans)
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'ignored', 'false_positive')),
    file_path TEXT,
    line_number INTEGER,
    column_number INTEGER,
    tool TEXT,
    rule_id TEXT,
    cwe_id TEXT,
    cve_id TEXT,
    package_name TEXT,
    affected_versions TEXT,
    confidence_score DECIMAL(3,2),
    auto_fixable BOOLEAN DEFAULT false,
    component TEXT,
    scan_id UUID REFERENCES security_scans(id),
    user_id UUID REFERENCES auth.users(id),
    first_detected TIMESTAMPTZ DEFAULT now(),
    fixed_at TIMESTAMPTZ,
    scanned_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pipeline_runs table
CREATE TABLE pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id INTEGER NOT NULL,
    branch_name TEXT DEFAULT 'main',
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pipeline_metrics table
CREATE TABLE pipeline_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    security_gate_passed BOOLEAN DEFAULT false,
    build_number INTEGER,
    triggered_by TEXT,
    metrics JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_user_id ON vulnerabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_user_id ON security_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON security_scans(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_user_id ON pipeline_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_user_id ON pipeline_metrics(user_id);

-- Enable Row Level Security
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vulnerabilities
CREATE POLICY "Users can view their own vulnerabilities" ON vulnerabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vulnerabilities" ON vulnerabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vulnerabilities" ON vulnerabilities FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for security_scans
CREATE POLICY "Users can view their own security scans" ON security_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own security scans" ON security_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own security scans" ON security_scans FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for pipeline_runs
CREATE POLICY "Users can view their own pipeline runs" ON pipeline_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pipeline runs" ON pipeline_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pipeline runs" ON pipeline_runs FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for pipeline_metrics
CREATE POLICY "Users can view their own pipeline metrics" ON pipeline_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pipeline metrics" ON pipeline_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pipeline metrics" ON pipeline_metrics FOR UPDATE USING (auth.uid() = user_id);
