-- Make the bucket public so images can be viewed in share links
UPDATE storage.buckets SET public = true WHERE id = 'prompt-images';

-- Allow anyone to view images (they still need the unguessable URL/path to access it)
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;

CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT USING (
  bucket_id = 'prompt-images'
);
