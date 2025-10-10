-- Add name and profile picture to testimonials
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add avatar_url to profiles for Google sign-in pictures
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for testimonial profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonial-avatars', 
  'testimonial-avatars', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for testimonial avatars
CREATE POLICY "Anyone can view testimonial avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-avatars');

CREATE POLICY "Authenticated users can upload their avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'testimonial-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'testimonial-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'testimonial-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);