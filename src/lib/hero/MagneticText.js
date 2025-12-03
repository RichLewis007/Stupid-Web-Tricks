// Magnetic Text Effect - Interactive text that follows mouse movement

/**
 * Magnetic Text Effect - Interactive text that follows mouse movement
 * @class
 */
export class MagneticText {
  /**
   * @constructor
   */
  constructor() {
    this.elements = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    this.lastMouseMoveTime = 0;
    this.idleTimeout = null;
    this.isGlowing = false;
    this.animationFrame = null;
    this.isDestroyed = false; // Flag to prevent timeout execution after destroy
    this.isOnScreen = true;

    this.mouseMoveHandler = (e) => this.handleMouseMove(e);
    this.mouseLeaveHandler = () => this.handleMouseLeave();
  }

  /**
   * Initialize the magnetic text effect
   * @returns {void}
   */
  init() {
    this.elements = Array.from(document.querySelectorAll('.magnetic-text'));
    if (this.elements.length === 0) return;

    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    heroSection.addEventListener('mousemove', this.mouseMoveHandler);
    heroSection.addEventListener('mouseleave', this.mouseLeaveHandler);
    this.animate();
  }

  /**
   * Handle mouse move events
   * @param {MouseEvent} e - Mouse event
   * @returns {void}
   */
  handleMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.isActive = true;
    this.lastMouseMoveTime = Date.now();

    // Cancel any pending glow animation trigger (but don't interrupt ongoing sequences)
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }

    // Only set up new glow trigger if not currently glowing (let ongoing sequences complete)
    if (!this.isGlowing) {
      // Set timeout to trigger glow sequence when mouse stops moving (pauses)
      // This will fire after mouse hasn't moved for 400ms
      this.idleTimeout = window.setTimeout(() => {
        // Check if mouse is still active and sequence isn't already running
        if (!this.isActive || this.isGlowing) return; // Don't trigger if mouse left or sequence already started
        const timeSinceLastMove = Date.now() - this.lastMouseMoveTime;
        if (timeSinceLastMove >= 350) {
          // Wait for transform transition to complete, then trigger glow
          setTimeout(() => {
            // Double-check mouse is still active, hasn't moved, and sequence isn't running
            if (this.isDestroyed || !this.isActive || this.isGlowing) return; // Don't trigger if destroyed, mouse left, or sequence already started
            const finalCheck = Date.now() - this.lastMouseMoveTime;
            if (finalCheck >= 400) {
              this.triggerGlowSequence();
            }
          }, 150);
        }
      }, 400); // 400ms after last mouse movement
    }
  }

  handleMouseLeave() {
    this.isActive = false;
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    this.elements.forEach((el) => {
      // Use translateZ(0) to maintain hardware acceleration layer
      el.style.transform = 'translate3d(0, 0, 0)';
      // Remove will-change after transition completes to restore normal rendering
      setTimeout(() => {
        if (!this.isDestroyed) {
          el.style.willChange = 'auto';
        }
      }, 150); // After transition completes
    });
  }

  removeAllJiggles() {
    const words = document.querySelectorAll('.word-stupid, .word-web, .word-tricks');
    words.forEach((word) => word.classList.remove('jiggle'));
    this.isGlowing = false;
  }

  triggerGlowSequence(force = false) {
    // Don't trigger if already jiggling or destroyed
    if (this.isGlowing || this.isDestroyed) return;
    // Don't trigger if mouse is not active (unless forced, e.g., on page load)
    if (!force && !this.isActive) return;
    this.isGlowing = true;

    const wordStupid = document.querySelector('.word-stupid');
    const wordWeb = document.querySelector('.word-web');
    const wordTricks = document.querySelector('.word-tricks');

    // Jiggle STUPID, then stop completely before starting WEB
    if (wordStupid) {
      wordStupid.classList.add('jiggle');

      // Wait for STUPID to complete jiggle (300ms animation)
      setTimeout(() => {
        if (this.isDestroyed) return;
        wordStupid.classList.remove('jiggle');

        // Start WEB jiggle after STUPID has fully finished
        setTimeout(() => {
          if (this.isDestroyed) return;
          if (wordWeb) {
            wordWeb.classList.add('jiggle');

            // Wait for WEB to complete jiggle
            setTimeout(() => {
              if (this.isDestroyed) return;
              wordWeb.classList.remove('jiggle');

              // Start TRICKS jiggle after WEB has fully finished
              setTimeout(() => {
                if (this.isDestroyed) return;
                if (wordTricks) {
                  wordTricks.classList.add('jiggle');

                  // Wait for TRICKS to complete jiggle, then add 500ms delay before allowing next trigger
                  setTimeout(() => {
                    if (this.isDestroyed) return;
                    wordTricks.classList.remove('jiggle');
                    // Wait 500ms after sequence completes before allowing it to be triggered again
                    setTimeout(() => {
                      if (!this.isDestroyed) this.isGlowing = false;
                    }, 500);
                  }, 300); // Animation duration
                } else {
                  // If TRICKS word not found, still add 500ms delay
                  setTimeout(() => {
                    if (!this.isDestroyed) this.isGlowing = false;
                  }, 500);
                }
              }, 50); // Small buffer between words
            }, 300); // Animation duration
          } else {
            // If WEB word not found, add 500ms delay
            setTimeout(() => {
              if (!this.isDestroyed) this.isGlowing = false;
            }, 500);
          }
        }, 50); // Small buffer between words
      }, 300); // Animation duration (matches CSS animation)
    } else {
      // If STUPID word not found, add 500ms delay
      setTimeout(() => {
        if (!this.isDestroyed) this.isGlowing = false;
      }, 500);
    }
  }

  pause() {
    this.isOnScreen = false;
  }

  resume() {
    this.isOnScreen = true;
  }

  animate() {
    if (this.isDestroyed || !this.isOnScreen) return;

    try {
      if (this.isActive) {
        this.elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const deltaX = (this.mouseX - centerX) * 0.15;
          const deltaY = (this.mouseY - centerY) * 0.15;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < 150) {
            const rotateX = (deltaY / 150) * 5;
            const rotateY = (deltaX / 150) * -5;
            el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          } else {
            el.style.transform = 'translate3d(0, 0, 0)';
          }
        });
      } else {
        // When inactive, check if we should trigger glow after transform settles
        const timeSinceLastMove = Date.now() - this.lastMouseMoveTime;
        if (timeSinceLastMove >= 350 && !this.isGlowing && this.lastMouseMoveTime > 0) {
          this.triggerGlowSequence();
          this.lastMouseMoveTime = 0; // Reset to prevent retriggering
        }
      }

      this.animationFrame = requestAnimationFrame(() => this.animate());
    } catch (error) {
      console.error('MagneticText: Error in animation loop:', error);
      // Continue the loop even if there's an error
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }
  }

  destroy() {
    // Mark as destroyed to prevent timeout execution
    this.isDestroyed = true;

    // Cancel animation frame
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Cancel idle timeout
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }

    // Remove event listeners
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.removeEventListener('mousemove', this.mouseMoveHandler);
      heroSection.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }

    this.elements = [];
  }
}
