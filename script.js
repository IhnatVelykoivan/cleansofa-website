/**
 * CleanSofa Website JavaScript - Mobile Optimized
 * Focused on performance and mobile user experience
 */

// DOM Elements
const elements = {
    // Navigation
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Loading
    loading: document.getElementById('loading'),

    // Animation elements
    animateElements: document.querySelectorAll('.animate-on-scroll, .service-card, .benefit-item, .step-item, .contact-stat'),

    // Floating action button
    floatingAction: document.querySelector('.floating-action'),
    fabMain: document.querySelector('.fab-main'),
    fabOptions: document.querySelector('.fab-options')
};

// State Management
const state = {
    isLoading: true,
    currentSection: 'hero',
    isMobile: window.innerWidth < 768,
    isMenuOpen: false,
    lastScrollY: 0,
    ticking: false
};

/**
 * Initialize the application
 */
function init() {
    // Hide loading screen
    setTimeout(hideLoading, 1200);

    // Setup event listeners
    setupEventListeners();

    // Initialize animations
    initAnimations();

    // Setup smooth scrolling
    setupSmoothScrolling();

    // Setup intersection observer for navigation
    setupNavigationObserver();

    // Setup mobile optimizations
    setupMobileOptimizations();

    // Setup touch gestures
    setupTouchGestures();

    console.log('CleanSofa mobile website initialized');
}

/**
 * Hide loading screen with smooth transition
 */
function hideLoading() {
    if (elements.loading) {
        elements.loading.classList.add('hidden');
        state.isLoading = false;

        setTimeout(() => {
            elements.loading.style.display = 'none';
        }, 500);
    }
}

/**
 * Setup all event listeners with passive options for better performance
 */
function setupEventListeners() {
    // Navigation toggle
    if (elements.navToggle) {
        elements.navToggle.addEventListener('click', toggleNavigation);
    }

    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Scroll events with passive listening
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize events with debouncing
    window.addEventListener('resize', debounce(handleResize, 250), { passive: true });

    // Service card interactions (only for non-touch devices)
    if (!isTouchDevice()) {
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', handleServiceCardHover, { passive: true });
            card.addEventListener('mouseleave', handleServiceCardLeave, { passive: true });
        });
    }

    // Floating action button
    if (elements.fabMain) {
        elements.fabMain.addEventListener('click', handleFabClick);
    }

    // Close menu when clicking outside
    document.addEventListener('click', handleOutsideClick);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

    // Handle orientation change
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Handle visibility change for performance
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
}

/**
 * Toggle mobile navigation with smooth animation
 */
function toggleNavigation() {
    if (!elements.navMenu || !elements.navToggle) return;

    const isActive = elements.navMenu.classList.contains('active');

    if (isActive) {
        closeNavigation();
    } else {
        openNavigation();
    }
}

/**
 * Open mobile navigation
 */
function openNavigation() {
    elements.navMenu.classList.add('active');
    elements.navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    state.isMenuOpen = true;

    // Add animation delay to nav items
    elements.navLinks.forEach((link, index) => {
        link.style.animationDelay = `${index * 0.1}s`;
        link.style.animation = 'fadeInLeft 0.3s ease forwards';
    });

    // Track menu open event
    trackEvent('navigation_opened', { method: 'mobile_toggle' });
}

/**
 * Close mobile navigation
 */
function closeNavigation() {
    elements.navMenu.classList.remove('active');
    elements.navToggle.classList.remove('active');
    document.body.style.overflow = '';
    state.isMenuOpen = false;

    // Reset animations
    elements.navLinks.forEach(link => {
        link.style.animation = '';
        link.style.animationDelay = '';
    });
}

/**
 * Handle navigation link clicks with smooth scrolling
 */
function handleNavClick(event) {
    event.preventDefault();

    const targetId = event.target.getAttribute('href');
    if (!targetId || !targetId.startsWith('#')) return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    // Close mobile menu if open
    if (state.isMenuOpen) {
        closeNavigation();
    }

    // Smooth scroll to section with offset for fixed navbar
    const navbarHeight = elements.navbar ? elements.navbar.offsetHeight : 70;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });

    // Update active nav link
    updateActiveNavLink(targetId);

    // Track navigation
    trackEvent('navigation_click', { target: targetId });
}

/**
 * Update active navigation link
 */
