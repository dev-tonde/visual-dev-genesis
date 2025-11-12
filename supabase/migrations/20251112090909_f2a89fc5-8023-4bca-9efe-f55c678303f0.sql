-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update is_admin() to use the secure has_role function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- Create RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Protect users.role column from updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile (role protected)"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent role column from being changed by users
  role = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- Migrate existing admins from admin_users table to user_roles
-- Only migrate valid users that exist in auth.users
INSERT INTO public.user_roles (user_id, role)
SELECT a.user_id, 'admin'::app_role
FROM public.admin_users a
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE id = a.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Also add any users in the users table with admin role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM public.users u
WHERE u.role = 'admin'::user_role
  AND EXISTS (
    SELECT 1 FROM auth.users WHERE id = u.id
  )
ON CONFLICT (user_id, role) DO NOTHING;