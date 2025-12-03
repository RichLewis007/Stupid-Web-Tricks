// Initialize all hero section effects

import { MagneticText } from './MagneticText.js';
import { ParticleTrail } from './ParticleTrail.js';
import { LaserOverlay, LASER_INTERVAL_MS } from './LaserOverlay.js';

// Initialize effects
let magneticText = null;
let particleTrail = null;
let laserOverlay = null;

export function initHeroEffects() {
  magneticText = new MagneticText();
  magneticText.init();

  particleTrail = new ParticleTrail();
  particleTrail.init();

  laserOverlay = new LaserOverlay();
  laserOverlay.init();

  // Set up Intersection Observer to pause animations when hero is off screen
  const heroSection = document.querySelector('.hero-section');
  if (heroSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isOnScreen = entry.isIntersecting;

          // Pause/resume all animations
          if (magneticText) {
            if (isOnScreen) {
              magneticText.resume();
            } else {
              magneticText.pause();
            }
          }

          if (particleTrail) {
            if (isOnScreen) {
              particleTrail.resume();
            } else {
              particleTrail.pause();
            }
          }

          if (laserOverlay) {
            if (isOnScreen) {
              laserOverlay.resume();
            } else {
              laserOverlay.pause();
            }
          }

          // Pause/resume bubble animations
          const soapBubbles = window?.soapBubbles_floatingShapesCanvas;
          if (
            soapBubbles &&
            typeof soapBubbles.pause === 'function' &&
            typeof soapBubbles.resume === 'function'
          ) {
            if (isOnScreen) {
              soapBubbles.resume();
            } else {
              soapBubbles.pause();
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% of hero section is visible
      },
    );

    observer.observe(heroSection);
  }

  // Trigger initial jiggle sequence on page load
  setTimeout(() => {
    if (magneticText) {
      magneticText.triggerGlowSequence(true); // force = true to bypass isActive check
    }
  }, 500); // Small delay to ensure page is fully loaded
}

export function cleanupHeroEffects() {
  if (magneticText) {
    magneticText.destroy();
    magneticText = null;
  }
  if (particleTrail) {
    particleTrail.destroy();
    particleTrail = null;
  }
  if (laserOverlay) {
    laserOverlay.destroy();
    laserOverlay = null;
  }
}

// Auto-initialize on DOMContentLoaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initHeroEffects);
  window.addEventListener('beforeunload', cleanupHeroEffects);
}
