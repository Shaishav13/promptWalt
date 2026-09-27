
CREATE TABLE IF NOT EXISTS public.prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage versions for their own prompts" ON public.prompt_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.prompts WHERE id = prompt_versions.prompt_id AND user_id = auth.uid())
);
