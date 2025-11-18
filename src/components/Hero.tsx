import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicGreeting from './DynamicGreeting';
import heroBg from '@/assets/programmer-hero-bg.jpg';

const Hero = () => {
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Optimized background image with explicit dimensions and priority hints for LCP */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ position: 'fixed', willChange: 'transform' }}
        fetchPriority="high"
        loading="eager"
        aria-hidden="true"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
      
      {/* Animated particles - optimized for performance */}
      <div className="absolute inset-0" style={{ willChange: 'auto' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full opacity-30"
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'transform',
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <motion.div
        className="container mx-auto px-4 text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <h1 id="hero-title" className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            <DynamicGreeting />, I'm Tonderai
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Crafting beautiful, interactive web experiences with modern technologies
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          variants={itemVariants}
        >
          <Button 
            size="lg" 
            className="gradient-primary hover:scale-102 transition-transform shadow-sm hover:shadow-md"
            onClick={() => scrollToSection('projects')}
            aria-label="View my portfolio projects"
          >
            View My Work
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="glass hover:bg-primary/10 transition-smooth shadow-sm hover:shadow-md"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/cv.pdf';
              link.download = 'Tonderai_CV.pdf';
              link.click();
            }}
            aria-label="Download my CV as PDF"
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download CV
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="glass hover:bg-primary/10 transition-smooth shadow-sm hover:shadow-md"
            onClick={() => scrollToSection('contact')}
            aria-label="Navigate to contact section"
          >
            Get In Touch
          </Button>
        </motion.div>

        <motion.div
          className="flex justify-center space-x-6 mb-16"
          variants={itemVariants}
        >
          <motion.a
            href="https://github.com/dev-tonde"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 glass rounded-full hover:bg-primary/10 transition-smooth"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Visit my GitHub profile"
          >
            <Github className="w-6 h-6" aria-hidden="true" />
          </motion.a>
          
          <motion.a
            href="https://www.linkedin.com/in/tonderai-matanga/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 glass rounded-full hover:bg-primary/10 transition-smooth"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Visit my LinkedIn profile"
          >
            <Linkedin className="w-6 h-6" aria-hidden="true" />
          </motion.a>
          
          <motion.a
            href="mailto:hello@iamtonde.co.za"
            className="p-3 glass rounded-full hover:bg-primary/10 transition-smooth"
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
            onClick={() => scrollToSection('about')}
            className="p-2 rounded-full hover:bg-primary/10 transition-smooth"
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