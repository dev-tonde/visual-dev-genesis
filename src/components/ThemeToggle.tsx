import { motion } from 'framer-motion';
import { useSafeTheme } from '@/components/SafeThemeProvider';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ThemeToggle = () => {
  const { theme, setTheme, mounted } = useSafeTheme();

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="relative w-12 h-12 rounded-full p-0 glass transition-all duration-200 hover:scale-110"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {/* Sun (Light mode icon) */}
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
                className="w-6 h-6 rounded-full bg-yellow-400 relative"
                animate={{
                  rotate: theme === 'light' ? 0 : 180,
                  boxShadow: theme === 'light' ? "0 0 20px hsl(45 100% 50% / 0.6)" : "0 0 0px hsl(45 100% 50% / 0)",
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
                      scale: theme === 'light' ? 1 : 0,
                      opacity: theme === 'light' ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Half Moon (Dark mode icon) */}
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
                className="w-6 h-6 relative"
                animate={{
                  rotate: theme === 'dark' ? 0 : -180,
                }}
                transition={{ duration: 0.5 }}
              >
                {/* Half moon shape using border-radius and background */}
                <div 
                  className="w-6 h-6 bg-slate-300 rounded-full relative"
                  style={{
                    background: 'linear-gradient(90deg, hsl(220 20% 70%) 50%, transparent 50%)',
                  }}
                >
                  {/* Shadow overlay for crescent effect */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 70% 50%, transparent 40%, hsl(220 20% 70%) 41%)',
                    }}
                  />
                  {/* Moon craters */}
                  <div className="absolute w-1 h-1 bg-slate-400 rounded-full top-1.5 left-1.5 opacity-60" />
                  <div className="absolute w-0.5 h-0.5 bg-slate-400 rounded-full top-3 left-2 opacity-40" />
                </div>
              </motion.div>
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;