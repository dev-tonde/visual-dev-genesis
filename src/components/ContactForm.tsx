import { motion, type Variants } from 'framer-motion';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  contactFormSchema,
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  type ContactFormData,
  isContactFunctionErrorPayload,
  isContactFunctionSuccessPayload,
  parseContactFunctionError,
} from '@/lib/contact';
import {
  sanitizeEmailInput,
  sanitizeMultilineInput,
  sanitizeSingleLineInput,
} from '@/lib/sanitize';

interface ContactFormProps {
  variants: Variants;
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
  const { errors } = form.formState;

  const submitWithRetry = async (data: ContactFormData, retryCount = 0) => {
    setIsSubmitting(true);

    try {
      // ONLY call edge function - it handles database insert and email sending
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-contact-email', {
        body: data
      });

      const errorData = functionError
        ? parseContactFunctionError(functionError)
        : isContactFunctionErrorPayload(responseData)
          ? responseData
          : null;

      if (errorData) {
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

        toast({
          title: errorData.error === 'VALIDATION_ERROR' ? "Invalid input" : "Failed to send message",
          description: errorData.details?.[0] || errorData.message,
          variant: "destructive",
        });

        return;
      }

      const successMessage = isContactFunctionSuccessPayload(responseData)
        ? responseData.message
        : "Thank you for your message. I'll get back to you soon.";

      setRetryTimeout(null);
      toast({
        title: "Message sent successfully!",
        description: successMessage,
      });

      form.reset();
    } catch (error) {
      // Only log errors in development
      if (import.meta.env.DEV) {
        console.error('Form submission error:', error);
      }
      
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
                        maxLength={CONTACT_NAME_MAX_LENGTH}
                        className={`glass border-0 shadow-sm transition-all duration-300 ${
                          watchedValues.name && !errors.name 
                            ? 'ring-1 ring-green-500/30 bg-green-500/5' 
                            : errors.name 
                              ? 'ring-1 ring-red-500/30 bg-red-500/5'
                              : ''
                        }`}
                        {...field}
                        onChange={(event) => field.onChange(sanitizeSingleLineInput(event.target.value))}
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
                        onChange={(event) => field.onChange(sanitizeEmailInput(event.target.value))}
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
                        maxLength={CONTACT_MESSAGE_MAX_LENGTH}
                        className={`glass border-0 resize-none shadow-sm transition-all duration-300 ${
                          watchedValues.message && !errors.message 
                            ? 'ring-1 ring-green-500/30 bg-green-500/5' 
                            : errors.message 
                              ? 'ring-1 ring-red-500/30 bg-red-500/5'
                              : ''
                        }`}
                        {...field}
                        onChange={(event) => field.onChange(sanitizeMultilineInput(event.target.value))}
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
