import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Skill {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'tools';
  color: string;
}

const SkillsVisualization = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const skills: Skill[] = [
    { name: 'React', level: 95, category: 'frontend', color: 'hsl(var(--primary))' },
    { name: 'TypeScript', level: 90, category: 'frontend', color: 'hsl(var(--secondary))' },
    { name: 'Next.js', level: 85, category: 'frontend', color: 'hsl(var(--accent))' },
    { name: 'Tailwind CSS', level: 92, category: 'frontend', color: 'hsl(var(--primary))' },
    { name: 'Circle CI', level: 82, category: 'tools', color: 'hsl(var(--secondary))' },
    { name: 'AdobeXD', level: 88, category: 'tools', color: 'hsl(var(--accent))' },
    { name: 'Python', level: 78, category: 'backend', color: 'hsl(var(--primary))' },
    {
      name: 'Artificial Intelligence',
      level: 80,
      category: 'backend',
      color: 'hsl(var(--secondary))',
    },
    { name: 'Git', level: 90, category: 'tools', color: 'hsl(var(--accent))' },
    { name: 'Docker', level: 70, category: 'tools', color: 'hsl(var(--primary))' },
    { name: 'AWS', level: 65, category: 'tools', color: 'hsl(var(--secondary))' },
    { name: 'Figma', level: 85, category: 'tools', color: 'hsl(var(--accent))' },
  ];

  const categories = ['frontend', 'backend', 'tools'] as const;

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-16">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Technical Expertise
          </h3>
          <p className="text-muted-foreground">
            Interactive visualization of my skills and proficiency levels
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Skill Bars */}
          <motion.div variants={itemVariants}>
            <Card className="glass-vibrant border-0 p-6">
              <h4 className="text-xl font-semibold mb-6">Proficiency Levels</h4>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center gap-2">
                        {skill.name}
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </span>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ backgroundColor: skill.color }}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.1,
                          ease: 'easeOut',
                        }}
                      />
                      <motion.div
                        className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent to-white/20 rounded-full"
                        initial={{ x: '-100%' }}
                        animate={inView ? { x: '100%' } : { x: '-100%' }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.1 + 0.5,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Circular Progress */}
          <motion.div variants={itemVariants}>
            <Card className="glass-vibrant border-0 p-6">
              <h4 className="text-xl font-semibold mb-6">Category Overview</h4>
              <div className="grid grid-cols-3 gap-6">
                {categories.map((category) => {
                  const categorySkills = skills.filter((s) => s.category === category);
                  const averageLevel = Math.round(
                    categorySkills.reduce((sum, skill) => sum + skill.level, 0) /
                      categorySkills.length
                  );

                  return (
                    <div key={category} className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="32"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-muted"
                            opacity="0.3"
                          />
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="32"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={
                              inView ? { pathLength: averageLevel / 100 } : { pathLength: 0 }
                            }
                            transition={{ duration: 2, delay: 0.5 }}
                            style={{
                              pathLength: averageLevel / 100,
                              strokeDasharray: '201.06 201.06',
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{averageLevel}%</span>
                        </div>
                      </div>
                      <h5 className="font-semibold capitalize text-sm">{category}</h5>
                      <p className="text-xs text-muted-foreground">
                        {categorySkills.length} skills
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default SkillsVisualization;
