import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Phone, Calendar, Save, Loader2, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import {
  sanitizePhoneInput,
  sanitizeSingleLineForSubmission,
  sanitizeSingleLineInput,
} from '@/lib/sanitize';

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

const AccountWorkspacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } else if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        company: data.company || '',
      });
    }

    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchProfile();
  }, [fetchProfile, user]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    setSaving(true);

    const sanitizedProfile = {
      full_name: sanitizeSingleLineForSubmission(formData.full_name),
      phone: sanitizePhoneInput(formData.phone).trim(),
      company: sanitizeSingleLineForSubmission(formData.company),
    };

    setFormData(sanitizedProfile);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: sanitizedProfile.full_name,
        phone: sanitizedProfile.phone,
        company: sanitizedProfile.company,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      await fetchProfile();
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <>
        <SEOHead
          title="Account Workspace - Tonderai Matanga"
          description="Private workspace for account details."
          noIndex
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
        title="Account Workspace - Tonderai Matanga"
        description="Private workspace for account details."
        noIndex
      />
      <Navigation />

      <div className="min-h-screen bg-background px-4 pb-16 pt-24">
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
              <h1 className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent">
                Account Workspace
              </h1>
              <p className="text-muted-foreground">
                Update the account details used across private workspace and admin tools.
              </p>
            </div>

            <Card className="glass border-0">
              <CardHeader>
                <div className="mb-4 flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                    <AvatarImage src={profile?.avatar_url || ''} alt={formData.full_name || 'User'} />
                    <AvatarFallback className="bg-primary/10 text-2xl">
                      {formData.full_name?.split(' ').map((name) => name[0]).join('') || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Maintain the contact and company details tied to your account.
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
                    Email cannot be changed here.
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
                    onChange={(event) =>
                      setFormData({ ...formData, full_name: sanitizeSingleLineInput(event.target.value) })
                    }
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
                    onChange={(event) =>
                      setFormData({ ...formData, phone: sanitizePhoneInput(event.target.value) })
                    }
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
                    onChange={(event) =>
                      setFormData({ ...formData, company: sanitizeSingleLineInput(event.target.value) })
                    }
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary">
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
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AccountWorkspacePage;
