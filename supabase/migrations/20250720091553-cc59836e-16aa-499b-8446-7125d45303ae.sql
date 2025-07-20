-- Enable RLS on tables that are missing it
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fix invites table policies
CREATE POLICY "Admins can manage invites" 
ON public.invites 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Users can accept their own invites" 
ON public.invites 
FOR UPDATE 
USING (email = auth.email());

-- Fix subscriptions table policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (public.is_admin());

-- Add missing policies for email_campaigns
CREATE POLICY "Admins can manage email campaigns" 
ON public.email_campaigns 
FOR ALL 
USING (public.is_admin());

-- Fix overly permissive policies - callback_requests
DROP POLICY IF EXISTS "Staff can update callback requests" ON public.callback_requests;
DROP POLICY IF EXISTS "Staff can view all callback requests" ON public.callback_requests;

CREATE POLICY "Admins can manage callback requests" 
ON public.callback_requests 
FOR ALL 
USING (public.is_admin());

-- Fix overly permissive policies - content_calendar  
DROP POLICY IF EXISTS "Staff can manage content" ON public.content_calendar;

CREATE POLICY "Admins can manage content calendar" 
ON public.content_calendar 
FOR ALL 
USING (public.is_admin());

-- Fix overly permissive policies - support_tickets
DROP POLICY IF EXISTS "Staff can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff can view all tickets" ON public.support_tickets;

CREATE POLICY "Admins can manage all tickets" 
ON public.support_tickets 
FOR ALL 
USING (public.is_admin());

-- Fix overly permissive policies - event_rsvps
DROP POLICY IF EXISTS "Staff can manage RSVPs" ON public.event_rsvps;

CREATE POLICY "Admins can manage all RSVPs" 
ON public.event_rsvps 
FOR ALL 
USING (public.is_admin());

-- Fix overly permissive policies - events
DROP POLICY IF EXISTS "Staff can manage events" ON public.events;

CREATE POLICY "Admins can manage events" 
ON public.events 
FOR ALL 
USING (public.is_admin());

-- Fix overly permissive policies - newsletter_subscribers
DROP POLICY IF EXISTS "Staff can view all subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can view all subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (public.is_admin());

-- Fix contact_submissions admin policy
DROP POLICY IF EXISTS "Admin can read contact submissions" ON public.contact_submissions;

CREATE POLICY "Admins can read contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (public.is_admin());