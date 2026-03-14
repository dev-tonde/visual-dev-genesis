import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCw } from 'lucide-react';

interface TetrisGameProps {
  onBack: () => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(197 100% 73%)',
  'hsl(45 93% 65%)',
  'hsl(340 82% 62%)',
  'hsl(120 60% 50%)',
];

type Board = number[][];
type Tetromino = number[][];

const createEmptyBoard = (): Board => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));

const TetrisGame = ({ onBack }: TetrisGameProps) => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [currentColor, setCurrentColor] = useState(0);
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getRandomPiece = useCallback(() => {
    const pieces = Object.values(TETROMINOES);
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const color = Math.floor(Math.random() * COLORS.length);
    return { piece, color };
  }, []);

  const checkCollision = useCallback((piece: Tetromino, pos: { x: number; y: number }, currentBoard: Board) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          if (newY >= 0 && currentBoard[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentColor + 1;
          }
        }
      }
    }
    
    // Check for complete lines
    const completeLines = newBoard.reduce((acc, row, index) => {
      if (row.every(cell => cell !== 0)) acc.push(index);
      return acc;
    }, [] as number[]);
    
    if (completeLines.length > 0) {
      completeLines.forEach(lineIndex => {
        newBoard.splice(lineIndex, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      });
      setScore(prev => prev + completeLines.length * 100);
    }
    
    setBoard(newBoard);
    
    // Spawn new piece
    const { piece, color } = getRandomPiece();
    const newPosition = { x: 4, y: 0 };
    
    if (checkCollision(piece, newPosition, newBoard)) {
      setGameOver(true);
    } else {
      setCurrentPiece(piece);
      setCurrentColor(color);
      setPosition(newPosition);
    }
  }, [board, currentPiece, currentColor, position, getRandomPiece, checkCollision]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    const newPos = { ...position, y: position.y + 1 };
    if (checkCollision(currentPiece, newPos, board)) {
      mergePiece();
    } else {
      setPosition(newPos);
    }
  }, [currentPiece, position, board, gameOver, isPaused, checkCollision, mergePiece]);

  const moveLeft = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const newPos = { ...position, x: position.x - 1 };
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [currentPiece, position, board, gameOver, isPaused, checkCollision]);

  const moveRight = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const newPos = { ...position, x: position.x + 1 };
    if (!checkCollision(currentPiece, newPos, board)) {
      setPosition(newPos);
    }
  }, [currentPiece, position, board, gameOver, isPaused, checkCollision]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const rotated = currentPiece[0].map((_, index) =>
      currentPiece.map(row => row[index]).reverse()
    );
    if (!checkCollision(rotated, position, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, board, gameOver, isPaused, checkCollision]);

  useEffect(() => {
    const { piece, color } = getRandomPiece();
    setCurrentPiece(piece);
    setCurrentColor(color);
  }, [getRandomPiece]);

  useEffect(() => {
    const interval = setInterval(moveDown, 1000);
    return () => clearInterval(interval);
  }, [moveDown]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
      if (e.key === 'ArrowDown') moveDown();
      if (e.key === 'ArrowUp') rotatePiece();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, moveDown, rotatePiece]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    const { piece, color } = getRandomPiece();
    setCurrentPiece(piece);
    setCurrentColor(color);
    setPosition({ x: 4, y: 0 });
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && !gameOver) {
      currentPiece.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell && position.y + y >= 0) {
            displayBoard[position.y + y][position.x + x] = currentColor + 1;
          }
        });
      });
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 border border-border/20"
            style={{
              backgroundColor: cell ? COLORS[cell - 1] : 'hsl(var(--muted) / 0.2)',
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-background">
      <div className="container mx-auto max-w-2xl">
        <Button onClick={onBack} variant="outline" className="mb-6" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Demos
        </Button>

        <Card className="glass-vibrant border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Tetris</h2>
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
              <div className="inline-block p-2 bg-muted/30 rounded-lg">
                {renderBoard()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Controls:</p>
                <p className="text-muted-foreground">← → : Move</p>
                <p className="text-muted-foreground">↑ : Rotate</p>
              </div>
              <div>
                <p className="text-muted-foreground">↓ : Drop Faster</p>
                <p className="text-muted-foreground">Space : Pause</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TetrisGame;
