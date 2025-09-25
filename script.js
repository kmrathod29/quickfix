// Combined QuickFix JavaScript functionality
// Mobile menu toggle and splash screen functionality
document.addEventListener("DOMContentLoaded", function () {
  // Show splash screen
  let currentScreen = "splash";

  // Check if this is the first visit
  const isFirstVisit = !getStorageItem("quickfix-visited");

  // Prevent background scroll while splash/welcome are visible
  document.body.style.overflow = "hidden";

  if (isFirstVisit) {
    // First visit - show splash and welcome screens
    setStorageItem("quickfix-visited", "true");

    // Transition from splash to welcome after 3 seconds
    setTimeout(() => {
      showWelcome();
    }, 3000);
  } else {
    // Returning visitor - go directly to main page
    const splashEl = document.getElementById("splash");
    const welcomeEl = document.getElementById("welcome");

    if (splashEl) {
      splashEl.classList.remove("active");
      splashEl.classList.add("hidden");
    }

    if (welcomeEl) {
      welcomeEl.classList.remove("active");
      welcomeEl.classList.add("hidden");
    }

    showMainPage();
  }

  //   setTimeout(() => {
  //     showWelcome();
  //   }, 3000);

  // Show welcome screen
  function showWelcome() {
    const splashEl = document.getElementById("splash");
    const welcomeEl = document.getElementById("welcome");

    if (splashEl) {
      splashEl.classList.remove("active");
      splashEl.classList.add("hidden");
    }

    if (welcomeEl) {
      welcomeEl.classList.remove("hidden");
      welcomeEl.classList.add("active");
    }

    currentScreen = "welcome";

    // Reset animations for welcome screen
    const welcomeContainer = document.querySelector(".welcome-container");
    if (welcomeContainer) {
      welcomeContainer.style.animation = "none";
      setTimeout(() => {
        welcomeContainer.style.animation = "slideUp 1s ease forwards";
      }, 100);
    }
  }

  // Show main page
  function showMainPage() {
    const welcomeEl = document.getElementById("welcome");
    if (welcomeEl) {
      welcomeEl.classList.remove("active");
      welcomeEl.classList.add("hidden");
    }

    // Reveal main content after a brief delay
    setTimeout(() => {
      const main = document.getElementById("mainPage");
      if (main) {
        main.classList.add("show");
      }
      currentScreen = "main";

      // Allow background scroll again
      document.body.style.overflow = "auto";

      // Initialize animations if AOS is present (optional)
      if (window.AOS && typeof AOS.init === "function") {
        AOS.init({
          duration: 800,
          easing: "ease-in-out",
          once: true,
          offset: 100,
        });
      }
    }, 300);
  }

  // Expose for the "Get Started" button inline handler
  window.showMainPage = showMainPage;

  // Mobile menu toggle
  function setupMobileMenu() {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navMenuRight = document.querySelector(".nav-menu-right");

    if (hamburger && navMenu) {
      hamburger.addEventListener("click", function () {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        if (navMenuRight) {
          navMenuRight.classList.toggle("active");
        }
      });

      // Close mobile menu when clicking on a link
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((n) =>
        n.addEventListener("click", () => {
          if (hamburger && navMenu) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            if (navMenuRight) {
              navMenuRight.classList.remove("active");
            }
          }
        })
      );
    }
  }

  // Try to set up mobile menu, but don't throw an error if it fails
  try {
    setupMobileMenu();
  } catch (error) {
    console.warn("Could not set up mobile menu:", error);
  }

  // Render auth UI (login button vs user initials avatar)
  renderAuthUI();

  // Protect Services link: if not logged in, show notification
  const servicesLink = document.querySelector('a[href="service.html"]');
  if (servicesLink) {
    servicesLink.addEventListener("click", function (e) {
      console.log("Services link clicked, token status:", !!getToken());
      if (!getToken()) {
        e.preventDefault();
        showNotification("Please login to view Services.", "info");
        // Open role select modal instead of redirecting
        openRoleSelectModal('login');
      }
    });
  } else {
    console.warn("Services link not found!");
  }
});

// ---------------- Auth helpers (frontend) ----------------
function getStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    // Silent fail for environments without localStorage
  }
}

function getToken() {
  return getStorageItem("quickfix-token");
}

function getUser() {
  try {
    return JSON.parse(getStorageItem("quickfix-user") || "null");
  } catch (_) {
    return null;
  }
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || first.toUpperCase() || "U";
}

