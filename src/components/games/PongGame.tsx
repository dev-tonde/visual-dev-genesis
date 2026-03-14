import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface PongGameProps {
  onBack: () => void;
}

const PongGame = ({ onBack }: PongGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPaused, setIsPaused] = useState(true);
  const gameStateRef = useRef({
    ball: { x: 400, y: 300, dx: 4, dy: 4, radius: 8 },
    player: { x: 20, y: 250, width: 10, height: 100 },
    ai: { x: 770, y: 250, width: 10, height: 100 },
    mouseY: 300,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.mouseY = e.clientY - rect.top;
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPaused((prev) => !prev);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);

    const gameLoop = setInterval(() => {
      if (isPaused) return;

      const { ball, player, ai } = gameStateRef.current;

      // Move player paddle to follow mouse
      player.y = Math.max(
        0,
        Math.min(600 - player.height, gameStateRef.current.mouseY - player.height / 2)
      );

      // Simple AI: follow the ball
      const aiCenter = ai.y + ai.height / 2;
      if (aiCenter < ball.y - 35) {
        ai.y = Math.min(600 - ai.height, ai.y + 3.5);
      } else if (aiCenter > ball.y + 35) {
        ai.y = Math.max(0, ai.y - 3.5);
      }

      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Ball collision with top/bottom
      if (ball.y - ball.radius < 0 || ball.y + ball.radius > 600) {
        ball.dy = -ball.dy;
      }

      // Ball collision with paddles
      if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
      ) {
        ball.dx = Math.abs(ball.dx);
        ball.dy += (ball.y - (player.y + player.height / 2)) * 0.1;
      }

      if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + ai.height) {
        ball.dx = -Math.abs(ball.dx);
        ball.dy += (ball.y - (ai.y + ai.height / 2)) * 0.1;
      }

      // Score points
      if (ball.x - ball.radius < 0) {
        setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
        ball.x = 400;
        ball.y = 300;
        ball.dx = 4;
        ball.dy = 4;
        setIsPaused(true);
      }

      if (ball.x + ball.radius > 800) {
        setScore((prev) => ({ ...prev, player: prev.player + 1 }));
        ball.x = 400;
        ball.y = 300;
        ball.dx = -4;
        ball.dy = -4;
        setIsPaused(true);
      }

      // Draw everything
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, 800, 600);

      // Draw center line
      ctx.strokeStyle = 'hsl(var(--muted-foreground))';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(400, 0);
      ctx.lineTo(400, 600);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = 'hsl(var(--destructive))';
      ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

      // Draw ball
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      canvas.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPaused]);

  const resetGame = () => {
    setScore({ player: 0, ai: 0 });
    gameStateRef.current = {
      ball: { x: 400, y: 300, dx: 4, dy: 4, radius: 8 },
      player: { x: 20, y: 250, width: 10, height: 100 },
      ai: { x: 770, y: 250, width: 10, height: 100 },
      mouseY: 300,
    };
    setIsPaused(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <Button onClick={onBack} variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Demos
            </Button>
            <div className="flex gap-4 items-center">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">You</div>
                <div className="text-3xl font-bold text-primary">{score.player}</div>
              </div>
              <div className="text-2xl text-muted-foreground">-</div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">AI</div>
                <div className="text-3xl font-bold text-destructive">{score.ai}</div>
              </div>
            </div>
          </div>

          <Card className="glass-vibrant border-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="border border-border rounded-lg max-w-full"
                  style={{ cursor: 'none' }}
                />

                {isPaused && (
                  <div className="text-center">
                    <p className="text-lg text-muted-foreground mb-4">
                      {score.player === 0 && score.ai === 0
                        ? 'Move your mouse to control the paddle. Press Space or click Start to begin!'
                        : 'Game Paused - Press Space or click Resume to continue'}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsPaused(!isPaused)}
                    size="lg"
                    className="gradient-primary"
                  >
                    {isPaused ? 'Start Game' : 'Pause'}
                  </Button>
                  <Button onClick={resetGame} variant="outline" size="lg">
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PongGame;
