
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS admission_year INTEGER NOT NULL DEFAULT 2025;
CREATE INDEX IF NOT EXISTS idx_courses_dept_year ON public.courses(department_id, admission_year);

CREATE TABLE IF NOT EXISTS public.department_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL,
  admission_year INTEGER NOT NULL,
  total_credits_required INTEGER NOT NULL DEFAULT 130,
  major_required_credits INTEGER NOT NULL DEFAULT 0,
  major_elective_credits INTEGER NOT NULL DEFAULT 0,
  general_required_credits INTEGER NOT NULL DEFAULT 0,
  general_elective_credits INTEGER NOT NULL DEFAULT 0,
  bsm_credits INTEGER NOT NULL DEFAULT 0,
  design_credits INTEGER NOT NULL DEFAULT 0,
  free_elective_credits INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (department_id, admission_year)
);

GRANT SELECT ON public.department_requirements TO anon, authenticated;
GRANT ALL ON public.department_requirements TO service_role;

ALTER TABLE public.department_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view department_requirements"
ON public.department_requirements FOR SELECT
USING (true);
