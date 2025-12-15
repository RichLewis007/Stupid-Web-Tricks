import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceMonitor, logPerformance, createPerformanceMonitor } from './performance.js';

describe('PerformanceMonitor', () => {
  let monitor;

  beforeEach(() => {
    vi.useFakeTimers();
    monitor = new PerformanceMonitor({ enabled: true, maxSamples: 10 });
  });

  afterEach(() => {
    monitor.stop();
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    expect(monitor.enabled).toBe(true);
    expect(monitor.samples.length).toBe(0);
    expect(monitor.frameCount).toBe(0);
  });

  it('should record performance samples', () => {
    monitor.start();
    vi.advanceTimersByTime(100);
    monitor.stop();

    expect(monitor.samples.length).toBeGreaterThan(0);
    expect(monitor.frameCount).toBeGreaterThan(0);
  });

  it('should calculate average FPS', () => {
    monitor.samples = [
      { fps: 60, delta: 16.67 },
      { fps: 30, delta: 33.33 },
      { fps: 60, delta: 16.67 },
    ];

    const avgFps = monitor.getAverageFps();
    expect(avgFps).toBeCloseTo(50, 1);
  });

  it('should calculate average delta', () => {
    monitor.samples = [
      { fps: 60, delta: 16.67 },
      { fps: 30, delta: 33.33 },
      { fps: 60, delta: 16.67 },
    ];

    const avgDelta = monitor.getAverageDelta();
    expect(avgDelta).toBeCloseTo(22.22, 1);
  });

  it('should get performance statistics', () => {
    monitor.samples = [
      { fps: 60, delta: 16.67, timestamp: 1000 },
      { fps: 30, delta: 33.33, timestamp: 1033 },
      { fps: 60, delta: 16.67, timestamp: 1050 },
    ];
    monitor.frameCount = 3;

    const stats = monitor.getStats();
    expect(stats.averageFps).toBeCloseTo(50, 1);
    expect(stats.minFps).toBe(30);
    expect(stats.maxFps).toBe(60);
    expect(stats.frameCount).toBe(3);
  });

  it('should reset statistics', () => {
    monitor.samples = [{ fps: 60, delta: 16.67 }];
    monitor.frameCount = 10;
    monitor.reset();

    expect(monitor.samples.length).toBe(0);
    expect(monitor.frameCount).toBe(0);
  });

  it('should limit samples to maxSamples', () => {
    const monitor = new PerformanceMonitor({ maxSamples: 5 });
    monitor.start();

    // Simulate many frames
    for (let i = 0; i < 20; i++) {
      monitor.samples.push({ fps: 60, delta: 16.67, timestamp: i * 1000 });
    }

    expect(monitor.samples.length).toBeLessThanOrEqual(5);
  });
});

describe('logPerformance', () => {
  it('should log performance stats', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const stats = {
      averageFps: 60,
      averageDelta: 16.67,
      minFps: 30,
      maxFps: 60,
      frameCount: 100,
    };

    logPerformance('TestComponent', stats);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Performance]'),
      expect.any(Object),
    );

    consoleSpy.mockRestore();
  });
});

describe('createPerformanceMonitor', () => {
  it('should create a monitor with default settings', () => {
    const monitor = createPerformanceMonitor('TestComponent');
    expect(monitor).toBeInstanceOf(PerformanceMonitor);
    expect(monitor.enabled).toBe(true);
  });

  it('should call onWarning callback when performance degrades', () => {
    const onWarning = vi.fn();
    const monitor = createPerformanceMonitor('TestComponent', {
      logThreshold: 16.67,
      onWarning,
    });

    monitor.start();
    // Simulate slow frame
    monitor.lastFrameTime = performance.now() - 50; // 50ms frame
    monitor.monitor();

    expect(onWarning).toHaveBeenCalled();
    monitor.stop();
  });
});

