-- 1. external_config: remove public read; admins only
DROP POLICY IF EXISTS "Anyone can view config" ON public.external_config;
REVOKE SELECT ON public.external_config FROM authenticated, anon;
GRANT SELECT ON public.external_config TO service_role;

-- 2. trial_claims: restrict insert to authenticated role only
DROP POLICY IF EXISTS "Users can insert their own trial claims" ON public.trial_claims;
DROP POLICY IF EXISTS "Users can view their own trial claims" ON public.trial_claims;

CREATE POLICY "Authenticated users can insert their own trial claims"
ON public.trial_claims
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Authenticated users can view their own trial claims"
ON public.trial_claims
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. has_role: only used internally by RLS (runs as SECURITY DEFINER in policy context)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 4. check_trial_eligibility: only called server-side, revoke from clients
REVOKE EXECUTE ON FUNCTION public.check_trial_eligibility(uuid, text) FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(uuid, text) TO service_role;

-- 5. Storage: prevent broad listing of public bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public read assets by exact name"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets' AND name IS NOT NULL AND name <> '');
