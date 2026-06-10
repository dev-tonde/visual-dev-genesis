import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Code2, Palette, Gamepad2, Music, Coffee, Plane } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { EXPERIENCE } from '@/config/experience';

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
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="journey" className="section-shell section-anchor px-4">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <SectionHeading
            label="Background"
            title="My Journey"
            description="The product thinking, engineering focus, and habits behind the work."
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-vibrant border-0 mb-8 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="space-y-4 text-foreground/90 leading-relaxed">
                <p>
                  Hey there! I'm Tonderai, a senior front-end developer with 8+ years of
                  experience creating performant, accessible web experiences. I've honed my craft
                  across modern frameworks like React and Next.js as well as CMS platforms like
                  WordPress and Drupal, building interfaces that users love.
                </p>
                <p>
                  My journey in tech started with a curiosity about how things work on the web. That
                  curiosity evolved into a career where I get to solve complex problems, mentor
                  junior developers, and stay at the forefront of web technologies. I believe in
                  writing clean, maintainable code and creating interfaces that are both
                  aesthetically pleasing and highly functional.
                </p>
                <p>
                  When I'm not coding, I'm constantly learning new technologies, contributing to
                  open source, and exploring the latest trends in web development. I'm particularly
                  interested in performance optimization, accessibility, and creating delightful
                  user experiences.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold mb-6 text-center">Experience</h3>
          <div className="space-y-4 mb-12">
            {EXPERIENCE.map((role) => (
              <Card
                key={role.company}
                className="glass-vibrant border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" aria-hidden="true" />
                      <p className="font-semibold">
                        {role.title} · <span className="text-foreground/80">{role.company}</span>
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">{role.period}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/80">{role.summary}</p>
                  <ul className="mt-3 space-y-1.5">
                    {role.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start text-sm leading-6 text-muted-foreground"
                      >
                        <span
                          className="mt-2.5 mr-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <h3 className="text-2xl font-bold mb-6 text-center">My Hobbies & Interests</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hobbies.map((hobby) => (
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
                      <hobby.icon className="w-6 h-6" style={{ color: hobby.color }} />
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
