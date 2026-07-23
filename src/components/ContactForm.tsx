import { motion, type Variants } from 'framer-motion';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PROFILE } from '@/config/profile';
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
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();

  // Anti-abuse evidence: when the form was first rendered (server enforces a
  // minimum completion time), plus a honeypot field bots tend to fill in.
  const formStartedAt = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  // Real-time validation states
  const watchedValues = form.watch();
  const { errors } = form.formState;

  const submitWithRetry = async (data: ContactFormData, retryCount = 0) => {
    setIsSubmitting(true);

    try {
      // The /api/contact serverless function validates input and sends the email.
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startedAt: formStartedAt.current,
          website: honeypotRef.current?.value ?? '',
        }),
      });

      const responseData: unknown = await response.json().catch(() => null);

      const errorData = !response.ok
        ? parseContactFunctionError(responseData)
        : isContactFunctionErrorPayload(responseData)
          ? responseData
          : null;

      if (errorData) {
        // Rate limited: tell the person when to retry instead of retrying automatically.
        if (errorData.error === 'RATE_LIMIT_EXCEEDED') {
          const retryAfterMs = errorData.retryAfter || 60000;
          const minutes = Math.max(1, Math.ceil(retryAfterMs / 60000));
          const description = `Please try again in about ${minutes} minute${minutes === 1 ? '' : 's'}, or email me directly at ${PROFILE.email}.`;

          setStatusMessage(description);
          toast({
            title: 'Too many messages',
            description,
            variant: 'destructive',
          });

          return;
        }

        if (errorData.error === 'NETWORK_ERROR' && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff

          toast({
            title: 'Connection issue',
            description: `Retrying in ${delay / 1000} seconds...`,
            variant: 'destructive',
          });

          setTimeout(() => submitWithRetry(data, retryCount + 1), delay);
          return;
        }

        const description = errorData.details?.[0] || errorData.message;
        setStatusMessage(description);
        toast({
          title:
            errorData.error === 'VALIDATION_ERROR' ? 'Invalid input' : 'Failed to send message',
          description,
          variant: 'destructive',
        });

        return;
      }

      const successMessage = isContactFunctionSuccessPayload(responseData)
        ? responseData.message
        : "Thank you for your message. I'll get back to you soon.";

      setStatusMessage(successMessage);
      toast({
        title: 'Message sent successfully!',
        description: successMessage,
      });

      form.reset();
      formStartedAt.current = Date.now(); // restart timing evidence for a follow-up message
    } catch (error) {
      // Only log errors in development
      if (import.meta.env.DEV) {
        console.error('Form submission error:', error);
      }

      if (retryCount === 0) {
        const description = 'Please try again or contact me directly via email.';
        setStatusMessage(description);
        toast({
          title: 'Failed to send message',
          description,
          variant: 'destructive',
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
              {/*
                Honeypot: invisible to people (aria-hidden removes it from the
                accessibility tree, tabIndex -1 removes it from keyboard order,
                inert styling hides it visually). Bots that fill it are
                rejected server-side.
              */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >
                <label htmlFor="contact-website-field">Leave this field empty</label>
                <input
                  id="contact-website-field"
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>
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
                      {errors.name && <XCircle className="w-4 h-4 text-red-500" />}
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
                        onChange={(event) =>
                          field.onChange(sanitizeSingleLineInput(event.target.value))
                        }
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
                      {errors.email && <XCircle className="w-4 h-4 text-red-500" />}
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
                      {errors.message && <XCircle className="w-4 h-4 text-red-500" />}
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
                        onChange={(event) =>
                          field.onChange(sanitizeMultilineInput(event.target.value))
                        }
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
                aria-label={isSubmitting ? 'Sending message...' : 'Send message'}
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

              {/* Screen-reader announcement of the latest submission outcome. */}
              <p role="status" aria-live="polite" className="sr-only">
                {statusMessage}
              </p>

              <p className="text-xs text-muted-foreground text-center">
                Prefer email? Reach me directly at{' '}
                <a href={PROFILE.emailHref} className="underline hover:text-foreground">
                  {PROFILE.email}
                </a>
                .
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContactForm;
