
    document.addEventListener('DOMContentLoaded', function() {
        const carousel = document.getElementById('carousel');
        const carouselDots = document.getElementById('carouselDots');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const slides = document.querySelectorAll('.carousel-slide');
        const originalSlides = 6; // Original slides (not counting clones)
        const totalSlides = slides.length;
        
        let currentIndex = 0;
        let slideInterval;
        let slidesToShow = 3; // Default for desktop
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;
        
        // Create dots (only for original slides)
        for (let i = 0; i < originalSlides; i++) {
            const dot = document.createElement('button');
            dot.addEventListener('click', () => goToSlide(i));
            carouselDots.appendChild(dot);
        }
        
        // Update slides to show based on screen size
        function updateSlidesToShow() {
            if (window.innerWidth < 576) {
                slidesToShow = 1;
            } else if (window.innerWidth < 992) {
                slidesToShow = 2;
            } else {
                slidesToShow = 3;
            }
            return slidesToShow;
        }
        
        // Update carousel position
        function updateCarousel() {
            const slideWidth = 100 / updateSlidesToShow();
            let effectiveIndex = currentIndex;
            
            // If we're at the cloned slides, jump to original slides without animation
            if (currentIndex >= originalSlides) {
                carousel.style.transition = 'none';
                effectiveIndex = currentIndex % originalSlides;
            } else {
                carousel.style.transition = 'transform 0.5s ease';
            }
            
            carousel.style.transform = `translateX(-${effectiveIndex * slideWidth}%)`;
            updateDots();
            
            // If we jumped to original slides, set up for next transition
            if (currentIndex >= originalSlides) {
                setTimeout(() => {
                    currentIndex = currentIndex % originalSlides;
                    carousel.style.transition = 'transform 0.5s ease';
                    updateCarousel();
                }, 10);
            }
        }
        
        // Update dots
        function updateDots() {
            const dots = document.querySelectorAll('.carousel-dots button');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === (currentIndex % originalSlides));
            });
        }
        
        // Go to specific slide with infinite loop logic
        function goToSlide(index) {
            // For slides 5 and 6 (index 4 and 5), we need special handling
            if (index >= originalSlides - slidesToShow + 1) {
                // For slide 5 (index 4): show 5,6,1
                // For slide 6 (index 5): show 6,1,2
                currentIndex = index;
            } else {
                currentIndex = index;
            }
            updateCarousel();
            resetInterval();
        }
        
        // Next slide with infinite loop
        function nextSlide() {
            currentIndex++;
            if (currentIndex > originalSlides) {
                currentIndex = 1; // Jump to slide 2 (index 1) for seamless transition
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(-${currentIndex * (100 / slidesToShow)}%)`;
                
                setTimeout(() => {
                    currentIndex = 1;
                    carousel.style.transition = 'transform 0.5s ease';
                    updateCarousel();
                }, 10);
            } else {
                updateCarousel();
            }
        }
        
        // Previous slide with infinite loop
        function prevSlide() {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = originalSlides - 1; // Jump to last slide
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(-${currentIndex * (100 / slidesToShow)}%)`;
                
                setTimeout(() => {
                    currentIndex = originalSlides - 1;
                    carousel.style.transition = 'transform 0.5s ease';
                    updateCarousel();
                }, 10);
            } else {
                updateCarousel();
            }
        }
        
        // Reset auto-slide interval
        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }
        
        // Touch and mouse events for dragging
        function startDrag(e) {
            if (window.innerWidth >= 992 && slidesToShow === 3) return;
            
            isDragging = true;
            carousel.classList.add('grabbing');
            startPos = getPositionX(e);
            prevTranslate = currentTranslate;
            
            clearInterval(slideInterval);
            cancelAnimationFrame(animationID);
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const currentPosition = getPositionX(e);
            const diff = currentPosition - startPos;
            const slideWidth = carousel.offsetWidth / updateSlidesToShow();
            
            if (originalSlides <= slidesToShow) return;
            
            currentTranslate = prevTranslate + (diff / slideWidth) * 100;
            const maxTranslate = (originalSlides - slidesToShow) * 100;
            currentTranslate = Math.max(Math.min(currentTranslate, maxTranslate), 0);
            
            carousel.style.transform = `translateX(-${currentIndex * 100}%) translateX(${currentTranslate}%)`;
        }
        
        function endDrag() {
            if (!isDragging) return;
            
            isDragging = false;
            carousel.classList.remove('grabbing');
            
            const movedBy = currentTranslate - prevTranslate;
            
            if (movedBy < -10 && currentIndex < originalSlides - slidesToShow) {
                nextSlide();
            } else if (movedBy > 10 && currentIndex > 0) {
                prevSlide();
            }
            
            currentTranslate = 0;
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
            resetInterval();
        }
        
        function getPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }
        
        // Event listeners
        carousel.addEventListener('mousedown', startDrag);
        carousel.addEventListener('touchstart', startDrag, { passive: true });
        
        carousel.addEventListener('mousemove', drag);
        carousel.addEventListener('touchmove', drag, { passive: false });
        
        carousel.addEventListener('mouseup', endDrag);
        carousel.addEventListener('mouseleave', endDrag);
        carousel.addEventListener('touchend', endDrag);
        
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });
        
        window.addEventListener('resize', () => {
            updateSlidesToShow();
            updateCarousel();
        });
        
        // Initialize
        updateSlidesToShow();
        updateCarousel();
        resetInterval();
    });
