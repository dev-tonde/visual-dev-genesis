import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeSwitch from '@/components/ThemeSwitch';
import { CommandPaletteTrigger } from '@/components/CommandPalette';
import { downloadCv } from '@/config/profile';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';

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
  const navigateToSection = useSectionNavigation();

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

    const frameId = window.requestAnimationFrame(() => {
      const firstFocusable = mobileMenuRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus();
      }
    });

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
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    navigateToSection(sectionId);

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
    { name: 'Demos', id: 'games', type: 'link' as const },
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
            <motion.button
              type="button"
              className="rounded-md bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-bold text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => scrollToSection('hero')}
              whileHover={{ y: -1 }}
              aria-label="Go to home section"
            >
              Tonderai
            </motion.button>

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
              <CommandPaletteTrigger />
              <ThemeSwitch />
              <Button variant="outline" size="sm" onClick={downloadCv} className="glass">
                <Download className="w-4 h-4 mr-2" />
                CV
              </Button>
              <Button
                onClick={() => scrollToSection('contact')}
                className="gradient-primary"
                aria-label="Navigate to contact section"
              >
                Hire Me
              </Button>
            </div>

            {/* Mobile & Tablet Menu Button - Shows below 1024px */}
            <div className="lg:hidden flex items-center space-x-2">
              <CommandPaletteTrigger mobile />
              <ThemeSwitch />
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="glass"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 icon-primary" />
                ) : (
                  <Menu className="w-5 h-5 icon-primary" />
                )}
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
                height: 'auto',
              }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
            >
              <div className="glass rounded-lg p-4 space-y-3">
                <h2 id="mobile-menu-title" className="sr-only">
                  Navigation Menu
                </h2>
                {menuItems.map((item) =>
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
                    >
                      {item.name}
                    </button>
                  )
                )}
                <Button variant="outline" onClick={downloadCv} className="w-full glass mt-4">
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
