import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';

interface MemoryGameProps {
  onBack: () => void;
}

type CardType = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'];

const MemoryGame = ({ onBack }: MemoryGameProps) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = () => {
    const gameCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        value: emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matches === emojis.length) {
      setIsWon(true);
    }
  }, [matches]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || cards[cardId].isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card))
    );

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlippedCards;

      if (cards[firstId].value === cards[secondId].value) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isMatched: true } : card
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
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
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Moves</div>
                <div className="text-2xl font-bold">{moves}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Matches</div>
                <div className="text-2xl font-bold text-primary">
                  {matches}/{emojis.length}
                </div>
              </div>
            </div>
          </div>

          <Card className="glass-vibrant border-0">
            <CardContent className="p-6">
              {isWon ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <Trophy className="w-20 h-20 mx-auto text-primary" />
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Congratulations! 🎉</h2>
                    <p className="text-lg text-muted-foreground">
                      You completed the game in {moves} moves!
                    </p>
                  </div>
                  <Button onClick={initializeGame} size="lg" className="gradient-primary">
                    Play Again
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {cards.map((card) => (
                      <motion.div
                        key={card.id}
                        whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                        whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                      >
                        <button
                          onClick={() => handleCardClick(card.id)}
                          disabled={card.isFlipped || card.isMatched}
                          className={`
                            w-full aspect-square rounded-lg text-5xl font-bold
                            transition-all duration-300 transform
                            ${
                              card.isFlipped || card.isMatched
                                ? 'bg-primary/10 border-2 border-primary'
                                : 'bg-muted hover:bg-muted/80 border-2 border-border'
                            }
                            ${card.isMatched ? 'opacity-50' : ''}
                          `}
                        >
                          {card.isFlipped || card.isMatched ? card.value : '❓'}
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={initializeGame} variant="outline" size="lg">
                      Reset Game
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MemoryGame;
