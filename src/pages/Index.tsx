import { Suspense } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import AboutMe from '@/components/AboutMe';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import heroBg from '@/assets/programmer-hero-bg.jpg';
import LoadingSpinner from '@/components/LoadingSpinner';
import BackToTop from '@/components/BackToTop';
import AboutSkeleton from '@/components/AboutSkeleton';
import AboutMeSkeleton from '@/components/AboutMeSkeleton';
import CertificationsSkeleton from '@/components/CertificationsSkeleton';
import { useSectionHashScroll } from '@/hooks/useSectionNavigation';

// Lazy load heavy components for better performance
import { ProjectsLazy } from '@/components/Projects.lazy';
import { CertificationsLazy } from '@/components/Certifications.lazy';

const Index = () => {
  useSectionHashScroll();

  return (
    <>
      <SEOHead />
      <BackToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Skip to main content
      </a>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-background/90 supports-[backdrop-filter]:backdrop-blur-[3px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/78 via-background/90 to-background/97" />
      </div>
      <div className="min-h-screen bg-transparent text-foreground custom-scrollbar relative z-10">
        <Navigation />
        <main role="main" aria-label="Main content" id="main-content">
          <Hero />
          <Suspense fallback={<AboutSkeleton />}>
            <About />
          </Suspense>
          <Suspense fallback={<AboutMeSkeleton />}>
            <AboutMe />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectsLazy />
          </Suspense>
          <Suspense fallback={<CertificationsSkeleton />}>
            <CertificationsLazy />
          </Suspense>
          <Contact />
        </main>
      
        <Footer />
      </div>
    </>
  );
};

export default Index;
