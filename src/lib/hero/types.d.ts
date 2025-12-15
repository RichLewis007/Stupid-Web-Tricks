// Type definitions for hero effects

import type { Point, Circle, Segment, LaserSegment } from '../types/index.js';

export interface MagneticTextElement extends HTMLElement {
  magneticText?: {
    baseX: number;
    baseY: number;
    currentX: number;
    currentY: number;
  };
}

export interface ParticleTrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  id: number;
  createdAt: number;
}

export { Point, Circle, Segment, LaserSegment };

