// Shared TypeScript type definitions

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Circle definition
 */
export interface Circle {
  x: number;
  y: number;
  r: number;
}

/**
 * Line segment
 */
export interface Segment {
  start: Point;
  end: Point;
  expires?: number;
}

/**
 * Laser segment with expiration
 */
export interface LaserSegment extends Segment {
  expires: number;
}

/**
 * Bubble/Shape configuration
 */
export interface BubbleShape {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  colors?: string[];
  originalColor: string;
  hoverColor: string;
  isHovered: boolean;
  pulse: number;
  pulseSpeed: number;
  id: number;
  wobblePhase?: number;
  wobbleSpeed?: number;
  distortionSeed?: number;
  reflectionAngle?: number;
  isPopping?: boolean;
  popPhase?: number;
  hasTriggeredSound?: boolean;
  forcePop?: boolean;
  lightExplosion?: boolean;
  life?: number;
  size?: number;
}

/**
 * SoapBubbles configuration
 */
export interface SoapBubblesConfig {
  containerSelector: string;
  canvasId: string;
  bubbleCount: number;
  minRadius: number;
  maxRadius: number;
  collisionSelectors: string[];
  enableMousePop: boolean;
  enableMouseInteraction: boolean;
}

/**
 * Performance sample
 */
export interface PerformanceSample {
  delta: number;
  fps: number;
  timestamp: number;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  averageFps: number;
  averageDelta: number;
  minFps: number;
  maxFps: number;
  minDelta: number;
  maxDelta: number;
  frameCount: number;
  sampleCount: number;
}

/**
 * Performance monitor options
 */
export interface PerformanceMonitorOptions {
  enabled?: boolean;
  logThreshold?: number;
  maxSamples?: number;
  onFrame?: (stats: { delta: number; fps: number; frameCount: number }) => void;
  onWarning?: (stats: PerformanceStats) => void;
  logWarnings?: boolean;
}

/**
 * Mobile menu configuration
 */
export interface MobileMenuConfig {
  buttonId?: string;
  menuId?: string;
}
