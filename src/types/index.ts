// TypeScript interfaces for the Stupid Web Tricks project

export interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  hue: number;
  baseHue: number;
  baseSaturation: number;
  baseLightness: number;
  pulse: number;
  driftPhase: number;
  driftSpeed: number;
  connections: number[];
  currentHue: number;
  waveIntensity: number;
  waveDecay: number;
  constellationId: number;
  life?: number; // For explosion particles
}

export interface ColorWave {
  x: number;
  y: number;
  hue: number;
  intensity: number;
  speed: number;
  decay: number;
  radius: number;
  maxRadius: number;
  affectedParticles: Set<Particle>;
  startTime: number;
}

export interface FloatingShape {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  originalColor: string;
  hoverColor: string;
  isHovered: boolean;
  pulse: number;
  pulseSpeed: number;
  id: number;
  element?: HTMLElement; // For DOM-based shapes
  life?: number; // For explosion particles
  size?: number; // For explosion particles
}

export interface CategoryCardProps {
  title: string;
  description: string;
  icon: string;
  iconClass: string;
  href: string;
  features: string[];
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface ConstellationSystemConfig {
  connectionDistance: number;
  minConstellationSize: number;
  maxConstellationSize: number;
  particleCount: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface FloatingShapesConfig {
  shapes: Array<{
    size: number;
    color: string;
    x: number;
    y: number;
  }>;
  physics: {
    velocity: number;
    friction: number;
    collisionDamping: number;
  };
}
