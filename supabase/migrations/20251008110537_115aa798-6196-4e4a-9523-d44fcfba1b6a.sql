-- Fix Security Definer View issue
DROP VIEW IF EXISTS public.public_analytics CASCADE;

-- Recreate the view without SECURITY DEFINER (it's not needed for aggregated public data)
CREATE VIEW public.public_analytics 
WITH (security_invoker = true)
AS
SELECT 
  page_path,
  DATE(created_at) as visit_date,
  COUNT(*) as visit_count
FROM public.page_views
GROUP BY page_path, DATE(created_at);

GRANT SELECT ON public.public_analytics TO anon, authenticated;