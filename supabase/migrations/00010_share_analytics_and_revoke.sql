-- 00010_share_analytics_and_revoke.sql
-- Add view_count, is_active, and last_viewed_at to shares table for link analytics and access revocation
ALTER TABLE public.shares ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.shares ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.shares ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for quick lookup of active share tokens
CREATE INDEX IF NOT EXISTS idx_shares_token_active ON public.shares(share_token, is_active);

-- Security Definer function to increment view count safely when public link is opened by visitors
CREATE OR REPLACE FUNCTION increment_share_view(token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.shares
  SET view_count = coalesce(view_count, 0) + 1,
      last_viewed_at = timezone('utc'::text, now())
  WHERE share_token = token AND (is_active IS NULL OR is_active = true);
END;
$$;
