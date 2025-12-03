// Initialize SoapBubbles component

import { SoapBubbles } from './SoapBubbles.js';

/**
 * Initialize soap bubbles with the given configuration
 * @param {import('./types.js').SoapBubblesConfig} config - Configuration object
 * @returns {void}
 */
export function initSoapBubbles(config) {
  let soapBubbles = null;

  function initializeBubbles() {
    try {
      const existing = window[`soapBubbles_${config.canvasId}`];
      if (existing && typeof existing.destroy === 'function' && existing.initialized) {
        existing.destroy();
      }

      // Check if canvas exists
      const canvasElement = document.getElementById(config.canvasId);
      if (!canvasElement) {
        console.warn(`SoapBubbles: Canvas with id "${config.canvasId}" not found, retrying...`);
        setTimeout(initializeBubbles, 100);
        return;
      }

      soapBubbles = new SoapBubbles(config);

      if (soapBubbles.initialized) {
        window[`soapBubbles_${config.canvasId}`] = soapBubbles;
        console.log(`SoapBubbles: Initialized successfully with ${config.bubbleCount} bubbles`);
        console.log(
          `SoapBubbles: Canvas size: ${soapBubbles.canvas.width}x${soapBubbles.canvas.height}`,
        );
        console.log(`SoapBubbles: Shapes created: ${soapBubbles.shapes.length}`);
      } else {
        console.warn(`SoapBubbles: Failed to initialize properly for canvas "${config.canvasId}"`);
        soapBubbles = null;
      }
    } catch (e) {
      console.error(`SoapBubbles: Error during initialization for canvas "${config.canvasId}":`, e);
      soapBubbles = null;
    }
  }

  // Try to initialize immediately if DOM is already loaded, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBubbles);
  } else {
    // DOM is already loaded, but wait a tick to ensure Astro has rendered
    setTimeout(initializeBubbles, 0);
  }

  window.addEventListener('beforeunload', function () {
    if (soapBubbles && typeof soapBubbles.destroy === 'function') {
      soapBubbles.destroy();
      soapBubbles = null;
    }
    const existing = window[`soapBubbles_${config.canvasId}`];
    if (existing && typeof existing.destroy === 'function') {
      existing.destroy();
      window[`soapBubbles_${config.canvasId}`] = null;
    }
  });
}
