CREATE OR REPLACE FUNCTION public.generate_free_trial_key(p_user_id UUID, p_ip_address TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_key TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Security check: users can only generate keys for themselves
    IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
        RETURN jsonb_build_object('error', 'Unauthorized: You can only claim your own trial');
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.trial_claims 
        WHERE user_id = p_user_id OR ip_address = p_ip_address
    ) THEN
        RETURN jsonb_build_object('error', 'Trial already claimed');
    END IF;

    -- Standard pattern: 30MIN- followed by 8 hex characters
    v_key := '30MIN-' || upper(substring(md5(random()::text || clock_timestamp()::text), 1, 8));
    v_expires_at := now() + interval '30 minutes';

    INSERT INTO public.trial_claims (user_id, ip_address, plan_id)
    VALUES (p_user_id, p_ip_address, 'test');

    INSERT INTO public.license_keys (user_id, key, duration, expires_at)
    VALUES (p_user_id, v_key, '30min', v_expires_at);

    RETURN jsonb_build_object(
        'success', true,
        'key', v_key,
        'expires_at', v_expires_at
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;