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
                updateScrollProgress();
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

    window.addEventListener('scroll', () => {
        if (!window.lenis) {
            updateScrollProgress();
        }
    });
    updateScrollProgress();

    // ============================================
    // MOBILE MENU & HEADER INTERACTION (FIXED VERSION)
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        // DOM elements
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const navPill = document.getElementById('nav-pill');
        const servicesToggle = document.getElementById('mobile-services-toggle');
        const servicesList = document.getElementById('mobile-services-list');
        const mobileArrow = document.getElementById('mobile-arrow');

        // Exit if critical elements missing
        if (!btn || !menu) {
            console.warn('Mobile menu elements not found');
            return;
        }

        // --- Mobile services toggle ---
        if (servicesToggle && servicesList && mobileArrow) {
            servicesToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isHidden = servicesList.classList.contains('hidden');
                
                if (isHidden) {
                    servicesList.classList.remove('hidden');
                    mobileArrow.style.transform = 'rotate(180deg)';
                    mobileArrow.style.transition = 'transform 0.3s ease';
                } else {
                    servicesList.classList.add('hidden');
                    mobileArrow.style.transform = 'rotate(0deg)';
                }
            });
        }

        // --- Toggle menu function ---
        const toggleMenu = (forceState) => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            const newState = forceState !== undefined ? forceState : !isOpen;
            
            btn.setAttribute('aria-expanded', newState);
            
            if (newState) {
                // Open menu
                menu.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
                menu.classList.add('active');
                
                const menuContent = menu.querySelector('div');
                if (menuContent) {
                    menuContent.classList.remove('-translate-y-4', 'scale-95');
                    menuContent.classList.add('translate-y-0', 'scale-100');
                }
                
                document.body.classList.add('menu-open');
                
                // Reset services submenu when opening main menu
                if (servicesList && mobileArrow) {
                    servicesList.classList.add('hidden');
                    mobileArrow.style.transform = 'rotate(0deg)';
                }
            } else {
                // Close menu
                menu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
                menu.classList.remove('active');
                
                const menuContent = menu.querySelector('div');
                if (menuContent) {
                    menuContent.classList.add('-translate-y-4', 'scale-95');
                    menuContent.classList.remove('translate-y-0', 'scale-100');
                }
                
                document.body.classList.remove('menu-open');
                
                // Reset services submenu
                if (servicesList && mobileArrow) {
                    servicesList.classList.add('hidden');
                    mobileArrow.style.transform = 'rotate(0deg)';
                }
            }
        };

        // --- Menu button click ---
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // --- Handle all mobile menu link clicks ---
        const handleMobileLinkClick = (e) => {
            const link = e.currentTarget;
            const href = link.getAttribute('href');
            
            // Don't close if clicking services toggle
            if (link.id === 'mobile-services-toggle') {
                return;
            }
            
            e.preventDefault();
            
            // Close menu first
            toggleMenu(false);
            
            // Handle navigation after menu closes
            setTimeout(() => {
                if (href) {
                    if (href.startsWith('#')) {
                        // Internal anchor link
                        const targetId = href.substring(1);
                        if (targetId) {
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                if (window.lenis) {
                                    window.lenis.scrollTo(targetElement, { 
                                        duration: 1.5, 
                                        offset: 50,
                                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                                    });
                                } else {
                                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            } else {
                                // If element not found, navigate to page
                                window.location.href = href;
                            }
                        } else {
                            // Just # - scroll to top
                            if (window.lenis) {
                                window.lenis.scrollTo(0, { duration: 1.5 });
                            } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }
                    } else {
                        // External link or page navigation
                        window.location.href = href;
                    }
                }
            }, 300); // Wait for menu close animation
        };

        // Add click handlers to all mobile menu links
        const allMobileLinks = document.querySelectorAll('#mobile-menu-links a');
        allMobileLinks.forEach(link => {
            link.addEventListener('click', handleMobileLinkClick);
        });

        // Special handling for service submenu links
        const serviceSublinks = document.querySelectorAll('#mobile-services-list a');
        serviceSublinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const href = link.getAttribute('href');
                
                // Close menu
                toggleMenu(false);
                
                // Navigate after menu closes
                setTimeout(() => {
                    if (href) {
                        if (href.startsWith('#')) {
                            const targetId = href.substring(1);
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                if (window.lenis) {
                                    window.lenis.scrollTo(targetElement, { 
                                        duration: 1.5, 
                                        offset: 50
                                    });
                                } else {
                                    targetElement.scrollIntoView({ behavior: 'smooth' });
                                }
                            }
                        } else {
                            window.location.href = href;
                        }
                    }
                }, 300);
            });
        });

        // --- Close menu when clicking outside ---
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && !menu.contains(e.target) && !btn.contains(e.target)) {
                toggleMenu(false);
            }
        });

        // --- Prevent clicks inside menu from closing it (except links) ---
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // --- Header scroll effect ---
        let lastScrollTop = 0;
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (navPill) {
                        if (scrollTop > 50) {
                            navPill.classList.add('bg-black/50', 'backdrop-blur-xl', 'border-white/10');
                            navPill.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                            
                            if (scrollTop > lastScrollTop && scrollTop > 200) {
                                navPill.style.transform = 'translateY(-120%)';
                                navPill.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                            } else {
                                navPill.style.transform = 'translateY(0)';
                            }
                        } else {
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

        // --- Resize handler ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= 768 && btn.getAttribute('aria-expanded') === 'true') {
                    toggleMenu(false);
                }
                if (typeof AOS !== 'undefined' && AOS.refresh) {
                    AOS.refresh();
                }
            }, 250);
        });

        // --- Desktop menu hover effect ---
        const desktopMenuItems = document.querySelectorAll('.nav-link');
        desktopMenuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.color = '#ffffff';
            });
            item.addEventListener('mouseleave', () => {
                item.style.color = '#808080';
            });
        });

        // --- Smooth scroll for all anchor links ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                // Don't interfere with mobile menu links
                if (anchor.closest('#mobile-menu')) {
                    return;
                }
                
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

        // --- Initialize menu state ---
        menu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        btn.setAttribute('aria-expanded', 'false');
    });
})();