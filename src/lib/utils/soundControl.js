/**
 * Global sound control utilities
 * Manages mute state across the entire application
 */

const MUTE_STORAGE_KEY = 'soundEffectsMuted';

/**
 * Get the current mute state from localStorage
 * @returns {boolean} True if sounds are muted, false otherwise
 */
export function isMuted() {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(MUTE_STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    console.warn('SoundControl: Failed to read mute state from localStorage', error);
    return false;
  }
}

/**
 * Set the mute state and persist to localStorage
 * @param {boolean} muted - True to mute, false to unmute
 * @returns {void}
 */
export function setMuted(muted) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted.toString());

    // Update Howler.js global mute state
    if (typeof window !== 'undefined' && window.Howler) {
      window.Howler.mute(muted);
    }

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('soundEffects:muteChanged', { detail: { muted } }));
  } catch (error) {
    console.warn('SoundControl: Failed to save mute state to localStorage', error);
  }
}

/**
 * Toggle the mute state
 * @returns {boolean} The new mute state (true if muted, false if unmuted)
 */
export function toggleMute() {
  const newMutedState = !isMuted();
  setMuted(newMutedState);
  return newMutedState;
}

/**
 * Initialize sound control on page load
 * Applies saved mute state to Howler.js
 * @returns {void}
 */
export function initSoundControl() {
  if (typeof window === 'undefined') return;

  // Apply saved mute state to Howler.js on initialization
  const muted = isMuted();
  if (window.Howler) {
    window.Howler.mute(muted);
  }

  // Also listen for Howler to be loaded later
  const checkHowler = () => {
    if (window.Howler) {
      window.Howler.mute(muted);
    } else {
      setTimeout(checkHowler, 100);
    }
  };
  checkHowler();
}
