import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Grid3x3, Github } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SEOHead from '@/components/SEOHead';
import TetrisGame from '@/components/games/TetrisGame';
import SnakeGame from '@/components/games/SnakeGame';

const Games = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeGame, setActiveGame] = useState<'tetris' | 'snake' | null>(null);

  const games = [
    {
      id: 'tetris' as const,
      name: 'Tetris',
      description: 'Classic falling blocks puzzle game. Use arrow keys to move and rotate pieces.',
      icon: Grid3x3,
      controls: '← → : Move | ↑ : Rotate | ↓ : Drop | Space : Hard Drop',
    },
    {
      id: 'snake' as const,
      name: 'Snake',
      description: 'Guide the snake to eat food and grow. Don\'t hit the walls or yourself!',
      icon: Gamepad2,
      controls: '← → ↑ ↓ : Direction | Space : Pause',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  if (activeGame === 'tetris') {
    return <TetrisGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'snake') {
    return <SnakeGame onBack={() => setActiveGame(null)} />;
  }

  return (
    <>
      <SEOHead 
        title="Games - Tonderai Matanga"
        description="Play classic coding games built with React and TypeScript. Test your skills with Tetris, Snake, and more!"
      />
      <Navigation />
      
      <main className="min-h-screen pt-24 pb-16 px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="container mx-auto max-w-6xl"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Game Zone
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Classic games built with React and TypeScript. All playable with keyboard controls!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {games.map((game) => (
              <motion.div
                key={game.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-vibrant border-0 h-full shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                      >
                        <game.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{game.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-base">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-xs font-mono text-muted-foreground">
                        {game.controls}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setActiveGame(game.id)}
                      className="w-full gradient-primary"
                      size="lg"
                    >
                      Play {game.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <Card className="glass-vibrant border-0 inline-block shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Github className="w-5 h-5" />
                  <p className="text-sm">
                    Games built with React, TypeScript, and Canvas API
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
};

export default Games;
