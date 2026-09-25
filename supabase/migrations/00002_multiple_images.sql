ALTER TABLE public.prompts ADD COLUMN demo_image_urls TEXT[] DEFAULT '{}'::text[];
UPDATE public.prompts SET demo_image_urls = ARRAY[demo_image_url] WHERE demo_image_url IS NOT NULL;
ALTER TABLE public.prompts DROP COLUMN demo_image_url;