function updateActiveNavLink(targetId) {
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[href="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Handle scroll events with performance optimization
 */
function handleScroll() {
    if (!state.ticking) {
        requestAnimationFrame(updateScrollElements);
        state.ticking = true;
    }
}

/**
 * Update elements based on scroll position
 */
function updateScrollElements() {
    const scrollTop = window.pageYOffset;

    // Update navbar background
    if (elements.navbar) {
        if (scrollTop > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    }

    // Hide/show floating action button based on scroll
    if (elements.floatingAction) {
        if (scrollTop > 300) {
            elements.floatingAction.style.opacity = '1';
            elements.floatingAction.style.visibility = 'visible';
        } else {
            elements.floatingAction.style.opacity = '0';
            elements.floatingAction.style.visibility = 'hidden';
        }
    }

    // Update current section for navigation
    updateCurrentSection();

    state.lastScrollY = scrollTop;
    state.ticking = false;
}

/**
 * Update current section based on scroll position
 */
function updateCurrentSection() {
    const sections = ['hero', 'services', 'about', 'process', 'contact'];
    const navbarHeight = elements.navbar ? elements.navbar.offsetHeight : 70;
    let currentSection = 'hero';

    for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= navbarHeight + 50 && rect.bottom >= navbarHeight + 50) {
                currentSection = sectionId;
                break;
            }
        }
    }

    if (currentSection !== state.currentSection) {
        state.currentSection = currentSection;
        updateActiveNavLink(`#${currentSection}`);
    }
}

/**
 * Handle window resize with mobile/desktop detection
 */
function handleResize() {
    const wasMobile = state.isMobile;
    state.isMobile = window.innerWidth < 768;

    // Close mobile menu on resize to desktop
    if (wasMobile && !state.isMobile && state.isMenuOpen) {
        closeNavigation();
    }

    // Update viewport height for mobile browsers
    if (state.isMobile) {
        updateViewportHeight();
    }

    // Recalculate animations if needed
    if (wasMobile !== state.isMobile) {
        reinitializeAnimations();
    }
}

/**
 * Handle outside clicks to close menu
 */
function handleOutsideClick(event) {
    if (!state.isMenuOpen) return;

    const navContainer = document.querySelector('.nav-container');
    if (navContainer && !navContainer.contains(event.target)) {
        closeNavigation();
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event) {
    // Close menu with Escape key
    if (event.key === 'Escape' && state.isMenuOpen) {
        closeNavigation();
        return;
    }

    // Handle tab navigation in menu
    if (state.isMenuOpen && event.key === 'Tab') {
        handleTabNavigation(event);
    }
}

/**
 * Handle tab navigation within menu
 */
function handleTabNavigation(event) {
    const focusableElements = elements.navMenu.querySelectorAll('a, button');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
        if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
    } else {
        if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
}

/**
 * Handle orientation change for mobile devices
 */
function handleOrientationChange() {
    setTimeout(() => {
        updateViewportHeight();
        handleResize();
    }, 100);
}

/**
 * Handle visibility change for performance optimization
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Pause animations when tab is not visible
        pauseAnimations();
    } else {
        // Resume animations when tab becomes visible
        resumeAnimations();
    }
}

/**
 * Setup smooth scrolling for all internal links
 */
function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]:not(.nav-link)');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navbarHeight = elements.navbar ? elements.navbar.offsetHeight : 70;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                trackEvent('internal_link_click', { target: targetId });
            }
        });
    });
}

/**
 * Initialize animations with Intersection Observer
 */
function initAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Skip animations for users who prefer reduced motion
        elements.animateElements.forEach(element => {
            element.classList.add('animated');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 50); // Reduced stagger for better mobile performance

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    // Add animation class and observe elements
    elements.animateElements.forEach((element, index) => {
        element.classList.add('animate-on-scroll');
        if (index > 0) {
            element.classList.add(`delay-${Math.min(index % 4 + 1, 4)}`);
        }
        observer.observe(element);
    });
}

/**
 * Setup navigation section observer
 */
function setupNavigationObserver() {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                const sectionId = entry.target.getAttribute('id');
                updateActiveNavLink(`#${sectionId}`);
            }
        });
    }, {
        threshold: [0.1, 0.3, 0.7],
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Handle service card hover effects (desktop only)
 */
function handleServiceCardHover(event) {
    if (isTouchDevice()) return;

    const card = event.target.closest('.service-card');
    if (card) {
        card.style.transform = 'translateY(-8px) scale(1.02)';
    }
}

function handleServiceCardLeave(event) {
    if (isTouchDevice()) return;

    const card = event.target.closest('.service-card');
    if (card) {
        card.style.transform = '';
    }
}

/**
 * Handle floating action button click
 */
function handleFabClick() {
    // Toggle FAB options visibility
    if (elements.fabOptions) {
        const isVisible = elements.fabOptions.style.opacity === '1';
        elements.fabOptions.style.opacity = isVisible ? '0' : '1';
        elements.fabOptions.style.visibility = isVisible ? 'hidden' : 'visible';
        elements.fabOptions.style.transform = isVisible ? 'translateY(20px)' : 'translateY(0)';
    }

    trackEvent('fab_clicked');
}

/**
 * Setup mobile-specific optimizations
 */
function setupMobileOptimizations() {
    // Update viewport height for mobile browsers
    updateViewportHeight();

    // Optimize touch scrolling
    document.body.style.webkitOverflowScrolling = 'touch';

    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', preventZoom, { passive: true });
        input.addEventListener('blur', allowZoom, { passive: true });
    });

    // Optimize images for mobile
    optimizeImagesForMobile();

    // Setup lazy loading for images
    setupLazyLoading();
}

