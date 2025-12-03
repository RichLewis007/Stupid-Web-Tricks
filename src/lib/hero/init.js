// Initialize all hero section effects

import { MagneticText } from './MagneticText.js';
import { ParticleTrail } from './ParticleTrail.js';
import { LaserOverlay } from './LaserOverlay.js';

// Initialize effects
/** @type {MagneticText | null} */
let magneticText = null;
/** @type {ParticleTrail | null} */
let particleTrail = null;
/** @type {LaserOverlay | null} */
let laserOverlay = null;

/**
 * Initialize all hero section effects
 * @returns {void}
 */
export function initHeroEffects() {
  magneticText = new MagneticText();
  magneticText.init();

  particleTrail = new ParticleTrail();
  particleTrail.init();

  laserOverlay = new LaserOverlay();
  laserOverlay.init();

  // Set up Intersection Observer to pause animations when hero is off screen
  // Delay observer setup slightly to ensure all effects are initialized first
  // This prevents the observer from immediately setting isOnScreen to false
  setTimeout(() => {
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
  }, 100); // Small delay to ensure effects are initialized first

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

// Note: initHeroEffects() is now called from HeroSection.astro script tag
// This allows the module to be imported and the function to be called explicitly
window.addEventListener('beforeunload', cleanupHeroEffects);
