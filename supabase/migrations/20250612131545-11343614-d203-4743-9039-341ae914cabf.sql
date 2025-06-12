
-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT,
  department TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  syllabus TEXT,
  difficulty_level TEXT DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student progress table
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, topic_id)
);

-- Enable RLS on all tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers table
CREATE POLICY "Teachers can view their own profile"
  ON public.teachers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all teachers"
  ON public.teachers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert teachers"
  ON public.teachers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update teachers"
  ON public.teachers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete teachers"
  ON public.teachers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for modules table
CREATE POLICY "Everyone can view active modules"
  ON public.modules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all modules"
  ON public.modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for topics table
CREATE POLICY "Everyone can view topics"
  ON public.topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules 
      WHERE id = topics.module_id AND is_active = true
    )
  );

CREATE POLICY "Admins can manage topics"
  ON public.topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for student progress table
CREATE POLICY "Students can view their own progress"
  ON public.student_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress"
  ON public.student_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress"
  ON public.student_progress FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all student progress"
  ON public.student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
