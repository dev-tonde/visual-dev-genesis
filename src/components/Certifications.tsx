import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Calendar, ExternalLink, BookOpen } from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
  modules: string[];
  credentialUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

const Certifications = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const certifications = {
    ai: [
      {
        id: 'ai-1',
        title: 'Machine Learning Specialist',
        issuer: 'Google Cloud',
        date: '2024',
        description: 'Comprehensive certification covering advanced machine learning techniques, neural networks, and AI model deployment.',
        skills: ['TensorFlow', 'PyTorch', 'Neural Networks', 'Deep Learning', 'Computer Vision'],
        modules: [
          'Introduction to Machine Learning',
          'Supervised Learning Algorithms',
          'Unsupervised Learning Techniques',
          'Deep Learning with Neural Networks',
          'Computer Vision Applications',
          'Natural Language Processing',
          'Model Deployment and MLOps'
        ],
        credentialUrl: 'https://cloud.google.com/certification',
        level: 'Expert' as const
      },
      {
        id: 'ai-2',
        title: 'AI Ethics and Responsible AI',
        issuer: 'Stanford University',
        date: '2024',
        description: 'Focus on ethical AI development, bias mitigation, and responsible deployment of AI systems.',
        skills: ['AI Ethics', 'Bias Detection', 'Fairness', 'Transparency', 'Accountability'],
        modules: [
          'Foundations of AI Ethics',
          'Bias in AI Systems',
          'Fairness and Accountability',
          'Transparency in AI',
          'Privacy and Security',
          'Regulatory Compliance'
        ],
        level: 'Advanced' as const
      }
    ],
    development: [
      {
        id: 'dev-1',
        title: 'Full Stack Developer Professional',
        issuer: 'Meta',
        date: '2023',
        description: 'Comprehensive full-stack development certification covering modern web technologies and best practices.',
        skills: ['React', 'Node.js', 'MongoDB', 'GraphQL', 'TypeScript', 'AWS'],
        modules: [
          'Frontend Development with React',
          'Backend Development with Node.js',
          'Database Design and Management',
          'API Development and GraphQL',
          'Authentication and Security',
          'Cloud Deployment and DevOps',
          'Testing and Quality Assurance'
        ],
        credentialUrl: 'https://developers.facebook.com/programs/',
        level: 'Expert' as const
      },
      {
        id: 'dev-2',
        title: 'Cloud Native Developer',
        issuer: 'AWS',
        date: '2023',
        description: 'Specialized in cloud-native application development using containerization and microservices.',
        skills: ['Docker', 'Kubernetes', 'AWS Lambda', 'Microservices', 'DevOps'],
        modules: [
          'Containerization with Docker',
          'Orchestration with Kubernetes',
          'Serverless Architecture',
          'Microservices Design Patterns',
          'CI/CD Pipelines',
          'Monitoring and Observability'
        ],
        level: 'Advanced' as const
      }
    ],
    frontend: [
      {
        id: 'fe-1',
        title: 'React Expert Certification',
        issuer: 'React Training',
        date: '2023',
        description: 'Advanced React development certification covering hooks, context, performance optimization, and testing.',
        skills: ['React', 'TypeScript', 'Testing', 'Performance', 'State Management'],
        modules: [
          'Advanced React Patterns',
          'Performance Optimization',
          'Testing Strategies',
          'State Management Solutions',
          'Server-Side Rendering',
          'React Native Development'
        ],
        credentialUrl: 'https://reacttraining.com',
        level: 'Expert' as const
      },
      {
        id: 'fe-2',
        title: 'UI/UX Design Systems',
        issuer: 'Design Systems University',
        date: '2024',
        description: 'Comprehensive training in creating and maintaining scalable design systems for modern applications.',
        skills: ['Design Systems', 'Figma', 'Component Libraries', 'Accessibility', 'Design Tokens'],
        modules: [
          'Design System Fundamentals',
          'Component Design Principles',
          'Accessibility Guidelines',
          'Design Token Management',
          'Documentation and Governance',
          'Cross-Platform Consistency'
        ],
        level: 'Advanced' as const
      }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-blue-500/20 text-blue-400';
      case 'Advanced': return 'bg-purple-500/20 text-purple-400';
      case 'Expert': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const CertificationCard = ({ cert }: { cert: Certification }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="glass-vibrant border-0 h-full hover-glow transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <Badge className={getLevelColor(cert.level)}>{cert.level}</Badge>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {cert.date}
            </div>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {cert.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">{cert.issuer}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {cert.description}
          </p>
          
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

          <div className="flex gap-2 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 hover-lift">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    {cert.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{cert.issuer}</p>
                      <Badge className={getLevelColor(cert.level)}>{cert.level}</Badge>
                    </div>
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

                  {cert.credentialUrl && (
                    <div className="pt-4 border-t">
                      <Button asChild className="w-full gradient-primary">
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Credential
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {cert.credentialUrl && (
              <Button size="sm" className="flex-1 gradient-primary hover-lift" asChild>
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
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
    <section id="certifications" className="px-4">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Certifications & Achievements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Continuous learning and professional development across multiple domains
            </p>
          </motion.div>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="ai">AI & Machine Learning</TabsTrigger>
              <TabsTrigger value="development">App Development</TabsTrigger>
              <TabsTrigger value="frontend">Frontend & Design</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-6">
              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
                {certifications.ai.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="development" className="space-y-6">
              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
                {certifications.development.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="frontend" className="space-y-6">
              <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
                {certifications.frontend.map((cert) => (
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