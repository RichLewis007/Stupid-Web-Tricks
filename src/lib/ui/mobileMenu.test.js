import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initMobileMenu } from './mobileMenu.js';

describe('MobileMenu', () => {
  let container;
  let button;
  let menu;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    document.body.appendChild(container);

    button = document.createElement('button');
    button.id = 'mobile-menu-button';
    button.setAttribute('aria-expanded', 'false');

    menu = document.createElement('div');
    menu.id = 'mobile-menu';
    menu.classList.add('hidden');

    container.appendChild(button);
    container.appendChild(menu);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should initialize menu elements', () => {
    initMobileMenu();
    expect(button).toBeTruthy();
    expect(menu).toBeTruthy();
  });

  it('should toggle menu on button click', (done) => {
    initMobileMenu();

    setTimeout(() => {
      expect(menu.classList.contains('hidden')).toBe(true);
      button.click();
      expect(menu.classList.contains('hidden')).toBe(false);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      done();
    }, 100);
  });

  it('should close menu on Escape key', (done) => {
    initMobileMenu();

    setTimeout(() => {
      // Open menu first
      menu.classList.remove('hidden');
      button.setAttribute('aria-expanded', 'true');

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      setTimeout(() => {
        expect(menu.classList.contains('hidden')).toBe(true);
        expect(button.getAttribute('aria-expanded')).toBe('false');
        done();
      }, 50);
    }, 100);
  });
});
