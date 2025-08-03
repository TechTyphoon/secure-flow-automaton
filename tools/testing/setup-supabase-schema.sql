-- 🗄️ Supabase Database Schema for 100% Real Data
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create security_scans table
CREATE TABLE IF NOT EXISTS public.security_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    scan_type TEXT NOT NULL CHECK (scan_type IN ('manual', 'automated', 'scheduled')),
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'pending')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    scan_results JSONB,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    total_vulnerabilities INTEGER GENERATED ALWAYS AS (critical_count + high_count + medium_count + low_count) STORED,
    repository_url TEXT,
    commit_sha TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vulnerabilities table
CREATE TABLE IF NOT EXISTS public.vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES public.security_scans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'false_positive')),
    component TEXT,
    file_path TEXT,
    line_number INTEGER,
    cve_id TEXT,
    cvss_score DECIMAL(3,1),
    auto_fixable BOOLEAN DEFAULT FALSE,
    fix_available BOOLEAN DEFAULT FALSE,
    source_tool TEXT CHECK (source_tool IN ('sonarqube', 'snyk', 'github', 'docker', 'custom')),
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fixed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pipeline_runs table
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    build_number INTEGER,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    stages JSONB,
    security_gate_passed BOOLEAN DEFAULT FALSE,
    commit_sha TEXT,
    commit_message TEXT,
    author_name TEXT,
    author_email TEXT,
    trigger_type TEXT CHECK (trigger_type IN ('manual', 'push', 'pull_request', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create remediation_activities table
CREATE TABLE IF NOT EXISTS public.remediation_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vulnerability_id UUID REFERENCES public.vulnerabilities(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('automated_fix', 'manual_fix', 'acknowledge', 'false_positive')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    pr_url TEXT,
    fix_description TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security_metrics table for historical tracking
CREATE TABLE IF NOT EXISTS public.security_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    security_score INTEGER CHECK (security_score BETWEEN 0 AND 100),
    total_vulnerabilities INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    fixed_count INTEGER DEFAULT 0,
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    scan_coverage DECIMAL(5,2) DEFAULT 0.00,
    metrics_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_scans_user_id ON public.security_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_project ON public.security_scans(project_name);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON public.security_scans(status);
CREATE INDEX IF NOT EXISTS idx_security_scans_created_at ON public.security_scans(created_at);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_user_id ON public.vulnerabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id ON public.vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON public.vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON public.vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_source_tool ON public.vulnerabilities(source_tool);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_user_id ON public.pipeline_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_project ON public.pipeline_runs(project_name);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON public.pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started_at ON public.pipeline_runs(started_at);

CREATE INDEX IF NOT EXISTS idx_security_metrics_project_date ON public.security_metrics(project_name, date);

-- Enable Row Level Security
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remediation_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Security scans policies
CREATE POLICY "Users can view their own security scans" ON public.security_scans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security scans" ON public.security_scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security scans" ON public.security_scans
    FOR UPDATE USING (auth.uid() = user_id);

-- Vulnerabilities policies
CREATE POLICY "Users can view their own vulnerabilities" ON public.vulnerabilities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vulnerabilities" ON public.vulnerabilities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vulnerabilities" ON public.vulnerabilities
    FOR UPDATE USING (auth.uid() = user_id);

-- Pipeline runs policies
CREATE POLICY "Users can view their own pipeline runs" ON public.pipeline_runs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pipeline runs" ON public.pipeline_runs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline runs" ON public.pipeline_runs
    FOR UPDATE USING (auth.uid() = user_id);

-- Remediation activities policies
CREATE POLICY "Users can view remediation activities for their vulnerabilities" ON public.remediation_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vulnerabilities v 
            WHERE v.id = vulnerability_id AND v.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert remediation activities for their vulnerabilities" ON public.remediation_activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vulnerabilities v 
            WHERE v.id = vulnerability_id AND v.user_id = auth.uid()
        )
    );

-- Security metrics policies (can be viewed by project owners)
CREATE POLICY "Users can view security metrics for their projects" ON public.security_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.security_scans s 
            WHERE s.project_name = security_metrics.project_name AND s.user_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_security_scans_updated_at
    BEFORE UPDATE ON public.security_scans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_vulnerabilities_updated_at
    BEFORE UPDATE ON public.vulnerabilities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_pipeline_runs_updated_at
    BEFORE UPDATE ON public.pipeline_runs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some initial data for testing (optional)
-- INSERT INTO public.pipeline_runs (
--     user_id, project_name, branch, build_number, status,
--     started_at, completed_at, duration_seconds, security_gate_passed,
--     stages, commit_sha, commit_message, author_name, trigger_type
-- ) VALUES (
--     auth.uid(), 'secure-flow-automaton', 'main', 1001, 'completed',
--     NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes', 900, true,
--     '[
--         {"name": "Source Code", "status": "completed", "duration": "2s"},
--         {"name": "Build", "status": "completed", "duration": "45s"},
--         {"name": "Test", "status": "completed", "duration": "1m 23s"},
--         {"name": "Security Scan", "status": "completed", "duration": "2m 15s"},
--         {"name": "Deploy", "status": "completed", "duration": "45s"}
--     ]'::jsonb,
--     'abc123def456', 'Add real data integration', 'System Admin', 'push'
-- );

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Database schema setup complete! 🎉' as message;