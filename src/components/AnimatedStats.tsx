import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Code, GitCommit, Users, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stat {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  color: string;
}

const AnimatedStats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats: Stat[] = [
    {
      icon: Code,
      label: 'Lines of Code',
      value: 50000,
      suffix: '+',
      color: 'hsl(var(--primary))'
    },
    {
      icon: GitCommit,
      label: 'Git Commits',
      value: 1200,
      suffix: '+',
      color: 'hsl(var(--secondary))'
    },
    {
      icon: Users,
      label: 'Happy Clients',
      value: 25,
      suffix: '+',
      color: 'hsl(var(--accent))'
    },
    {
      icon: Trophy,
      label: 'Projects Completed',
      value: 40,
      suffix: '+',
      color: 'hsl(var(--primary))'
    }
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
    <section className="py-16">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Development Metrics
          </h3>
          <p className="text-muted-foreground">
            Numbers that showcase my coding journey and achievements
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              delay={index * 0.1}
              inView={inView}
              variants={itemVariants}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

interface StatCardProps {
  stat: Stat;
  delay: number;
  inView: boolean;
  variants: any;
}

const StatCard = ({ stat, delay, inView, variants }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const { icon: Icon, label, value, suffix, color } = stat;

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    const duration = 2000; // 2 seconds

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [inView, value, delay]);

  return (
    <motion.div
      variants={variants}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <Card className="glass-vibrant border-0 text-center hover-glow transition-all duration-300">
        <CardContent className="p-6">
          <motion.div
            className="relative mb-4"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:shadow-md"
              style={{ 
                backgroundColor: `${color}20`,
                boxShadow: `0 0 12px ${color}30`
              }}
            >
              <Icon 
                className="w-8 h-8" 
                style={{ color }}
              />
            </div>
          </motion.div>
          
          <motion.div
            className="text-3xl font-bold mb-2"
            style={{ color }}
          >
            {count.toLocaleString()}{suffix}
          </motion.div>
          
          <p className="text-sm text-muted-foreground font-medium">
            {label}
          </p>
          
          {/* Animated progress bar */}
          <motion.div
            className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={inView ? { width: '100%' } : { width: 0 }}
              transition={{ 
                duration: 2, 
                delay: delay + 0.5,
                ease: "easeOut" 
              }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedStats;