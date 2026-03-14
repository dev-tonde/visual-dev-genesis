import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github, Star, GitFork, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGitHubRepos } from '@/hooks/useGitHubRepos';
import { getLanguageColor } from '@/lib/github';
import ProjectSkeleton from '@/components/ProjectSkeleton';
import RetryButton from '@/components/RetryButton';
import { useState, useMemo } from 'react';
import ProjectSearch from '@/components/ProjectSearch';
import { resolveProjectDemoLink } from '@/config/projectDemos';
import ProjectCaseStudies from '@/components/ProjectCaseStudies';
import SectionHeading from '@/components/SectionHeading';

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { repos, loading, status, error, refetch, profileUrl, username } = useGitHubRepos();
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

  const hasActiveFilters = searchTerm.trim().length > 0 || selectedFilters.length > 0;

  const enrichedProjects = useMemo(
    () =>
      repos.map((repo) => ({
        ...repo,
        demoLink: resolveProjectDemoLink(repo.name, repo.homepage),
      })),
    [repos]
  );

  const featuredProjects = useMemo(() => enrichedProjects.slice(0, 6), [enrichedProjects]);
  const verifiedRepoNames = useMemo(
    () => (status === 'ready' ? new Set(enrichedProjects.map((project) => project.name.toLowerCase())) : null),
    [enrichedProjects, status]
  );

  const availableTechs = useMemo(() => {
    const techs = new Set<string>();
    const frontendTechs = ['react', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'sass', 'bootstrap', 'nextjs', 'nuxt', 'gatsby', 'svelte', 'framer-motion'];

    enrichedProjects.forEach(project => {
      if (project.topics) {
        project.topics.forEach(topic => {
          const normalizedTopic = topic.toLowerCase();
          if (frontendTechs.includes(normalizedTopic)) {
            techs.add(normalizedTopic);
          }
        });
      }
      if (project.language && frontendTechs.includes(project.language.toLowerCase())) {
        techs.add(project.language.toLowerCase());
      }
    });
    return Array.from(techs).sort();
  }, [enrichedProjects]);

  const filteredProjects = useMemo(() => {
    let filtered = enrichedProjects;

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
  }, [enrichedProjects, selectedFilters, searchTerm]);

  const displayProjects = hasActiveFilters ? filteredProjects : featuredProjects;

  const hasPartialProjectData = displayProjects.some(
    (project) => !project.description?.trim() || !project.demoLink
  );

  const sectionDescription = useMemo(() => {
    if (loading) {
      return 'Curated case studies are available below while the live GitHub repository feed loads.';
    }

    if (status === 'error') {
      return 'Curated case studies remain available below. The live GitHub repository feed is currently unavailable, and no placeholder projects are shown.';
    }

    if (status === 'empty') {
      return `Case studies are curated below. There are currently no public repositories available on ${username}'s GitHub profile.`;
    }

    if (hasPartialProjectData) {
      return 'Curated case studies sit above a live GitHub repository feed, with demo links shown only when they are explicitly configured or published in the repository.';
    }

    return 'Curated case studies sit above a live GitHub repository feed so technical depth and current work are both visible.';
  }, [hasPartialProjectData, loading, status, username]);

  const handleTagToggle = (tag: string) => {
    setSelectedFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const errorHeading = error?.kind === 'rate_limit'
    ? 'GitHub rate limit reached'
    : 'GitHub projects are temporarily unavailable';
  const errorMessage = error?.message || 'Live GitHub projects could not be loaded right now.';

  return (
    <section id="projects" className="section-shell section-anchor px-4">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-16">
            <SectionHeading
              label="Proof Of Work"
              title="Selected Work"
              description={sectionDescription}
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline">Curated case studies</Badge>
              <Badge variant="secondary">Live GitHub feed</Badge>
              {status === 'ready' && <Badge variant="outline">Curated demo links when available</Badge>}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-14">
            <ProjectCaseStudies verifiedRepoNames={verifiedRepoNames} />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6 text-center">
            <h3 className="text-2xl font-bold md:text-3xl">Live Repository Feed</h3>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              This list stays connected to GitHub. The case studies above are curated write-ups; the cards below remain live repo snapshots.
            </p>
          </motion.div>

          {status === 'ready' && (
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
          ) : status === 'error' ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{errorHeading}</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{errorMessage}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <RetryButton onRetry={() => void refetch()} />
                <Button variant="outline" asChild>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View GitHub Profile
                  </a>
                </Button>
              </div>
            </motion.div>
          ) : status === 'empty' ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No public repositories available</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                This section only shows verified public repositories. When new projects are published on GitHub, they will appear here automatically.
              </p>
              <Button variant="outline" asChild>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  Visit GitHub Profile
                </a>
              </Button>
            </motion.div>
          ) : displayProjects.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects match the current filters</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Try a different search term or use the filters above to return to the live GitHub project list.
              </p>
              <Button variant="ghost" asChild>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                  Browse all on GitHub
                </a>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {hasPartialProjectData && (
                <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Some repositories only include verified code links because no public demo URL or repository description was provided.
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map((project) => (
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
                        {project.description?.trim() || 'No public description provided in the repository.'}
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

                      {project.demoLink && (
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {project.demoLink.label}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="space-y-3 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full hover-lift"
                          asChild
                        >
                          <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </a>
                        </Button>

                        {project.demoLink ? (
                          <Button
                            size="sm"
                            className="w-full hover-lift gradient-primary"
                            asChild
                          >
                            <a href={project.demoLink.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {project.demoLink.source === 'curated_demo' ? 'Live Demo' : 'Open Link'}
                            </a>
                          </Button>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Code is available on GitHub. No verified public demo link is listed for this project.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
