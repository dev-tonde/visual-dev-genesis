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

  const onSubmit = async (data: ContactFormData) => {
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
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: data
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
      }

      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. I'll get back to you soon.",
      });

      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact me directly via email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={variants}>
      <Card className="glass border-0">
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
                        className={`glass border-0 shadow-inner transition-all duration-300 ${
                          watchedValues.name && !errors.name 
                            ? 'ring-2 ring-green-500/30 bg-green-500/5 shadow-green-500/20' 
                            : errors.name 
                              ? 'ring-2 ring-red-500/30 bg-red-500/5 shadow-red-500/20'
                              : 'shadow-muted/20'
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
                        className={`glass border-0 shadow-inner transition-all duration-300 ${
                          watchedValues.email && !errors.email 
                            ? 'ring-2 ring-green-500/30 bg-green-500/5 shadow-green-500/20' 
                            : errors.email 
                              ? 'ring-2 ring-red-500/30 bg-red-500/5 shadow-red-500/20'
                              : 'shadow-muted/20'
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
                        className={`glass border-0 resize-none shadow-inner transition-all duration-300 ${
                          watchedValues.message && !errors.message 
                            ? 'ring-2 ring-green-500/30 bg-green-500/5 shadow-green-500/20' 
                            : errors.message 
                              ? 'ring-2 ring-red-500/30 bg-red-500/5 shadow-red-500/20'
                              : 'shadow-muted/20'
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
                disabled={isSubmitting}
                aria-label={isSubmitting ? "Sending message..." : "Send message"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin icon-primary" />
                    Sending...
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