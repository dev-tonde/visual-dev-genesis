import { motion } from 'framer-motion';
import { 
  Code2, 
  Palette, 
  Zap, 
  Database,
  Cloud,
  Shield,
  Boxes,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const Footer = () => {
  const technologies = [
    {
      category: 'Frontend',
      icon: Code2,
      items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite']
    },
    {
      category: 'UI/UX',
      icon: Palette,
      items: ['Shadcn/ui', 'Radix UI', 'Lucide Icons', 'Next Themes']
    },
    {
      category: 'Backend',
      icon: Database,
      items: ['Supabase', 'PostgreSQL', 'Edge Functions', 'Row Level Security']
    },
    {
      category: 'DevOps',
      icon: Cloud,
      items: ['GitHub Actions', 'Vercel', 'PWA', 'Service Workers']
    },
    {
      category: 'Performance',
      icon: Zap,
      items: ['Code Splitting', 'Lazy Loading', 'React Query', 'Lighthouse']
    },
    {
      category: 'Security',
      icon: Shield,
      items: ['Auth', 'HTTPS', 'CORS', 'Input Validation']
    },
    {
      category: 'Testing',
      icon: Boxes,
      items: ['Vitest', 'Testing Library', 'Axe Core', 'E2E Tests']
    },
    {
      category: 'Features',
      icon: Sparkles,
      items: ['SEO Optimized', 'Accessibility', 'Dark Mode', 'Responsive']
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
        {/* Technologies Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Built With Modern Technologies
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
                href="#about" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#projects" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Projects
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </li>
            <li>
              <a 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy
              </a>
            </li>
            <li>
              <a 
                href="/cv.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
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
            Designed & Built with ❤️ using React, TypeScript & Modern Web Standards
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
