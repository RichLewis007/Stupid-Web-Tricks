// Laser Overlay - Draws laser beams that pop bubbles

import { randomEdgePoint, extendToBoundary, segmentCircleHit } from './helpers.js';

export const LASER_INTERVAL_MS = 10000; // every 10 seconds

// Shared laser segment state so other systems can react
/** @type {import('./types.js').LaserSegment | null} */
let activeLaserSegment = null;

/**
 * Get the currently active laser segment
 * @returns {import('./types.js').LaserSegment | null} Active laser segment or null
 */
export function getActiveLaserSegment() {
  return activeLaserSegment;
}

/**
 * Laser Overlay - Draws laser beams that pop bubbles
 * @class
 */
export class LaserOverlay {
  /**
   * @constructor
   */
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.dpr = 1;
    this.intervalId = null;
    this.fadeTimeout = null;
    this.clearTimeout = null;
    this.resizeHandler = () => this.resize();
    this.isVisible = true;
    this.visibilityHandler = null;
    this.audioContext = null;
    this.isOnScreen = true;
  }

  /**
   * Pause the laser overlay (stop sounds and prevent firing)
   * @returns {void}
   */
  pause() {
    this.isOnScreen = false;
    // Stop any ongoing sounds by closing audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  /**
   * Resume the laser overlay
   * @returns {void}
   */
  resume() {
    this.isOnScreen = true;
  }

  /**
   * Play laser sound effect using Web Audio API
   * @returns {void}
   */
  playLaserSound() {
    // Don't play sound if hero is off screen
    if (!this.isOnScreen) return;

    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window['webkitAudioContext'];
        this.audioContext = new AudioContext();
      }

      // Resume audio context if suspended (required for autoplay policies)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator for high-pitched sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const duration = 0.3; // Longer duration
      const startTime = this.audioContext.currentTime;

      // High-pitched frequency starts high and smoothly drops to lower pitch
      oscillator.frequency.setValueAtTime(3000, startTime);
      // Smooth pitch drop from start to end over the entire duration
      oscillator.frequency.exponentialRampToValueAtTime(1000, startTime + duration);

      // Volume envelope: quick attack, sustain, fade out
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01); // Quick attack
      gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.1); // Slight decay
      gainNode.gain.setValueAtTime(0.12, startTime + 0.2); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Fade out at end

      // Use a sine wave for a clean, high-pitched tone
      oscillator.type = 'sine';

      // Play the sound
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch (error) {
      // Silently fail if audio context can't be created (e.g., autoplay restrictions)
      console.debug('LaserOverlay: Could not play laser sound', error);
    }
  }

  init() {
    const canvas = document.getElementById('heroLaser');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', this.resizeHandler);

    // Handle visibility changes
    if (typeof document !== 'undefined') {
      this.visibilityHandler = () => {
        this.isVisible = !document.hidden;
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    this.intervalId = window.setInterval(() => {
      if (this.isVisible && this.isOnScreen) {
        this.fire();
      }
    }, LASER_INTERVAL_MS);
    setTimeout(() => {
      if (this.isVisible && this.isOnScreen) {
        this.fire();
      }
    }, LASER_INTERVAL_MS);
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  fire() {
    if (!this.canvas || !this.ctx) return;
    const width = this.canvas.width / this.dpr || this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.height / this.dpr || this.canvas.clientHeight || window.innerHeight;

    const soap = window?.soapBubbles_floatingShapesCanvas;
    const mainBubbles =
      soap?.shapes?.filter(
        (s) =>
          s &&
          !s.isPopping &&
          s.life === undefined &&
          Number.isFinite(s.radius) &&
          // Only consider bubbles fully on-screen
          s.x - s.radius >= 0 &&
          s.x + s.radius <= width &&
          s.y - s.radius >= 0 &&
          s.y + s.radius <= height,
      ) || [];

    // If bubbles aren't ready yet, do nothing with laser
    // x //, still show a streak across the hero
    if (!mainBubbles.length) {
      // const startFallback = { x: 0, y: height * 0.5 };
      // const endFallback = { x: width, y: height * 0.5 };
      //   this.drawLaser(startFallback, endFallback);
      return;
    }

    // largest of top 6
    const ranked = [...mainBubbles]
      .filter(
        (b) =>
          b.x >= -b.radius &&
          b.x <= width + b.radius &&
          b.y >= -b.radius &&
          b.y <= height + b.radius,
      )
      .sort((a, b) => b.radius - a.radius)
      .slice(0, 6);
    const target = ranked[0];
    if (!target) return;

    const start = randomEdgePoint(width, height, 60);
    let dir = { x: target.x - start.x, y: target.y - start.y };
    if (Math.abs(dir.x) < 1) dir.x += (Math.random() > 0.5 ? 1 : -1) * 0.5;
    if (Math.abs(dir.y) < 1) dir.y += (Math.random() > 0.5 ? 1 : -1) * 0.5;
    const end = extendToBoundary(start, dir, width, height, 60);

    this.playLaserSound();
    this.drawLaser(start, end);
    this.popBubbles(mainBubbles, target, start, end);

    // Sets an expiration timestamp 1300ms in the future
    // Used to mark when the laser segment should no longer be considered active
    const expires = performance.now() + 1300;
    activeLaserSegment = { start, end, expires };
    // Also stores it on window so other components (like SoapBubbles) can access it
    // The SoapBubbles component checks window.activeLaserSegment in its physics loop (around line 718-787) to detect if bubbles intersect the laser path
    window.activeLaserSegment = activeLaserSegment;
    // After 1400ms, clears both references
    // 1400ms is slightly longer than the 1300ms expiration to ensure cleanup happens after the laser is no longer active
    setTimeout(() => {
      activeLaserSegment = null;
      window.activeLaserSegment = null;
    }, 1400);
  }

  drawLaser(start, end) {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    const gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, 'rgba(255, 120, 120, 0.7)');
    gradient.addColorStop(0.5, 'rgba(255, 40, 40, 1)');
    gradient.addColorStop(1, 'rgba(255, 120, 120, 0.7)');
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = 'rgba(255, 60, 60, 0.8)';
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    // Make the streak visible, then fade it out
    this.canvas.style.transition = 'none';
    this.canvas.style.opacity = '1';
    // force reflow so the next transition applies
    void this.canvas.offsetWidth;
    this.canvas.style.transition = 'opacity 0.8s ease-out'; // fade duration is 0.8 seconds
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
    this.fadeTimeout = window.setTimeout(() => {
      this.canvas && (this.canvas.style.opacity = '0');
    }, 200); // fade starts after 200ms (laser visible for 200ms)
    if (this.clearTimeout) clearTimeout(this.clearTimeout);
    this.clearTimeout = window.setTimeout(() => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
      }
    }, 1100); // canvas is cleared after 1100ms (200ms visible + 800ms fade + 100ms buffer)
  }

  popBubbles(mainBubbles, target, start, end) {
    const hitList = [];
    mainBubbles.forEach((b) => {
      const hit = segmentCircleHit(start, end, { x: b.x, y: b.y, r: b.radius || 0 });
      if (hit || b === target) {
        b.forcePop = true;
        hitList.push(b);
      }
    });
    if (hitList.length) {
      requestAnimationFrame(() => {
        try {
          hitList.forEach((b) => {
            window.dispatchEvent(
              new CustomEvent('soapbubbles:pop', {
                detail: { id: b.id, x: b.x, y: b.y, radius: b.radius },
              }),
            );
          });
        } catch (_) {}
      });
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
      this.clearTimeout = null;
    }
    window.removeEventListener('resize', this.resizeHandler);

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    activeLaserSegment = null;
    window.activeLaserSegment = null;
  }
}
