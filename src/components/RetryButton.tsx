import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RetryButtonProps {
  onRetry: () => void;
  disabled?: boolean;
  className?: string;
}

const RetryButton = ({ onRetry, disabled = false, className = '' }: RetryButtonProps) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button onClick={onRetry} disabled={disabled} variant="outline" className={className}>
        <RefreshCw className={`w-4 h-4 mr-2 ${disabled ? 'animate-spin' : ''}`} />
        Try Again
      </Button>
    </motion.div>
  );
};

export default RetryButton;
