// Particle Trail Effect - Creates bubble particles that follow mouse movement

export class ParticleTrail {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.trailPoints = [];
    this.pointer = { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, vy: 0, speed: 0, active: false };
    this.smoothedPointer = { x: 0, y: 0 };
    this.lastPointerUpdate = 0;
    this.lastEmitPosition = null;
    this.lastEmitTime = 0;
    this.emitInterval = 180;
    this.lastStationaryEmitTime = 0;
    this.stationaryEmitInterval = 800;
    this.stationaryThreshold = 500;
    this.lastFrameTime = 0;
    this.animationFrame = null;
    // Realistic max: ~22 particles/sec × 4 sec lifetime = ~88 at max speed
    // Using 120 to provide headroom for stationary bubbles and edge cases
    this.initialMaxTrailPoints = 120;
    this.maxTrailPoints = this.initialMaxTrailPoints;
    this.performanceLimitedMax = null;
    this.minimumSpacing = 8;
    this.dpr = 1;
    this.disabled = false;
    this.currentPeakTrailCount = 0;
    this.performanceSamples = [];
    this.lastPerformanceCheck = 0;
    this.minBubbleCount = 30;
    this.dynamicBubbleCount = 30;
    this.populationDirty = false;
    this.isVisible = true;
    this.visibilityHandler = null;
    this.isOnScreen = true;

    if (typeof navigator !== 'undefined') {
      const deviceMemory = navigator.deviceMemory ?? 4;
      const cores = navigator.hardwareConcurrency ?? 0;

      // Apply optimizations based on device capabilities
      if (deviceMemory <= 2) {
        console.log('LOW MEMORY!');
        this.initialMaxTrailPoints = Math.min(this.initialMaxTrailPoints, 30);
        this.minimumSpacing = 10;
        this.emitInterval = Math.max(this.emitInterval, 220);
      }

      // Check CPU cores - apply additional optimizations if cores are limited
      if (cores > 0 && cores <= 4) {
        console.log('LOW CORES!');
        // Only reduce further if memory optimization didn't already set it lower
        if (this.initialMaxTrailPoints > 30) {
          this.initialMaxTrailPoints = Math.min(this.initialMaxTrailPoints, 40);
        }
        // Increase spacing and emission interval for low core systems
        this.minimumSpacing = Math.max(this.minimumSpacing, 9);
        this.emitInterval = Math.max(this.emitInterval, 200);
      }
    }
    this.maxTrailPoints = this.initialMaxTrailPoints;

