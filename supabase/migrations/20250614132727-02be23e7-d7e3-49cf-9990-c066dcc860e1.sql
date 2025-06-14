
-- Add unique index for upsert using (student_id, module_id, content_id)
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_student_id_module_id_content_id_key
  ON public.student_progress (student_id, module_id, content_id)
  WHERE content_id IS NOT NULL;

-- Add unique index for upsert using (student_id, module_id, topic_id, content_id)
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_student_id_module_id_topic_id_content_id_key
  ON public.student_progress (student_id, module_id, topic_id, content_id)
  WHERE content_id IS NOT NULL AND topic_id IS NOT NULL;

-- (Retain the existing index on student_id, content_id for compatibility)
