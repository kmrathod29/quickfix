// Shared UI interactions for navigation and basic UX across pages
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getToken() {
    try { return localStorage.getItem('quickfix-token'); } catch (_) { return null; }
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem('quickfix-user') || 'null'); } catch (_) { return null; }
  }
  function getInitials(name) {
    if (!name || typeof name !== 'string') return 'U';
    var parts = name.trim().split(/\s+/);
    var first = (parts[0] && parts[0][0]) || '';
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || first.toUpperCase() || 'U';
  }
  function renderAuthUI() {
    var navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    var loginBtn = document.querySelector('.nav-auth-btn.login-btn');
    var token = getToken();
    var user = getUser();

    // Helper to ensure a dashboard link exists for the current role
    function ensureDashboardLink(role) {
      var existing = document.getElementById('nav-dashboard-link');
      var path = role === 'admin' ? 'admin/index.html' : role === 'technician' ? 'technician/dashboard.html' : 'user/dashboard.html';
      if (!existing) {
        var li = document.createElement('li');
        li.id = 'nav-dashboard-link';
        li.innerHTML = '<a class="nav-link" href="' + path + '">Dashboard</a>';
        navMenu.appendChild(li);
      } else {
        var a = existing.querySelector('a');
        if (a) a.setAttribute('href', path);
      }
    }

    if (token && user) {
      if (loginBtn && loginBtn.parentElement) loginBtn.parentElement.style.display = 'none';
      ensureDashboardLink(user.role || 'user');
      if (!document.getElementById('nav-user-menu')) {
        var li = document.createElement('li');
        li.id = 'nav-user-menu';
        li.style.position = 'relative';
        li.innerHTML = '\n          <button id=\"avatarBtn\" class=\"w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center\" title=\"Account\">\n            ' + getInitials(user.name || user.email || 'U') + '\n          </button>\n          <div id=\"avatarMenu\" class=\"hidden absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border\">\n            <a href=\"#\" id=\"logoutBtn\" class=\"block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100\">Logout</a>\n          </div>';
        navMenu.appendChild(li);
        var avatarBtn = li.querySelector('#avatarBtn');
        var avatarMenu = li.querySelector('#avatarMenu');
        var logoutBtn = li.querySelector('#logoutBtn');
        avatarBtn.addEventListener('click', function(){
          avatarMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', function(e){
          if (!li.contains(e.target)) avatarMenu.classList.add('hidden');
        });
        logoutBtn.addEventListener('click', function(e){
          e.preventDefault();
          try {
            localStorage.removeItem('quickfix-token');
            localStorage.removeItem('quickfix-user');
            localStorage.removeItem('quickfix-role');
          } catch(_){ }
          window.location.href = 'login.html';
        });
      }
    } else {
      if (loginBtn && loginBtn.parentElement) loginBtn.parentElement.style.display = '';
      var existed = document.getElementById('nav-user-menu');
      if (existed && existed.parentElement) existed.parentElement.removeChild(existed);
      var dash = document.getElementById('nav-dashboard-link');
      if (dash && dash.parentElement) dash.parentElement.removeChild(dash);
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

    // Protect pages marked as protected
    var body = document.body;
    if (body && body.getAttribute('data-protected') === 'true') {
      if (!getToken()) {
        window.location.href = 'login.html';
        return; // stop further UI
      }
    }

    // Render auth state in navbar
    renderAuthUI();

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
          console.log('Language changed to: ' + label);
        } catch (_) {}
      });
    }
  });
})();
