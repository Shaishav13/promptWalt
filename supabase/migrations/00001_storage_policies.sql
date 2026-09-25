-- Storage Policies for prompt-images bucket

-- Allow authenticated users to upload files to their own folder (folder name = user_id)
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'prompt-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'prompt-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'prompt-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
