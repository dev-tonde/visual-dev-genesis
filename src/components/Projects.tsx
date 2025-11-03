import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Star, GitFork, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGitHubRepos } from '@/hooks/useGitHubRepos';
import { getLanguageColor } from '@/lib/github';
import ProjectFilter from '@/components/ProjectFilter';
import ProjectSkeleton from '@/components/ProjectSkeleton';
import LoadingSpinner from '@/components/LoadingSpinner';
import RetryButton from '@/components/RetryButton';
import { useState, useMemo } from 'react';
import ProjectSearch from '@/components/ProjectSearch';
import { getDemoUrl } from '@/config/projectDemos';

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { repos, loading, error } = useGitHubRepos();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
  
  // Get frontend technologies for filtering
  const availableTechs = useMemo(() => {
    const techs = new Set<string>();
    const frontendTechs = ['react', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'sass', 'bootstrap', 'nextjs', 'nuxt', 'gatsby', 'svelte', 'framer-motion'];
    
    allProjects.forEach(project => {
      if (project.topics) {
        project.topics.forEach(topic => {
          if (frontendTechs.includes(topic.toLowerCase())) {
            techs.add(topic);
          }
        });
      }
      if (project.language && frontendTechs.includes(project.language.toLowerCase())) {
        techs.add(project.language.toLowerCase());
      }
    });
    return Array.from(techs).sort();
  }, [allProjects]);

  // Filter projects based on search term and selected filters
  const displayProjects = useMemo(() => {
    let filtered = allProjects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.topics && project.topics.some(topic => 
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (project.language && project.language.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected tags
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(project => {
        const projectTechs = [
          ...(project.topics || []),
          ...(project.language ? [project.language.toLowerCase()] : [])
        ];
        return selectedFilters.some(filter => 
          projectTechs.some(tech => tech.toLowerCase().includes(filter.toLowerCase()))
        );
      });
    }

    return filtered;
  }, [allProjects, selectedFilters, searchTerm]);

  const handleTagToggle = (tag: string) => {
    setSelectedFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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
            <ProjectSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTags={selectedFilters}
              onTagToggle={handleTagToggle}
              availableTags={availableTechs}
              resultsCount={displayProjects.length}
            />
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ minHeight: '800px' }}>
              {[...Array(6)].map((_, index) => (
                <ProjectSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load projects</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <RetryButton onRetry={() => window.location.reload()} />
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02, rotateY: 2 }}
                  className="group hover-lift"
                >
                  <Card className="glass-vibrant border-0 h-full overflow-hidden hover:shadow-lg transition-all duration-500 hover-glow relative">
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
                      
                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 hover-lift"
                          asChild
                        >
                          <a href={project.html_url || `https://github.com/dev-tonde/${project.name}`} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </a>
                        </Button>
                        
                        <Button
                          size="sm"
                          className="flex-1 hover-lift gradient-primary"
                          asChild
                        >
                          <a href={getDemoUrl(project.name, project.homepage)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
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