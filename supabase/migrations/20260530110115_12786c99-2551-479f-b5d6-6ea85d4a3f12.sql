-- 1. Atualizar a função de teste grátis (Garantir o prefixo 5MIN)
CREATE OR REPLACE FUNCTION public.generate_free_trial_key(p_user_id uuid, p_ip_address text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_key TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.trial_claims 
        WHERE user_id = p_user_id OR ip_address = p_ip_address
    ) THEN
        RETURN jsonb_build_object('error', 'Trial already claimed');
    END IF;

    v_key := 'GUTO-5MIN-' || upper(substring(md5(random()::text || clock_timestamp()::text), 1, 6));
    v_expires_at := now() + interval '5 minutes';

    INSERT INTO public.trial_claims (user_id, ip_address, plan_id)
    VALUES (p_user_id, p_ip_address, 'test');

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

-- 2. Criar função para gerar chaves baseadas no plano (Duração)
CREATE OR REPLACE FUNCTION public.generate_license_key_by_duration(p_duration TEXT)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
BEGIN
    CASE lower(p_duration)
        WHEN '5min' THEN v_prefix := '5MIN';
        WHEN '1day' THEN v_prefix := '1DAY';
        WHEN '1week' THEN v_prefix := '1WEEK';
        WHEN '1month', '30days', '30 dias' THEN v_prefix := '1MONTH';
        WHEN 'lifetime', 'vitalício', 'vitalicia' THEN v_prefix := 'LIFETIME';
        ELSE v_prefix := 'KEY';
    END CASE;
    
    RETURN 'GUTO-' || v_prefix || '-' || upper(substring(md5(random()::text || clock_timestamp()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para garantir que novas chaves (inseridas via webhook/webhook externo) sigam o padrão
CREATE OR REPLACE FUNCTION public.ensure_license_key_format()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a chave vier vazia ou não tiver o prefixo GUTO, nós geramos uma no padrão
    IF NEW.key IS NULL OR NEW.key = '' OR NEW.key NOT LIKE 'GUTO-%' THEN
        NEW.key := public.generate_license_key_by_duration(NEW.duration);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ensure_license_key_format ON public.license_keys;
CREATE TRIGGER tr_ensure_license_key_format
BEFORE INSERT ON public.license_keys
FOR EACH ROW
EXECUTE FUNCTION public.ensure_license_key_format();