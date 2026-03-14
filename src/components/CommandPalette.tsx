import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { Command } from 'cmdk';
import {
  Award,
  Briefcase,
  Download,
  Gamepad2,
  Github,
  Home,
  Linkedin,
  Mail,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PROFILE, downloadCv } from '@/config/profile';
import { useSafeTheme } from '@/components/SafeThemeProvider';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface CommandPaletteProviderProps {
  children: ReactNode;
}

interface CommandAction {
  id: string;
  label: string;
  description: string;
  icon: typeof Home;
  searchText: string;
  action: () => void;
}

interface CommandGroup {
  heading: string;
  actions: CommandAction[];
}

interface CommandPaletteTriggerProps {
  mobile?: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined);

const openExternalUrl = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const getShortcutLabel = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    ? '⌘K'
    : 'Ctrl K';

const useCommandPalette = () => {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }

  return context;
};

const CommandPaletteDialog = () => {
  const { open, setOpen } = useCommandPalette();
  const { theme, setTheme, mounted } = useSafeTheme();
  const navigateToSection = useSectionNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const commandGroups = useMemo<CommandGroup[]>(() => {
    const actions: CommandGroup[] = [
      {
        heading: 'Navigate',
        actions: [
          {
            id: 'home',
            label: 'Home',
            description:
              location.pathname === '/'
                ? 'Jump to the top of the portfolio.'
                : 'Return to the portfolio homepage.',
            icon: Home,
            searchText: 'home hero landing portfolio start',
            action: () => navigateToSection('hero'),
          },
          {
            id: 'about',
            label: 'About',
            description: 'Go to the skills and experience section.',
            icon: User,
            searchText: 'about skills expertise experience background',
            action: () => navigateToSection('about'),
          },
          {
            id: 'projects',
            label: 'Projects',
            description: 'Browse curated case studies and live GitHub work.',
            icon: Briefcase,
            searchText: 'projects work portfolio github repos case studies',
            action: () => navigateToSection('projects'),
          },
          {
            id: 'certifications',
            label: 'Certifications',
            description: 'Review credentials and technical certifications.',
            icon: Award,
            searchText: 'certifications certificates credentials achievements',
            action: () => navigateToSection('certifications'),
          },
          {
            id: 'games',
            label: 'Demos',
            description: 'Open the interactive engineering demos page.',
            icon: Gamepad2,
            searchText: 'games demos engineering interaction realtime canvas',
            action: () => navigate('/games'),
          },
          {
            id: 'contact',
            label: 'Contact',
            description: 'Jump to the contact section.',
            icon: Mail,
            searchText: 'contact hire email reach out',
            action: () => navigateToSection('contact'),
          },
        ],
      },
      {
        heading: 'Profiles',
        actions: [
          {
            id: 'github',
            label: 'Open GitHub',
            description: 'View public repositories and code history.',
            icon: Github,
            searchText: 'github code repositories profile',
            action: () => openExternalUrl(PROFILE.githubUrl),
          },
          {
            id: 'linkedin',
            label: 'Open LinkedIn',
            description: 'View professional experience and recommendations.',
            icon: Linkedin,
            searchText: 'linkedin professional profile experience recommendations',
            action: () => openExternalUrl(PROFILE.linkedinUrl),
          },
          {
            id: 'email',
            label: 'Email Tonderai',
            description: `Start a message to ${PROFILE.email}.`,
            icon: Mail,
            searchText: 'email mail hello contact message',
            action: () => {
              window.location.href = PROFILE.emailHref;
            },
          },
        ],
      },
      {
        heading: 'Resources',
        actions: [
          {
            id: 'cv',
            label: 'Download CV',
            description: 'Download the latest resume as a PDF.',
            icon: Download,
            searchText: 'cv resume download pdf',
            action: downloadCv,
          },
        ],
      },
    ];

    if (mounted) {
      actions.push({
        heading: 'Appearance',
        actions: [
          ...(theme !== 'light'
            ? [
                {
                  id: 'theme-light',
                  label: 'Switch to Light Mode',
                  description: 'Use the light color theme.',
                  icon: Sun,
                  searchText: 'theme light appearance display',
                  action: () => setTheme('light'),
                },
              ]
            : []),
          ...(theme !== 'dark'
            ? [
                {
                  id: 'theme-dark',
                  label: 'Switch to Dark Mode',
                  description: 'Use the dark color theme.',
                  icon: Moon,
                  searchText: 'theme dark appearance display',
                  action: () => setTheme('dark'),
                },
              ]
            : []),
        ],
      });
    }

    return actions.filter((group) => group.actions.length > 0);
  }, [location.pathname, mounted, navigate, navigateToSection, setTheme, theme]);

  const handleSelect = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0 shadow-lg border-0 glass max-w-[680px]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle>Quick Actions</DialogTitle>
          <DialogDescription>
            Search sections, pages, profile links, and practical site actions.
          </DialogDescription>
        </DialogHeader>

        <Command
          label="Quick actions"
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:pb-2 [&_[cmdk-group]]:pt-0"
        >
          <div className="flex items-center border-b px-4" cmdk-input-wrapper="">
            <Search className="mr-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Command.Input
              ref={inputRef}
              aria-label="Search quick actions"
              placeholder="Jump to case studies, contact, or demos..."
              className="flex h-12 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto overflow-x-hidden px-2 py-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
              No matching actions found.
            </Command.Empty>

            {commandGroups.map((group) => (
              <Command.Group key={group.heading} heading={group.heading}>
                {group.actions.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.description} ${command.searchText}`}
                    onSelect={() => handleSelect(command.action)}
                    className="mx-2 flex cursor-default select-none items-start gap-3 rounded-md px-3 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <command.icon
                      className="mt-0.5 h-4 w-4 shrink-0 icon-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{command.label}</div>
                      <div className="text-xs text-muted-foreground">{command.description}</div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
          <span>Use ↑↓ to move, Enter to open, and Esc to close.</span>
          <span>{getShortcutLabel()} opens this menu from anywhere.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CommandPaletteProvider = ({ children }: CommandPaletteProviderProps) => {
  const [open, setOpen] = useState(false);

  useHotkeys(
    'mod+k',
    (event) => {
      event.preventDefault();
      setOpen(true);
    },
    {
      preventDefault: true,
    }
  );

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPaletteDialog />
    </CommandPaletteContext.Provider>
  );
};

export const CommandPaletteTrigger = ({ mobile = false }: CommandPaletteTriggerProps) => {
  const { open, setOpen } = useCommandPalette();
  const shortcutLabel = getShortcutLabel();

  if (mobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open quick actions"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search className="w-5 h-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="glass hidden md:flex items-center gap-2"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      <Search className="w-4 h-4" aria-hidden="true" />
      <span className="text-xs text-muted-foreground">Quick Actions</span>
      <kbd className="rounded bg-muted px-2 py-0.5 text-xs">{shortcutLabel}</kbd>
    </Button>
  );
};

export default CommandPaletteProvider;
