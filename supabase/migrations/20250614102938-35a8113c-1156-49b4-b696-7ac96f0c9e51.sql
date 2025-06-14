
-- Update the check constraint to include '3d_model' as a valid content type
ALTER TABLE public.module_content 
DROP CONSTRAINT module_content_content_type_check;

ALTER TABLE public.module_content 
ADD CONSTRAINT module_content_content_type_check 
CHECK (content_type IN ('text', 'video', 'image', 'pdf', 'url', '3d_model'));
