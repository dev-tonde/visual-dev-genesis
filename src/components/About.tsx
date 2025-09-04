import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code, Palette, Zap, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SkillsVisualization from '@/components/SkillsVisualization';
import AnimatedStats from '@/components/AnimatedStats';

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

  const skills = [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Next.js', level: 85 },
    { name: 'Tailwind CSS', level: 92 },
    { name: 'Framer Motion', level: 88 },
    { name: 'Node.js', level: 80 },
  ];

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
              About Me
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I'm a passionate frontend developer with a love for creating exceptional digital experiences. 
              I specialize in modern web technologies and have a keen eye for design and user experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-semibold mb-6 text-primary">Technical Skills</h3>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full gradient-primary"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-semibold mb-6 text-primary">What I Do</h3>
              <div className="grid gap-4">
                {highlights.map((highlight, index) => (
                  <motion.div
                    key={highlight.title}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="transition-transform"
                  >
                    <Card className="glass border-0">
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
          </div>

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

          {/* Animated Statistics */}
          <AnimatedStats />
        </motion.div>
      </div>
    </section>
  );
};

export default About;