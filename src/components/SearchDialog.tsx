import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHotkeys } from 'react-hotkeys-hook';

interface SearchResult {
  id: string;
  title: string;
  type: 'section' | 'project' | 'skill' | 'certification';
  description?: string;
  sectionId: string;
}

const SearchDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Open with Cmd/Ctrl + K
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  // Searchable content database
  const searchableContent: SearchResult[] = [
    { id: 'hero', title: 'Home', type: 'section', description: 'Portfolio homepage', sectionId: 'hero' },
    { id: 'about', title: 'About Me', type: 'section', description: 'Learn about my background', sectionId: 'about' },
    { id: 'projects', title: 'Projects', type: 'section', description: 'View my work', sectionId: 'projects' },
    { id: 'certifications', title: 'Certifications', type: 'section', description: 'My achievements and credentials', sectionId: 'certifications' },
    { id: 'testimonials', title: 'Testimonials', type: 'section', description: 'Client feedback', sectionId: 'testimonials' },
    { id: 'contact', title: 'Contact', type: 'section', description: 'Get in touch', sectionId: 'contact' },
    
    // Skills
    { id: 'skill-react', title: 'React', type: 'skill', description: 'Modern React development with hooks', sectionId: 'about' },
    { id: 'skill-typescript', title: 'TypeScript', type: 'skill', description: 'Type-safe JavaScript', sectionId: 'about' },
    { id: 'skill-tailwind', title: 'Tailwind CSS', type: 'skill', description: 'Utility-first CSS framework', sectionId: 'about' },
    { id: 'skill-nextjs', title: 'Next.js', type: 'skill', description: 'React framework for production', sectionId: 'about' },
    { id: 'skill-nodejs', title: 'Node.js', type: 'skill', description: 'Backend JavaScript runtime', sectionId: 'about' },
    { id: 'skill-git', title: 'Git', type: 'skill', description: 'Version control', sectionId: 'about' },
  ];

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = searchableContent.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery)
    );

    setResults(filtered);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const element = document.getElementById(result.sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'section': return 'bg-primary/10 text-primary';
      case 'project': return 'bg-secondary/10 text-secondary';
      case 'skill': return 'bg-accent/10 text-accent';
      case 'certification': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        className="glass hidden md:flex items-center space-x-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="text-xs text-muted-foreground">Search</span>
        <kbd className="px-2 py-0.5 text-xs bg-muted rounded">⌘K</kbd>
      </Button>

      {/* Mobile Search Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <Search className="w-5 h-5" />
      </Button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="sr-only">Search Portfolio</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search projects, skills, sections..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] px-4 pb-4">
            {results.length > 0 ? (
              <div className="space-y-2 mt-4">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left p-3 rounded-lg hover:bg-accent/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {result.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : query.trim() !== '' ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="mb-2">Start typing to search</p>
                <p className="text-sm">Try "React", "Projects", or "Contact"</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchDialog;
