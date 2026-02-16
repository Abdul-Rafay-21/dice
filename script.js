(function() {
    "use strict";

    // --- LENIS ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smoothWheel: true,
        wheelMultiplier: 1.1,
    });
    window.lenis = lenis;

    lenis.on('scroll', () => {
        if (typeof AOS !== 'undefined' && AOS.refresh) AOS.refresh();
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- PRELOADER ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 600);
        });
    }

    // --- SCROLL PROGRESS & BACK TO TOP ---
    const progressBar = document.getElementById('scroll-progress-bar');
    const btt = document.getElementById("backToTop");

    if (lenis && progressBar && btt) {
        lenis.on('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.height = `${Math.min(progress, 100)}%`;

            if (scrollTop > 400) btt.classList.add("show");
            else btt.classList.remove("show");
        });
    }

    if (btt) {
        btt.addEventListener("click", () => {
            if (lenis) lenis.scrollTo(0, { duration: 1.5 });
        });
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({ once: true, duration: 800, offset: 100 });
    }
})();

// Mobile & header interaction (updated with new color theme)
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const navPill = document.getElementById('nav-pill');
    const mobileLinks = document.querySelectorAll('#mobile-menu-links a');
    const serviceSublinks = document.querySelectorAll('#mobile-services-list a');
    const allClickable = [...mobileLinks, ...serviceSublinks];
    const servicesToggle = document.getElementById('mobile-services-toggle');
    const servicesList = document.getElementById('mobile-services-list');
    const mobileArrow = document.getElementById('mobile-arrow');

    if (!btn || !menu) return;

    if (servicesToggle && servicesList && mobileArrow) {
        servicesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = servicesList.classList.contains('hidden');
            if (isHidden) {
                servicesList.classList.remove('hidden');
                mobileArrow.style.transform = 'rotate(180deg)';
                // Optional: Add cyan color to toggle when open
                servicesToggle.style.color = '#00a8cc';
            } else {
                servicesList.classList.add('hidden');
                mobileArrow.style.transform = 'rotate(0deg)';
                servicesToggle.style.color = '';
            }
        });
    }

    const toggleMenu = (forceState) => {
        const isOpen = forceState !== undefined ? forceState : btn.getAttribute('aria-expanded') === 'true';
        const newState = !isOpen;
        btn.setAttribute('aria-expanded', newState);
        
        if (newState) {
            menu.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
            menu.children[0].classList.remove('-translate-y-4');
            menu.children[0].classList.add('translate-y-0');
            document.body.classList.add('menu-open');
            btn.classList.add('hamburger-active');
            if (servicesList) {
                servicesList.classList.add('hidden');
                if (mobileArrow) {
                    mobileArrow.style.transform = 'rotate(0deg)';
                    servicesToggle.style.color = '';
                }
            }
        } else {
            menu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
            menu.children[0].classList.add('-translate-y-4');
            menu.children[0].classList.remove('translate-y-0');
            document.body.classList.remove('menu-open');
            btn.classList.remove('hamburger-active');
            if (servicesList) {
                servicesList.classList.add('hidden');
                if (mobileArrow) {
                    mobileArrow.style.transform = 'rotate(0deg)';
                    servicesToggle.style.color = '';
                }
            }
        }
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    allClickable.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            toggleMenu(false);
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target && window.lenis) {
                    window.lenis.scrollTo(target, { 
                        duration: 1.5, 
                        offset: 50,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    menu.addEventListener('click', (e) => {
        if (e.target === menu) {
            toggleMenu(false);
        }
    });

    let lastScrollTop = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Update header styles based on scroll
                if (scrollTop > 50) {
                    navPill.classList.add('bg-black/50', 'backdrop-blur-xl');
                    // Add border with cyan color
                    navPill.style.borderColor = 'rgba(0, 168, 204, 0.3)';
                    
                    if (scrollTop > lastScrollTop && scrollTop > 200) {
                        // Scrolling down - hide header
                        navPill.style.transform = 'translateY(-120%)';
                    } else {
                        // Scrolling up - show header
                        navPill.style.transform = 'translateY(0)';
                    }
                } else {
                    navPill.classList.remove('bg-black/50', 'backdrop-blur-xl');
                    navPill.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    navPill.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
                ticking = false;
            });
            
            ticking = true;
        }
    });

    // Keyboard escape handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
            toggleMenu(false);
        }
    });

    // Resize handler with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= 768 && btn.getAttribute('aria-expanded') === 'true') {
                toggleMenu(false);
            }
        }, 250);
    });

    // Optional: Add hover effect for desktop menu items
    const desktopMenuItems = document.querySelectorAll('.nav-link');
    desktopMenuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Add cyan glow effect
            item.style.textShadow = '0 0 10px rgba(0, 168, 204, 0.5)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.textShadow = '';
        });
    });

    // Initialize AOS refresh after Lenis scroll
    if (window.lenis && typeof AOS !== 'undefined') {
        window.lenis.on('scroll', () => {
            AOS.refresh();
        });
    }

    // Add smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target && window.lenis) {
                    window.lenis.scrollTo(target, { 
                        duration: 1.5, 
                        offset: 50,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                }
            }
        });
    });
});