import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectFilterProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  availableTechs: string[];
}

const ProjectFilter = ({ selectedFilters, onFilterChange, availableTechs }: ProjectFilterProps) => {
  const toggleFilter = (tech: string) => {
    if (selectedFilters.includes(tech)) {
      onFilterChange(selectedFilters.filter((f) => f !== tech));
    } else {
      onFilterChange([...selectedFilters, tech]);
    }
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>

        {availableTechs.map((tech) => (
          <motion.button
            key={tech}
            onClick={() => toggleFilter(tech)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant={selectedFilters.includes(tech) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all duration-200 ${
                selectedFilters.includes(tech)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10'
              }`}
            >
              {tech}
            </Badge>
          </motion.button>
        ))}

        {selectedFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {selectedFilters.length > 0 && (
        <motion.p
          className="text-sm text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Showing projects with: {selectedFilters.join(', ')}
        </motion.p>
      )}
    </motion.div>
  );
};

export default ProjectFilter;
