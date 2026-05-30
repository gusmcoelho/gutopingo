-- Function to generate a free trial key directly from the client (securely)
CREATE OR REPLACE FUNCTION public.generate_free_trial_key(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_key TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_result JSONB;
BEGIN
    -- Double check eligibility in the same transaction
    IF EXISTS (
        SELECT 1 FROM public.trial_claims 
        WHERE user_id = p_user_id
    ) THEN
        RETURN jsonb_build_object('error', 'Trial already claimed');
    END IF;

    -- Generate a simple 16-char random key
    v_key := 'GUTO-FREE-' || upper(substring(md5(random()::text), 1, 8));
    v_expires_at := now() + interval '5 minutes';

    -- Insert into license_keys
    INSERT INTO public.license_keys (user_id, key, duration, expires_at)
    VALUES (p_user_id, v_key, '5 minutes', v_expires_at);

    -- Return the key info
    RETURN jsonb_build_object(
        'success', true,
        'key', v_key,
        'expires_at', v_expires_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Explicitly revoke execute from public (anon)
REVOKE EXECUTE ON FUNCTION public.generate_free_trial_key(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_free_trial_key(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_free_trial_key(UUID) TO service_role;
