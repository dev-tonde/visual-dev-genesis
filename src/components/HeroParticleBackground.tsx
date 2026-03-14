import { useEffect, useRef, useState } from 'react';

type ParticleShape = 'circle' | 'square' | 'triangle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  driftX: number;
  driftY: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  phase: number;
  shape: ParticleShape;
  color: string;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

interface HeroParticleBackgroundProps {
  particleCount?: number;
}

const DEFAULT_PARTICLE_COUNT = 60;
const MIN_PARTICLE_COUNT = 50;
const MAX_PARTICLE_COUNT = 90;
const MAX_DEVICE_PIXEL_RATIO = 2;
const POINTER_INFLUENCE_RADIUS = 160;
const PARTICLE_SHAPES: ParticleShape[] = ['circle', 'square', 'triangle'];

const HeroParticleBackground = ({
  particleCount = DEFAULT_PARTICLE_COUNT,
}: HeroParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });
  const animationFrameRef = useRef<number>();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const noHoverQuery = window.matchMedia('(hover: none)');

    const updateEligibility = () => {
      setIsEnabled(
        !reducedMotionQuery.matches && !coarsePointerQuery.matches && !noHoverQuery.matches
      );
    };

    updateEligibility();

    reducedMotionQuery.addEventListener('change', updateEligibility);
    coarsePointerQuery.addEventListener('change', updateEligibility);
    noHoverQuery.addEventListener('change', updateEligibility);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateEligibility);
      coarsePointerQuery.removeEventListener('change', updateEligibility);
      noHoverQuery.removeEventListener('change', updateEligibility);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;

    const resolvedParticleCount = Math.min(
      MAX_PARTICLE_COUNT,
      Math.max(MIN_PARTICLE_COUNT, particleCount)
    );

    const getPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      const tokens = ['--primary', '--secondary', '--accent']
        .map((token) => styles.getPropertyValue(token).trim())
        .filter(Boolean);

      if (tokens.length === 0) {
        return ['hsl(221 83% 53%)', 'hsl(262 83% 58%)', 'hsl(173 80% 40%)'];
      }

      return tokens.map((token) => `hsl(${token})`);
    };

    let palette = getPalette();

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      driftX: (Math.random() - 0.5) * 0.016,
      driftY: (Math.random() - 0.5) * 0.016,
      size: Math.random() * 4 + 2.5,
      opacity: Math.random() * 0.28 + 0.16,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.008,
      phase: Math.random() * Math.PI * 2,
      shape: PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)],
      color: palette[Math.floor(Math.random() * palette.length)],
    });

    const recreateParticles = () => {
      particlesRef.current = Array.from({ length: resolvedParticleCount }, createParticle);
    };

    const syncCanvasSize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(bounds.width, window.innerWidth);
      height = Math.max(bounds.height, window.innerHeight);

      const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      palette = getPalette();
      recreateParticles();
    };

    const drawParticle = (particle: Particle) => {
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.globalAlpha = particle.opacity;
      context.fillStyle = particle.color;
      context.shadowBlur = 18;
      context.shadowColor = particle.color;

      if (particle.shape === 'circle') {
        context.beginPath();
        context.arc(0, 0, particle.size, 0, Math.PI * 2);
        context.fill();
      } else if (particle.shape === 'square') {
        context.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
      } else {
        context.beginPath();
        context.moveTo(0, -particle.size * 1.4);
        context.lineTo(particle.size * 1.2, particle.size);
        context.lineTo(-particle.size * 1.2, particle.size);
        context.closePath();
        context.fill();
      }

      context.restore();
    };

    const updateParticle = (particle: Particle, time: number) => {
      particle.phase += 0.002;
      particle.vx += Math.sin(time + particle.phase) * particle.driftX;
      particle.vy += Math.cos(time + particle.phase) * particle.driftY;

      if (pointerRef.current.active) {
        const dx = particle.x - pointerRef.current.x;
        const dy = particle.y - pointerRef.current.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > 0.0001 && distanceSquared < POINTER_INFLUENCE_RADIUS ** 2) {
          const distance = Math.sqrt(distanceSquared);
          const force = (1 - distance / POINTER_INFLUENCE_RADIUS) ** 2;
          particle.vx += (dx / distance) * force * 0.9;
          particle.vy += (dy / distance) * force * 0.9;
        }
      }

      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;

      const margin = 24;
      if (particle.x < -margin) particle.x = width + margin;
      if (particle.x > width + margin) particle.x = -margin;
      if (particle.y < -margin) particle.y = height + margin;
      if (particle.y > height + margin) particle.y = -margin;
    };

    const renderFrame = (timestamp: number) => {
      context.clearRect(0, 0, width, height);

      const time = timestamp * 0.00035;
      particlesRef.current.forEach((particle) => {
        updateParticle(particle, time);
        drawParticle(particle);
      });

      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    const updatePointerPosition = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        active: true,
      };
    };

    const clearPointer = () => {
      pointerRef.current.active = false;
    };

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize();
    });

    resizeObserver.observe(container);
    syncCanvasSize();

    container.addEventListener('pointermove', updatePointerPosition, { passive: true });
    container.addEventListener('pointerdown', updatePointerPosition, { passive: true });
    container.addEventListener('pointerleave', clearPointer);
    container.addEventListener('pointercancel', clearPointer);
    window.addEventListener('resize', syncCanvasSize, { passive: true });

    animationFrameRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', updatePointerPosition);
      container.removeEventListener('pointerdown', updatePointerPosition);
      container.removeEventListener('pointerleave', clearPointer);
      container.removeEventListener('pointercancel', clearPointer);
      window.removeEventListener('resize', syncCanvasSize);

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEnabled, particleCount]);

  if (!isEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-20 h-full w-full pointer-events-none"
    />
  );
};

export default HeroParticleBackground;
