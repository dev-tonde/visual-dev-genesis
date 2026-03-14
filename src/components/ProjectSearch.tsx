import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeSearchInput } from '@/lib/sanitize';

interface ProjectSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  resultsCount: number;
}

const ProjectSearch = ({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  resultsCount
}: ProjectSearchProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleClearSearch = () => {
    onSearchChange('');
    selectedTags.forEach(tag => onTagToggle(tag));
  };

  const hasActiveFilters = searchTerm || selectedTags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-4"
    >
      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => onSearchChange(sanitizeSearchInput(e.target.value))}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10 pr-10 glass-vibrant border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-300"
          />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          <AnimatePresence>
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-300 hover-lift ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'hover:bg-primary/10'
                    }`}
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Results Info and Clear Button */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <span>
              {resultsCount} project{resultsCount !== 1 ? 's' : ''} found
            </span>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearSearch}
              className="h-6 px-2 text-xs hover:text-foreground"
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap justify-center gap-2"
          >
            <span className="text-sm text-muted-foreground self-center">Active filters:</span>
            {selectedTags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  variant="destructive"
                  className="cursor-pointer hover-lift"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectSearch;
