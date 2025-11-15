import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Palette, Gamepad2, Music, Coffee, Plane } from 'lucide-react';

const AboutMe = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const hobbies = [
    { icon: Code2, name: 'Coding', color: 'hsl(var(--primary))' },
    { icon: Palette, name: 'Design', color: 'hsl(var(--secondary))' },
    { icon: Gamepad2, name: 'Gaming', color: 'hsl(var(--accent))' },
    { icon: Music, name: 'Music', color: 'hsl(var(--primary))' },
    { icon: Coffee, name: 'Coffee', color: 'hsl(var(--secondary))' },
    { icon: Plane, name: 'Travel', color: 'hsl(var(--accent))' },
  ];

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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="journey" className="px-4">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Journey
          </h2>
          <p className="text-lg text-muted-foreground">
            Get to know the person behind the code
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-vibrant border-0 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <p>
                  Hey there! I'm Tonderai, a passionate senior front-end developer with a love for creating 
                  beautiful, performant, and accessible web experiences. With years of experience in the 
                  industry, I've honed my craft in building scalable applications that users love.
                </p>
                <p>
                  My journey in tech started with a curiosity about how things work on the web. That curiosity 
                  evolved into a career where I get to solve complex problems, mentor junior developers, and 
                  stay at the forefront of web technologies. I believe in writing clean, maintainable code 
                  and creating interfaces that are both aesthetically pleasing and highly functional.
                </p>
                <p>
                  When I'm not coding, I'm constantly learning new technologies, contributing to open source, 
                  and exploring the latest trends in web development. I'm particularly interested in performance 
                  optimization, accessibility, and creating delightful user experiences.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold mb-6 text-center">My Hobbies & Interests</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hobbies.map((hobby, index) => (
              <motion.div
                key={hobby.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-vibrant border-0 text-center shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
                      style={{ 
                        backgroundColor: `${hobby.color}20`,
                      }}
                    >
                      <hobby.icon 
                        className="w-6 h-6" 
                        style={{ color: hobby.color }}
                      />
                    </div>
                    <p className="font-medium">{hobby.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutMe;
