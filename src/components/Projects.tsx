import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Star, GitFork, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGitHubRepos } from '@/hooks/useGitHubRepos';
import { getLanguageColor } from '@/lib/github';
import ProjectFilter from '@/components/ProjectFilter';
import ProjectSkeleton from '@/components/ProjectSkeleton';
import { useState, useMemo } from 'react';

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { repos, loading, error } = useGitHubRepos();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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

  // Fallback projects for when GitHub data is loading or unavailable
  const fallbackProjects = [
    {
      id: 1,
      name: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution built with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.',
      html_url: 'https://github.com',
      homepage: 'https://example.com',
      language: 'TypeScript',
      stargazers_count: 124,
      forks_count: 15,
      topics: ['react', 'nodejs', 'mongodb', 'stripe'],
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      fork: false
    },
    {
      id: 2,
      name: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      html_url: 'https://github.com',
      homepage: 'https://example.com',
      language: 'JavaScript',
      stargazers_count: 89,
      forks_count: 12,
      topics: ['nextjs', 'typescript', 'prisma', 'socketio'],
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      fork: false
    },
    {
      id: 3,
      name: 'Portfolio Website',
      description: 'A responsive portfolio website showcasing my work and skills. Built with modern web technologies and optimized for performance.',
      html_url: 'https://github.com',
      homepage: 'https://example.com',
      language: 'TypeScript',
      stargazers_count: 67,
      forks_count: 8,
      topics: ['react', 'tailwind', 'framer-motion'],
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      fork: false
    }
  ];

  const allProjects = repos.length > 0 ? repos.slice(0, 6) : fallbackProjects;
  
  // Get all available technologies for filtering
  const availableTechs = useMemo(() => {
    const techs = new Set<string>();
    allProjects.forEach(project => {
      if (project.topics) {
        project.topics.forEach(topic => techs.add(topic));
      }
      if (project.language) {
        techs.add(project.language.toLowerCase());
      }
    });
    return Array.from(techs).sort();
  }, [allProjects]);

  // Filter projects based on selected filters
  const displayProjects = useMemo(() => {
    if (selectedFilters.length === 0) return allProjects;
    
    return allProjects.filter(project => {
      const projectTechs = [
        ...(project.topics || []),
        ...(project.language ? [project.language.toLowerCase()] : [])
      ];
      return selectedFilters.some(filter => 
        projectTechs.some(tech => tech.toLowerCase().includes(filter.toLowerCase()))
      );
    });
  }, [allProjects, selectedFilters]);

  return (
    <section id="projects" className="py-20 px-4">
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
              Featured Projects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {loading ? 'Loading my latest projects from GitHub...' : 
               error ? 'Here are some of my featured projects:' :
               'Here are my latest projects from GitHub showcasing my skills and passion for creating amazing digital experiences.'}
            </p>
          </motion.div>

          {!loading && availableTechs.length > 0 && (
            <ProjectFilter
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
              availableTechs={availableTechs}
            />
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <ProjectSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="glass border-0 h-full overflow-hidden hover:shadow-2xl transition-all duration-300 tilt-hover magnetic-button">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center space-x-3 text-muted-foreground">
                          {project.stargazers_count > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span className="text-sm">{project.stargazers_count}</span>
                            </div>
                          )}
                          {project.forks_count > 0 && (
                            <div className="flex items-center space-x-1">
                              <GitFork className="w-4 h-4" />
                              <span className="text-sm">{project.forks_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {project.language && (
                        <div className="flex items-center space-x-2 mb-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getLanguageColor(project.language) }}
                          />
                          <span className="text-sm text-muted-foreground">{project.language}</span>
                          <div className="flex items-center space-x-1 text-muted-foreground ml-auto">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              {new Date(project.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {project.description || 'No description available.'}
                      </p>
                      
                      {project.topics && project.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.topics.slice(0, 6).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {project.topics.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.topics.length - 6} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-3 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 glass hover:bg-primary/10"
                          asChild
                        >
                          <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </a>
                        </Button>
                        
                        {project.homepage && (
                          <Button
                            size="sm"
                            className="flex-1 gradient-primary"
                            asChild
                          >
                            <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;