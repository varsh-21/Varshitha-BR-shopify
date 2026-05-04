/**
 * Mobile header toggle
 * - Toggles hamburger ↔ close icon
 * - Opens/closes the drawer with max-height animation
 * - Shows/hides the SHOP NOW link in the bar
 */
(function () {
  'use strict';

  const toggle   = document.getElementById('tisso-mobile-toggle');
  const drawer   = document.getElementById('tisso-mobile-drawer');
  const shopNow  = document.getElementById('tisso-mobile-shopnow');
  const iconOpen = toggle && toggle.querySelector('.tisso-mobile-toggle__icon--open');
  const iconClose= toggle && toggle.querySelector('.tisso-mobile-toggle__icon--close');

  if (!toggle || !drawer) return;

  let isOpen = false;
  
  function openMenu() {
    isOpen = true;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');

    /* Swap icons */
    iconOpen.style.display  = 'none';
    iconClose.style.display = 'inline-flex';

    /* Show SHOP NOW in bar */
    if (shopNow) {
      shopNow.style.display = 'inline-flex';
      shopNow.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMenu() {
    isOpen = false;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');

    /* Swap icons back */
    iconOpen.style.display  = 'inline-flex';
    iconClose.style.display = 'none';

    /* Hide SHOP NOW in bar */
    if (shopNow) {
      shopNow.style.display = 'none';
      shopNow.setAttribute('aria-hidden', 'true');
    }
  }

  toggle.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

})();