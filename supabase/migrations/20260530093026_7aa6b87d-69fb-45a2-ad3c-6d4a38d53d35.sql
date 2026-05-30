-- Revoke public execution of the has_role function to improve security
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- The linter also mentioned public list permission on storage.objects.
-- Usually, we keep public SELECT for public buckets, but to be strict,
-- we could restrict it. For now, we follow the user request.
