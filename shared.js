// Shared UI interactions for navigation and basic UX across pages
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    // Mobile hamburger toggle
    var hamburger = document.querySelector('.hamburger');
    var navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });
      // Close on link click
      Array.prototype.forEach.call(document.querySelectorAll('.nav-link'), function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });
    }

    // Navbar style on scroll (shadow/background tweak)
    window.addEventListener('scroll', function () {
      var navbar = document.querySelector('.navbar');
      if (!navbar) return;
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      }
    });

    // Language selector feedback (non-blocking)
    var languageSelector = document.querySelector('.language-selector');
    if (languageSelector) {
      languageSelector.addEventListener('change', function (e) {
        try {
          var label = e.target.options[e.target.selectedIndex].text;
          // Minimal UX: quick toast-like alert (replace with nicer UI if desired)
          console.log('Language changed to: ' + label);
        } catch (_) {}
      });
    }
  });
})();