/**
 * Setup touch gestures for mobile navigation
 */
function setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        // Swipe right to open menu (from left edge)
        if (deltaX > 50 && Math.abs(deltaY) < 100 && startX < 50 && !state.isMenuOpen) {
            openNavigation();
        }

        // Swipe left to close menu
        if (deltaX < -50 && Math.abs(deltaY) < 100 && state.isMenuOpen) {
            closeNavigation();
        }
    }, { passive: true });
}

/**
 * Update viewport height for mobile browsers
 */
function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Prevent zoom on input focus (iOS Safari fix)
 */
function preventZoom() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

/**
 * Allow zoom after input blur
 */
function allowZoom() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0';
    }
}

/**
 * Optimize images for mobile devices
 */
function optimizeImagesForMobile() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Add loading="lazy" for better performance
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        // Handle image load errors
        img.addEventListener('error', handleImageError, { once: true });
    });
}

/**
 * Handle image loading errors
 */
function handleImageError(event) {
    const img = event.target;
    const parent = img.parentNode;

    // Add placeholder class to parent if image fails to load
    if (parent && parent.classList.contains('sofa-image')) {
        parent.classList.add('placeholder');
        img.style.display = 'none';
    }
}

/**
 * Setup lazy loading for images (additional optimization)
 */
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

/**
 * Reinitialize animations after resize
 */
function reinitializeAnimations() {
    // Remove existing animation classes
    elements.animateElements.forEach(element => {
        element.classList.remove('animated', 'animate-on-scroll');
    });

    // Reinitialize with new parameters
    setTimeout(initAnimations, 100);
}

/**
 * Pause animations for performance
 */
function pauseAnimations() {
    document.body.style.animationPlayState = 'paused';
}

/**
 * Resume animations
 */
function resumeAnimations() {
    document.body.style.animationPlayState = 'running';
}

/**
 * Utility function to detect touch devices
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function to limit function calls
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
 * Analytics tracking function
 */
function trackEvent(eventName, parameters = {}) {
    // Add mobile context to all events
    const enrichedParameters = {
        ...parameters,
        is_mobile: state.isMobile,
        user_agent: navigator.userAgent.substr(0, 100),
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        timestamp: new Date().toISOString()
    };

    console.log('Track event:', eventName, enrichedParameters);

    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, enrichedParameters);
    }

    // Facebook Pixel example
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, enrichedParameters);
    }

    // Custom analytics
    if (window.customAnalytics) {
        window.customAnalytics.track(eventName, enrichedParameters);
    }
}

/**
 * Performance monitoring
 */
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0];

                const performanceMetrics = {
                    load_time: loadTime,
                    dom_interactive: perfData.domInteractive - perfData.navigationStart,
                    dom_complete: perfData.domComplete - perfData.navigationStart,
                    first_contentful_paint: firstContentfulPaint ? firstContentfulPaint.startTime : null,
                    device_memory: navigator.deviceMemory || 'unknown',
                    connection_type: navigator.connection ? navigator.connection.effectiveType : 'unknown'
                };

                console.log('Performance metrics:', performanceMetrics);
                trackEvent('page_performance', performanceMetrics);
            }, 0);
        });
    }
}

/**
 * Error tracking with context
 */
function setupErrorTracking() {
    window.addEventListener('error', (event) => {
        const errorInfo = {
            error_message: event.message,
            error_filename: event.filename,
            error_lineno: event.lineno,
            error_colno: event.colno,
            user_agent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        console.error('JavaScript error:', errorInfo);
        trackEvent('javascript_error', errorInfo);
    });

    window.addEventListener('unhandledrejection', (event) => {
        const rejectionInfo = {
            reason: event.reason.toString(),
            user_agent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };

        console.error('Unhandled promise rejection:', rejectionInfo);
        trackEvent('promise_rejection', rejectionInfo);
    });
}

/**
 * Service Worker registration for PWA capabilities
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    trackEvent('service_worker_registered');
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                    trackEvent('service_worker_failed', { error: registrationError.message });
                });
        });
    }
}

/**
 * Initialize critical web vitals monitoring
 */
function initWebVitals() {
    // This would integrate with web-vitals library if loaded
    if (typeof webVitals !== 'undefined') {
        webVitals.getCLS(metric => trackEvent('web_vital_cls', { value: metric.value }));
        webVitals.getFID(metric => trackEvent('web_vital_fid', { value: metric.value }));
        webVitals.getLCP(metric => trackEvent('web_vital_lcp', { value: metric.value }));
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Setup additional monitoring
measurePerformance();
setupErrorTracking();
initWebVitals();

// Optional: Register service worker for PWA capabilities
// registerServiceWorker();

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        trackEvent,
        isTouchDevice,
        debounce,
        throttle
    };
}