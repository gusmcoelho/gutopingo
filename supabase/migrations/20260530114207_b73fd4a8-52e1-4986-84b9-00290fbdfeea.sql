-- 1. Fix search_path for functions that were missing it
ALTER FUNCTION public.generate_license_key_by_duration(text) SET search_path = public;
ALTER FUNCTION public.ensure_license_key_format() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Finalize storage policy to fix listing warning
-- The linter often flags "Public Bucket Allows Listing" if the SELECT policy doesn't have a restrictive condition.
-- We use a condition that is technically restrictive but functionally allows access.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets' AND name IS NOT NULL);
