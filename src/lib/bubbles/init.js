// Initialize SoapBubbles component

import { SoapBubbles } from './SoapBubbles.js';

/**
 * Initialize soap bubbles with the given configuration
 * @param {import('./types.js').SoapBubblesConfig} config - Configuration object
 * @returns {void}
 */
export function initSoapBubbles(config) {
  let soapBubbles = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let initTimeoutId = null;
  /** @type {((event: Event) => void) | null} */
  let domContentLoadedListener = null;
  /** @type {((event: BeforeUnloadEvent) => void) | null} */
  let beforeUnloadListener = null;
  const maxRetries = 50; // Limit retries to prevent infinite loops
  let retryCount = 0;

  function initializeBubbles() {
    // Clear any pending timeout
    if (initTimeoutId !== null) {
      clearTimeout(initTimeoutId);
      initTimeoutId = null;
    }

    try {
      const existing = window[`soapBubbles_${config.canvasId}`];
      if (existing && typeof existing.destroy === 'function' && existing.initialized) {
        existing.destroy();
      }

      // Check if canvas exists
      const canvasElement = document.getElementById(config.canvasId);
      if (!canvasElement) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`SoapBubbles: Canvas with id "${config.canvasId}" not found, retrying...`);
          initTimeoutId = setTimeout(initializeBubbles, 100);
        } else {
          console.error(`SoapBubbles: Max retries reached for canvas "${config.canvasId}"`);
        }
        return;
      }

      // Check if container exists and has dimensions
      const container = document.querySelector(config.containerSelector);
      if (!container) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(
            `SoapBubbles: Container "${config.containerSelector}" not found, retrying...`,
          );
          initTimeoutId = setTimeout(initializeBubbles, 100);
        } else {
          console.error(
            `SoapBubbles: Max retries reached for container "${config.containerSelector}"`,
          );
        }
        return;
      }

      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(
            `SoapBubbles: Container "${config.containerSelector}" has zero dimensions, retrying...`,
          );
          initTimeoutId = setTimeout(initializeBubbles, 100);
        } else {
          console.error(`SoapBubbles: Max retries reached for container dimensions`);
        }
        return;
      }

      // Reset retry count on success
      retryCount = 0;

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

  // Cleanup function
  function cleanup() {
    if (initTimeoutId !== null) {
      clearTimeout(initTimeoutId);
      initTimeoutId = null;
    }
    if (domContentLoadedListener) {
      document.removeEventListener('DOMContentLoaded', domContentLoadedListener);
      domContentLoadedListener = null;
    }
    if (beforeUnloadListener) {
      window.removeEventListener('beforeunload', beforeUnloadListener);
      beforeUnloadListener = null;
    }
    if (soapBubbles && typeof soapBubbles.destroy === 'function') {
      soapBubbles.destroy();
      soapBubbles = null;
    }
    const existing = window[`soapBubbles_${config.canvasId}`];
    if (existing && typeof existing.destroy === 'function') {
      existing.destroy();
      window[`soapBubbles_${config.canvasId}`] = null;
    }
  }

  // Try to initialize immediately if DOM is already loaded, otherwise wait
  if (document.readyState === 'loading') {
    domContentLoadedListener = initializeBubbles;
    document.addEventListener('DOMContentLoaded', domContentLoadedListener);
  } else {
    // DOM is already loaded, but wait a tick to ensure Astro has rendered
    initTimeoutId = setTimeout(initializeBubbles, 0);
  }

  beforeUnloadListener = cleanup;
  window.addEventListener('beforeunload', beforeUnloadListener);
}