function renderAuthUI() {
  const navMenu = document.querySelector(".nav-menu");
  if (!navMenu) return;

  const loginBtn = document.querySelector(".nav-auth-btn.login-btn");
  const token = getToken();
  const user = getUser();

  function ensureDashboardLink(role) {
    const existing = document.getElementById("nav-dashboard-link");
    const path =
      role === "admin"
        ? "admin/index.html"
        : role === "technician"
        ? "technician/dashboard.html"
        : "user/dashboard.html";
    if (!existing) {
      const li = document.createElement("li");
      li.id = "nav-dashboard-link";
      li.innerHTML = `<a class="nav-link" href="${path}">Dashboard</a>`;
      navMenu.appendChild(li);
    } else {
      const a = existing.querySelector("a");
      if (a) a.setAttribute("href", path);
    }
  }

     // If logged in: hide login button and show avatar with dropdown
     if (token && user) {
      if (loginBtn && loginBtn.parentElement) {
          loginBtn.parentElement.style.display = 'none';
      }
      ensureDashboardLink(user.role || 'user');
      if (!document.getElementById('nav-user-menu')) {
          const li = document.createElement('li');
          li.id = 'nav-user-menu';
          li.style.position = 'relative';
          li.innerHTML = `
              <button id="avatarBtn" class="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center" title="Account">
                  ${getInitials(user.name || user.email || 'U')}
              </button>
              <div id="avatarMenu" class="hidden absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border">
                  <a href="#" id="logoutBtn" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
              </div>`;
          navMenu.appendChild(li);

          const avatarBtn = li.querySelector('#avatarBtn');
          const avatarMenu = li.querySelector('#avatarMenu');
          const logoutBtn = li.querySelector('#logoutBtn');
          avatarBtn.addEventListener('click', function(){
              avatarMenu.classList.toggle('hidden');
          });
          document.addEventListener('click', function(e){
              if (!li.contains(e.target)) {
                  avatarMenu.classList.add('hidden');
              }
          });
          logoutBtn.addEventListener('click', function(e){
              e.preventDefault();
              try {
                  localStorage.removeItem('quickfix-token');
                  localStorage.removeItem('quickfix-user');
                  localStorage.removeItem('quickfix-role');
              } catch(_){ }
              // Redirect to homepage to avoid 404s when logging out from nested routes
              window.location.href = 'index.html';
          });
      }
  } else {
      // Not logged in: show login button; remove avatar if present
      if (loginBtn && loginBtn.parentElement) {
          loginBtn.parentElement.style.display = '';
      }
      const existed = document.getElementById('nav-user-menu');
      if (existed && existed.parentElement) existed.parentElement.removeChild(existed);
      const dash = document.getElementById('nav-dashboard-link');
      if (dash && dash.parentElement) dash.parentElement.removeChild(dash);
  }
}
 

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
    });
  }
}

// Add scroll event listener for navbar
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
      navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.15)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
    }
  }
});

// Modal functionality
let pendingAuthAction = null; // 'login' | 'signup' | null

function openRoleSelectModal(action) {
  pendingAuthAction = action;
  const modalId =
    action === "login" ? "roleSelectLoginModal" : "roleSelectSignupModal";
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeRoleSelectLoginModal() {
  const modal = document.getElementById("roleSelectLoginModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function closeRoleSelectSignupModal() {
  const modal = document.getElementById("roleSelectSignupModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function proceedWithRoleSelection(role) {
  setStorageItem("quickfix-role", role);

  // Close the correct modal
  if (pendingAuthAction === "login") {
    closeRoleSelectLoginModal();
    openLoginModal();
  } else if (pendingAuthAction === "signup") {
    closeRoleSelectSignupModal();
    openSignupModal();
  }

  pendingAuthAction = null;
}

function openBookingModal() {
  // Require login before booking
  if (!getToken()) {
    showNotification("Please login to book a service.", "info");
    window.location.href = "login.html";
    return;
  }
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modals = [
    "bookingModal",
    "loginModal",
    "signupModal",
    "roleSelectLoginModal",
    "roleSelectSignupModal",
  ];

  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId);
    if (modal && event.target === modal) {
      if (modalId === "bookingModal") closeBookingModal();
      else if (modalId === "loginModal") closeLoginModal();
      else if (modalId === "signupModal") closeSignupModal();
      else if (modalId === "roleSelectLoginModal") closeRoleSelectLoginModal();
      else if (modalId === "roleSelectSignupModal")
        closeRoleSelectSignupModal();
    }
  });
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeBookingModal();
    closeLoginModal();
    closeSignupModal();
    closeRoleSelectModal();
  }
});

