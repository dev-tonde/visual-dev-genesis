import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import { 
  Mail, Calendar, Search, Filter, CheckCircle, 
  XCircle, Loader2, ExternalLink, Trash2, MailOpen
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { ContactSubmissionStatus } from '@/lib/contact';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { sanitizeSearchInput } from '@/lib/sanitize';

type ContactSubmission = Tables<'contact_submissions'>;

const ContactInboxPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactSubmissionStatus | 'all'>('all');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contact submissions',
        variant: 'destructive'
      });
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }, [toast]);

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
            variant: 'destructive'
          });
          navigate('/');
          return;
        }

        setIsAdmin(true);
        await fetchSubmissions();
      } catch (err) {
        console.error('Unexpected error:', err);
        navigate('/');
      }
    };

    void checkAdmin();
  }, [fetchSubmissions, navigate, toast, user]);

  const normalizedSearchTerm = searchTerm.toLowerCase();
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = normalizedSearchTerm === '' || (
      submission.name.toLowerCase().includes(normalizedSearchTerm) ||
      submission.email.toLowerCase().includes(normalizedSearchTerm) ||
      submission.message.toLowerCase().includes(normalizedSearchTerm)
    );
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: ContactSubmissionStatus) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Status updated successfully'
      });
      await fetchSubmissions();
    }
  };

  const deleteSubmission = async (id: string) => {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Submission deleted successfully'
      });
      await fetchSubmissions();
    }
  };

  const getStatusColor = (status: ContactSubmissionStatus) => {
    switch (status) {
      case 'responded': return 'bg-green-500/20 text-green-400';
      case 'read': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead
          title="Contact Inbox - Tonderai Matanga"
          description="Private inbox for inbound contact submissions."
          url="https://iamtonde.co.za/admin/contacts"
          noIndex
        />
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <SEOHead
        title="Contact Inbox - Tonderai Matanga"
        description="Private inbox for inbound contact submissions."
        url="https://iamtonde.co.za/admin/contacts"
        noIndex
      />
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Contact Inbox
          </h1>
          <p className="text-muted-foreground">
            Review, triage, and respond to inbound project inquiries.
          </p>
        </div>

      {/* Filters */}
      <Card className="glass border-0 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </p>
            <Button variant="outline" size="sm" onClick={fetchSubmissions}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card className="glass border-0">
            <CardContent className="p-12 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Submissions Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No contact form submissions yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="glass border-0 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {submission.name}
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <a 
                        href={`mailto:${submission.email}`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {submission.email}
                      </a>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(submission.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {submission.message}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${submission.email}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Reply via Email
                  </Button>
                  
                  {submission.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(submission.id, 'read')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <MailOpen className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}

                  {submission.status !== 'responded' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(submission.id, 'responded')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Responded
                    </Button>
                  )}
                  
                  {submission.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(submission.id, 'pending')}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark as Pending
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the contact submission from {submission.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteSubmission(submission.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default ContactInboxPage;
