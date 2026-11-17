document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. LOGIKA NAVBAR SCROLL (TRANSPARAN -> GARIS KACA)
    // ==========================================
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 2. ANIMASI SCROLL REVEAL & KURSOR
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealOnScroll.observe(el));

    if (window.matchMedia("(pointer: fine)").matches) {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 50);
        });
    }

    // ==========================================
    // 3. LOGIKA SCROLL GALERI (MANUAL DRAG + AUTO)
    // ==========================================
    const container = document.querySelector('.marquee-container');
    let isDown = false;
    let startX;
    let scrollLeft;
    let isHovered = false;
    let autoScrollId;
    let scrollSpeed = 1.5;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        cancelAnimationFrame(autoScrollId);
        e.preventDefault(); 
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active');
        if (!isHovered) startAutoScroll(); 
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active');
        startAutoScroll(); 
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); 
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; 
        container.scrollLeft = scrollLeft - walk;
    });

    function autoScrollStep() {
        if (!isHovered && !isDown) {
            container.scrollLeft += scrollSpeed;
            if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) {
                container.scrollLeft = 0;
            }
        }
        autoScrollId = requestAnimationFrame(autoScrollStep);
    }

    function startAutoScroll() {
        cancelAnimationFrame(autoScrollId);
        autoScrollStep();
    }

    container.addEventListener('mouseenter', () => { isHovered = true; cancelAnimationFrame(autoScrollId); });
    container.addEventListener('mouseleave', () => { isHovered = false; if(!isDown) startAutoScroll(); });

    startAutoScroll(); 

    // ==========================================
    // 4. LOGIKA LIGHTBOX (ZOOM, DRAG, AUTO-PLAY)
    // ==========================================
    const zoomableImages = document.querySelectorAll('.zoomable');
    const lightbox = document.getElementById('lightbox');
    const lightboxTrack = document.getElementById('lightbox-track');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;
    let autoPlayInterval;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    const totalImages = zoomableImages.length;

    zoomableImages.forEach((img, index) => {
        const newImg = document.createElement('img');
        newImg.src = img.src;
        newImg.alt = img.alt;
        lightboxTrack.appendChild(newImg);

        img.parentElement.addEventListener('click', (e) => {
            if (container.scrollLeft !== window.lastScrollLeft) return; 
            
            currentIndex = index;
            updateLightboxPosition(false);
            lightbox.classList.add('active');
            startAutoPlay();
        });
    });

    container.addEventListener('scroll', () => {
        window.lastScrollLeft = container.scrollLeft;
    });

    function updateLightboxPosition(animate = true) {
        if (animate) lightboxTrack.style.transition = 'transform 0.4s ease-out';
        else lightboxTrack.style.transition = 'none';
        
        currentTranslate = currentIndex * -100;
        lightboxTrack.style.transform = `translateX(${currentTranslate}vw)`;
        prevTranslate = currentTranslate;
    }

    function startAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateLightboxPosition(true);
        }, 3000);
    }

    function stopAutoPlay() { clearInterval(autoPlayInterval); }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalImages;
        updateLightboxPosition(true);
        startAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        updateLightboxPosition(true);
        startAutoPlay();
    });

    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
        stopAutoPlay();
    });

    lightboxTrack.addEventListener('mousedown', dragStart);
    lightboxTrack.addEventListener('touchstart', dragStart);
    lightboxTrack.addEventListener('mouseup', dragEnd);
    lightboxTrack.addEventListener('touchend', dragEnd);
    lightboxTrack.addEventListener('mouseleave', dragEnd);
    lightboxTrack.addEventListener('mousemove', drag);
    lightboxTrack.addEventListener('touchmove', drag);

    function dragStart(e) {
        isDragging = true;
        startPos = getPositionX(e);
        lightboxTrack.style.transition = 'none';
        stopAutoPlay();
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentPosition = getPositionX(e);
        const diff = currentPosition - startPos;
        const diffVw = (diff / window.innerWidth) * 100;
        lightboxTrack.style.transform = `translateX(${prevTranslate + diffVw}vw)`;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const currentPosition = getPositionX(e);
        const diff = currentPosition - startPos;
        const threshold = window.innerWidth / 4;

        if (diff < -threshold) {
            currentIndex = Math.min(currentIndex + 1, totalImages - 1);
        } else if (diff > threshold) {
            currentIndex = Math.max(currentIndex - 1, 0);
        }

        updateLightboxPosition(true);
        startAutoPlay();
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
});