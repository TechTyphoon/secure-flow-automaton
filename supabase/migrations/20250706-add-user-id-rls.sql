-- Migration: Add user_id columns and restrict RLS to authenticated users

ALTER TABLE public.security_scans ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.vulnerabilities ADD COLUMN IF NOT EXISTS user_id UUID;

-- Remove public policies
DROP POLICY IF EXISTS "Allow all access to security_scans" ON public.security_scans;
DROP POLICY IF EXISTS "Allow all access to vulnerabilities" ON public.vulnerabilities;

-- Enable RLS if not already enabled
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to access their own data
CREATE POLICY "Users can access their own scans" ON public.security_scans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own vulnerabilities" ON public.vulnerabilities
  FOR ALL USING (auth.uid() = user_id);

-- Backfill: Optionally set user_id for existing data (manual step or script)
-- UPDATE public.security_scans SET user_id = '<your-user-id>' WHERE user_id IS NULL;
-- UPDATE public.vulnerabilities SET user_id = '<your-user-id>' WHERE user_id IS NULL;
