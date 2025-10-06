import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCw } from 'lucide-react';

interface SnakeGameProps {
  onBack: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const SnakeGame = ({ onBack }: SnakeGameProps) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const checkCollision = useCallback((head: { x: number; y: number }) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    if (checkCollision(newHead)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];

    // Check if snake ate food
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(prev => prev + 10);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, checkCollision, generateFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, isPaused]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
      <div className="container mx-auto max-w-2xl">
        <Button onClick={onBack} variant="outline" className="mb-6" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>

        <Card className="glass-vibrant border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Snake</h2>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-primary">{score}</p>
              </div>
            </div>

            {gameOver && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-center">
                <p className="text-lg font-bold mb-2">Game Over!</p>
                <Button onClick={resetGame} size="sm">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/50 rounded-lg text-center">
                <p className="text-lg font-bold">Paused</p>
                <p className="text-sm text-muted-foreground">Press Space to resume</p>
              </div>
            )}

            <div className="flex justify-center mb-6">
              <div 
                className="inline-block p-2 bg-muted/30 rounded-lg"
                style={{
                  width: GRID_SIZE * CELL_SIZE + 16,
                  height: GRID_SIZE * CELL_SIZE + 16,
                }}
              >
                <div 
                  className="relative bg-background/50 rounded"
                  style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                  }}
                >
                  {/* Snake */}
                  {snake.map((segment, index) => (
                    <div
                      key={index}
                      className="absolute rounded-sm"
                      style={{
                        left: segment.x * CELL_SIZE,
                        top: segment.y * CELL_SIZE,
                        width: CELL_SIZE - 2,
                        height: CELL_SIZE - 2,
                        backgroundColor: index === 0 
                          ? 'hsl(var(--primary))' 
                          : 'hsl(var(--secondary))',
                      }}
                    />
                  ))}
                  
                  {/* Food */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      left: food.x * CELL_SIZE,
                      top: food.y * CELL_SIZE,
                      width: CELL_SIZE - 2,
                      height: CELL_SIZE - 2,
                      backgroundColor: 'hsl(var(--accent))',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Controls:</p>
                <p className="text-muted-foreground">↑ ↓ ← → : Direction</p>
              </div>
              <div>
                <p className="text-muted-foreground">Space : Pause</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SnakeGame;
