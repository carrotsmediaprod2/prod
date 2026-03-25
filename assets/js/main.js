/**
 * Main JavaScript File
 * Handles Navigation, Mobile Menu, and Scroll Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureDirection: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger to X
            const spans = mobileBtn.querySelectorAll('span');
            spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(5px, 6px)' : 'none';
            spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(5px, -6px)' : 'none';
        });
    }

    // Smooth Scroll for Anchor Links (with offset for sticky header)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                // Reset hamburger
                const spans = mobileBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80,
                    duration: 1.2
                });
            }
        });
    });

    // Navbar Scroll Effect (blur/transparency adjustment)
    // Navbar Scroll Effect (blur/transparency adjustment)
    const navbar = document.querySelector('.navbar');

    // Initial check in case of refresh
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    const whatsappFloat = document.querySelector('.whatsapp-float');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (whatsappFloat) {
            if (window.scrollY > window.innerHeight) {
                whatsappFloat.classList.add('visible');
            } else {
                whatsappFloat.classList.remove('visible');
            }
        }
    });

    // Stats Count-up Animation
    const stats = document.querySelectorAll('.stat-number');

    // Function to parse "40+" to 40, "1B+" to 1000000000 (simplified logic for visual count)
    // Actually simpler: we just animate the number part if it exists

    const animateValue = (obj, start, end, duration, suffix) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing (easeOutQuad)
            // const easeProgress = 1 - (1 - progress) * (1 - progress); 
            // obj.innerHTML = Math.floor(easeProgress * (end - start) + start) + suffix;

            // Linear for short numbers, eased for large
            obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end + suffix; // Ensure final value is exact
            }
        };
        window.requestAnimationFrame(step);
    };

    const observerOptions = {
        threshold: 0.5
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.innerText;

                // Extract number and suffix
                // Custom handling for "40+", "2000+", "1B+"
                // We will data-attributes in HTML for cleaner logic, OR parse regex

                // Let's use data-attributes if possible, but since we didn't add them, let's just do a simple parse
                // OR better, let's update HTML to include data-target attribute for cleaner code in next step?
                // For now, let's hack the parse:

                let val = 0;
                let suffix = "+";

                if (text.includes("B")) { val = 1; suffix = "B+"; }
                else if (text.includes("M")) { val = parseFloat(text); suffix = "M"; }
                else if (text.includes("K")) { val = parseFloat(text); suffix = "K"; }
                else { val = parseInt(text); suffix = "+"; }

                animateValue(target, 0, val, 2000, suffix);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Initialize Swiper for Clients
    const swiper = new Swiper('.clients-slider', {
        slidesPerView: 3,
        spaceBetween: 20,
        loop: true,
        centeredSlides: true,
        speed: 5000, /* Slower, smoother constant speed */
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        allowTouchMove: true,
        grabCursor: true,
        freeMode: false, /* freeMode true breaks the continuous linear autoplay usually, stick to false with 0 delay */
        breakpoints: {
            640: {
                slidesPerView: 4,
                spaceBetween: 30,
                centeredSlides: false,
            },
            768: {
                slidesPerView: 5,
                spaceBetween: 40,
                centeredSlides: false,
            },
            1024: {
                slidesPerView: 6,
                spaceBetween: 50,
                centeredSlides: false,
            }
        }
    });

    console.log('Carrots Media Site Initiated 🥕');

    // Contact Form AJAX Submission
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Reset Message
            formMessage.style.display = 'none';
            formMessage.className = '';
            formMessage.textContent = '';

            // Disable Button
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            formData.append('action', 'carrots_submit_form');
            formData.append('nonce', carrots_ajax.nonce);

            fetch(carrots_ajax.ajax_url, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    formMessage.style.display = 'block';
                    if (data.success) {
                        formMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.2)'; // Green
                        formMessage.style.color = '#4caf50';
                        formMessage.style.border = '1px solid #4caf50';
                        formMessage.textContent = data.data.message;
                        contactForm.reset();
                    } else {
                        formMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'; // Red
                        formMessage.style.color = '#f44336';
                        formMessage.style.border = '1px solid #f44336';
                        formMessage.textContent = data.data.message || 'An error occurred.';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    formMessage.style.display = 'block';
                    formMessage.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
                    formMessage.style.color = '#f44336';
                    formMessage.style.border = '1px solid #f44336';
                    formMessage.textContent = 'Connection error. Please try again.';
                })
                .finally(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
    // Initialize Projects Slider
    const projectsSlider = new Swiper('.projects-slider', {
        slidesPerView: 1.2,
        spaceBetween: 20,
        centeredSlides: true,
        loop: true,
        speed: 800,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            500: {
                slidesPerView: 2,
                centeredSlides: false,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 30,
                centeredSlides: false
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 30,
                centeredSlides: false
            }
        }
    });

});
