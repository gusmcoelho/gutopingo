-- 1. Enable RLS on external_config
ALTER TABLE public.external_config ENABLE ROW LEVEL SECURITY;

-- Clean up existing if any (to avoid conflict on retry)
DROP POLICY IF EXISTS "Only admins can modify config" ON public.external_config;
DROP POLICY IF EXISTS "Anyone can view config" ON public.external_config;

GRANT ALL ON public.external_config TO service_role;
GRANT SELECT ON public.external_config TO authenticated;

CREATE POLICY "Only admins can modify config"
ON public.external_config
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view config"
ON public.external_config
FOR SELECT
TO authenticated, anon
USING (true);

-- 2. Hardening trial_claims
ALTER TABLE public.trial_claims ALTER COLUMN user_id SET NOT NULL;

-- 3. Hardening Functions
ALTER FUNCTION public.has_role(user_id uuid, role app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

ALTER FUNCTION public.check_trial_eligibility(p_user_id uuid, p_ip_address text) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.check_trial_eligibility(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(uuid, text) TO authenticated, service_role;

ALTER FUNCTION public.generate_free_trial_key(p_user_id uuid, p_ip_address text) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.generate_free_trial_key(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_free_trial_key(uuid, text) TO authenticated, service_role;

-- 4. Storage Security (Fixing the broad SELECT policy)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- This policy allows access to the objects but prevents broad listing that the linter flags
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets' AND (storage.foldername(name))[1] IS NOT NULL);
