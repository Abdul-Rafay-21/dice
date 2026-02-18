(function() {
    "use strict";

    // --- LENIS INITIALIZATION with error handling ---
    let lenis;
    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                wheelMultiplier: 1.1,
                touchMultiplier: 1.5,
                infinite: false,
            });
            window.lenis = lenis;

            lenis.on('scroll', () => {
                if (typeof AOS !== 'undefined' && AOS.refresh) {
                    AOS.refresh();
                }
                updateScrollProgress(); // Update progress bar on scroll
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        } else {
            console.warn('Lenis not loaded - using native scroll');
        }
    } catch (error) {
        console.error('Lenis initialization failed:', error);
    }

    // --- SCROLL PROGRESS FUNCTION ---
    function updateScrollProgress() {
        const progressBar = document.getElementById('scroll-progress-bar');
        const btt = document.getElementById("backToTop");
        
        if (!progressBar && !btt) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        if (progressBar) {
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.height = `${Math.min(progress, 100)}%`;
            // Update background based on scroll position (white/grey theme)
            if (progress > 80) {
                progressBar.style.background = 'linear-gradient(180deg, #ffffff, #808080)';
            } else {
                progressBar.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(200,200,200,0.7))';
            }
        }
        
        if (btt) {
            if (scrollTop > 400) {
                btt.classList.add("show");
            } else {
                btt.classList.remove("show");
            }
        }
    }

    // --- PRELOADER ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            preloader.style.transition = 'opacity 0.6s ease';
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.add('loaded');
            }, 600);
        });
        
        // Fallback in case load event already fired
        if (document.readyState === 'complete') {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.add('loaded');
            }, 600);
        }
    }

    // --- BACK TO TOP ---
    const btt = document.getElementById("backToTop");
    if (btt) {
        btt.addEventListener("click", (e) => {
            e.preventDefault();
            if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // --- AOS INIT ---
    if (typeof AOS !== 'undefined') {
        try {
            AOS.init({ 
                once: true, 
                duration: 800, 
                offset: 100,
                easing: 'ease-out-cubic',
                disable: 'mobile'
            });
        } catch (error) {
            console.error('AOS initialization failed:', error);
        }
    }

    // Add scroll event listener for progress (fallback for non-lenis)
    window.addEventListener('scroll', () => {
        if (!window.lenis) {
            updateScrollProgress();
        }
    });
    // Initial call
    updateScrollProgress();

    // ============================================
    // MOBILE MENU & HEADER INTERACTION (theme updated to black/white/grey)
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        // DOM elements
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const navPill = document.getElementById('nav-pill');
        const mobileLinks = document.querySelectorAll('#mobile-menu-links a');
        const serviceSublinks = document.querySelectorAll('#mobile-services-list a');
        const allClickable = [...mobileLinks, ...serviceSublinks];
        const servicesToggle = document.getElementById('mobile-services-toggle');
        const servicesList = document.getElementById('mobile-services-list');
        const mobileArrow = document.getElementById('mobile-arrow');

        // Exit if critical elements missing
        if (!btn || !menu) {
            console.warn('Mobile menu elements not found');
            return;
        }

        // --- Mobile services toggle (if elements exist) ---
        if (servicesToggle && servicesList && mobileArrow) {
            servicesToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = servicesList.classList.contains('hidden');
                
                if (isHidden) {
                    servicesList.classList.remove('hidden');
                    mobileArrow.style.transform = 'rotate(180deg)';
                    mobileArrow.style.transition = 'transform 0.3s ease';
                    servicesToggle.style.color = '#ffffff'; // pure white when open
                    servicesToggle.style.fontWeight = '600';
                } else {
                    servicesList.classList.add('hidden');
                    mobileArrow.style.transform = 'rotate(0deg)';
                    servicesToggle.style.color = '#808080'; // light gray when closed
                    servicesToggle.style.fontWeight = '500';
                }
            });
        }

        // --- Toggle menu function ---
        const toggleMenu = (forceState) => {
            const isOpen = forceState !== undefined ? forceState : btn.getAttribute('aria-expanded') === 'true';
            const newState = !isOpen;
            btn.setAttribute('aria-expanded', newState);
            
            if (newState) {
                // Open menu
                menu.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
                const menuContent = menu.children[0];
                if (menuContent) {
                    menuContent.classList.remove('-translate-y-4');
                    menuContent.classList.add('translate-y-0');
                }
                document.body.classList.add('menu-open');
                btn.classList.add('hamburger-active');
                
                // Reset services submenu when opening main menu
                if (servicesList && mobileArrow) {
                    servicesList.classList.add('hidden');
                    mobileArrow.style.transform = 'rotate(0deg)';
                    if (servicesToggle) {
                        servicesToggle.style.color = '#808080';
                    }
                }
            } else {
                // Close menu
                menu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                const menuContent = menu.children[0];
                if (menuContent) {
                    menuContent.classList.add('-translate-y-4');
                    menuContent.classList.remove('translate-y-0');
                }
                document.body.classList.remove('menu-open');
                btn.classList.remove('hamburger-active');
                
                // Reset services submenu when closing
                if (servicesList && mobileArrow) {
                    servicesList.classList.add('hidden');
                    mobileArrow.style.transform = 'rotate(0deg)';
                    if (servicesToggle) {
                        servicesToggle.style.color = '#808080';
                    }
                }
            }
        };

        // --- Menu button click ---
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // --- Click handlers for mobile links ---
        allClickable.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                // Close menu
                toggleMenu(false);
                
                // Scroll to target
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        if (window.lenis) {
                            window.lenis.scrollTo(target, { 
                                duration: 1.5, 
                                offset: 50,
                                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                            });
                        } else {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }
            });
        });

        // --- Close menu when clicking outside ---
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                toggleMenu(false);
            }
        });

        // --- Header scroll effect (with white/grey theme) ---
        let lastScrollTop = 0;
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (navPill) {
                        if (scrollTop > 50) {
                            // Add background when scrolled
                            navPill.classList.add('bg-black/50', 'backdrop-blur-xl', 'border-white/10');
                            navPill.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            
                            // Hide/show based on scroll direction
                            if (scrollTop > lastScrollTop && scrollTop > 200) {
                                // Scrolling down - hide header
                                navPill.style.transform = 'translateY(-120%)';
                                navPill.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                            } else {
                                // Scrolling up - show header
                                navPill.style.transform = 'translateY(0)';
                            }
                        } else {
                            // At top - remove background
                            navPill.classList.remove('bg-black/50', 'backdrop-blur-xl', 'border-white/10');
                            navPill.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            navPill.style.transform = 'translateY(0)';
                        }
                    }
                    
                    lastScrollTop = scrollTop;
                    ticking = false;
                });
                
                ticking = true;
            }
        });

        // --- Keyboard escape handler ---
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
                toggleMenu(false);
            }
        });

        // --- Resize handler with debounce ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 768 && btn.getAttribute('aria-expanded') === 'true') {
                    toggleMenu(false);
                }
                // Refresh AOS on resize
                if (typeof AOS !== 'undefined' && AOS.refresh) {
                    AOS.refresh();
                }
            }, 250);
        });

        // --- Desktop menu hover effect (white/grey theme) ---
        const desktopMenuItems = document.querySelectorAll('.nav-link');
        desktopMenuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.color = '#ffffff';
                item.style.transition = 'color 0.3s ease';
            });
            item.addEventListener('mouseleave', () => {
                item.style.color = '#808080';
            });
        });

        // --- Initialize AOS refresh after Lenis scroll (if available) ---
        if (window.lenis && typeof AOS !== 'undefined') {
            window.lenis.on('scroll', () => {
                AOS.refresh();
            });
        }

        // --- Smooth scroll for all anchor links (fallback) ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        if (window.lenis) {
                            window.lenis.scrollTo(target, { 
                                duration: 1.5, 
                                offset: 50,
                                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                            });
                        } else {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }
            });
        });

        // --- Update scroll progress on initial load ---
        setTimeout(updateScrollProgress, 100);
    });
})();
