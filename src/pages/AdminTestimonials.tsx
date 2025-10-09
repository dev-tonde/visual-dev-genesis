import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface Testimonial {
  id: string;
  user_id: string;
  title: string;
  company: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminTestimonials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchTestimonials();
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select(`
        *,
        profiles!testimonials_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive'
      });
    } else {
      setTestimonials((data as any) || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('testimonials')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update testimonial',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: `Testimonial ${status}`
      });
      fetchTestimonials();
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Testimonial deleted'
      });
      fetchTestimonials();
    }
  };

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {testimonial.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{testimonial.profiles?.full_name || 'Unknown User'}</h4>
              <p className="text-sm text-muted-foreground">
                {testimonial.title} at {testimonial.company}
              </p>
              <p className="text-xs text-muted-foreground">{testimonial.profiles?.email}</p>
            </div>
          </div>
          <Badge variant={
            testimonial.status === 'approved' ? 'default' :
            testimonial.status === 'rejected' ? 'destructive' : 'secondary'
          }>
            {testimonial.status}
          </Badge>
        </div>

        <p className="text-sm mb-4 italic">"{testimonial.content}"</p>

        <div className="text-xs text-muted-foreground mb-4">
          Submitted: {new Date(testimonial.created_at).toLocaleDateString()}
        </div>

        <div className="flex gap-2">
          {testimonial.status !== 'approved' && (
            <Button
              size="sm"
              onClick={() => updateStatus(testimonial.id, 'approved')}
            >
              Approve
            </Button>
          )}
          {testimonial.status !== 'rejected' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus(testimonial.id, 'rejected')}
            >
              Reject
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteTestimonial(testimonial.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const rejectedTestimonials = testimonials.filter(t => t.status === 'rejected');

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">Manage Testimonials</CardTitle>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingTestimonials.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedTestimonials.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedTestimonials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingTestimonials.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending testimonials
                </CardContent>
              </Card>
            ) : (
              pendingTestimonials.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedTestimonials.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No approved testimonials
                </CardContent>
              </Card>
            ) : (
              approvedTestimonials.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedTestimonials.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No rejected testimonials
                </CardContent>
              </Card>
            ) : (
              rejectedTestimonials.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminTestimonials;
