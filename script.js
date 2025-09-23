// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Show splash screen
    let currentScreen = 'splash';
        
        // Check if this is the first visit
        const isFirstVisit = !localStorage.getItem('quickfix-visited');
        
        // Prevent background scroll while splash/welcome are visible
        document.body.style.overflow = 'hidden';
        
        if (isFirstVisit) {
            // First visit - show splash and welcome screens
            localStorage.setItem('quickfix-visited', 'true');
            
            // Transition from splash to welcome after 3 seconds
            setTimeout(() => {
                showWelcome();
            }, 3000);
        } else {
            // Returning visitor - go directly to main page
            document.getElementById('splash').classList.remove('active');
            document.getElementById('splash').classList.add('hidden');
            document.getElementById('welcome').classList.remove('active');
            document.getElementById('welcome').classList.add('hidden');
            
            showMainPage();
        }
        
        // Show welcome screen
        function showWelcome() {
            document.getElementById('splash').classList.remove('active');
            document.getElementById('splash').classList.add('hidden');
            document.getElementById('welcome').classList.remove('hidden');
            document.getElementById('welcome').classList.add('active');
            currentScreen = 'welcome';
            
            // Reset animations for welcome screen
            const welcomeContainer = document.querySelector('.welcome-container');
            welcomeContainer.style.animation = 'none';
            setTimeout(() => {
                welcomeContainer.style.animation = 'slideUp 1s ease forwards';
            }, 100);
        }
        
        // Show main page
        function showMainPage() {
            const welcomeEl = document.getElementById('welcome');
            if (welcomeEl) {
                welcomeEl.classList.remove('active');
                welcomeEl.classList.add('hidden');
            }
            
            // Reveal main content after a brief delay
            setTimeout(() => {
                const main = document.getElementById('mainPage');
                if (main) {
                    main.classList.add('show');
                }
                currentScreen = 'main';
                
                // Allow background scroll again
                document.body.style.overflow = 'auto';

                // Initialize animations if AOS is present (optional)
                if (window.AOS && typeof AOS.init === 'function') {
                    AOS.init({
                        duration: 800,
                        easing: 'ease-in-out',
                        once: true,
                        offset: 100
                    });
                }
            }, 300);
        }
        
        // Expose for the "Get Started" button inline handler
        window.showMainPage = showMainPage;

    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
});

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Add scroll event listener for navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Modal functionality
let pendingAuthAction = null; // 'login' | 'signup' | null

function openRoleSelectModal(action) {
    pendingAuthAction = action;
    const modal = document.getElementById('roleSelectModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}
function closeRoleSelectModal() {
    const modal = document.getElementById('roleSelectModal');
    if (modal) {
        modal.style.display = 'none';
        // only re-enable scroll if no other modal is open
        const anyOpen = ['bookingModal','loginModal','signupModal'].some(id => {
            const el = document.getElementById(id);
            return el && el.style.display === 'block';
        });
        if (!anyOpen) document.body.style.overflow = 'auto';
    }
}
function proceedWithRoleSelection(role) {
    try { localStorage.setItem('quickfix-role', role); } catch (_) {}
    closeRoleSelectModal();
    if (pendingAuthAction === 'login') {
        openLoginModal();
    } else if (pendingAuthAction === 'signup') {
        openSignupModal();
    }
    pendingAuthAction = null;
}

function openBookingModal() {
    document.getElementById('bookingModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('bookingModal');
    if (event.target === modal) {
        closeBookingModal();
    }
    
    const loginModal = document.getElementById('loginModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
    
    const signupModal = document.getElementById('signupModal');
    if (event.target === signupModal) {
        closeSignupModal();
    }

    const roleModal = document.getElementById('roleSelectModal');
    if (event.target === roleModal) {
        closeRoleSelectModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeBookingModal();
        closeLoginModal();
        closeSignupModal();
    }
});

// Login Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Signup Modal Functions
function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Select service function
function selectService(serviceName) {
    document.getElementById('serviceType').value = serviceName;
    openBookingModal();
}

// Form submission handlers
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const serviceType = document.getElementById('serviceType').value;
    
    // Simulate form submission
    showNotification('Booking request submitted successfully! We\'ll contact you within 30 minutes.', 'success');
    
    // Reset form and close modal
    this.reset();
    closeBookingModal();
    
    // In a real application, you would send this data to your server
    console.log('Booking submitted for:', serviceType);
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simulate form submission
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    
    // Reset form
    this.reset();
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtain role from prior selection (fallback: user)
    const role = (function(){
        try { return localStorage.getItem('quickfix-role') || 'user'; } catch (_) { return 'user'; }
    })();

    // Simulate login
    showNotification(`Login successful as ${role === 'technician' ? 'Technician' : 'User'}! Welcome back to QuickFix.`, 'success');
    
    // Reset form and close modal
    this.reset();
    closeLoginModal();
    
    // In a real application, you would authenticate the user
    console.log('User logged in as', role);
});

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get password fields
    const password = this.querySelector('input[type="password"]:nth-of-type(1)').value;
    const confirmPassword = this.querySelector('input[type="password"]:nth-of-type(2)').value;
    
    // Check if passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match. Please try again.', 'error');
        return;
    }
    
    // Simulate signup
    showNotification('Account created successfully! Welcome to QuickFix.', 'success');
    
    // Reset form and close modal
    this.reset();
    closeSignupModal();
    
    // In a real application, you would create the user account
    console.log('New user account created');
});

// Language selector functionality
(function(){
    const langSel = document.querySelector('.language-selector');
    if (!langSel) return;
    langSel.addEventListener('change', function(e) {
        const selectedLanguage = e.target.value;
        showNotification(`Language changed to ${e.target.options[e.target.selectedIndex].text}`, 'info');
        // In a real application, you would implement language switching logic
        console.log('Language changed to:', selectedLanguage);
    });
})();

// Notification system
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
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
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
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
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to elements when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Add animation class to elements
    const elementsToAnimate = document.querySelectorAll('.service-card, .step, .technician-card, .section-header');
    elementsToAnimate.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});

// Add loading animation for service buttons
document.querySelectorAll('.service-btn').forEach(button => {
    button.addEventListener('click', function() {
        const originalText = this.textContent;
        this.textContent = 'Loading...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
        }, 1000);
    });
});

// Add hover effect for cards
document.querySelectorAll('.service-card, .technician-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString() + (target >= 1000 ? '+' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                if (text.includes('4.9')) {
                    stat.textContent = '4.9';
                } else {
                    animateCounter(stat, number);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect
document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero-content h1');
    const originalText = heroTitle.textContent;
    
    // Small delay to ensure everything is loaded
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 50);
    }, 500);
});

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
  