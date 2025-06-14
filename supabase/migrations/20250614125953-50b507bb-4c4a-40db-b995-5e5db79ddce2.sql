
-- This migration adds unique constraints to the student_progress table
-- to ensure data integrity for both topic-level summaries and content-level logs.

-- Add a unique constraint for content completion logs.
-- This prevents duplicate entries for the same student and content item.
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_student_id_content_id_key 
ON public.student_progress (student_id, content_id)
WHERE content_id IS NOT NULL;

-- Add a unique constraint for topic progress summaries.
-- This ensures that there is only one summary row per student per topic.
CREATE UNIQUE INDEX IF NOT EXISTS student_progress_student_id_topic_id_key
ON public.student_progress (student_id, topic_id)
WHERE content_id IS NULL;