// Login Modal Functions
function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Signup Modal Functions
function openSignupModal() {
  const modal = document.getElementById("signupModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // If signing up as technician, render skills selector
    try {
      maybeRenderTechnicianSkills();
    } catch (_) {}
  }
}

function closeSignupModal() {
  const modal = document.getElementById("signupModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Select service function
function selectService(serviceName) {
  // Check if user is logged in
  if (!getToken()) {
    showNotification("Please login to select a service.", "info");
    return;
  }

  const serviceTypeEl = document.getElementById("serviceType");
  if (serviceTypeEl) {
    serviceTypeEl.value = serviceName;
  }
  openBookingModal();
}

// API base
// IMPORTANT: Backend runs on port 9000 (see backend/.env)
const API_BASE = "http://localhost:9000";

// Form submission handlers with safe event listener
function safeAddFormSubmitListener(formId, handler) {
  const form = document.getElementById(formId);
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handler.call(this, e);
    });
  }
}

// Booking form submission handler
safeAddFormSubmitListener("bookingForm", async function (e) {
  const serviceType = document.getElementById("serviceType")?.value || "";
  const inputs = this.querySelectorAll("input");
  const selects = this.querySelectorAll("select");
  const textareas = this.querySelectorAll("textarea");

  const payload = {
    serviceType,
    name: inputs[0]?.value || "",
    phone: inputs[1]?.value || "",
    email: inputs[2]?.value || "",
    address: inputs[3]?.value || "",
    date: inputs[4]?.value || "",
    time: selects[1]?.value || "",
    notes: textareas[0]?.value || "",
  };

  try {
    const token = getToken();
    if (!token) {
      showNotification("Please login to book a service.", "info");
      window.location.href = "login.html";
      return;
    }
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Booking failed");
    showNotification(
      "Booking request submitted successfully! We'll contact you within 30 minutes.",
      "success"
    );
    this.reset();
    closeBookingModal();
  } catch (err) {
    showNotification(err.message || "Booking error", "error");
  }
});

// Contact form submission handler
safeAddFormSubmitListener("contactForm", async function (e) {
  const inputs = this.querySelectorAll("input");
  const textarea = this.querySelector("textarea");

  const payload = {
    name: inputs[0]?.value || "",
    email: inputs[1]?.value || "",
    phone: inputs[2]?.value || "",
    message: textarea?.value || "",
  };

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send message");
    showNotification(
      "Message sent successfully! We'll get back to you soon.",
      "success"
    );
    this.reset();
  } catch (err) {
    showNotification(err.message || "Contact error", "error");
  }
});

// Login form submission
safeAddFormSubmitListener("loginForm", async function (e) {
  const email = this.querySelector('input[type="email"]')?.value.trim() || "";
  const password = this.querySelector('input[type="password"]')?.value || "";

  try {
    // Check if user exists first
    const checkRes = await fetch(
      `${API_BASE}/api/auth/check?email=${encodeURIComponent(email)}`
    );
    const check = await checkRes.json().catch(() => ({}));
    if (checkRes.ok && check.exists === false) {
      showNotification(
        "No account found for this email. Redirecting to Sign Up...",
        "info"
      );
      // Prefill signup email and open signup modal
      closeLoginModal();
      openSignupModal();
      const signupEmail = document.querySelector(
        '#signupForm input[type="email"]'
      );
      if (signupEmail) signupEmail.value = email;
      return;
    }

    // Proceed to login
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    setStorageItem("quickfix-token", data.token);
    setStorageItem("quickfix-user", JSON.stringify(data.user));
    setStorageItem("quickfix-role", data.user?.role || "user");
    showNotification("Login successful! Welcome back to QuickFix.", "success");
    this.reset();
    closeLoginModal();
    renderAuthUI(); // Update UI after login
  } catch (err) {
    showNotification(err.message || "Login error", "error");
  }
});

// Render skills list if role is technician
async function maybeRenderTechnicianSkills() {
  const role = getStorageItem("quickfix-role") || "user";
  const container = document.getElementById("technicianSkills");
  const skillsList = document.getElementById("skillsList");
  if (!container || !skillsList) return;

  if (role === "technician") {
    container.style.display = "";
    if (skillsList.childElementCount === 0) {
      // Fetch service categories from backend
      try {
        const res = await fetch(`${API_BASE}/api/skills/categories`);
        const data = await res.json();
        const categories = data && data.categories ? Object.values(data.categories) : [];
        
        // Render checkboxes for service categories
        skillsList.innerHTML = categories
          .map(
            (category, i) =>
              `<label style="display:flex; align-items:center; gap:8px;">
                 <input type="checkbox" name="tech-skill" value="${category.name}"> 
                 <span style="display:flex; align-items:center; gap:8px;">
                   <i class="${category.icon} mr-2"></i>
                   <span>${category.name}</span>
                 </span>
               </label>`
          )
          .join("");
      } catch (err) {
        console.warn("Failed to load skills:", err);
        skillsList.innerHTML = `<div style="color:#ef4444;">Failed to load skills. Please try again later.</div>`;
      }
    }
  } else {
    container.style.display = "none";
  }
}

