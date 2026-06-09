
-- Create enum for course types
CREATE TYPE public.course_type AS ENUM ('전공필수', '전공선택', '교양필수', '교양선택', '자유선택');

-- Create enum for liberal arts areas
CREATE TYPE public.liberal_arts_area AS ENUM ('인문', '사회', '자연', '예술체육', '융합', '기타');

-- Departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_credits_required INTEGER NOT NULL DEFAULT 130,
  major_required_credits INTEGER NOT NULL DEFAULT 0,
  major_elective_credits INTEGER NOT NULL DEFAULT 0,
  general_required_credits INTEGER NOT NULL DEFAULT 0,
  general_elective_credits INTEGER NOT NULL DEFAULT 0,
  free_elective_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);

-- Courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  course_code TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  course_type course_type NOT NULL,
  target_year INTEGER NOT NULL CHECK (target_year BETWEEN 1 AND 4),
  target_semester INTEGER NOT NULL CHECK (target_semester BETWEEN 1 AND 2),
  liberal_arts_area liberal_arts_area,
  prerequisite_course_id UUID REFERENCES public.courses(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- Student records table
CREATE TABLE public.student_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) NOT NULL,
  current_year INTEGER NOT NULL CHECK (current_year BETWEEN 1 AND 4),
  current_semester INTEGER NOT NULL CHECK (current_semester BETWEEN 1 AND 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own records" ON public.student_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own records" ON public.student_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON public.student_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON public.student_records FOR DELETE USING (auth.uid() = user_id);

-- Completed courses (junction table)
CREATE TABLE public.completed_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_record_id UUID REFERENCES public.student_records(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed_year INTEGER NOT NULL,
  completed_semester INTEGER NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_record_id, course_id)
);

ALTER TABLE public.completed_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own completed courses" ON public.completed_courses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.student_records sr WHERE sr.id = student_record_id AND sr.user_id = auth.uid())
);
CREATE POLICY "Users can add own completed courses" ON public.completed_courses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.student_records sr WHERE sr.id = student_record_id AND sr.user_id = auth.uid())
);
CREATE POLICY "Users can delete own completed courses" ON public.completed_courses FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.student_records sr WHERE sr.id = student_record_id AND sr.user_id = auth.uid())
);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_student_records_updated_at
  BEFORE UPDATE ON public.student_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
