-- We want the bucket to be public for fast asset delivery, but we DON'T want people to be able to list() the bucket contents.
-- So we revert the SELECT policy back to authenticated users only.

DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'prompt-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
