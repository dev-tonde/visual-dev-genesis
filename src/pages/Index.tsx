import { Suspense } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import AboutMe from '@/components/AboutMe';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import SEOEnhancements from '@/components/SEOEnhancements';
import StructuredData from '@/components/StructuredData';
import InteractiveBackground from '@/components/InteractiveBackground';
import FloatingElements from '@/components/FloatingElements';
import LoadingSpinner from '@/components/LoadingSpinner';
import BackToTop from '@/components/BackToTop';
import AboutSkeleton from '@/components/AboutSkeleton';
import AboutMeSkeleton from '@/components/AboutMeSkeleton';
import CertificationsSkeleton from '@/components/CertificationsSkeleton';

// Lazy load heavy components for better performance
import { ProjectsLazy } from '@/components/Projects.lazy';
import { CertificationsLazy } from '@/components/Certifications.lazy';

const Index = () => {
  return (
    <>
      <SEOHead />
      <SEOEnhancements />
      <StructuredData />
      <InteractiveBackground />
      <FloatingElements />
      <BackToTop />
      <div className="min-h-screen bg-background text-foreground custom-scrollbar relative z-20">
        <Navigation />
        <main role="main" aria-label="Main content" id="main-content">
          <section id="hero" aria-labelledby="hero-heading">
            <h1 id="hero-heading" className="sr-only">Tonderai Matanga - Full Stack Developer Portfolio</h1>
            <Hero />
          </section>
          <section id="about" aria-labelledby="about-heading" className="py-12">
            <h2 id="about-heading" className="sr-only">Skills and Expertise</h2>
            <Suspense fallback={<AboutSkeleton />}>
              <About />
            </Suspense>
          </section>
          <section id="journey" aria-labelledby="journey-heading" className="py-12">
            <h2 id="journey-heading" className="sr-only">My Journey and Background</h2>
            <Suspense fallback={<AboutMeSkeleton />}>
              <AboutMe />
            </Suspense>
          </section>
          <section id="projects" aria-labelledby="projects-heading" className="py-12">
            <h2 id="projects-heading" className="sr-only">Featured Projects</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectsLazy />
            </Suspense>
          </section>
          <section id="certifications" aria-labelledby="certifications-heading" className="py-12">
            <h2 id="certifications-heading" className="sr-only">Certifications and Achievements</h2>
            <Suspense fallback={<CertificationsSkeleton />}>
              <CertificationsLazy />
            </Suspense>
          </section>
          <section id="testimonials" aria-labelledby="testimonials-heading" className="py-12">
            <h2 id="testimonials-heading" className="sr-only">Client Testimonials</h2>
            <Testimonials />
          </section>
          <section id="contact" aria-labelledby="contact-heading" className="py-12">
            <h2 id="contact-heading" className="sr-only">Contact Information</h2>
            <Contact />
          </section>
        </main>
      
        {/* Footer with full tech stack */}
        <Footer />
      </div>
    </>
  );
};

export default Index;
