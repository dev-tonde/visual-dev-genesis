import { motion } from 'framer-motion';
import {
  Code2, 
  Palette, 
  Database,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { PROFILE } from '@/config/profile';
import { getSectionHref, useSectionNavigation } from '@/hooks/useSectionNavigation';

const Footer = () => {
  const navigateToSection = useSectionNavigation();

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    navigateToSection(sectionId);
  };

  const technologies = [
    {
      category: 'Frontend',
      icon: Code2,
      items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
    },
    {
      category: 'UI System',
      icon: Palette,
      items: ['shadcn/ui', 'Radix UI', 'Lucide', 'next-themes']
    },
    {
      category: 'Backend',
      icon: Database,
      items: ['Supabase', 'PostgreSQL', 'Edge Functions', 'Row Level Security']
    },
    {
      category: 'Quality & Delivery',
      icon: Shield,
      items: ['Vitest', 'Testing Library', 'GitHub Actions', 'Vercel']
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="py-16 px-4 border-t border-border/50 bg-background/50 backdrop-blur-sm" 
      role="contentinfo" 
      aria-label="Site footer"
    >
      <div className="container mx-auto">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Current Stack
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass border-border/50 p-4 h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <tech.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">{tech.category}</h3>
                  </div>
                  <ul className="space-y-1">
                    {tech.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Links Section */}
        <nav aria-label="Footer navigation" className="mb-8">
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <li>
              <a 
                href={getSectionHref('about')}
                onClick={(e) => handleSectionClick(e, 'about')}
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                About
              </a>
            </li>
            <li>
              <a 
                href={getSectionHref('projects')}
                onClick={(e) => handleSectionClick(e, 'projects')}
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Projects
              </a>
            </li>
            <li>
              <a 
                href={getSectionHref('certifications')}
                onClick={(e) => handleSectionClick(e, 'certifications')}
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Certifications
              </a>
            </li>
            <li>
              <Link 
                to="/games" 
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Demos
              </Link>
            </li>
            <li>
              <a 
                href={getSectionHref('contact')}
                onClick={(e) => handleSectionClick(e, 'contact')}
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Contact
              </a>
            </li>
            <li>
              <Link 
                to="/privacy" 
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Privacy
              </Link>
            </li>
            <li>
              <a 
                href={PROFILE.cvHref} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="rounded-sm px-1 py-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Download CV
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Tonderai Matanga. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Built with React, TypeScript, and Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
