import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';

interface TicTacToeGameProps {
  onBack: () => void;
}

type Player = 'X' | 'O' | null;
type Board = Player[];

const TicTacToeGame = ({ onBack }: TicTacToeGameProps) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (currentBoard: Board): { winner: Player | 'draw' | null; line: number[] } => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }

    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: [] };
    }

    return { winner: null, line: [] };
  };

  const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(board);
    
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getAIMove = (currentBoard: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      return;
    }

    setIsPlayerTurn(false);

    setTimeout(() => {
      const aiMove = getAIMove(newBoard);
      if (aiMove !== -1) {
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);

        const aiResult = checkWinner(newBoard);
        if (aiResult.winner) {
          setWinner(aiResult.winner);
          setWinningLine(aiResult.line);
        }
      }
      setIsPlayerTurn(true);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
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
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                {winner 
                  ? winner === 'draw' 
                    ? "It's a Draw!" 
                    : winner === 'X' 
                      ? 'You Won! 🎉' 
                      : 'AI Wins!'
                  : isPlayerTurn 
                    ? 'Your Turn (X)' 
                    : 'AI Thinking... (O)'}
              </div>
            </div>
          </div>

          <Card className="glass-vibrant border-0">
            <CardContent className="p-6">
              {winner && winner !== 'draw' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-6"
                >
                  <Trophy className={`w-16 h-16 mx-auto mb-2 ${winner === 'X' ? 'text-primary' : 'text-destructive'}`} />
                </motion.div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
                {board.map((cell, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    whileHover={!cell && !winner && isPlayerTurn ? { scale: 1.05 } : {}}
                    whileTap={!cell && !winner && isPlayerTurn ? { scale: 0.95 } : {}}
                    className={`
                      aspect-square rounded-lg text-5xl font-bold
                      transition-all duration-200
                      ${winningLine.includes(index) 
                        ? 'bg-primary/20 border-2 border-primary' 
                        : 'bg-muted/50 hover:bg-muted border-2 border-border'
                      }
                      ${!cell && !winner && isPlayerTurn ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                    disabled={!!cell || !!winner || !isPlayerTurn}
                  >
                    <span className={cell === 'X' ? 'text-primary' : 'text-destructive'}>
                      {cell}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={resetGame} size="lg" className="gradient-primary">
                  New Game
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TicTacToeGame;
