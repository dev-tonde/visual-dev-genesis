import { useId } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useSafeTheme } from '@/components/SafeThemeProvider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ThemeSwitch = () => {
  const { theme, setTheme, mounted } = useSafeTheme();
  const switchId = useId();

  if (!mounted) {
    return (
      <div className="flex items-center gap-3 opacity-0">
        <div className="w-11 h-6 bg-muted rounded-full" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-3">
      <Label
        htmlFor={switchId}
        className="flex items-center gap-2 cursor-pointer text-sm font-medium"
      >
        <motion.div
          initial={false}
          animate={{
            scale: !isDark ? 1 : 0.8,
            opacity: !isDark ? 1 : 0.5,
          }}
          transition={{ duration: 0.2 }}
        >
          <Sun className="w-4 h-4" />
        </motion.div>
        <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
      </Label>

      <Switch
        id={switchId}
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className="data-[state=checked]:bg-primary"
      />

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0.8,
          opacity: isDark ? 1 : 0.5,
        }}
        transition={{ duration: 0.2 }}
      >
        <Moon className="w-4 h-4" />
      </motion.div>
    </div>
  );
};

export default ThemeSwitch;
