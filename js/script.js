/**
 * JOSÉ CERVERA PORTFOLIO - VANILLA JAVASCRIPT
 * Modern interactive functionality with smooth animations
 * Compatible with all browsers and hosting environments
 */

(function() {
    'use strict';

    // ==========================================
    // GLOBAL VARIABLES AND CONFIGURATION
    // ==========================================
    
    const CONFIG = {
        animationDuration: 1000,
        scrollOffset: 100,
        typingSpeed: 100,
        typingDeleteSpeed: 50,
        typingPauseDelay: 2000,
        preloaderDelay: 2500,
        scrollThrottle: 16
    };

    let isScrolling = false;
    let currentSection = 'home';
    let typingIndex = 0;
    let typingTextIndex = 0;
    let isDeleting = false;

    // Typing animation texts
    const typingTexts = [
        'Desarrollador Web',
        'Docente Informático',
        'Especialista en HTML5 CSS3 y JavaScript',
        'Experto en PHP y MySQL',
        'Desarrollador de Aplicaciones Web',
        'Formador Tecnológico'
    ];

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Throttle function to limit function execution frequency
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Debounce function to delay function execution
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 - offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    /**
     * Animate counter numbers
     */
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // ==========================================
    // PRELOADER
    // ==========================================

    function initPreloader() {
        const preloader = document.getElementById('preloader');
        
        if (preloader) {
            // Hide preloader after delay
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = 'visible';
                
                // Remove from DOM after animation
                setTimeout(() => {
                    if (preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 500);
            }, CONFIG.preloaderDelay);
        }
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    function initNavigation() {
        const navbar = document.getElementById('navbar');
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Navigation link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement, 80);
                }

                // Close mobile menu
                if (navMenu && hamburger) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
        });

        // Scroll behavior for navbar
        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Update active navigation link
            updateActiveNavLink();
        }, CONFIG.scrollThrottle);

        window.addEventListener('scroll', handleScroll);
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentActiveSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentActiveSection = section.getAttribute('id');
            }
        });

        if (currentActiveSection !== currentSection) {
            currentSection = currentActiveSection;
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                const linkSection = link.getAttribute('href').substring(1);
                if (linkSection === currentSection) {
                    link.classList.add('active');
                }
            });
        }
    }

    // ==========================================
    // TYPING ANIMATION
    // ==========================================

    function initTypingAnimation() {
        const typingElement = document.getElementById('typing-text');
        
        if (!typingElement) return;

        function type() {
            const currentText = typingTexts[typingTextIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, typingIndex - 1);
                typingIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, typingIndex + 1);
                typingIndex++;
            }

            let typeSpeed = isDeleting ? CONFIG.typingDeleteSpeed : CONFIG.typingSpeed;

            if (!isDeleting && typingIndex === currentText.length) {
                typeSpeed = CONFIG.typingPauseDelay;
                isDeleting = true;
            } else if (isDeleting && typingIndex === 0) {
                isDeleting = false;
                typingTextIndex = (typingTextIndex + 1) % typingTexts.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        type();
    }

    // ==========================================
    // SKILLS ANIMATION
    // ==========================================

    function initSkillsAnimation() {
        const skillBars = document.querySelectorAll('.skill-progress');
        const skillsSection = document.getElementById('skills');
        let skillsAnimated = false;

        function animateSkills() {
            if (skillsAnimated) return;
            
            skillBars.forEach((bar, index) => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, index * 200);
            });
            
            skillsAnimated = true;
        }

        // Intersection Observer for skills animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkills();
                }
            });
        }, { threshold: 0.5 });

        if (skillsSection) {
            observer.observe(skillsSection);
        }
    }

    // ==========================================
    // COUNTERS ANIMATION
    // ==========================================

    function initCountersAnimation() {
        const counters = document.querySelectorAll('.stat-number');
        let countersAnimated = false;

        function animateCounters() {
            if (countersAnimated) return;
            
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            });
            
            countersAnimated = true;
        }

        const aboutSection = document.getElementById('about');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                }
            });
        }, { threshold: 0.5 });

        if (aboutSection) {
            observer.observe(aboutSection);
        }
    }

    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================

    function initScrollAnimations() {
        // AOS (Animate On Scroll) initialization
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100,
                easing: 'ease-out-cubic'
            });
        }

        // Custom scroll animations for elements without AOS
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
        
        function checkAnimation() {
            animatedElements.forEach(element => {
                if (isInViewport(element, 100)) {
                    element.classList.add('visible');
                }
            });
        }

        const scrollHandler = throttle(checkAnimation, CONFIG.scrollThrottle);
        window.addEventListener('scroll', scrollHandler);
        checkAnimation(); // Check on initial load
    }

    // ==========================================
    // CONTACT FORM
    // ==========================================

    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        
        if (!contactForm) return;

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Validate form
            if (!name || !email || !subject || !message) {
                showNotification('Por favor, completa todos los campos.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Por favor, introduce un email válido.', 'error');
                return;
            }
            
            // Create mailto link
            const emailSubject = encodeURIComponent(`Contacto desde portafolio: ${subject}`);
            const emailBody = encodeURIComponent(`
Nombre: ${name}
Email: ${email}
Asunto: ${subject}

Mensaje:
${message}

---
Enviado desde el portafolio web de José Cervera
            `);
            
            const mailtoLink = `mailto:cerveretaprofe@gmail.com?subject=${emailSubject}&body=${emailBody}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            showNotification('Abriendo tu cliente de email...', 'success');
            
            // Reset form
            contactForm.reset();
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // ==========================================
    // SCROLL TO TOP BUTTON
    // ==========================================

    function initScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        
        if (!scrollBtn) return;

        const handleScroll = throttle(() => {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }, CONFIG.scrollThrottle);

        window.addEventListener('scroll', handleScroll);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    // FLOATING SHAPES ANIMATION
    // ==========================================

    function initFloatingShapes() {
        const shapes = document.querySelectorAll('.shape');
        
        shapes.forEach((shape, index) => {
            // Add random movement
            const randomDelay = Math.random() * 2000;
            const randomDuration = 4000 + Math.random() * 4000;
            
            shape.style.animationDelay = randomDelay + 'ms';
            shape.style.animationDuration = randomDuration + 'ms';
        });
    }

    // ==========================================
    // PARALLAX EFFECT
    // ==========================================

    function initParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.hero-background, .floating-shapes');
        
        const handleScroll = throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        }, CONFIG.scrollThrottle);

        window.addEventListener('scroll', handleScroll);
    }

    // ==========================================
    // PROJECT CARDS INTERACTION
    // ==========================================

    function initProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // ==========================================
    // KEYBOARD NAVIGATION
    // ==========================================

    function initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes mobile menu
            if (e.key === 'Escape') {
                const navMenu = document.getElementById('nav-menu');
                const hamburger = document.getElementById('hamburger');
                
                if (navMenu && hamburger) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
            
            // Arrow keys for section navigation
            const sections = ['home', 'about', 'skills', 'projects', 'certifications', 'contact'];
            const currentIndex = sections.indexOf(currentSection);
            
            if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
                e.preventDefault();
                const nextSection = document.getElementById(sections[currentIndex + 1]);
                if (nextSection) smoothScrollTo(nextSection, 80);
            }
            
            if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                const prevSection = document.getElementById(sections[currentIndex - 1]);
                if (prevSection) smoothScrollTo(prevSection, 80);
            }
        });
    }

    // ==========================================
    // PERFORMANCE OPTIMIZATIONS
    // ==========================================

    function initPerformanceOptimizations() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Preload critical resources
        const criticalResources = [
            'css/styles.css',
            'js/script.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    // ==========================================
    // ERROR HANDLING
    // ==========================================

    function initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            // Could send error to analytics service here
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            // Could send error to analytics service here
        });
    }

    // ==========================================
    // ACCESSIBILITY ENHANCEMENTS
    // ==========================================

    function initAccessibility() {
        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content identifier
        const mainContent = document.querySelector('main') || document.querySelector('#home');
        if (mainContent) {
            mainContent.id = 'main-content';
        }
        
        // Enhanced focus management
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid #3b82f6';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }

    // ==========================================
    // MAIN INITIALIZATION
    // ==========================================

    function init() {
        // Initialize all components
        initPreloader();
        initNavigation();
        initTypingAnimation();
        initSkillsAnimation();
        initCountersAnimation();
        initScrollAnimations();
        initContactForm();
        initScrollToTop();
        initFloatingShapes();
        initParallaxEffect();
        initProjectCards();
        initKeyboardNavigation();
        initPerformanceOptimizations();
        initErrorHandling();
        initAccessibility();
        
        console.log('🚀 José Cervera Portfolio initialized successfully!');
    }

    // ==========================================
    // DOM READY AND WINDOW LOAD EVENTS
    // ==========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Additional window load event for complete initialization
    window.addEventListener('load', () => {
        // Final optimizations after complete page load
        setTimeout(() => {
            // Remove will-change properties to improve performance
            const animatedElements = document.querySelectorAll('[style*="will-change"]');
            animatedElements.forEach(element => {
                element.style.willChange = 'auto';
            });
        }, 3000);
    });

    // ==========================================
    // EXPORT FOR POTENTIAL EXTERNAL USE
    // ==========================================

    // Make some functions available globally if needed
    window.PortfolioApp = {
        scrollToSection: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) smoothScrollTo(element, 80);
        },
        showNotification: showNotification,
        CONFIG: CONFIG
    };

})();

// ==========================================
// ADDITIONAL UTILITY FUNCTIONS
// ==========================================

/**
 * Simple analytics tracking (can be extended)
 */
function trackEvent(category, action, label) {
    // This can be connected to Google Analytics or other analytics services
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

/**
 * Simple dark mode toggle (optional feature)
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
}

/**
 * Initialize dark mode from localStorage
 */
function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

    // ==========================================
    // AI EXPERTISE SECTION FUNCTIONALITY
    // ==========================================

    /**
     * Initialize AI stats counters animation
     */
    function initAIStatsCounters() {
        const statItems = document.querySelectorAll('.ai-stat-number');
        
        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target + (target === 95 ? '%' : '');
                }
            };
            
            updateCounter();
        };

        // Intersection Observer for stats animation
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumber = entry.target.querySelector('.ai-stat-number');
                    if (statNumber && !statNumber.hasAttribute('data-animated')) {
                        statNumber.setAttribute('data-animated', 'true');
                        setTimeout(() => {
                            animateCounter(statNumber);
                        }, 200);
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe all stat items
        const statContainers = document.querySelectorAll('.ai-stat-item');
        statContainers.forEach(item => {
            statsObserver.observe(item);
        });
    }

    /**
     * Add floating animation to AI cards
     */
    function initAICardsAnimation() {
        const aiCards = document.querySelectorAll('.ai-card');
        
        aiCards.forEach((card, index) => {
            // Add staggered floating animation
            card.style.animationDelay = `${index * 0.2}s`;
            
            // Add hover interaction for tech list items
            const techItems = card.querySelectorAll('.ai-tech-list li');
            techItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(10px)';
                    this.style.transition = 'transform 0.3s ease';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0)';
                });
            });
        });
    }

    /**
     * Add interactive effects to AI specializations
     */
    function initAISpecializations() {
        const specItems = document.querySelectorAll('.ai-spec-item');
        
        specItems.forEach(item => {
            item.addEventListener('click', function() {
                // Add click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-3px)';
                }, 150);
            });
        });
    }

    /**
     * Add glowing effect to AI section icons
     */
    function initAIIconEffects() {
        const aiIcons = document.querySelectorAll('.ai-card-icon');
        
        const addGlowEffect = () => {
            aiIcons.forEach((icon, index) => {
                setTimeout(() => {
                    icon.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6)';
                    setTimeout(() => {
                        icon.style.boxShadow = '';
                    }, 1000);
                }, index * 500);
            });
        };

        // Create intersection observer for glow effect
        const glowObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-glow-animated')) {
                    entry.target.setAttribute('data-glow-animated', 'true');
                    addGlowEffect();
                }
            });
        }, {
            threshold: 0.3
        });

        const aiSection = document.getElementById('ai-expertise');
        if (aiSection) {
            glowObserver.observe(aiSection);
        }
    }

    /**
     * Update navigation to include AI Expertise section
     */
    function updateNavigationForAI() {
        const navItems = document.querySelectorAll('.navbar .nav-links a[href="#projects"]');
        
        navItems.forEach(navItem => {
            // Create new AI expertise nav item
            const aiNavItem = document.createElement('a');
            aiNavItem.href = '#ai-expertise';
            aiNavItem.textContent = 'IA & Automatización';
            aiNavItem.classList.add('nav-link');
            
            // Insert before projects
            navItem.parentNode.insertBefore(aiNavItem, navItem);
        });
    }

    // Initialize all AI expertise functionality
    function initAIExpertise() {
        initAIStatsCounters();
        initAICardsAnimation();
        initAISpecializations();
        initAIIconEffects();
        updateNavigationForAI();
        
        // Update scroll spy to include AI section
        updateScrollSpy();
    }

    // Add to the main initialization
    initAIExpertise();

// Auto-initialize dark mode on load
document.addEventListener('DOMContentLoaded', initDarkMode);
