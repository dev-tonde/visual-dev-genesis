-- Align contact submission storage and admin management with the edge-function flow

ALTER TABLE public.contact_submissions
ADD COLUMN IF NOT EXISTS ip_hash TEXT;

UPDATE public.contact_submissions
SET status = 'pending'
WHERE status IS NULL OR status = 'new';

ALTER TABLE public.contact_submissions
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.contact_submissions
DROP CONSTRAINT IF EXISTS contact_submissions_status_check;

ALTER TABLE public.contact_submissions
ADD CONSTRAINT contact_submissions_status_check
CHECK (status IN ('pending', 'read', 'responded'));

COMMENT ON COLUMN public.contact_submissions.ip_hash IS
'SHA-256 hash of the client IP used for contact-form rate limiting. Raw IP addresses are not stored in this table.';

CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
ON public.contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_email_created_at_idx
ON public.contact_submissions (email, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_ip_hash_created_at_idx
ON public.contact_submissions (ip_hash, created_at DESC)
WHERE ip_hash IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow public inserts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;

CREATE POLICY "Admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
USING (public.is_admin());