    this.pointerMoveHandler = (e) => this.handlePointerMove(e);
    this.pointerLeaveHandler = () => this.handlePointerLeave();
    this.pointerDownHandler = () => this.handlePointerDown();
    this.pointerUpHandler = () => this.handlePointerUp();
    this.resizeHandler = () => this.resize();
  }

  init() {
    const canvasElement = document.getElementById('particleTrail');
    if (!(canvasElement instanceof HTMLCanvasElement)) return;
    this.canvas = canvasElement;

    const context = this.canvas.getContext('2d', { alpha: true });
    if (!context) return;
    this.ctx = context;

    const prefersReducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const hasFinePointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : true;
    if (prefersReducedMotion || !hasFinePointer) {
      this.disabled = true;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.resize();
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      if (window.PointerEvent) {
        heroSection.addEventListener('pointermove', this.pointerMoveHandler, { passive: true });
        heroSection.addEventListener('pointerdown', this.pointerDownHandler, { passive: true });
        heroSection.addEventListener('pointerup', this.pointerUpHandler, { passive: true });
        heroSection.addEventListener('pointerleave', this.pointerLeaveHandler);
      } else {
        heroSection.addEventListener('mousemove', this.pointerMoveHandler);
        heroSection.addEventListener('mousedown', this.pointerDownHandler);
        heroSection.addEventListener('mouseup', this.pointerUpHandler);
        heroSection.addEventListener('mouseleave', this.pointerLeaveHandler);
      }
    }
    window.addEventListener('resize', this.resizeHandler);

    // Handle visibility changes to pause/resume animations
    if (typeof document !== 'undefined') {
      this.visibilityHandler = () => {
        this.isVisible = !document.hidden;
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    this.animate();
  }

  resize() {
    if (!this.canvas || !this.ctx) return;

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    if (typeof this.ctx.setTransform === 'function') {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else if (typeof this.ctx.resetTransform === 'function') {
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    } else {
      this.ctx.scale(dpr, dpr);
    }
    this.lastEmitPosition = null;
  }

  handlePointerDown() {
    this.pointer.active = true;
    this.lastPointerUpdate = performance.now();
  }

  handlePointerUp() {
    this.pointer.active = false;
  }

  handlePointerLeave() {
    this.pointer.active = false;
    this.lastEmitPosition = null;
    this.pointer.x = 0;
    this.pointer.y = 0;
    this.lastStationaryEmitTime = 0;
  }

  handlePointerMove(e) {
    if (!this.canvas) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.pointer.lastX = this.pointer.x;
    this.pointer.lastY = this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.vx = this.pointer.x - (this.pointer.lastX ?? this.pointer.x);
    this.pointer.vy = this.pointer.y - (this.pointer.lastY ?? this.pointer.y);
    const speed = Math.sqrt(this.pointer.vx * this.pointer.vx + this.pointer.vy * this.pointer.vy);
    this.pointer.speed = speed;
    this.pointer.active = true;
    this.lastPointerUpdate = performance.now();

    if (!this.lastEmitPosition) {
      const spawn = this.getSpawnPosition(x, y);
      this.smoothedPointer.x = spawn.x;
      this.smoothedPointer.y = spawn.y;
      this.lastEmitPosition = { ...spawn };
      this.emitTrailPoint(spawn.x, spawn.y);
    }
  }

  getSpawnPosition(x, y) {
    if (!this.ctx) return;

    const soapBubbleColorSets = [
      ['rgba(255, 230, 250, 0.15)', 'rgba(230, 250, 255, 0.18)', 'rgba(240, 255, 255, 0.12)'],
      ['rgba(240, 230, 255, 0.16)', 'rgba(230, 240, 255, 0.17)', 'rgba(230, 255, 250, 0.14)'],
      ['rgba(230, 245, 255, 0.17)', 'rgba(240, 255, 255, 0.16)', 'rgba(255, 240, 250, 0.15)'],
      ['rgba(235, 255, 240, 0.15)', 'rgba(230, 245, 255, 0.17)', 'rgba(245, 235, 255, 0.16)'],
      ['rgba(255, 250, 235, 0.14)', 'rgba(255, 235, 245, 0.16)', 'rgba(235, 245, 255, 0.15)'],
      ['rgba(235, 255, 255, 0.16)', 'rgba(245, 235, 255, 0.15)', 'rgba(255, 235, 250, 0.17)'],
    ];

    const pointerSpeed = Math.sqrt((this.pointer.vx || 0) ** 2 + (this.pointer.vy || 0) ** 2);
    const norm = pointerSpeed > 0.01 ? pointerSpeed : 1;
    const motionFactor = Math.min(pointerSpeed / 80, 1);
    const offsetDistance = 6 + motionFactor * 26;
    const offsetX = ((this.pointer.vx || 0) / norm) * offsetDistance;
    const offsetY = ((this.pointer.vy || 0) / norm) * offsetDistance;
    const driftAngle = Math.random() * Math.PI * 2;
    const driftMagnitude = 0.12 + motionFactor * 0.08;

    return {
      x: x - offsetX,
      y: y - offsetY,
      driftX: Math.cos(driftAngle) * driftMagnitude,
      driftY: Math.sin(driftAngle) * driftMagnitude,
      motionFactor,
      colors: soapBubbleColorSets[Math.floor(Math.random() * soapBubbleColorSets.length)],
    };
  }

  emitTrailPoint(x, y) {
    if (!this.ctx) return;
    if (this.trailPoints.length >= this.maxTrailPoints) return;

    const spawn = this.getSpawnPosition(x, y);
    if (!spawn) return;

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.25 + Math.random() * 0.1;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    this.trailPoints.unshift({
      x: spawn.x + (Math.random() - 0.5) * 3,
      y: spawn.y + (Math.random() - 0.5) * 3,
      vx: velocityX,
      vy: velocityY,
      life: 1,
      birth: performance.now(),
      fullLifeMs: 4000,
      delayMs: 3000,
      shrinkStartMs: null,
      colors: spawn.colors,
      baseRadius: 3 + Math.random() * 3,
      currentRadius: 0,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.034 + Math.random() * 0.009,
    });

    this.lastEmitTime = performance.now();
  }

  emitStationaryBubbles(x, y) {
    if (!this.ctx) return;
    if (this.trailPoints.length >= this.maxTrailPoints) return;

    const soapBubbleColorSets = [
      ['rgba(255, 230, 250, 0.15)', 'rgba(230, 250, 255, 0.18)', 'rgba(240, 255, 255, 0.12)'],
      ['rgba(240, 230, 255, 0.16)', 'rgba(230, 240, 255, 0.17)', 'rgba(230, 255, 250, 0.14)'],
      ['rgba(230, 245, 255, 0.17)', 'rgba(240, 255, 255, 0.16)', 'rgba(255, 240, 250, 0.15)'],
      ['rgba(235, 255, 240, 0.15)', 'rgba(230, 245, 255, 0.17)', 'rgba(245, 235, 255, 0.16)'],
      ['rgba(255, 250, 235, 0.14)', 'rgba(255, 235, 245, 0.16)', 'rgba(235, 245, 255, 0.15)'],
      ['rgba(235, 255, 255, 0.16)', 'rgba(245, 235, 255, 0.15)', 'rgba(255, 235, 250, 0.17)'],
    ];

    // Emit 1-2 small bubbles moving away in different directions
    const bubbleCount = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < bubbleCount; i++) {
      if (this.trailPoints.length >= this.maxTrailPoints) break;

      // Random angle for each bubble to move away from center
      const angle = Math.random() * Math.PI * 2;
      // Speed for stationary bubbles (doubled from original)
      const speed = 0.16 + Math.random() * 0.1;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      // Small random offset from exact pointer position
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;

      this.trailPoints.unshift({
        x: x + offsetX,
        y: y + offsetY,
        vx: velocityX,
        vy: velocityY,
        life: 1,
        birth: performance.now(),
        fullLifeMs: 5000,
        delayMs: 3000,
        shrinkStartMs: null,
        colors: soapBubbleColorSets[Math.floor(Math.random() * soapBubbleColorSets.length)],
        baseRadius: 2 + Math.random() * 2, // Smaller bubbles
        currentRadius: 0,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.025 + Math.random() * 0.008,
      });
    }

    this.lastStationaryEmitTime = performance.now();
  }

  pause() {
    this.isOnScreen = false;
  }

  resume() {
    this.isOnScreen = true;
  }

  calculateAdaptiveBubbleCount() {
    // Adaptive logic based on device capabilities
    if (typeof navigator === 'undefined') return 30;

    const deviceMemory = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 0;

    let target = 30; // Base count

    if (deviceMemory >= 8 && cores >= 8) {
      target = 50;
    } else if (deviceMemory >= 4 && cores >= 4) {
      target = 40;
    } else if (deviceMemory >= 2 && cores >= 2) {
      target = 35;
    }

    return target;
  }

  animate() {
    if (!this.ctx || !this.canvas || this.disabled || !this.isOnScreen) return;

    const now = performance.now();
    this.lastFrameTime = now;

    // Safety check: limit trail points to prevent memory issues
    const maxTrailPointsHardLimit = 1000;
    if (this.trailPoints.length > maxTrailPointsHardLimit) {
      // Remove oldest points
      const excess = this.trailPoints.length - maxTrailPointsHardLimit;
      this.trailPoints.splice(-excess);
    }

    const timeSinceLastMove = now - this.lastPointerUpdate;
    const isStationary =
      timeSinceLastMove > this.stationaryThreshold && this.pointer.x > 0 && this.pointer.y > 0;

    if (this.pointer.active && timeSinceLastMove > 300) {
      this.pointer.active = false;
    }

    if (this.pointer.active || timeSinceLastMove < 250) {
      const followSpeed = this.pointer.active ? 0.34 : 0.1;
      this.smoothedPointer.x += (this.pointer.x - this.smoothedPointer.x) * followSpeed;
      this.smoothedPointer.y += (this.pointer.y - this.smoothedPointer.y) * followSpeed;

      const maxSpeed = 800;
      const minMultiplier = 1;
      const maxMultiplier = 4;
      const speedMultiplier =
        minMultiplier +
        Math.min(
          maxMultiplier - minMultiplier,
          ((this.pointer.speed || 0) / maxSpeed) * (maxMultiplier - minMultiplier),
        );

      const current = { x: this.smoothedPointer.x, y: this.smoothedPointer.y };
      if (!this.lastEmitPosition) {
        this.lastEmitPosition = { ...current };
      }

      if (
        this.trailPoints.length < this.maxTrailPoints &&
        now - this.lastEmitTime > this.emitInterval * speedMultiplier
      ) {
        this.emitTrailPoint(current.x, current.y);
        this.lastEmitPosition = { ...current };
      } else {
        this.lastEmitPosition = { ...current };
      }
    } else {
      this.lastEmitPosition = null;
    }

    // Emit stationary bubbles when pointer is still in hero area but not moving
    if (
      isStationary &&
      this.trailPoints.length < this.maxTrailPoints &&
      now - this.lastStationaryEmitTime > this.stationaryEmitInterval
    ) {
      this.emitStationaryBubbles(this.smoothedPointer.x, this.smoothedPointer.y);
    }

    const clearWidth = this.canvas.width / this.dpr;
    const clearHeight = this.canvas.height / this.dpr;

    // Only update and draw if visible (tab is active)
    if (this.isVisible) {
      this.ctx.clearRect(0, 0, clearWidth, clearHeight);
    }

    this.trailPoints = this.trailPoints.filter((point) => {
      point.x += point.vx;
      point.y += point.vy;
      const elapsed = now - (point.birth || now);

      if (elapsed >= (point.fullLifeMs || 6000)) {
        return false;
      }

      let lifeFactor = 1;
      const delayMs = point.delayMs ?? 3000;
      const fadeWindow = Math.max((point.fullLifeMs || 6000) - delayMs, 1);

      if (elapsed >= delayMs) {
        if (point.shrinkStartMs === null) {
          point.shrinkStartMs = now;
        }
        const fadeElapsed = now - (point.shrinkStartMs || now);
        lifeFactor = Math.max(0, 1 - fadeElapsed / fadeWindow);
      }

      point.pulse += point.pulseSpeed;
      point.currentRadius = elapsed < delayMs ? point.baseRadius : point.baseRadius * lifeFactor;

      const alpha = elapsed < delayMs ? 1 : lifeFactor;

      // Only draw if visible (tab is active)
      if (!this.isVisible) {
        return true; // Keep point but don't draw
      }

      this.ctx.save();

      const bubblePath = new Path2D();
      const baseRadius = point.currentRadius;
      const pulseOffset = Math.sin(point.pulse) * 0.25;
      const pulseSize = Math.max(0.05, baseRadius + pulseOffset);
      bubblePath.arc(point.x, point.y, pulseSize, 0, Math.PI * 2);
      bubblePath.closePath();

      if (point.colors && point.colors.length >= 3) {
        const mainGradient = this.ctx.createRadialGradient(
          point.x - pulseSize * 0.35,
          point.y - pulseSize * 0.35,
          0,
          point.x,
          point.y,
          pulseSize,
        );
        mainGradient.addColorStop(0, `rgba(255, 255, 255, ${0.02 * alpha})`);
        mainGradient.addColorStop(0.7, this.adjustAlpha(point.colors[0], alpha));
        mainGradient.addColorStop(0.85, this.adjustAlpha(point.colors[1], alpha));
        mainGradient.addColorStop(1, this.adjustAlpha(point.colors[2], alpha));

        this.ctx.fillStyle = mainGradient;
        this.ctx.fill(bubblePath);
      }

      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = `rgba(255, 255, 255, ${0.35 * alpha})`;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * alpha})`;
      this.ctx.lineWidth = 0.3;
      this.ctx.stroke(bubblePath);

      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = 'transparent';

      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * alpha})`;
      this.ctx.lineWidth = 0.2;
      this.ctx.stroke(bubblePath);

      this.ctx.restore();
      return true;
    });

    if (this.trailPoints.length > this.currentPeakTrailCount) {
      this.currentPeakTrailCount = this.trailPoints.length;
    }

    this.ctx.globalAlpha = 1;

    try {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    } catch (error) {
      console.error('ParticleTrail: Error in animation loop:', error);
      // Continue the loop even if there's an error
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    if (now - this.lastPerformanceCheck >= 2000 && this.performanceSamples.length >= 20) {
      const avgFps =
        this.performanceSamples.reduce((sum, value) => sum + value, 0) /
        this.performanceSamples.length;
      const adaptiveTarget = this.calculateAdaptiveBubbleCount();

      if (avgFps < 42 && this.dynamicBubbleCount > this.minBubbleCount) {
        this.dynamicBubbleCount = Math.max(this.minBubbleCount, this.dynamicBubbleCount - 1);
        this.populationDirty = true;

        if (this.performanceLimitedMax === null) {
          this.performanceLimitedMax = Math.max(
            this.currentPeakTrailCount,
            this.trailPoints.length,
          );
          this.maxTrailPoints = Math.min(
            this.maxTrailPoints,
            Math.floor(this.performanceLimitedMax * 0.75),
          );
        }
      } else if (avgFps > 58 && this.dynamicBubbleCount < adaptiveTarget) {
        this.dynamicBubbleCount = Math.min(adaptiveTarget, this.dynamicBubbleCount + 1);
        this.populationDirty = true;
      }

      this.performanceSamples = [];
      this.lastPerformanceCheck = now;
    }
  }

  // Helper to adjust alpha in rgba color strings
  adjustAlpha(color, alpha) {
    // Match rgba values - format is rgba(r, g, b, a) where a is 0-1
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const r = match[1];
      const g = match[2];
      const b = match[3];
      const originalAlpha = parseFloat(match[4]);
      return `rgba(${r}, ${g}, ${b}, ${originalAlpha * alpha})`;
    }
    return color;
  }

  destroy() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.removeEventListener('pointermove', this.pointerMoveHandler);
      heroSection.removeEventListener('pointerdown', this.pointerDownHandler);
      heroSection.removeEventListener('pointerup', this.pointerUpHandler);
      heroSection.removeEventListener('pointerleave', this.pointerLeaveHandler);
      heroSection.removeEventListener('mousemove', this.pointerMoveHandler);
      heroSection.removeEventListener('mousedown', this.pointerDownHandler);
      heroSection.removeEventListener('mouseup', this.pointerUpHandler);
      heroSection.removeEventListener('mouseleave', this.pointerLeaveHandler);
    }
    window.removeEventListener('resize', this.resizeHandler);

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.trailPoints = [];
    if (this.ctx && this.canvas) {
      const clearWidth = this.canvas.width / this.dpr;
      const clearHeight = this.canvas.height / this.dpr;
      this.ctx.clearRect(0, 0, clearWidth, clearHeight);
    }
  }
}

