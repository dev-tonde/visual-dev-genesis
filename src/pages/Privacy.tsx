import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Database, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SEOHead from '@/components/SEOHead';
import { Link } from 'react-router-dom';

const Privacy = () => {
  const lastUpdated = 'December 2024';

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <SEOHead
        title="Privacy Policy - Tonderai Matanga"
        description="Learn how we protect your privacy and handle your data on our portfolio website. Transparent privacy practices and data protection."
        url="https://iamtonde.co.za/privacy"
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-primary/20 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Portfolio
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Privacy Policy</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Your Privacy Matters
                </CardTitle>
                <CardDescription>
                  This privacy policy explains how we collect, use, and protect your information
                  when you visit our portfolio website. Last updated: {lastUpdated}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We are committed to protecting your privacy and being transparent about our data
                  practices. This policy outlines what information we collect, how we use it, and
                  your rights regarding your data.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary">
                    <strong>Do Not Track:</strong> We respect the "Do Not Track" browser setting. If
                    you have enabled DNT, we will not collect any analytics data about your visit.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Form Data</h3>
                  <p className="text-muted-foreground mb-2">
                    When you use our contact form, we collect:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Your name</li>
                    <li>Email address</li>
                    <li>Message content</li>
                    <li>Submission timestamp</li>
                    <li>
                      A one-way hash of your IP address when available, used only for abuse
                      prevention and rate limiting
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    This information is stored securely and used solely to respond to your inquiry.
                    Raw IP addresses are not stored with contact submissions.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Analytics Data (Optional)</h3>
                  <p className="text-muted-foreground mb-2">
                    With your consent, we may collect basic analytics information:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Pages visited and time spent</li>
                    <li>Browser type and version</li>
                    <li>Device type and screen resolution</li>
                    <li>General geographic location (country/region)</li>
                    <li>Referral source</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    This data is anonymized and used to improve the website experience.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Technical Data</h3>
                  <p className="text-muted-foreground mb-2">
                    Our hosting provider automatically logs:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>IP addresses (for security purposes)</li>
                    <li>Request timestamps</li>
                    <li>HTTP status codes</li>
                    <li>User agent strings</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    This data is automatically deleted after 30 days.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Form Submissions</h3>
                    <p className="text-muted-foreground">
                      Information from contact forms is used exclusively to respond to your
                      inquiries and maintain a record of our communication. We do not share this
                      information with third parties or use it for marketing purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Analytics Data</h3>
                    <p className="text-muted-foreground">
                      Analytics data helps us understand how visitors use our website, which pages
                      are most popular, and how we can improve the user experience. This data is
                      aggregated and anonymized.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Security and Performance</h3>
                    <p className="text-muted-foreground">
                      Technical logs are used to monitor website security, prevent abuse, and ensure
                      optimal performance for all visitors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Services */}
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Email Service (Resend)</h3>
                  <p className="text-muted-foreground">
                    Contact form submissions are processed through Resend to send email
                    notifications. Resend processes your email data according to their privacy
                    policy.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Database (Supabase)</h3>
                  <p className="text-muted-foreground">
                    Contact form data and analytics are stored in a Supabase database with
                    industry-standard encryption and security measures.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">GitHub API</h3>
                  <p className="text-muted-foreground">
                    We use GitHub's public API to display project information. No personal data is
                    shared with GitHub beyond standard API requests.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Data Access and Deletion</h3>
                  <p className="text-muted-foreground">
                    You have the right to request access to any personal data we hold about you or
                    request its deletion. Contact us using the information below to exercise these
                    rights.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Analytics Opt-Out</h3>
                  <p className="text-muted-foreground">
                    You can opt out of analytics tracking at any time using the privacy preferences
                    banner or by enabling "Do Not Track" in your browser settings.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Cookie Management</h3>
                  <p className="text-muted-foreground">
                    We use minimal cookies for essential functionality. You can manage cookies
                    through your browser settings, though this may affect website functionality.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us About Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this privacy policy or how we handle your data,
                  please don't hesitate to contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> hello@iamtonde.co.za
                  </p>
                  <p>
                    <strong>Response Time:</strong> We aim to respond within 48 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Back to Top */}
            <div className="text-center pt-8">
              <Button variant="outline" asChild>
                <Link to="/">Return to Portfolio</Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Privacy;
