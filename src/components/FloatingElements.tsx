import { motion } from 'framer-motion';
import { Code2, Palette, Zap, Rocket, Star, Heart } from 'lucide-react';

const FloatingElements = () => {
  const elements = [
    { Icon: Code2, delay: 0, duration: 20 },
    { Icon: Palette, delay: 2, duration: 25 },
    { Icon: Zap, delay: 4, duration: 18 },
    { Icon: Rocket, delay: 6, duration: 22 },
    { Icon: Star, delay: 8, duration: 28 },
    { Icon: Heart, delay: 10, duration: 24 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" style={{ willChange: 'auto' }}>
      {elements.map(({ Icon, delay, duration }, index) => (
        <motion.div
          key={index}
          className="absolute opacity-20"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: (typeof window !== 'undefined' ? window.innerHeight : 1080) + 50,
            rotate: 0,
            scale: 0.5
          }}
          animate={{
            y: -100,
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            rotate: 360,
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ willChange: 'transform' }}
        >
          <Icon 
            className="w-8 h-8 text-primary" 
            style={{
              filter: 'drop-shadow(0 0 10px hsl(var(--primary)))',
            }}
            aria-hidden="true"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;