// Performance monitoring utilities

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  timestamp: number;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private isMonitoring = false;
  private callback?: (metrics: PerformanceMetrics) => void;

  start(callback?: (metrics: PerformanceMetrics) => void) {
    this.callback = callback;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.measure();
  }

  stop() {
    this.isMonitoring = false;
  }

  private measure() {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      const metrics: PerformanceMetrics = {
        fps: this.fps,
        frameTime: this.frameTime,
        memoryUsage: this.getMemoryUsage(),
        timestamp: currentTime
      };

      if (this.callback) {
        this.callback(metrics);
      }

      // Log performance warnings
      if (this.fps < 30) {
        console.warn(`Low FPS detected: ${this.fps}fps`);
      }
    }

    requestAnimationFrame(() => this.measure());
  }

  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  getCurrentFPS(): number {
    return this.fps;
  }

  getCurrentFrameTime(): number {
    return this.frameTime;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observers: Map<string, IntersectionObserver> = new Map();
  private throttledFunctions: Map<string, Function> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    if (this.throttledFunctions.has(key)) {
      return this.throttledFunctions.get(key) as (...args: Parameters<T>) => void;
    }

    let lastCall = 0;
    const throttled = (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };

    this.throttledFunctions.set(key, throttled);
    return throttled;
  }

  // Create intersection observer for lazy loading
  createIntersectionObserver(
    key: string,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    if (this.observers.has(key)) {
      return this.observers.get(key)!;
    }

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    this.observers.set(key, observer);
    return observer;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.throttledFunctions.clear();
  }
}

// Canvas performance utilities
export class CanvasOptimizer {
  private static offscreenCanvas: OffscreenCanvas | null = null;
  private static offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;

  static getOffscreenCanvas(width: number, height: number): OffscreenCanvas {
    if (!this.offscreenCanvas || 
        this.offscreenCanvas.width !== width || 
        this.offscreenCanvas.height !== height) {
      this.offscreenCanvas = new OffscreenCanvas(width, height);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }
    return this.offscreenCanvas;
  }

  static getOffscreenContext(): OffscreenCanvasRenderingContext2D | null {
    return this.offscreenCtx;
  }

  // Pre-render complex shapes to offscreen canvas
  static preRenderShape(
    width: number,
    height: number,
    renderFunction: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void
  ): OffscreenCanvas {
    const canvas = this.getOffscreenCanvas(width, height);
    const ctx = this.getOffscreenContext();
    if (ctx) {
      renderFunction(ctx);
    }
    return canvas;
  }
}

// Memory management utilities
export class MemoryManager {
  private static cleanupCallbacks: Set<() => void> = new Set();

  static registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.add(callback);
  }

  static unregisterCleanup(callback: () => void): void {
    this.cleanupCallbacks.delete(callback);
  }

  static cleanup(): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback error:', error);
      }
    });
  }

  // Monitor memory usage
  static getMemoryInfo(): { used: number; total: number; limit: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  // Start performance monitoring in development
  if (import.meta.env.DEV) {
    performanceMonitor.start((metrics) => {
      if (metrics.fps < 30) {
        console.warn(`Performance warning: ${metrics.fps}fps`);
      }
    });
  }

  // Register cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.stop();
    MemoryManager.cleanup();
  });
}
