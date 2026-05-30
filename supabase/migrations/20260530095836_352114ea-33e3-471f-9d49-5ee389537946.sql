-- Fix search_path and execution permissions for security functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Explicitly revoke execute from public (anon)
REVOKE EXECUTE ON FUNCTION public.check_trial_eligibility(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(UUID, TEXT) TO service_role;
