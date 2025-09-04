import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Clock, Users, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProjectCaseStudies = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const caseStudies = [
    {
      id: 'ecommerce',
      title: 'Modern E-Commerce Platform',
      description: 'A full-stack e-commerce solution with real-time inventory management and AI-powered recommendations.',
      image: '/api/placeholder/600/400',
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AI/ML'],
      timeline: '3 months',
      teamSize: '4 developers',
      impact: '+40% conversion rate',
      challenge: 'Building a scalable platform that could handle high traffic during sales events while maintaining excellent user experience.',
      solution: 'Implemented microservices architecture with Redis caching, optimized database queries, and used CDN for asset delivery.',
      results: [
        '40% increase in conversion rate',
        '60% faster page load times',
        '99.9% uptime during peak sales',
        '25% reduction in bounce rate'
      ],
      liveUrl: 'https://ecommerce.dev-tonde.com',
      githubUrl: 'https://github.com/dev-tonde/ecommerce-platform'
    },
    {
      id: 'task-manager',
      title: 'Collaborative Task Manager',
      description: 'Real-time task management with team collaboration features and advanced analytics.',
      image: '/api/placeholder/600/400',
      tech: ['Next.js', 'TypeScript', 'Prisma', 'WebSocket', 'Chart.js'],
      timeline: '2 months',
      teamSize: '3 developers',
      impact: '+300% team productivity',
      challenge: 'Creating a seamless real-time collaboration experience with complex state management.',
      solution: 'Utilized WebSocket connections for real-time updates and implemented optimistic UI updates for better user experience.',
      results: [
        '300% increase in team productivity',
        'Real-time sync across devices',
        'Advanced analytics dashboard',
        '50% reduction in project delays'
      ],
      liveUrl: 'https://taskmanager.dev-tonde.com',
      githubUrl: 'https://github.com/dev-tonde/task-manager'
    },
    {
      id: 'ai-assistant',
      title: 'AI-Powered Virtual Assistant',
      description: 'Intelligent chatbot with natural language processing and context-aware responses.',
      image: '/api/placeholder/600/400',
      tech: ['React', 'Python', 'OpenAI', 'FastAPI', 'Docker'],
      timeline: '4 months',
      teamSize: '5 developers',
      impact: '85% user satisfaction',
      challenge: 'Building an AI assistant that could understand context and provide meaningful responses across various domains.',
      solution: 'Integrated OpenAI GPT models with custom training data and implemented context management system.',
      results: [
        '85% user satisfaction rate',
        '90% query resolution accuracy',
        '50% reduction in support tickets',
        'Multi-language support'
      ],
      liveUrl: 'https://aiassistant.dev-tonde.com',
      githubUrl: 'https://github.com/dev-tonde/ai-assistant'
    }
  ];

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
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Project Case Studies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deep dives into my development process, challenges faced, and solutions implemented
          </p>
        </motion.div>

        <Tabs defaultValue={caseStudies[0].id} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {caseStudies.map((study) => (
              <TabsTrigger key={study.id} value={study.id} className="text-sm">
                {study.title.split(' ')[0]} {study.title.split(' ')[1]}
              </TabsTrigger>
            ))}
          </TabsList>

          {caseStudies.map((study) => (
            <TabsContent key={study.id} value={study.id}>
              <motion.div variants={itemVariants}>
                <Card className="glass-vibrant border-0 overflow-hidden">
                  <div className="grid lg:grid-cols-2 gap-8 p-8">
                    {/* Project Image */}
                    <div className="relative">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center p-6">
                          <h4 className="text-lg font-semibold mb-2">{study.title}</h4>
                          <p className="text-sm text-muted-foreground">Project Preview</p>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 glass rounded-lg">
                          <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm font-medium">{study.timeline}</p>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                        </div>
                        <div className="text-center p-3 glass rounded-lg">
                          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm font-medium">{study.teamSize}</p>
                          <p className="text-xs text-muted-foreground">Team Size</p>
                        </div>
                        <div className="text-center p-3 glass rounded-lg">
                          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm font-medium">{study.impact}</p>
                          <p className="text-xs text-muted-foreground">Impact</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-3">{study.title}</h3>
                        <p className="text-muted-foreground mb-4">{study.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {study.tech.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-primary">Challenge</h4>
                        <p className="text-sm text-muted-foreground mb-4">{study.challenge}</p>
                        
                        <h4 className="font-semibold mb-2 text-primary">Solution</h4>
                        <p className="text-sm text-muted-foreground mb-4">{study.solution}</p>
                        
                        <h4 className="font-semibold mb-2 text-primary">Results</h4>
                        <ul className="space-y-1 mb-6">
                          {study.results.map((result, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <Button size="sm" className="gradient-primary hover-lift" asChild>
                          <a href={study.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" className="hover-lift" asChild>
                          <a href={study.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            View Code
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </section>
  );
};

export default ProjectCaseStudies;