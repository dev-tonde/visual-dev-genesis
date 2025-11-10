import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Users, BarChart3, Loader2, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';

const AdminHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    pendingTestimonials: 0,
    pendingContacts: 0,
    totalTestimonials: 0,
    totalContacts: 0
  });

  useEffect(() => {
    checkAdmin();
  }, [user]);

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
          variant: 'destructive'
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchStats();
    } catch (err) {
      console.error('Unexpected error:', err);
      navigate('/');
    }
  };

  const fetchStats = async () => {
    setLoading(true);

    // Fetch testimonial stats
    const { data: testimonials } = await supabase
      .from('testimonials')
      .select('status');

    const pendingTestimonials = testimonials?.filter(t => t.status === 'pending').length || 0;
    const totalTestimonials = testimonials?.length || 0;

    // Fetch contact stats
    const { data: contacts } = await supabase
      .from('contact_submissions')
      .select('status');

    const pendingContacts = contacts?.filter(c => c.status === 'pending').length || 0;
    const totalContacts = contacts?.length || 0;

    setStats({
      pendingTestimonials,
      pendingContacts,
      totalTestimonials,
      totalContacts
    });

    setLoading(false);
  };

  const adminSections = [
    {
      title: 'Testimonials',
      description: 'Review, approve, or reject testimonial submissions',
      icon: MessageSquare,
      path: '/admin/testimonials',
      stats: [
        { label: 'Pending', value: stats.pendingTestimonials, highlight: true },
        { label: 'Total', value: stats.totalTestimonials }
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Contact Submissions',
      description: 'View and respond to contact form submissions',
      icon: Mail,
      path: '/admin/contacts',
      stats: [
        { label: 'Pending', value: stats.pendingContacts, highlight: true },
        { label: 'Total', value: stats.totalContacts }
      ],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Admin Dashboard - Tonderai Matanga"
          description="Admin dashboard for managing content"
        />
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <SEOHead 
        title="Admin Dashboard - Tonderai Matanga"
        description="Admin dashboard for managing content"
      />
      <Navigation />
      
      <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Manage your portfolio content from here.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {adminSections.map((section, index) => (
                <motion.div
                  key={section.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="glass border-0 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className={`h-1 bg-gradient-to-r ${section.color}`} />
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${section.color} bg-opacity-10`}>
                          <section.icon className="w-6 h-6 text-primary" />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(section.path)}
                          className="group-hover:translate-x-1 transition-transform"
                        >
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                      <CardTitle className="text-2xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-6">
                        {section.stats.map((stat) => (
                          <div key={stat.label} className="flex-1">
                            <div className={`text-3xl font-bold mb-1 ${stat.highlight ? 'text-primary' : ''}`}>
                              {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/testimonials')}
                    className="justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manage Testimonials
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/contacts')}
                    className="justify-start"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    View Contact Forms
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                    className="justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    My Profile
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

export default AdminHub;
