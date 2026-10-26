-- 00011_explore_and_public_prompts.sql
-- Add author metadata to prompts table for public community discovery in Explore
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS author_avatar TEXT;

-- Create indexes for high-performance explore queries
CREATE INDEX IF NOT EXISTS idx_prompts_public_created ON public.prompts(visibility, created_at DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_prompts_public_usage ON public.prompts(visibility, usage_count DESC) WHERE visibility = 'public';

-- Ensure anyone (authenticated or anonymous visitors) can view public prompts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prompts' AND policyname = 'Anyone can view public prompts'
  ) THEN
    CREATE POLICY "Anyone can view public prompts" ON public.prompts 
    FOR SELECT USING (visibility = 'public');
  END IF;
END
$$;
