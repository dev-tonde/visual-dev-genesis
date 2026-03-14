import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Mail, Users, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';

const OperationsWorkspacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    pendingContacts: 0,
    totalContacts: 0,
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);

    const { data: contacts } = await supabase.from('contact_submissions').select('status');

    const pendingContacts = contacts?.filter((contact) => contact.status === 'pending').length || 0;
    const totalContacts = contacts?.length || 0;

    setStats({
      pendingContacts,
      totalContacts,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');

        if (error || !data) {
          toast({
            title: 'Access Denied',
            description: 'Admin privileges required.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setIsAdmin(true);
        await fetchStats();
      } catch (error) {
        console.error('Unexpected error:', error);
        navigate('/');
      }
    };

    void checkAdmin();
  }, [fetchStats, navigate, toast, user]);

  if (loading) {
    return (
      <>
        <SEOHead
          title="Operations Workspace - Tonderai Matanga"
          description="Private workspace for reviewing incoming contact submissions."
          noIndex
        />
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Operations Workspace - Tonderai Matanga"
        description="Private workspace for reviewing incoming contact submissions."
        noIndex
      />
      <Navigation />

      <div className="min-h-screen bg-background px-4 pb-16 pt-24">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent">
                Operations Workspace
              </h1>
              <p className="text-muted-foreground">
                Review inbound contact submissions and jump into the private workspace tools that
                still matter.
              </p>
            </div>

            <div className="mb-8">
              <Card className="glass border-0 overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/contacts')}>
                      Open Inbox
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                  <CardTitle className="text-2xl">Contact Inbox</CardTitle>
                  <CardDescription>
                    Review and respond to inbound contact submissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div className="mb-1 text-3xl font-bold text-primary">
                        {stats.pendingContacts}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 text-3xl font-bold">{stats.totalContacts}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Workspace Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/contacts')}
                    className="justify-start"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Open Contact Inbox
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/profile')}
                    className="justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Account Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OperationsWorkspacePage;
