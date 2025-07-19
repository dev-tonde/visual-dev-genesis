-- Enable RLS on all tables that need it
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for enrollments
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for vitals
CREATE POLICY "Users can view their own vitals" ON public.vitals
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = vitals.patient_id 
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Healthcare providers can view patient vitals" ON public.vitals
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'healthcare_provider'
  )
);

CREATE POLICY "Healthcare providers can insert vitals" ON public.vitals
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'healthcare_provider'
  )
);

-- Create RLS policies for patients
CREATE POLICY "Users can view their own patient record" ON public.patients
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Healthcare providers can view all patients" ON public.patients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'healthcare_provider'
  )
);

CREATE POLICY "Users can create their own patient record" ON public.patients
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for courses
CREATE POLICY "Anyone can view published courses" ON public.courses
FOR SELECT USING (true);

CREATE POLICY "Tutors can manage their own courses" ON public.courses
FOR ALL USING (auth.uid() = tutor_id);

-- Create RLS policies for progress
CREATE POLICY "Users can view their own progress" ON public.progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.progress
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON public.progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for resources
CREATE POLICY "Anyone can view resources" ON public.resources
FOR SELECT USING (true);

-- Create RLS policies for badges
CREATE POLICY "Anyone can view badges" ON public.badges
FOR SELECT USING (true);

-- Create RLS policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for enrollments
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for medications
CREATE POLICY "Users can view their own medications" ON public.medications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = medications.patient_id 
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Healthcare providers can manage medications" ON public.medications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'healthcare_provider'
  )
);

-- Create RLS policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.alerts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = alerts.patient_id 
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Healthcare providers can manage alerts" ON public.alerts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'healthcare_provider'
  )
);

-- Create RLS policies for care_notes
CREATE POLICY "Users can view care notes for their patients" ON public.care_notes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.patients 
    WHERE patients.id = care_notes.patient_id 
    AND patients.user_id = auth.uid()
  )
);

CREATE POLICY "Healthcare providers can manage care notes" ON public.care_notes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'healthcare_provider'
  )
);

-- Create RLS policies for audit_logs (restricted access)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Fix the function search path security issue
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Add updated_at triggers for tables that need them
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();