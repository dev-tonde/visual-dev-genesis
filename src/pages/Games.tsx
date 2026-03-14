import { useMemo, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Cpu, ExternalLink, Gamepad2, Github, Grid3x3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import SEOHead from '@/components/SEOHead';
import TetrisGame from '@/components/games/TetrisGame';
import SnakeGame from '@/components/games/SnakeGame';
import PongGame from '@/components/games/PongGame';
import MemoryGame from '@/components/games/MemoryGame';
import TicTacToeGame from '@/components/games/TicTacToeGame';
import { PROFILE } from '@/config/profile';

type GameId = 'tetris' | 'snake' | 'pong' | 'memory' | 'tictactoe';
type DemoTrack = 'systems' | 'logic';
type DemoDensity = 'Featured demo' | 'Compact logic demo';

interface GameShowcase {
  id: GameId;
  name: string;
  summary: string;
  icon: typeof Grid3x3;
  track: DemoTrack;
  densityLabel: DemoDensity;
  evidence: string;
  technologies: readonly string[];
  challenge: string;
  controls: string;
  sourceUrl: string;
}

const GAME_SOURCE_BASE_URL = `${PROFILE.portfolioRepoUrl}/blob/main/src/components/games`;

const GAME_SHOWCASES: readonly GameShowcase[] = [
  {
    id: 'tetris',
    name: 'Tetris',
    summary:
      'A grid-based gameplay loop that stresses collision rules, rotation, and line clearing.',
    icon: Grid3x3,
    track: 'systems',
    densityLabel: 'Featured demo',
    evidence: 'Shows real-time state updates on a 10x20 board with deterministic piece merges.',
    technologies: ['React state', 'TypeScript', 'Grid rendering'],
    challenge:
      'Rotation and collision checks have to stay predictable while merging pieces and clearing multiple rows.',
    controls: 'Arrow keys move and rotate. Space pauses.',
    sourceUrl: `${GAME_SOURCE_BASE_URL}/TetrisGame.tsx`,
  },
  {
    id: 'snake',
    name: 'Snake',
    summary:
      'A compact game loop focused on keyboard input, interval timing, and collision handling.',
    icon: Gamepad2,
    track: 'systems',
    densityLabel: 'Featured demo',
    evidence:
      'Demonstrates input guards, pause state, and coordinate-based rendering without a canvas dependency.',
    technologies: ['React hooks', 'TypeScript', 'Absolute positioning'],
    challenge:
      'Direction changes must feel immediate without allowing invalid self-reversals or stale interval state.',
    controls: 'Arrow keys change direction. Space pauses.',
    sourceUrl: `${GAME_SOURCE_BASE_URL}/SnakeGame.tsx`,
  },
  {
    id: 'pong',
    name: 'Pong',
    summary:
      'A canvas-based rendering demo with mouse input, AI paddle tracking, and frame-by-frame motion.',
    icon: Gamepad2,
    track: 'systems',
    densityLabel: 'Featured demo',
    evidence: 'Shows when imperative canvas rendering is the right fit for a fast update loop.',
    technologies: ['Canvas 2D', 'React refs', 'TypeScript'],
    challenge:
      'The paddle AI, bounce response, and render loop need to stay responsive without turning the component into uncontrolled state.',
    controls: 'Move the mouse to steer. Space starts or pauses.',
    sourceUrl: `${GAME_SOURCE_BASE_URL}/PongGame.tsx`,
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    summary: 'A smaller decision-logic demo built around turn management and minimax search.',
    icon: Grid3x3,
    track: 'logic',
    densityLabel: 'Compact logic demo',
    evidence: 'The value here is the AI decision tree, not the board rendering.',
    technologies: ['Minimax', 'React state', 'TypeScript'],
    challenge:
      'The AI should feel immediate while still exploring the full game tree and preserving clear UI state.',
    controls: 'Click any empty square to place X.',
    sourceUrl: `${GAME_SOURCE_BASE_URL}/TicTacToeGame.tsx`,
  },
  {
    id: 'memory',
    name: 'Memory Match',
    summary:
      'A lightweight interaction study for staged UI updates, disabled states, and feedback timing.',
    icon: Grid3x3,
    track: 'logic',
    densityLabel: 'Compact logic demo',
    evidence: 'Useful as a smaller proof point for match evaluation and delayed state transitions.',
    technologies: ['React state', 'Framer Motion', 'TypeScript'],
    challenge:
      'Card flips, match locks, and reset timing need to stay consistent even under rapid clicks.',
    controls: 'Click cards to reveal and match pairs.',
    sourceUrl: `${GAME_SOURCE_BASE_URL}/MemoryGame.tsx`,
  },
] as const;

const getGameComponent = (gameId: GameId): ComponentType<{ onBack: () => void }> => {
  switch (gameId) {
    case 'tetris':
      return TetrisGame;
    case 'snake':
      return SnakeGame;
    case 'pong':
      return PongGame;
    case 'memory':
      return MemoryGame;
    case 'tictactoe':
      return TicTacToeGame;
  }
};

const getSectionDescription = (track: DemoTrack) => {
  switch (track) {
    case 'systems':
      return 'Larger demos that show real-time updates, input handling, and rendering choices under pressure.';
    case 'logic':
      return 'Smaller interaction studies that still show decision logic, turn state, and controlled UI transitions.';
  }
};

interface GameShowcaseCardProps {
  game: GameShowcase;
  onLaunch: (gameId: GameId) => void;
}

const GameShowcaseCard = ({ game, onLaunch }: GameShowcaseCardProps) => (
  <motion.div
    variants={{
      hidden: { y: 30, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.6,
        },
      },
    }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="glass-vibrant border-0 flex h-full flex-col shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
            >
              <game.icon className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{game.densityLabel}</Badge>
                <Badge variant="secondary">
                  {game.track === 'systems' ? 'Interactive systems' : 'Decision logic'}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{game.name}</CardTitle>
            </div>
          </div>
        </div>

        <CardDescription className="text-sm leading-6 text-foreground/80">
          {game.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-5">
        <div className="grid gap-4 text-sm">
          <div className="rounded-xl border border-border/60 bg-background/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Demonstrates
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/80">{game.evidence}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Core Tech
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {game.technologies.map((technology) => (
                <Badge key={technology} variant="outline" className="bg-background/50">
                  {technology}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Interesting Bit
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/80">{game.challenge}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Controls
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{game.controls}</p>
        </div>

        <div className="card-action-stack">
          <Button
            onClick={() => onLaunch(game.id)}
            className="card-action-button gradient-primary"
            size="lg"
          >
            Open Demo
          </Button>
          <Button variant="outline" size="lg" asChild className="card-action-button">
            <a
              href={game.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source for ${game.name}`}
            >
              <Code2 className="w-4 h-4 mr-2" />
              View Source
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Games = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.08,
      },
    },
  };

  const featuredDemos = useMemo(
    () => GAME_SHOWCASES.filter((game) => game.track === 'systems'),
    []
  );
  const compactDemos = useMemo(() => GAME_SHOWCASES.filter((game) => game.track === 'logic'), []);

  if (activeGame) {
    const ActiveGameComponent = getGameComponent(activeGame);
    return <ActiveGameComponent onBack={() => setActiveGame(null)} />;
  }

  return (
    <>
      <SEOHead
        title="Interactive Engineering Demos - Tonderai Matanga"
        description="Interactive browser demos that showcase real-time state, Canvas rendering, decision logic, and input handling in React and TypeScript."
      />
      <Navigation />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="container mx-auto max-w-6xl"
        >
          <motion.div
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
            }}
            className="mb-12"
          >
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Interactive engineering demos</Badge>
                <Badge variant="secondary">Real source links</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Interactive Engineering Demos
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  This page exists to show front-end engineering judgment, not side entertainment.
                  Each demo is small on purpose and highlights a specific skill: real-time state,
                  canvas rendering, input handling, or decision logic.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
            }}
            className="grid gap-4 md:grid-cols-3 mb-12"
          >
            <Card className="glass-vibrant border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-primary" />
                  <p className="font-semibold">What to look for</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Input models, update loops, and how rendering strategy changes between DOM-driven
                  and canvas-driven interactions.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-vibrant border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Why these demos matter</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  They surface implementation decisions that a static portfolio card cannot show:
                  timing, collision rules, AI behavior, and state recovery.
                </p>
              </CardContent>
            </Card>
            <Card className="glass-vibrant border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Source availability</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every demo links to its implementation in the public portfolio repo so the code
                  can be inspected directly.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {(
            [
              ['systems', featuredDemos],
              ['logic', compactDemos],
            ] as const
          ).map(([track, games]) => (
            <section key={track} className="mb-14">
              <motion.div
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
                }}
                className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
              >
                <div>
                  <h2 className="text-3xl font-bold">
                    {track === 'systems' ? 'Featured systems demos' : 'Compact logic demos'}
                  </h2>
                  <p className="mt-2 max-w-3xl text-muted-foreground">
                    {getSectionDescription(track)}
                  </p>
                </div>
                {track === 'systems' && (
                  <Button variant="outline" asChild>
                    <a href={`${GAME_SOURCE_BASE_URL}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Browse all demo source
                    </a>
                  </Button>
                )}
              </motion.div>

              <div
                className={`grid gap-6 ${track === 'systems' ? 'lg:grid-cols-3 md:grid-cols-2' : 'lg:grid-cols-2'}`}
              >
                {games.map((game) => (
                  <GameShowcaseCard key={game.id} game={game} onLaunch={setActiveGame} />
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      </main>
    </>
  );
};

export default Games;
