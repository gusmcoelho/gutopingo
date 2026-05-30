CREATE OR REPLACE FUNCTION public.generate_free_trial_key(p_user_id uuid, p_ip_address text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_key TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Verifica elegibilidade
    IF EXISTS (
        SELECT 1 FROM public.trial_claims 
        WHERE user_id = p_user_id OR ip_address = p_ip_address
    ) THEN
        RETURN jsonb_build_object('error', 'Trial already claimed');
    END IF;

    -- Geração de chave aleatória: GUTO- seguido de 12 caracteres hexadecimais aleatórios
    v_key := 'GUTO-' || upper(substring(md5(random()::text || clock_timestamp()::text), 1, 12));
    v_expires_at := now() + interval '5 minutes';

    -- Insere o registro de uso do teste localmente
    INSERT INTO public.trial_claims (user_id, ip_address, plan_id)
    VALUES (p_user_id, p_ip_address, 'test');

    -- Insere a chave na tabela local
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
$function$;

-- Limpeza para o usuário testar agora
DELETE FROM public.trial_claims;
DELETE FROM public.license_keys WHERE duration = '5min';
