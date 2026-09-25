-- Allow anyone to look up a share link
CREATE POLICY "Anyone can view shares" ON public.shares FOR SELECT USING (true);

-- Allow anyone to read the actual prompt if a share exists for it
CREATE POLICY "Anyone can read shared prompts via link" ON public.prompts FOR SELECT USING (
    visibility = 'shared' OR visibility = 'public'
);

-- Note: In the future, if you only want people WITH the token to see it,
-- you would enforce the token check in the application layer (Next.js server component),
-- which we are already doing by fetching the share_token first!
