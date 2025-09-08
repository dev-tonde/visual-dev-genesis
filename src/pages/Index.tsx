import { Suspense } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';
import Testimonials from '@/components/Testimonials';
import SEOHead from '@/components/SEOHead';
import StructuredData from '@/components/StructuredData';
import InteractiveBackground from '@/components/InteractiveBackground';
import FloatingElements from '@/components/FloatingElements';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load heavy components for better performance
import { ProjectsLazy } from '@/components/Projects.lazy';
import { CertificationsLazy } from '@/components/Certifications.lazy';

const Index = () => {
  return (
    <>
      <SEOHead />
      <StructuredData />
      <InteractiveBackground />
      <FloatingElements />
      <div className="min-h-screen bg-background text-foreground custom-scrollbar relative z-20">
        <Navigation />
        <main role="main" aria-label="Main content" id="main-content">
          <section id="hero" aria-labelledby="hero-heading">
            <h1 id="hero-heading" className="sr-only">Tonderai Matanga - Full Stack Developer Portfolio</h1>
            <Hero />
          </section>
          <section id="about" aria-labelledby="about-heading">
            <h2 id="about-heading" className="sr-only">About Tonderai Matanga</h2>
            <About />
          </section>
          <section id="projects" aria-labelledby="projects-heading">
            <h2 id="projects-heading" className="sr-only">Featured Projects</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectsLazy />
            </Suspense>
          </section>
          <section id="certifications" aria-labelledby="certifications-heading">
            <h2 id="certifications-heading" className="sr-only">Certifications and Achievements</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <CertificationsLazy />
            </Suspense>
          </section>
          <section id="testimonials" aria-labelledby="testimonials-heading">
            <h2 id="testimonials-heading" className="sr-only">Client Testimonials</h2>
            <Testimonials />
          </section>
          <section id="contact" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="sr-only">Contact Information</h2>
            <Contact />
          </section>
        </main>
      
        {/* Footer */}
        <footer 
          className="py-8 px-4 border-t border-primary/20" 
          role="contentinfo" 
          aria-label="Site footer"
        >
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Tonderai Matanga. Built with React, TypeScript, Tailwind CSS, and Framer Motion.
            </p>
            <nav aria-label="Footer navigation" className="mt-4">
              <ul className="flex justify-center space-x-6 text-sm">
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#projects" className="hover:text-primary transition-colors">Projects</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">CV</a></li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
