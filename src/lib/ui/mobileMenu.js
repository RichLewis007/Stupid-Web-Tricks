// Mobile Menu Handler - Manages mobile navigation menu toggle and interactions

/**
 * Initialize mobile menu functionality
 * @param {string} [buttonId='mobile-menu-button'] - ID of the mobile menu button
 * @param {string} [menuId='mobile-menu'] - ID of the mobile menu element
 * @returns {void}
 */
export function initMobileMenu(buttonId = 'mobile-menu-button', menuId = 'mobile-menu') {
  function initialize() {
    const mobileMenuButton = document.getElementById(buttonId);
    const mobileMenu = document.getElementById(menuId);

    if (!mobileMenuButton || !mobileMenu) {
      console.warn(`MobileMenu: Elements not found (button: ${buttonId}, menu: ${menuId})`);
      return;
    }

    const closeMenu = () => {
      mobileMenu.classList.add('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      mobileMenu.classList.remove('hidden');
      mobileMenuButton.setAttribute('aria-expanded', 'true');
    };

    const toggleMenu = () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    // Toggle menu on button click
    mobileMenuButton.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        !mobileMenu.contains(e.target) &&
        !mobileMenuButton.contains(e.target) &&
        !mobileMenu.classList.contains('hidden')
      ) {
        closeMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        closeMenu();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}
