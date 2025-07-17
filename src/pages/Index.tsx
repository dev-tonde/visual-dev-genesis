import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';
import Testimonials from '@/components/Testimonials';
import SEOHead from '@/components/SEOHead';

const Index = () => {
  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-background text-foreground custom-scrollbar">
        <Navigation />
        <main>
          <section id="hero">
            <Hero />
          </section>
          <section id="about">
            <About />
          </section>
          <section id="projects">
            <Projects />
          </section>
          <section id="testimonials">
            <Testimonials />
          </section>
          <section id="contact">
            <Contact />
          </section>
        </main>
      
        {/* Footer */}
        <footer className="py-8 px-4 border-t border-primary/20">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">
              © 2024 Tonderai. Built with React, TypeScript, Tailwind CSS, and Framer Motion.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
