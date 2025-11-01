import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code, Palette, Zap, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SkillsVisualization from '@/components/SkillsVisualization';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };


  const highlights = [
    {
      icon: Code,
      title: 'Clean Code',
      description: 'Writing maintainable, scalable code with best practices'
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      description: 'Creating beautiful, intuitive user interfaces'
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Optimizing for speed and exceptional user experience'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Working effectively in team environments'
    }
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Skills & Expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I specialize in modern web technologies and have a keen eye for design and user experience.
              Here's what I bring to the table.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold mb-6 text-primary">What I Do</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={highlight.title}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className="transition-transform"
                >
                  <Card className="glass border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <highlight.icon className="w-5 h-5 icon-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{highlight.title}</h4>
                          <p className="text-sm text-muted-foreground">{highlight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center p-8 glass rounded-2xl"
          >
            <p className="text-lg leading-relaxed">
              "I believe in the power of technology to transform ideas into reality. 
              Every project is an opportunity to push boundaries and create something amazing."
            </p>
          </motion.div>

          {/* Interactive Skills Visualization */}
          <SkillsVisualization />
        </motion.div>
      </div>
    </section>
  );
};

export default About;