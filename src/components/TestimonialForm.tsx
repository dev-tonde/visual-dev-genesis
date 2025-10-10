import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

const testimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  company: z.string().trim().min(1, "Company is required").max(100, "Company must be less than 100 characters"),
  content: z.string().trim().min(10, "Testimonial must be at least 10 characters").max(1000, "Testimonial must be less than 1000 characters")
});

const TestimonialForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    content: ''
  });

  useEffect(() => {
    if (user) {
      // Pre-fill from user metadata (Google sign-in)
      const metadata = user.user_metadata;
      setFormData(prev => ({
        ...prev,
        name: prev.name || metadata?.full_name || metadata?.name || ''
      }));
      
      // Set profile picture from Google
      if (metadata?.avatar_url || metadata?.picture) {
        setProfilePictureUrl(metadata.avatar_url || metadata.picture);
      }
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/submit-testimonial`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (5MB)
    if (file.size > 5242880) {
      toast({
        title: 'Error',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only JPEG, PNG, WebP, and GIF images are allowed',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('testimonial-avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('testimonial-avatars')
        .getPublicUrl(fileName);

      setProfilePictureUrl(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Profile picture uploaded successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a testimonial',
        variant: 'destructive'
      });
      return;
    }

    // Validate form data
    try {
      testimonialSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.issues[0].message,
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase
      .from('testimonials')
      .insert({
        user_id: user.id,
        name: formData.name.trim(),
        title: formData.title.trim(),
        company: formData.company.trim(),
        content: formData.content.trim(),
        profile_picture_url: profilePictureUrl || null,
        status: 'pending'
      });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit testimonial',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Your testimonial has been submitted for review'
      });
      setFormData({ name: '', title: '', company: '', content: '' });
      setProfilePictureUrl('');
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Submit a Testimonial</CardTitle>
            <CardDescription>
              Sign in with Google to share your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full"
              variant="outline"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Submit Your Testimonial</CardTitle>
          <CardDescription>
            Share your experience working with Tonderai
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profilePictureUrl} alt={formData.name} />
                <AvatarFallback>{formData.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">Max 5MB (JPEG, PNG, WebP, GIF)</p>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Title/Position
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Developer"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company
              </label>
              <Input
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Tech Corp"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Testimonial
              </label>
              <Textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your experience..."
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.content.length}/1000 characters
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Testimonial'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialForm;
