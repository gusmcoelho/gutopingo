-- Create a table to track free trial claims
CREATE TABLE IF NOT EXISTS public.trial_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    plan_id TEXT NOT NULL DEFAULT 'test'
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_trial_claims_user_id ON public.trial_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_claims_ip_address ON public.trial_claims(ip_address);

-- Grant permissions
GRANT SELECT, INSERT ON public.trial_claims TO authenticated;
GRANT ALL ON public.trial_claims TO service_role;

-- Enable RLS
ALTER TABLE public.trial_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own trial claims" 
ON public.trial_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trial claims" 
ON public.trial_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to check if a user or IP has already claimed a trial
CREATE OR REPLACE FUNCTION public.check_trial_eligibility(p_user_id UUID, p_ip_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.trial_claims 
        WHERE user_id = p_user_id OR ip_address = p_ip_address
    ) INTO v_exists;
    RETURN NOT v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(UUID, TEXT) TO service_role;
