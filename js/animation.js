/* ==========================================================================
   GERMON IT SOLUTION PVT. LTD. - Animation & Scroll Effects
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. Intersection Observer for Scroll Reveal Animations
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    };

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is unsupported
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ------------------------------------------------------------------------
  // 2. Typing Animation Effect for Hero Subtitle (Company Core Services)
  // ------------------------------------------------------------------------
  const typingElement = document.getElementById('heroTypingText');
  if (typingElement) {
    const phrases = [
      'CCTV & Smart Wi-Fi Cameras',
      'DVR & NVR Installation & Maintenance',
      'Fire Extinguishers & Safety Systems',
      'Biometric Attendance Machines',
      'Access Control Door & Gate Systems',
      'Money / Currency Counting Machines',
      'Laptop & Desktop Computer Sales & Repair',
      'Printer Sales, Repair & Cartridges',
      'Routers, Network Switches & PoE Switches'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 70;

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 35;
      } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 1800; // Pause at full phrase
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 350; // Pause before next phrase
      }

      setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();
  }

  // ------------------------------------------------------------------------
  // 3. Progress Bar Fill Animation (About Page)
  // ------------------------------------------------------------------------
  const progressBars = document.querySelectorAll('.progress-fill');

  if (progressBars.length > 0 && 'IntersectionObserver' in window) {
    const progressObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const targetWidth = entry.target.getAttribute('data-percentage') || '85%';
          entry.target.style.width = targetWidth;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    progressBars.forEach(function (bar) {
      progressObserver.observe(bar);
    });
  }
});
