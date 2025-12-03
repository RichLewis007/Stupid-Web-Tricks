// Performance Monitoring and Logging Utilities

/**
 * Performance Monitor - Tracks and logs performance metrics
 * @class
 */
export class PerformanceMonitor {
  /**
   * @constructor
   * @param {import('../types/index.js').PerformanceMonitorOptions} [options={}] - Configuration options
   */
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.logThreshold = options.logThreshold ?? 16.67; // 60fps = 16.67ms per frame
    this.samples = [];
    this.maxSamples = options.maxSamples ?? 100;
    this.onFrame = options.onFrame || null;
    this.onWarning = options.onWarning || null;
    this.frameCount = 0;
    this.lastFrameTime = null;
    this.animationFrameId = null;
  }

  /**
   * Start monitoring performance
   * @returns {void}
   */
  start() {
    if (!this.enabled) return;
    this.lastFrameTime = performance.now();
    this.monitor();
  }

  /**
   * Stop monitoring performance
   * @returns {void}
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Monitor frame performance
   */
  monitor() {
    if (!this.enabled) return;

    const now = performance.now();
    const delta = this.lastFrameTime ? now - this.lastFrameTime : 0;
    const fps = delta > 0 ? 1000 / delta : 0;

    this.frameCount++;
    this.lastFrameTime = now;

    // Record sample
    if (this.samples.length >= this.maxSamples) {
      this.samples.shift();
    }
    this.samples.push({ delta, fps, timestamp: now });

    // Check for performance issues
    if (delta > this.logThreshold && this.onWarning) {
      this.onWarning({
        delta,
        fps,
        frameCount: this.frameCount,
        averageFps: this.getAverageFps(),
      });
    }

    // Call frame callback
    if (this.onFrame) {
      this.onFrame({ delta, fps, frameCount: this.frameCount });
    }

    this.animationFrameId = requestAnimationFrame(() => this.monitor());
  }

  /**
   * Get average FPS over recent samples
   * @returns {number} Average frames per second
   */
  getAverageFps() {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((acc, sample) => acc + sample.fps, 0);
    return sum / this.samples.length;
  }

  /**
   * Get average frame time (delta) over recent samples
   * @returns {number} Average frame time in milliseconds
   */
  getAverageDelta() {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((acc, sample) => acc + sample.delta, 0);
    return sum / this.samples.length;
  }

  /**
   * Get performance statistics
   * @returns {import('../types/index.js').PerformanceStats} Performance statistics
   */
  getStats() {
    if (this.samples.length === 0) {
      return {
        averageFps: 0,
        averageDelta: 0,
        minFps: 0,
        maxFps: 0,
        frameCount: this.frameCount,
      };
    }

    const fpsValues = this.samples.map((s) => s.fps);
    const deltaValues = this.samples.map((s) => s.delta);

    return {
      averageFps: this.getAverageFps(),
      averageDelta: this.getAverageDelta(),
      minFps: Math.min(...fpsValues),
      maxFps: Math.max(...fpsValues),
      minDelta: Math.min(...deltaValues),
      maxDelta: Math.max(...deltaValues),
      frameCount: this.frameCount,
      sampleCount: this.samples.length,
    };
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.samples = [];
    this.frameCount = 0;
    this.lastFrameTime = null;
  }
}

/**
 * Log performance metrics to console
 * @param {string} component - Component name
 * @param {import('../types/index.js').PerformanceStats} stats - Performance statistics
 * @returns {void}
 */
export function logPerformance(component, stats) {
  if (typeof console !== 'undefined' && console.log) {
    console.log(`[Performance] ${component}:`, {
      fps: stats.averageFps.toFixed(2),
      delta: `${stats.averageDelta.toFixed(2)}ms`,
      minFps: stats.minFps.toFixed(2),
      maxFps: stats.maxFps.toFixed(2),
      frames: stats.frameCount,
    });
  }
}

/**
 * Create a performance monitor with default settings
 * @param {string} component - Component name for logging
 * @param {import('../types/index.js').PerformanceMonitorOptions} [options={}] - Configuration options
 * @returns {PerformanceMonitor} Performance monitor instance
 */
export function createPerformanceMonitor(component, options = {}) {
  const monitor = new PerformanceMonitor({
    ...options,
    onWarning: (stats) => {
      if (options.logWarnings !== false) {
        console.warn(`[Performance Warning] ${component}:`, {
          fps: stats.fps.toFixed(2),
          delta: `${stats.delta.toFixed(2)}ms`,
          averageFps: stats.averageFps.toFixed(2),
        });
      }
      if (options.onWarning) {
        options.onWarning(stats);
      }
    },
  });

  return monitor;
}
