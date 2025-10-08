-- Fix Critical Security Issues: Remove Public Access to Sensitive Tables

-- 1. Fix profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- 2. Fix page_views table
DROP POLICY IF EXISTS "Public can view aggregated analytics" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;

CREATE POLICY "Admins can view page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

-- 3. Create aggregated public analytics view (safe, no PII)
CREATE OR REPLACE VIEW public.public_analytics AS
SELECT 
  page_path,
  DATE(created_at) as visit_date,
  COUNT(*) as visit_count
FROM public.page_views
GROUP BY page_path, DATE(created_at);

GRANT SELECT ON public.public_analytics TO anon, authenticated;