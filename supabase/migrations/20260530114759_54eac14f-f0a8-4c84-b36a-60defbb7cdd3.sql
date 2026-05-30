-- Strictly revoke everything from everyone first
REVOKE ALL ON FUNCTION public.generate_free_trial_key(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_trial_eligibility(uuid, text) FROM PUBLIC, anon, authenticated;

-- Grant only what is absolutely necessary
GRANT EXECUTE ON FUNCTION public.generate_free_trial_key(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_trial_eligibility(uuid, text) TO authenticated, service_role;

-- Double check search path
ALTER FUNCTION public.generate_free_trial_key(uuid, text) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.check_trial_eligibility(uuid, text) SET search_path = public;
