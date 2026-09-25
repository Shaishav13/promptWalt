-- Create custom types for ENUMS
CREATE TYPE visibility_type AS ENUM ('private', 'shared', 'public');

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT,
    prompt_text TEXT NOT NULL,
    negative_prompt TEXT,
    demo_image_url TEXT,
    tags TEXT[],
    model_used TEXT,
    is_favorite BOOLEAN DEFAULT false,
    visibility visibility_type DEFAULT 'private',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create shares table
CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_prompts_user_category ON public.prompts(user_id, category_id);
-- Setup Full Text Search index (excluding tags to keep the expression immutable)
ALTER TABLE public.prompts ADD COLUMN fts tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(prompt_text, ''))) STORED;
CREATE INDEX idx_prompts_fts ON public.prompts USING GIN (fts);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Categories
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

-- Prompts
CREATE POLICY "Users can view their own prompts or shared/public ones" ON public.prompts FOR SELECT USING (
    auth.uid() = user_id OR 
    visibility = 'public' OR
    (visibility = 'shared' AND EXISTS (SELECT 1 FROM public.shares WHERE prompt_id = prompts.id AND shared_with = auth.uid()))
);
CREATE POLICY "Users can insert their own prompts" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prompts" ON public.prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prompts" ON public.prompts FOR DELETE USING (auth.uid() = user_id);

-- Shares
CREATE POLICY "Users can manage shares for their own prompts" ON public.shares FOR ALL USING (auth.uid() = shared_by);
CREATE POLICY "Users can view shares shared with them" ON public.shares FOR SELECT USING (auth.uid() = shared_with);
