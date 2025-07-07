import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full p-0 glass hover:bg-primary/10"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-yellow-400 relative"
          animate={{
            rotate: theme === 'dark' ? 0 : 180,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Sun rays */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-2 bg-yellow-400 left-1/2 top-0 origin-bottom"
              style={{
                transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-12px)`,
              }}
              animate={{
                scale: theme === 'dark' ? 0 : 1,
                opacity: theme === 'dark' ? 0 : 1,
              }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          opacity: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-slate-300 relative overflow-hidden"
          animate={{
            rotate: theme === 'light' ? 0 : -180,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Moon craters */}
          <div className="absolute w-1.5 h-1.5 bg-slate-400 rounded-full top-1 left-1" />
          <div className="absolute w-1 h-1 bg-slate-400 rounded-full top-3 right-1" />
          <div className="absolute w-0.5 h-0.5 bg-slate-400 rounded-full bottom-1 left-2" />
        </motion.div>
      </motion.div>
    </Button>
  );
};

export default ThemeToggle;