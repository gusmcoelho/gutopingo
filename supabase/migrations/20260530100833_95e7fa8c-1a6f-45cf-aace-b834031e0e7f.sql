-- Redefine the trial eligibility check to be more robust
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

-- Redefine key generation to be more robust
CREATE OR REPLACE FUNCTION public.generate_free_trial_key(p_user_id UUID, p_ip_address TEXT)
RETURNS JSONB AS $$
DECLARE
    v_key TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check eligibility inside the function for atomicity
    IF EXISTS (
        SELECT 1 FROM public.trial_claims 
        WHERE user_id = p_user_id OR ip_address = p_ip_address
    ) THEN
        RETURN jsonb_build_object('error', 'Trial already claimed');
    END IF;

    -- Generate key
    v_key := 'GUTO-FREE-' || upper(substring(md5(random()::text), 1, 8));
    v_expires_at := now() + interval '5 minutes';

    -- Insert claim first
    INSERT INTO public.trial_claims (user_id, ip_address, plan_id)
    VALUES (p_user_id, p_ip_address, 'test');

    -- Insert key
    INSERT INTO public.license_keys (user_id, key, duration, expires_at)
    VALUES (p_user_id, v_key, '5min', v_expires_at);

    RETURN jsonb_build_object(
        'success', true,
        'key', v_key,
        'expires_at', v_expires_at
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update permissions
REVOKE EXECUTE ON FUNCTION public.generate_free_trial_key(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_free_trial_key(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_free_trial_key(UUID, TEXT) TO service_role;
