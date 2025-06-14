
-- Add sub_info column to store sub information for content
ALTER TABLE public.module_content
ADD COLUMN IF NOT EXISTS sub_info TEXT;

-- (If you want to allow more complex structure later, change TEXT to JSONB)
