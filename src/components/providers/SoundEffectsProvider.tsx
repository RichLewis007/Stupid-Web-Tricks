import { useCallback, useEffect, useRef } from 'react';
import { Howler } from 'howler';
import useSound from 'use-sound';

function resumeAudioContext() {
  if (typeof window === 'undefined') return;

  try {
    const ctx = Howler?.ctx ?? (window as typeof window & { Howler?: typeof Howler }).Howler?.ctx;
    if (!ctx) return;

    switch (ctx.state) {
      case 'suspended':
        void ctx.resume();
        break;
      case 'interrupted':
        if (typeof ctx.onstatechange === 'function') {
          const resumeOnce = () => {
            if (ctx.state === 'running') {
              ctx.onstatechange = null;
            }
          };
          ctx.onstatechange = resumeOnce;
        }
        void ctx.resume();
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn('SoundEffectsProvider: Failed to resume audio context', error);
  }
}

function useDeferredPlay(play: () => void) {
  const unlockedRef = useRef(false);

  useEffect(() => {
    const unlock = () => {
      resumeAudioContext();
      if (!unlockedRef.current) {
        unlockedRef.current = true;
      }
    };

    const unlockEvents: Array<[keyof WindowEventMap, AddEventListenerOptions | undefined]> = [
      ['pointerdown', { once: true, capture: true }],
      ['pointermove', { once: true, capture: true }],
      ['mousedown', { once: true, capture: true }],
      ['mouseup', { once: true, capture: true }],
      ['touchstart', { once: true, capture: true, passive: true }],
      ['keydown', { once: true, capture: true }],
      ['focus', { once: true, capture: true }],
    ];

    unlockEvents.forEach(([eventName, options]) => {
      window.addEventListener(eventName, unlock, options);
    });

    return () => {
      unlockEvents.forEach(([eventName, options]) => {
        window.removeEventListener(eventName, unlock, options);
      });
    };
  }, [play]);

  return useCallback(() => {
    if (unlockedRef.current) {
      resumeAudioContext();
      play();
    }
  }, [play]);
}

export default function SoundEffectsProvider() {
  // Get base URL from Astro (includes base path if configured)
  const baseUrl = typeof import.meta.env !== 'undefined' && import.meta.env.BASE_URL 
    ? import.meta.env.BASE_URL 
    : '/';
  const soundPath = `${baseUrl}assets/sounds/bubble-pop-1.wav`.replace(/\/+/g, '/'); // Remove duplicate slashes
  
  const [playBubblePop, { sound }] = useSound(soundPath, {
    volume: 0.4,
    interrupt: true,
  });

  useEffect(() => {
    if (!sound) return;

    const ctx = Howler?.ctx;
    if (ctx && ctx.state === 'running') return;
  }, [sound]);

  const deferredBubblePop = useDeferredPlay(playBubblePop);

  useEffect(() => {
    const handleBubblePop = () => {
      const ctx = Howler?.ctx;
      if (ctx && ctx.state === 'suspended' && !navigator.userActivation?.hasBeenActive) {
        return;
      }

      deferredBubblePop();
    };

    window.addEventListener('soapbubbles:pop', handleBubblePop);
    return () => {
      window.removeEventListener('soapbubbles:pop', handleBubblePop);
    };
  }, [deferredBubblePop]);

  return null;
}
