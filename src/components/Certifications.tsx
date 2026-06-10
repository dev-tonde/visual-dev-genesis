import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Calendar, ExternalLink, BookOpen } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

interface Certification {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description: string;
  skills: string[];
  modules?: string[];
  credentialUrl?: string;
}

const Certifications = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const certifications = {
    certificates: [
      {
        id: 'cert-meta-fe',
        title: 'Meta Front-End Developer Certificate',
        issuer: 'Meta',
        description:
          'Professional certificate covering front-end development with React, JavaScript, HTML/CSS, and UI testing practices.',
        skills: ['React', 'JavaScript', 'HTML/CSS', 'UI Testing'],
      },
      {
        id: 'cert-google-ux',
        title: 'Google UX Design Professional Certificate',
        issuer: 'Google',
        description:
          'Professional certificate covering the UX design process: research, wireframing, prototyping, and usability testing.',
        skills: ['UX Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
      },
      {
        id: 'cert-scrum',
        title: 'Scrum Master Certification',
        description:
          'Certified in Scrum practices: sprint planning, facilitation, and iterative agile delivery.',
        skills: ['Scrum', 'Agile Delivery', 'Sprint Planning'],
      },
    ],
    education: [
      {
        id: 'edu-bcomm',
        title: 'BComm Honours in Business Administration',
        issuer: 'Midlands State University, Zimbabwe',
        description:
          'Honours degree in Business Administration with a focus on Logistics and Retail Management.',
        skills: ['Business Administration', 'Logistics', 'Retail Management'],
      },
      {
        id: 'edu-coursework',
        title: 'Additional Coursework',
        issuer: 'LinkedIn Learning',
        description: 'Ongoing professional development across modern front-end engineering topics.',
        skills: ['React', 'Next.js', 'TypeScript', 'Accessibility', 'Performance', 'CI/CD'],
      },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const CertificationCard = ({ cert }: { cert: Certification }) => (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="group">
      <Card className="glass-vibrant border-0 flex h-full flex-col transition-shadow duration-300 hover:shadow-md hover-glow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            {cert.date && (
              <div className="flex items-center text-muted-foreground text-sm">
                <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                <time dateTime={cert.date}>{cert.date}</time>
              </div>
            )}
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {cert.title}
          </CardTitle>
          {cert.issuer && (
            <p className="text-sm text-muted-foreground font-medium">{cert.issuer}</p>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{cert.description}</p>

          <div className="flex flex-wrap gap-1">
            {cert.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {cert.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{cert.skills.length - 3} more
              </Badge>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:flex-1"
                  aria-label={`View details for ${cert.title}`}
                >
                  <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" aria-hidden="true" />
                    {cert.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    {cert.issuer && <p className="font-medium mb-2">{cert.issuer}</p>}
                    <p className="text-muted-foreground">{cert.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Skills Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {cert.modules && cert.modules.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Course Modules</h4>
                      <ul className="space-y-2">
                        {cert.modules.map((module, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                            {module}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cert.credentialUrl && (
                    <div className="pt-4 border-t">
                      <Button
                        asChild
                        className="w-full gradient-primary"
                        aria-label={`Verify ${cert.title} certification`}
                      >
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                          Verify Certification
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {cert.credentialUrl && (
              <Button size="sm" className="w-full sm:flex-1 gradient-primary" asChild>
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Verify ${cert.title} certification`}
                >
                  <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                  Verify
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section id="certifications" className="section-shell section-anchor px-4">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <SectionHeading
              label="Credentials"
              title="Certifications & Education"
              description="Professional certificates and formal education behind the work."
            />
          </motion.div>

          <Tabs defaultValue="certificates" className="w-full">
            <TabsList className="mb-8 grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-2">
              <TabsTrigger
                value="certificates"
                aria-label="Professional certificates"
                className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 data-[state=active]:border-primary/60 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Professional Certificates
              </TabsTrigger>
              <TabsTrigger
                value="education"
                aria-label="Education and coursework"
                className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 data-[state=active]:border-primary/60 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Education & Coursework
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certificates" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.certificates.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.education.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default Certifications;
