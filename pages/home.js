// Home Page JavaScript

// Load home page
function loadHomePage(container) {
    container.innerHTML = `
        <div class="home-page">
            <div class="home-feed-container">
                <h2>Your Feed</h2>
                <div class="home-posts-list" id="postsList">
                    <!-- Posts will be loaded here -->
                    <div class="home-loading">Loading posts...</div>
                </div>
            </div>
        </div>
    `;
    // Load posts after DOM is ready
    setTimeout(loadMockPosts, 100);
}

// Mock data functions
function loadMockPosts() {
    const postsList = document.getElementById('postsList');
    if (!postsList) return;
    
    const mockPosts = [
        {
            id: 1,
            username: 'catmom2024',
            avatar: 'cat-pics/cat1.png',
            image: 'cat-pics/cat2.png',
            caption: 'My beautiful tabby enjoying the morning sun   #cats #morning #tabby',
            likes: 42,
            time: '2h'
        },
        {
            id: 2,
            username: 'whiskers_photo',
            avatar: 'cat-pics/cat3.png',
            image: 'cat-pics/cat4.png',
            caption: 'Professional cat portrait session =� This Persian stole the show! #photography #persian #professional',
            likes: 128,
            time: '4h'
        },
        {
            id: 3,
            username: 'fluffymeows',
            avatar: 'cat-pics/cat5.png',
            image: 'cat-pics/cat6.png',
            caption: 'Sleepy Sunday vibes =4 Who else loves afternoon naps? #sleepy #lazy #weekend',
            likes: 67,
            time: '6h'
        },
        {
            id: 4,
            username: 'kitty_adventures',
            avatar: 'cat-pics/cat7.png',
            image: 'cat-pics/cat8.png',
            caption: 'Exploring the garden today! <? Nature therapy for cats =1 #adventure #outdoor #nature',
            likes: 89,
            time: '8h'
        },
        {
            id: 5,
            username: 'cuddly_cats',
            avatar: 'cat-pics/cat9.png',
            image: 'cat-pics/cat10.png',
            caption: 'Just adopted this little angel from the shelter! = Love at first sight d #rescue #adoption #newkitten',
            likes: 156,
            time: '12h'
        }
    ];
    
    postsList.innerHTML = mockPosts.map(post => `
        <div class="home-post" data-post-id="${post.id}">
            <div class="home-post-header">
                <img src="${post.avatar}" alt="${post.username}" class="home-avatar">
                <div class="home-post-user-info">
                    <span class="home-username">${post.username}</span>
                    <span class="home-post-time">${post.time}</span>
                </div>
            </div>
            <img src="${post.image}" alt="Post image" class="home-post-image">
            <div class="home-post-actions">
                <button class="home-action-btn home-like-btn">d</button>
                <button class="home-action-btn home-comment-btn">=�</button>
                <button class="home-action-btn home-share-btn">=�</button>
            </div>
            <div class="home-post-info">
                <span class="home-likes-count">${post.likes} likes</span>
                <p class="home-post-caption"><strong>${post.username}</strong> ${post.caption}</p>
            </div>
        </div>
    `).join('');
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.HomePage = {
        loadHomePage,
        loadMockPosts
    };
}