// Signup form submission
safeAddFormSubmitListener("signupForm", async function (e) {
  const inputs = this.querySelectorAll("input");
  const fullName = inputs[0]?.value.trim() || "";
  const email = inputs[1]?.value.trim() || "";
  const phone = inputs[2]?.value.trim() || "";
  const password = inputs[3]?.value || "";
  const confirmPassword = inputs[4]?.value || "";

  if (password !== confirmPassword) {
    showNotification("Passwords do not match. Please try again.", "error");
    return;
  }

  try {
    // Check if user exists first
    const checkRes = await fetch(
      `${API_BASE}/api/auth/check?email=${encodeURIComponent(email)}`
    );
    const check = await checkRes.json().catch(() => ({}));
    if (checkRes.ok && check.exists === true) {
      showNotification(
        "An account already exists for this email. Redirecting to Login...",
        "info"
      );
      closeSignupModal();
      openLoginModal();
      const loginEmail = document.querySelector(
        '#loginForm input[type="email"]'
      );
      if (loginEmail) loginEmail.value = email;
      return;
    }

    // Proceed to signup
    const role = getStorageItem("quickfix-role") || "user";

    // collect skills if technician
    let skills = [];
    if (role === "technician") {
      skills = Array.from(
        document.querySelectorAll('#signupForm input[name="tech-skill"]:checked')
      ).map(el => String(el.value).trim().toLowerCase());
      if (skills.length === 0) {
        showNotification("Please select at least one skill to sign up as a technician.", "error");
        return;
      }
    }

    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        phone,
        password,
        role,
        ...(role === "technician" ? { skills } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");
    setStorageItem("quickfix-token", data.token);
    setStorageItem("quickfix-user", JSON.stringify(data.user));
    setStorageItem("quickfix-role", data.user?.role || "user");
    showNotification(
      "Account created successfully! Welcome to QuickFix.",
      "success"
    );
    this.reset();
    closeSignupModal();
    renderAuthUI(); // Update UI after signup
  } catch (err) {
    showNotification(err.message || "Signup error", "error");
  }
});

// Language selector functionality
(function () {
  const languageSelector = document.querySelector(
    ".language-selector-container"
  );
  if (!languageSelector) {
    // Fallback for simple language selector
    const langSel = document.querySelector(".language-selector");
    if (langSel) {
      langSel.addEventListener("change", function (e) {
        const selectedLanguage = e.target.value;
        const label = e.target.options[e.target.selectedIndex].text;
        showNotification(`Language changed to ${label}`, "info");
        setStorageItem("quickfix-language", selectedLanguage);
        console.log("Language changed to:", selectedLanguage);
      });
    }
    return;
  }

  const currentLanguage = languageSelector.querySelector(".current-language");
  const languageDropdown = languageSelector.querySelector(".language-dropdown");
  const languageOptions = languageSelector.querySelectorAll(".language-option");

  let isOpen = false;
  let hoverTimeout;

  // Show dropdown on hover
  languageSelector.addEventListener("mouseenter", function () {
    clearTimeout(hoverTimeout);
    if (languageDropdown) {
      languageDropdown.style.display = "block";
      isOpen = true;
    }
  });

  // Hide dropdown when mouse leaves (with small delay)
  languageSelector.addEventListener("mouseleave", function () {
    hoverTimeout = setTimeout(() => {
      if (isOpen && languageDropdown) {
        languageDropdown.style.display = "none";
        isOpen = false;
      }
    }, 200); // 200ms delay to prevent flickering
  });

  // Toggle dropdown on click (for mobile/accessibility)
  languageSelector.addEventListener("click", function (e) {
    e.stopPropagation();
    if (languageDropdown) {
      const isVisible = languageDropdown.style.display === "block";
      languageDropdown.style.display = isVisible ? "none" : "block";
      isOpen = !isVisible;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!languageSelector.contains(e.target) && languageDropdown) {
      languageDropdown.style.display = "none";
      isOpen = false;
    }
  });

  // Handle language option selection
  languageOptions.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();
      const lang = this.getAttribute("data-lang");
      const langText = this.textContent.trim();

      // Update current language display
      if (currentLanguage) {
        currentLanguage.innerHTML = `
                    <i class="fas fa-globe me-2"></i>
                    ${lang.toUpperCase()}
                `;
      }

      // Hide dropdown
      if (languageDropdown) {
        languageDropdown.style.display = "none";
      }
      isOpen = false;

      // Show notification
      showNotification(`Language changed to ${langText}`, "info");

      // Store selected language
      setStorageItem("quickfix-language", lang);
      console.log("Language changed to:", lang);
    });
  });
})();

