/* ==========================================================================
   GERMON IT SOLUTION PVT. LTD. - Animated Counter Statistics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const counters = document.querySelectorAll('.counter-number');
  const counterSection = document.querySelector('.counter-section');

  if (counters.length > 0 && counterSection) {
    let animated = false;

    function startCounters() {
      counters.forEach(function (counter) {
        const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          
          // Ease-out cubic function
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeProgress * target);

          counter.textContent = prefix + currentVal.toLocaleString() + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = prefix + target.toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
      });
    }

    // Trigger counter animation on scroll into view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            startCounters();
          }
        });
      }, { threshold: 0.3 });

      observer.observe(counterSection);
    } else {
      startCounters();
    }
  }
});
