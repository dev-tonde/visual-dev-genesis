import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicGreeting from './DynamicGreeting';
import { PROFILE, downloadCv } from '@/config/profile';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';
import HeroParticleBackground from '@/components/HeroParticleBackground';

const Hero = () => {
  const navigateToSection = useSectionNavigation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section 
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,hsl(262_83%_68%_/_0.10),transparent_44%)]" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/32 via-background/10 to-background/20" />
      <HeroParticleBackground />

      <motion.div
        className="relative z-30 container mx-auto px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-primary/80">
            Developer Portfolio
          </p>
          <h1 id="hero-title" className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            <DynamicGreeting />, I'm {PROFILE.firstName}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Full-stack developer building React, TypeScript, and product-focused web applications.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          variants={itemVariants}
        >
            <Button 
            size="lg" 
            className="gradient-primary"
            onClick={() => navigateToSection('projects')}
            aria-label="View selected work and case studies"
          >
            View Case Studies
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="glass hover:bg-primary/10 transition-smooth shadow-sm hover:shadow-md"
            onClick={downloadCv}
            aria-label="Download my CV as PDF"
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download CV
          </Button>
          
            <Button 
            variant="outline" 
            size="lg"
            className="glass hover:bg-primary/10 transition-smooth shadow-sm hover:shadow-md"
            onClick={() => navigateToSection('contact')}
            aria-label="Navigate to contact section"
          >
            Start a Conversation
          </Button>
        </motion.div>

        <motion.div
          className="flex justify-center space-x-6 mb-16"
          variants={itemVariants}
        >
          <motion.a
            href={PROFILE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-icon-button glass h-12 w-12 hover:bg-primary/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Visit my GitHub profile"
          >
            <Github className="w-6 h-6" aria-hidden="true" />
          </motion.a>
          
          <motion.a
            href={PROFILE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-icon-button glass h-12 w-12 hover:bg-primary/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Visit my LinkedIn profile"
          >
            <Linkedin className="w-6 h-6" aria-hidden="true" />
          </motion.a>
          
          <motion.a
            href={PROFILE.emailHref}
            className="interactive-icon-button glass h-12 w-12 hover:bg-primary/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send me an email"
          >
            <Mail className="w-6 h-6" aria-hidden="true" />
          </motion.a>
        </motion.div>

        <motion.div
          className="flex justify-center"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigateToSection('about')}
            className="interactive-icon-button h-11 w-11 hover:bg-primary/10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-label="Scroll down to about section"
          >
            <ArrowDown className="w-6 h-6" aria-hidden="true" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
