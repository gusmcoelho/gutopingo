-- Create the assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Policy to allow admins to upload/manage assets
-- We use the has_role function created in the previous migration
CREATE POLICY "Admin Manage Assets"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'assets' AND 
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'assets' AND 
  public.has_role(auth.uid(), 'admin')
);