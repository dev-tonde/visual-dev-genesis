import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Download } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeSwitch from '@/components/ThemeSwitch';
import SearchDialog from '@/components/SearchDialog';

// Hook to detect reduced motion preference
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const isGamesPage = location.pathname === '/games';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus trap and escape handling for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }

      // Focus trap
      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusableElements = mobileMenuRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Disable page scroll and make background inert
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    // If we're on games page and trying to go to a section, navigate home first
    if (isGamesPage && sectionId !== 'games') {
      // Use React Router navigation to prevent full page reload
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }, 100);
      return;
    }
    
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  };

  const menuItems = [
    { name: 'Home', id: 'hero', type: 'scroll' as const },
    { name: 'About', id: 'about', type: 'scroll' as const },
    { name: 'Projects', id: 'projects', type: 'scroll' as const },
    { name: 'Certifications', id: 'certifications', type: 'scroll' as const },
    { name: 'Games', id: 'games', type: 'link' as const },
    { name: 'Contact', id: 'contact', type: 'scroll' as const },
  ];

  return (
    <>
      {/* Background overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'glass backdrop-blur-lg py-2' : 'bg-transparent py-6'
        }`}
        initial={prefersReducedMotion ? { y: 0 } : { y: -100 }}
        animate={{ y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
        role="banner"
      >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent cursor-pointer"
            onClick={() => scrollToSection('hero')}
            whileHover={{ scale: 1.05 }}
            role="button"
            aria-label="Go to home section"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && scrollToSection('hero')}
          >
            Tonderai
          </motion.div>

          {/* Desktop Menu - Hidden below 1024px */}
          <div className="hidden lg:flex items-center space-x-2">
            {menuItems.map((item) => 
              item.type === 'link' ? (
                <Link
                  key={item.name}
                  to={`/${item.id}`}
                  className="text-foreground hover:text-primary transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
                >
                  {item.name}
                </Link>
              ) : (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="text-foreground hover:text-primary transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
                  whileHover={{ scale: 1.05 }}
                  aria-label={`Navigate to ${item.name} section`}
                >
                  {item.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              )
            )}
            <SearchDialog />
            <ThemeSwitch />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/cv.pdf';
                link.download = 'Tonderai_CV.pdf';
                link.click();
              }}
              className="glass"
            >
              <Download className="w-4 h-4 mr-2" />
              CV
            </Button>
            <Button
              onClick={() => scrollToSection('contact')}
              className="gradient-primary hover:scale-105 transition-transform focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Navigate to contact section"
            >
              Hire Me
            </Button>
          </div>

          {/* Mobile & Tablet Menu Button - Shows below 1024px */}
          <div className="lg:hidden flex items-center space-x-2">
            <SearchDialog />
            <ThemeSwitch />
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 icon-primary" /> : <Menu className="w-5 h-5 icon-primary" />}
            </Button>
          </div>
        </div>

        {/* Mobile & Tablet Menu */}
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="lg:hidden mt-4 relative z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: 'auto' 
            }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
          >
            <div className="glass rounded-lg p-4 space-y-3">
              <h2 id="mobile-menu-title" className="sr-only">
                Navigation Menu
              </h2>
              {menuItems.map((item, index) => 
                item.type === 'link' ? (
                  <Link
                    key={item.name}
                    to={`/${item.id}`}
                    className="block w-full text-left text-foreground hover:text-primary transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label={`Navigate to ${item.name} page`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left text-foreground hover:text-primary transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                    aria-label={`Navigate to ${item.name} section`}
                    autoFocus={index === 0}
                  >
                    {item.name}
                  </button>
                )
              )}
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/cv.pdf';
                  link.download = 'Tonderai_CV.pdf';
                  link.click();
                }}
                className="w-full glass mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CV
              </Button>
              <Button
                onClick={() => scrollToSection('contact')}
                className="w-full gradient-primary mt-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Navigate to contact section"
              >
                Hire Me
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
    </>
  );
};

export default Navigation;