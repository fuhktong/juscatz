// Bops Page JavaScript - Smooth vertical swiping for cat videos

// Global variables for bops
let currentBopIndex = 0;
let bopsData = [];
let isTransitioning = false;

// Load mock bops data
function loadMockBops() {
    const bopsContainer = document.getElementById('bopsContainer');
    if (!bopsContainer) return;
    
    bopsData = [
        {
            id: 1,
            username: 'catmom2024',
            avatar: 'cat-pics/cat1.png',
            image: 'cat-pics/cat2.png',
            caption: 'My tabby doing morning stretches! 🐱💪 #morningvibes #catstretch #tabbycat',
            likes: 342,
            comments: 28,
            music: '🎵 Relaxing Cat Music'
        },
        {
            id: 2,
            username: 'whiskers_photo',
            avatar: 'cat-pics/cat3.png',
            image: 'cat-pics/cat4.png',
            caption: 'Professional photoshoot magic ✨ Behind the scenes with this gorgeous Persian! 📸 #photography #persian #photoshoot',
            likes: 1256,
            comments: 89,
            music: '🎵 Studio Vibes'
        },
        {
            id: 3,
            username: 'fluffymeows',
            avatar: 'cat-pics/cat5.png',
            image: 'cat-pics/cat6.png',
            caption: 'Sunday nap goals achieved 😴 Who else is having a lazy day? #naptime #lazy #sundayvibes',
            likes: 678,
            comments: 45,
            music: '🎵 Sleepy Time Jazz'
        },
        {
            id: 4,
            username: 'kitty_adventures',
            avatar: 'cat-pics/cat7.png',
            image: 'cat-pics/cat8.png',
            caption: 'Garden exploration time! 🌿 Nature is the best playground 🦋 #adventure #outdoor #nature',
            likes: 432,
            comments: 67,
            music: '🎵 Nature Sounds'
        },
        {
            id: 5,
            username: 'cuddly_cats',
            avatar: 'cat-pics/cat9.png',
            image: 'cat-pics/cat10.png',
            caption: 'New rescue baby! 😇 This little angel found their forever home ❤️ #rescue #adoption #love',
            likes: 2341,
            comments: 156,
            music: '🎵 Heartwarming Melody'
        }
    ];
    
    currentBopIndex = 0;
    
    bopsContainer.innerHTML = bopsData.map((bop, index) => {
        let positionClass = '';
        if (index === 0) positionClass = 'active';
        else if (index === 1) positionClass = 'next';
        else positionClass = 'next';
        
        return `
            <div class="bops-item ${positionClass}" data-bop-id="${bop.id}" data-index="${index}">
                <div class="bops-content">
                    <img src="${bop.image}" alt="Bop by ${bop.username}" class="bops-image">
                    
                    <div class="bops-overlay">
                        <div class="bops-info">
                            <div class="bops-user">
                                <img src="${bop.avatar}" alt="${bop.username}" class="bops-avatar">
                                <span class="bops-username">@${bop.username}</span>
                                <button class="bops-follow-btn">Follow</button>
                            </div>
                            <p class="bops-caption">${bop.caption}</p>
                            <div class="bops-music">
                                <span class="bops-music-note">♪</span>
                                <span class="bops-music-text">${bop.music}</span>
                            </div>
                        </div>
                        
                        <div class="bops-actions">
                            <button class="bops-action-btn bops-like-btn" data-likes="${bop.likes}">
                                <span class="bops-action-icon">❤️</span>
                                <span class="bops-action-count">${formatCount(bop.likes)}</span>
                            </button>
                            <button class="bops-action-btn bops-comment-btn" data-comments="${bop.comments}">
                                <span class="bops-action-icon">💬</span>
                                <span class="bops-action-count">${bop.comments}</span>
                            </button>
                            <button class="bops-action-btn bops-share-btn">
                                <span class="bops-action-icon">📤</span>
                            </button>
                            <button class="bops-action-btn bops-save-btn">
                                <span class="bops-action-icon">🔖</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers for action buttons
    addBopActionHandlers();
}

// Initialize smooth swipe navigation for bops
function initializeBopsSwipe() {
    const bopsContainer = document.getElementById('bopsContainer');
    if (!bopsContainer || !bopsData.length) return;
    
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    // Touch events
    bopsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    bopsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    bopsContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for desktop
    bopsContainer.addEventListener('mousedown', handleMouseStart, { passive: false });
    bopsContainer.addEventListener('mousemove', handleMouseMove, { passive: false });
    bopsContainer.addEventListener('mouseup', handleMouseEnd, { passive: false });
    bopsContainer.addEventListener('mouseleave', handleMouseEnd, { passive: false });
    
    // Wheel event for desktop scrolling
    bopsContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    function handleTouchStart(e) {
        if (isTransitioning) return;
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
        bopsContainer.style.cursor = 'grabbing';
    }
    
    function handleTouchMove(e) {
        if (!isDragging || isTransitioning) return;
        e.preventDefault();
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        updateBopPositions(deltaY);
    }
    
    function handleTouchEnd(e) {
        if (!isDragging || isTransitioning) return;
        isDragging = false;
        bopsContainer.style.cursor = 'grab';
        
        const deltaY = currentY - startY;
        const threshold = 100; // Minimum swipe distance
        
        if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0) {
                // Swipe down - previous bop
                navigateToBop(-1);
            } else {
                // Swipe up - next bop
                navigateToBop(1);
            }
        } else {
            // Snap back to current position
            updateBopPositions(0);
        }
    }
    
    function handleMouseStart(e) {
        if (isTransitioning) return;
        startY = e.clientY;
        currentY = startY;
        isDragging = true;
        bopsContainer.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    function handleMouseMove(e) {
        if (!isDragging || isTransitioning) return;
        e.preventDefault();
        
        currentY = e.clientY;
        const deltaY = currentY - startY;
        updateBopPositions(deltaY);
    }
    
    function handleMouseEnd(e) {
        if (!isDragging || isTransitioning) return;
        isDragging = false;
        bopsContainer.style.cursor = 'grab';
        
        const deltaY = currentY - startY;
        const threshold = 100;
        
        if (Math.abs(deltaY) > threshold) {
            if (deltaY > 0) {
                navigateToBop(-1);
            } else {
                navigateToBop(1);
            }
        } else {
            updateBopPositions(0);
        }
    }
    
    function handleWheel(e) {
        if (isTransitioning) return;
        e.preventDefault();
        
        if (e.deltaY > 0) {
            navigateToBop(1);
        } else {
            navigateToBop(-1);
        }
    }
    
    function updateBopPositions(deltaY) {
        const bopItems = document.querySelectorAll('.bops-item');
        
        bopItems.forEach((item, index) => {
            const relativeIndex = index - currentBopIndex;
            let translateY = relativeIndex * 100; // Each bop is 100vh apart
            
            if (isDragging) {
                translateY += (deltaY / window.innerHeight) * 100;
            }
            
            item.style.transform = `translateY(${translateY}%)`;
            
            // Update opacity based on position
            if (Math.abs(relativeIndex) <= 1) {
                const opacity = Math.max(0, 1 - Math.abs(translateY / 100));
                item.style.opacity = opacity;
            } else {
                item.style.opacity = 0;
            }
        });
    }
    
    function navigateToBop(direction) {
        if (isTransitioning || !bopsData.length) return;
        
        const totalBops = bopsData.length;
        let newIndex = currentBopIndex + direction;
        
        // Loop around
        if (newIndex >= totalBops) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = totalBops - 1;
        }
        
        if (newIndex === currentBopIndex) return;
        
        isTransitioning = true;
        currentBopIndex = newIndex;
        
        // Update bop classes and positions
        const bopItems = document.querySelectorAll('.bops-item');
        bopItems.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next');
            
            if (index === newIndex) {
                item.classList.add('active');
            } else if (index === newIndex - 1 || (newIndex === 0 && index === totalBops - 1)) {
                item.classList.add('prev');
            } else {
                item.classList.add('next');
            }
        });
        
        // Smooth transition to new positions
        updateBopPositions(0);
        
        // Reset transition flag after animation
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }
    
    // Initialize cursor
    bopsContainer.style.cursor = 'grab';
    
    // Initial position update
    updateBopPositions(0);
}

// Add action button handlers for bops
function addBopActionHandlers() {
    // Like buttons
    document.querySelectorAll('.bops-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = btn.querySelector('.bops-action-icon');
            const count = btn.querySelector('.bops-action-count');
            const currentLikes = parseInt(btn.dataset.likes);
            
            if (icon.textContent === '❤️') {
                icon.textContent = '🤍';
                count.textContent = formatCount(currentLikes - 1);
                btn.dataset.likes = currentLikes - 1;
            } else {
                icon.textContent = '❤️';
                count.textContent = formatCount(currentLikes + 1);
                btn.dataset.likes = currentLikes + 1;
            }
        });
    });
    
    // Follow buttons
    document.querySelectorAll('.bops-follow-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.textContent === 'Follow') {
                btn.textContent = 'Following';
                btn.classList.add('following');
            } else {
                btn.textContent = 'Follow';
                btn.classList.remove('following');
            }
        });
    });
    
    // Other action buttons
    document.querySelectorAll('.bops-comment-btn, .bops-share-btn, .bops-save-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = btn.querySelector('.bops-action-icon');
            
            // Add animation
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.BopsPage = {
        loadMockBops,
        initializeBopsSwipe,
        addBopActionHandlers
    };
}