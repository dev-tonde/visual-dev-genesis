import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Phone, Calendar, Save, Loader2, FileText, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';

interface Profile {
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTestimonials();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive'
      });
    } else if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        company: data.company || ''
      });
    }
    setLoading(false);
  };

  const fetchTestimonials = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTestimonials(data as Testimonial[]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        company: formData.company,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      fetchProfile();
    }

    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Profile - Tonderai Matanga"
          description="Manage your profile and view your testimonials"
        />
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Profile - Tonderai Matanga"
        description="Manage your profile and view your testimonials"
      />
      <Navigation />
      
      <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account information and view your testimonials
              </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="testimonials">
                  My Testimonials ({testimonials.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="glass border-0">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url || ''} alt={formData.full_name || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-2xl">
                          {formData.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+27 XX XXX XXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Company
                      </Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                      </span>
                    </div>

                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="w-full gradient-primary"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="testimonials">
                <div className="space-y-4">
                  {testimonials.length === 0 ? (
                    <Card className="glass border-0">
                      <CardContent className="p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Testimonials Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't submitted any testimonials. Share your experience!
                        </p>
                        <Button onClick={() => navigate('/submit-testimonial')}>
                          Submit Testimonial
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    testimonials.map((testimonial) => (
                      <Card key={testimonial.id} className="glass border-0">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{testimonial.title}</CardTitle>
                              <CardDescription>{testimonial.company}</CardDescription>
                            </div>
                            <Badge className={getStatusColor(testimonial.status)}>
                              {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4 leading-relaxed">
                            "{testimonial.content}"
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Submitted {new Date(testimonial.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Profile;
