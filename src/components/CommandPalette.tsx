import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  User, 
  Briefcase, 
  Mail, 
  Download, 
  Home, 
  Github, 
  Linkedin,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useHotkeys('meta+k, ctrl+k', () => setOpen(true), {
    preventDefault: true,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands = [
    {
      id: 'home',
      label: 'Go to Home',
      icon: Home,
      action: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'about',
      label: 'Go to About',
      icon: User,
      action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'projects',
      label: 'View Projects',
      icon: Briefcase,
      action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'contact',
      label: 'Contact Me',
      icon: Mail,
      action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'cv',
      label: 'Download CV',
      icon: Download,
      action: () => {
        const link = document.createElement('a');
        link.href = '/cv.pdf';
        link.download = 'Tonderai_CV.pdf';
        link.click();
      },
    },
    {
      id: 'github',
      label: 'Open GitHub',
      icon: Github,
      action: () => window.open('https://github.com/yourusername', '_blank'),
    },
    {
      id: 'linkedin',
      label: 'Open LinkedIn',
      icon: Linkedin,
      action: () => window.open('https://linkedin.com/in/yourusername', '_blank'),
    },
    {
      id: 'theme-light',
      label: 'Switch to Light Mode',
      icon: Sun,
      action: () => setTheme('light'),
      condition: () => theme !== 'light',
    },
    {
      id: 'theme-dark',
      label: 'Switch to Dark Mode',
      icon: Moon,
      action: () => setTheme('dark'),
      condition: () => theme !== 'dark',
    },
  ];

  const handleCommand = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg border-0 glass max-w-[640px]">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation">
              {commands
                .filter(cmd => !cmd.condition || cmd.condition())
                .map((command) => (
                <Command.Item
                  key={command.id}
                  onSelect={() => handleCommand(command.action)}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <command.icon className="mr-2 h-4 w-4 icon-primary" />
                  <span>{command.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;