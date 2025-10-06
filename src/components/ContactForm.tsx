import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters')
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  variants: any;
}

const ContactForm = ({ variants }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });

  // Real-time validation states
  const watchedValues = form.watch();
  const { errors, isValid } = form.formState;

  const submitWithRetry = async (data: ContactFormData, retryCount = 0) => {
    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          name: data.name,
          email: data.email,
          message: data.message
        });

      if (dbError) throw dbError;

      // Call edge function to send email
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: data
      });

      if (emailError) {
        const errorData = emailError.message ? JSON.parse(emailError.message) : emailError;
        
        // Handle specific error types with retry logic
        if (errorData.error === 'RATE_LIMIT_EXCEEDED' && retryCount < 2) {
          const retryAfter = errorData.retryAfter || 60000;
          
          toast({
            title: "Rate limit exceeded",
            description: `Too many requests. Retrying in ${Math.ceil(retryAfter / 1000)} seconds...`,
            variant: "destructive",
          });

          setRetryTimeout(retryAfter);
          setTimeout(() => {
            setRetryTimeout(null);
            submitWithRetry(data, retryCount + 1);
          }, retryAfter);
          
          return;
        }
        
        if ((errorData.error === 'NETWORK_ERROR' || errorData.error === 'CONTACT_SEND_FAILED') && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          
          toast({
            title: "Connection issue",
            description: `Retrying in ${delay / 1000} seconds...`,
            variant: "destructive",
          });

          setTimeout(() => submitWithRetry(data, retryCount + 1), delay);
          return;
        }
        
        // Final error handling
        toast({
          title: errorData.error === 'VALIDATION_ERROR' ? "Invalid input" : "Failed to send message",
          description: errorData.message || "Please try again or contact me directly via email.",
          variant: "destructive",
        });
        
        throw emailError;
      }

      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. I'll get back to you soon.",
      });

      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      
      if (retryCount === 0) {
        toast({
          title: "Failed to send message",
          description: "Please try again or contact me directly via email.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: ContactFormData) => submitWithRetry(data, 0);

  return (
    <motion.div variants={variants}>
      <Card className="glass border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl">Send a Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Name
                      {watchedValues.name && !errors.name && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {errors.name && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Name"
                        className={`glass border-0 shadow-sm transition-all duration-300 ${
                          watchedValues.name && !errors.name 
                            ? 'ring-1 ring-green-500/30 bg-green-500/5' 
                            : errors.name 
                              ? 'ring-1 ring-red-500/30 bg-red-500/5'
                              : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Email
                      {watchedValues.email && !errors.email && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {errors.email && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        className={`glass border-0 shadow-sm transition-all duration-300 ${
                          watchedValues.email && !errors.email 
                            ? 'ring-1 ring-green-500/30 bg-green-500/5' 
                            : errors.email 
                              ? 'ring-1 ring-red-500/30 bg-red-500/5'
                              : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Message
                      {watchedValues.message && !errors.message && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {errors.message && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell me about your project..."
                        rows={5}
                        className={`glass border-0 resize-none shadow-sm transition-all duration-300 ${
                          watchedValues.message && !errors.message 
                            ? 'ring-1 ring-green-500/30 bg-green-500/5' 
                            : errors.message 
                              ? 'ring-1 ring-red-500/30 bg-red-500/5'
                              : ''
                        }`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {watchedValues.message?.length || 0}/1000 characters
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full gradient-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                size="lg"
                disabled={isSubmitting || !!retryTimeout}
                aria-label={
                  isSubmitting 
                    ? "Sending message..." 
                    : retryTimeout 
                      ? `Retrying in ${Math.ceil(retryTimeout / 1000)} seconds...`
                      : "Send message"
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin icon-primary" />
                    Sending...
                  </>
                ) : retryTimeout ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin icon-primary" />
                    Retrying in {Math.ceil(retryTimeout / 1000)}s...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 icon-primary" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContactForm;