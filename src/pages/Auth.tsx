import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SEOHead from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { sanitizeEmailInput, sanitizePasswordInput } from '@/lib/sanitize';

// Secure validation schema
const sanitizeString = <T extends z.ZodTypeAny>(
  sanitizer: (value: string) => string,
  schema: T,
) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? sanitizer(value) : value),
    schema,
  );

const authSchema = z.object({
  email: sanitizeString(
    sanitizeEmailInput,
    z.string()
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters'),
  ),
  password: sanitizeString(
    sanitizePasswordInput,
    z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters'),
  ),
});

type AuthFormData = z.infer<typeof authSchema>;

const AccountAccessPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);

    const { error } = await signIn(data.email.trim(), data.password);
    
    if (error) {
      // Generic error message to prevent user enumeration
      setError('Invalid email or password');
    } else {
      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);

    const { error } = await signUp(data.email.trim(), data.password);
    
    if (error) {
      // Show specific error for signup (user needs to know if email is taken)
      setError(error.message);
    } else {
      toast({
        title: 'Success',
        description: 'Check your email to confirm your account',
      });
      form.reset();
    }
    
    setLoading(false);
  };

  return (
    <>
      <SEOHead 
        title="Account Access - Tonderai Matanga"
        description="Private account access for workspace and admin tools."
        url="https://iamtonde.co.za/auth"
        noIndex
      />
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Account Access</CardTitle>
          <CardDescription>
            Sign in to access private workspace and admin tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'signin' | 'signup');
            setError(null);
            form.reset();
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            disabled={loading}
                            {...field}
                            onChange={(event) => field.onChange(sanitizeEmailInput(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            disabled={loading}
                            {...field}
                            onChange={(event) => field.onChange(sanitizePasswordInput(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            disabled={loading}
                            {...field}
                            onChange={(event) => field.onChange(sanitizeEmailInput(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Min 8 characters"
                            disabled={loading}
                            {...field}
                            onChange={(event) => field.onChange(sanitizePasswordInput(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Must be at least 8 characters
                        </p>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AccountAccessPage;