// Notification system
function showNotification(message, type = "info") {
  // Remove any existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification(this)">&times;</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#22c55e"
            : type === "error"
            ? "#ef4444"
            : "#3b82f6"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;

  // Add notification styles to head if not already present
  if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .notification-close:hover {
                opacity: 0.8;
            }
        `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideInRight 0.3s ease reverse";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 9000);
}

function closeNotification(button) {
  const notification = button.closest(".notification");
  if (notification) {
    notification.style.animation = "slideInRight 0.3s ease reverse";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }
}

// Animate elements on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Apply animation to elements when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Add animation styles
  const style = document.createElement("style");
  style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
    `;
  document.head.appendChild(style);

  // Add animation class to elements
  const elementsToAnimate = document.querySelectorAll(
    ".service-card, .step, .technician-card, .section-header"
  );
  elementsToAnimate.forEach((el) => {
    el.classList.add("animate-on-scroll");
    observer.observe(el);
  });
});

// Add loading animation for service buttons
document.querySelectorAll(".service-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const originalText = this.textContent;
    this.textContent = "Loading...";
    this.disabled = true;

    setTimeout(() => {
      this.textContent = originalText;
      this.disabled = false;
    }, 1000);
  });
});

// Add hover effect for cards
document.querySelectorAll(".service-card, .technician-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-10px) scale(1.02)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target.toLocaleString() + (target >= 10 ? "+" : "");
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start).toLocaleString();
    }
  }, 16);
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll(".stat-number");
      statNumbers.forEach((stat) => {
        const text = stat.textContent;
        const number = parseInt(text.replace(/[^0-9]/g, ""));
        if (text.includes("4.9")) {
          stat.textContent = "4.9";
        } else {
          animateCounter(stat, number);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) {
    statsObserver.observe(heroStats);
  }
});

// Active Navigation Link Management
function updateActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const currentHash = window.location.hash;

  // Remove active class from all nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => link.classList.remove("active"));

  // Add active class based on current page
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (href) {
      // Handle hash links (for sections on same page)
      if (href.startsWith("#")) {
        if (
          href === currentHash &&
          (currentPage === "index.html" || currentPage === "")
        ) {
          link.classList.add("active");
        }
      }
      // Handle page links
      else if (href.includes(".html")) {
        const linkPage = href.split("/").pop().split("#")[0];
        if (
          linkPage === currentPage ||
          (linkPage === "index.html" &&
            (currentPage === "" || currentPage === "index.html"))
        ) {
          link.classList.add("active");
        }
      }
      // Handle links with both page and hash
      else if (href.includes("#")) {
        const linkPage = href.split("#")[0] || "index.html";
        const linkHash = "#" + href.split("#")[1];
        if (linkPage === currentPage && linkHash === currentHash) {
          link.classList.add("active");
        }
      }
    }
  });
}

// Section-based active link detection for single page
function handleSectionActiveLinks() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0.1,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;

        // Remove active from all nav links
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });

        // Add active to matching nav link
        const activeLink = document.querySelector(
          `.nav-link[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

// Initialize active link detection
function initializeActiveLinks() {
  // Update active links on page load
  updateActiveNavLink();

  // Handle section-based detection for single page navigation
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname === ""
  ) {
    handleSectionActiveLinks();
  }

  // Update active links when hash changes
  window.addEventListener("hashchange", updateActiveNavLink);
}

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.textContent = "";

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typing effect and active navigation links
document.addEventListener("DOMContentLoaded", function () {
  const heroTitle = document.querySelector(".hero-content h1");

  // Only proceed if hero title exists
  if (heroTitle) {
    const originalText = heroTitle.textContent;

    // Small delay to ensure everything is loaded
    setTimeout(() => {
      typeWriter(heroTitle, originalText, 50);
    }, 500);
  }

  // Initialize active navigation links
  initializeActiveLinks();
});

// Feature alert for coming soon features
function featureAlert() {
  showNotification("🚧 This feature is coming soon. Stay tuned!", "info");
}
