import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Briefcase, Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';

const floatingObjects = [
  {
    className: 'left-[8%] top-[16%] h-3 w-3 rounded-full bg-primary/55',
    animation: { x: [0, 16, -10, 0], y: [0, -12, 8, 0] },
    duration: 9,
  },
  {
    className: 'right-[12%] top-[18%] h-4 w-4 rounded-md bg-secondary/45',
    animation: { x: [0, -18, 10, 0], y: [0, 14, -6, 0], rotate: [0, 12, -8, 0] },
    duration: 11,
  },
  {
    className: 'left-[14%] bottom-[18%] h-5 w-5 rounded-full border border-accent/45 bg-accent/15',
    animation: { x: [0, 12, -6, 0], y: [0, 10, -14, 0] },
    duration: 10,
  },
  {
    className: 'right-[18%] bottom-[14%] h-3.5 w-3.5 rounded-sm bg-primary/40',
    animation: { x: [0, -14, 8, 0], y: [0, -10, 12, 0], rotate: [0, -16, 10, 0] },
    duration: 8,
  },
  {
    className: 'left-1/2 top-[10%] h-2.5 w-12 -translate-x-1/2 rounded-full bg-foreground/10',
    animation: { x: [0, 8, -8, 0], y: [0, -6, 6, 0] },
    duration: 12,
  },
  {
    className: 'left-1/2 bottom-[9%] h-10 w-10 -translate-x-1/2 rounded-full border border-primary/25 bg-primary/10',
    animation: { x: [0, 10, -10, 0], y: [0, 8, -8, 0] },
    duration: 13,
  },
] as const;

const NotFound = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const pathLabel = location.pathname === '/' ? '/' : location.pathname;

  return (
    <>
      <SEOHead
        title="404 | Page Not Found"
        description="The requested page could not be found."
        url="https://iamtonde.co.za/404"
        noIndex
      />

      <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,hsl(262_83%_68%_/_0.14),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(197_100%_73%_/_0.12),transparent_28%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(140deg,hsl(var(--background))_0%,hsl(var(--background)/0.92)_48%,hsl(var(--background)/0.82)_100%)]"
        />

        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-primary/80">
              Error 404
            </p>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              This route does not exist anymore.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              The page may have moved, the link may be outdated, or the URL may have been typed incorrectly.
              The rest of the portfolio is still available.
            </p>

            <div className="mt-6 inline-flex max-w-full items-center gap-3 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <span className="font-medium text-foreground">Requested path</span>
              <code className="max-w-[14rem] truncate rounded bg-muted px-2 py-1 font-mono text-xs text-foreground sm:max-w-[24rem]">
                {pathLabel}
              </code>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-sm">
                <Link to="/">
                  <Home className="mr-2" aria-hidden="true" />
                  Return Home
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="shadow-sm">
                <Link to="/#projects">
                  <Briefcase className="mr-2" aria-hidden="true" />
                  View Case Studies
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              If you expected this page to exist, the link is probably stale and should be updated.
            </p>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(262_83%_68%_/_0.08),transparent_35%,hsl(197_100%_73%_/_0.08)_100%)]"
              />

              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {floatingObjects.map((object) => (
                  <motion.div
                    key={object.className}
                    className={`absolute ${object.className}`}
                    animate={prefersReducedMotion ? undefined : object.animation}
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : {
                            duration: object.duration,
                            repeat: Infinity,
                            repeatType: 'mirror',
                            ease: 'easeInOut',
                          }
                    }
                    style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                  <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                  Lost route, active fallback
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                  {['4', '4'].map((digit, index) => (
                    <motion.div
                      key={`${digit}-${index}`}
                      className="rounded-[1.75rem] border border-border/60 bg-background/80 px-4 py-8 text-center shadow-lg"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { y: index === 0 ? [0, -6, 0] : [0, 6, 0] }
                      }
                      transition={
                        prefersReducedMotion
                          ? undefined
                          : { duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }
                      }
                    >
                      <span className="bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-6xl font-bold text-transparent sm:text-7xl">
                        {digit}
                      </span>
                    </motion.div>
                  ))}

                  <motion.div
                    className="relative flex aspect-square w-full max-w-[7rem] items-center justify-center rounded-full border border-primary/25 bg-primary/10 shadow-inner shadow-primary/15"
                    animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : { duration: 18, repeat: Infinity, ease: 'linear' }
                    }
                  >
                    <div className="absolute h-[76%] w-[76%] rounded-full border border-secondary/30" />
                    <div className="absolute h-[48%] w-[48%] rounded-full border border-accent/30" />
                    <div className="h-3.5 w-3.5 rounded-full bg-accent shadow-[0_0_24px_rgba(103,232,249,0.55)]" />
                  </motion.div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
                      Fast recovery
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Jump back to the homepage or continue into the portfolio work directly.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
                      Low overhead
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The motion uses a few transform-only elements and respects reduced-motion settings.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>The page is missing, not the portfolio.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFound;
