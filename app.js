// JusCatz Main App JavaScript - Core App Logic Only
console.log("juscatz app loaded!");

// Load header
async function loadHeader() {
    try {
        // Load CSS first
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'header/header.css';
        document.head.appendChild(link);
        
        // Load HTML
        const response = await fetch('/header/header.html');
        const html = await response.text();
        
        // Insert into the header container
        const container = document.getElementById('header-container');
        container.innerHTML = html;
        
        console.log('Header loaded successfully');
    } catch (error) {
        console.error('Failed to load header:', error);
    }
}

// Load bottom navigation
async function loadBottomNav() {
    try {
        // Load CSS first
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'bottomnav/bottomnav.css';
        document.head.appendChild(link);
        
        // Load HTML
        const response = await fetch('/bottomnav/bottomnav.html');
        const html = await response.text();
        
        // Insert into the bottom nav container
        const container = document.getElementById('bottom-nav-container');
        container.innerHTML = html;
        
        console.log('Bottom navigation loaded successfully');
    } catch (error) {
        console.error('Failed to load bottom nav:', error);
    }
}

// Check authentication on app load
document.addEventListener('DOMContentLoaded', () => {
    // DEVELOPMENT MODE: Skip auth check for frontend development
    // TODO: Re-enable when backend is ready
    // if (!AuthManager.requireAuth()) {
    //     return; // Will redirect to login if not authenticated
    // }

    // Initialize app
    initializeApp();
});

function initializeApp() {
    // Load header and bottom navigation
    Promise.all([loadHeader(), loadBottomNav()]).then(() => {
        // Initialize navigation after both are loaded
        initializeNavigation();
        initializeHeaderButtons();
    });
    
    // Show user info
    displayUserInfo();
    
    // Load home page by default
    loadPage('home');
}

function initializeHeaderButtons() {
    // Initialize header buttons after header is loaded
    const notificationsBtn = document.getElementById('notifications-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', handleNotifications);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', handleSettings);
    }
}

function handleNotifications() {
    console.log('Notifications clicked');
    loadPageWithJS('notifications', () => {
        if (window.NotificationsPage) {
            window.NotificationsPage.loadNotificationsPage();
        }
    });
}

function handleSettings() {
    console.log('Settings clicked');
    loadPageWithJS('settings', () => {
        const contentArea = document.getElementById('page-content');
        if (window.SettingsPage && contentArea) {
            window.SettingsPage.loadSettingsPage(contentArea);
        }
    });
}

function initializeNavigation() {
    // Navigation functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            loadPage(page);
        });
    });
}

function loadPage(page) {
    console.log(`Loading page: ${page}`);
    
    // Update active state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-page="${page}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Load page content
    const contentArea = document.getElementById('page-content');
    if (contentArea) {
        switch(page) {
            case 'home':
                loadPageWithJS('home', () => {
                    if (window.HomePage) {
                        window.HomePage.loadHomePage(contentArea);
                    }
                });
                break;
            case 'search':
                loadPageWithJS('search', () => {
                    if (window.SearchPage) {
                        window.SearchPage.loadSearchPage(contentArea);
                    }
                });
                break;
            case 'post':
                loadPageWithJS('post', () => {
                    if (window.CreatePostsPage) {
                        window.CreatePostsPage.loadCreatePostsPage(contentArea);
                    }
                });
                break;
            case 'posts':
                const postId = getUrlParameter('id') || getUrlParameter('post_id');
                loadPageWithJS('posts', () => {
                    if (window.PostsPage) {
                        window.PostsPage.loadPostsPage(contentArea, postId);
                    }
                });
                break;
            case 'activity':
                loadPageWithJS('bops', () => {
                    if (window.BopsPage) {
                        contentArea.innerHTML = `
                            <div class="bops-page">
                                <div class="bops-container" id="bopsContainer">
                                    <div class="bops-loading">Loading bops...</div>
                                </div>
                            </div>
                        `;
                        setTimeout(() => {
                            window.BopsPage.loadMockBops();
                            window.BopsPage.initializeBopsSwipe();
                        }, 200);
                    }
                });
                break;
            case 'profile':
                loadPageWithJS('profile', () => {
                    if (window.ProfilePage) {
                        window.ProfilePage.loadProfilePage(contentArea);
                    }
                });
                break;
            default:
                contentArea.innerHTML = '<p>Page not found</p>';
        }
    }
}

// Load page-specific CSS
function loadPageCSS(pageName) {
    // Remove any existing page CSS
    const existingPageCSS = document.querySelector('link[data-page-css]');
    if (existingPageCSS) {
        existingPageCSS.remove();
    }
    
    // Load new page CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    if (pageName === 'profile') {
        link.href = `profile/profile.css`;
    } else if (pageName === 'post') {
        link.href = `create-posts/create-posts.css`;
    } else if (pageName === 'posts') {
        link.href = `posts/posts.css`;
    } else if (pageName === 'settings') {
        link.href = `settings/settings.css`;
    } else if (pageName === 'edit-profile') {
        link.href = `settings/edit-profile.css`;
    } else if (pageName === 'privacy') {
        link.href = `settings/privacy.css`;
    } else if (pageName === 'change-password') {
        link.href = `settings/change-password.css`;
    } else if (pageName === 'userinfo') {
        link.href = `settings/userinfo.css`;
    } else if (pageName === 'about') {
        link.href = `settings/about.css`;
    } else {
        link.href = `pages/${pageName}.css`;
    }
    link.setAttribute('data-page-css', pageName);
    document.head.appendChild(link);
}


// Load page with both CSS and JS, then execute callback
function loadPageWithJS(pageName, callback) {
    // Clear content first to prevent flash
    const contentArea = document.getElementById('page-content');
    if (contentArea) {
        contentArea.innerHTML = '<div class="loading">Loading...</div>';
    }
    
    loadPageCSS(pageName);
    
    // Load JS and wait for it to actually load
    const script = document.createElement('script');
    if (pageName === 'profile') {
        script.src = `profile/profile.js`;
    } else if (pageName === 'post') {
        script.src = `create-posts/create-posts.js`;
    } else if (pageName === 'posts') {
        script.src = `posts/posts.js`;
    } else if (pageName === 'settings') {
        script.src = `settings/settings.js`;
    } else if (pageName === 'edit-profile') {
        script.src = `settings/edit-profile.js`;
    } else if (pageName === 'privacy') {
        script.src = `settings/privacy.js`;
    } else if (pageName === 'change-password') {
        script.src = `settings/change-password.js`;
    } else if (pageName === 'userinfo') {
        script.src = `settings/userinfo.js`;
    } else if (pageName === 'about') {
        script.src = `settings/about.js`;
    } else {
        script.src = `pages/${pageName}.js`;
    }
    script.setAttribute('data-page-js', pageName);
    
    // Wait for script to load before executing callback
    script.onload = () => {
        setTimeout(callback, 50); // Small delay to ensure everything is ready
    };
    
    script.onerror = () => {
        console.error(`Failed to load ${pageName}.js`);
        callback(); // Still try to execute callback
    };
    
    // Remove any existing page JS first
    const existingPageJS = document.querySelector('script[data-page-js]');
    if (existingPageJS) {
        existingPageJS.remove();
    }
    
    document.head.appendChild(script);
}

// Utility function - format large numbers
function formatCount(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function displayUserInfo() {
    const user = AuthManager.getUser();
    const profileNameElement = document.getElementById('userProfileName');
    
    if (user && profileNameElement) {
        profileNameElement.textContent = `@${user.username}`;
        console.log(`Welcome back, ${user.username}!`);
    } else if (profileNameElement) {
        // Development mode - show placeholder
        profileNameElement.textContent = '@testuser';
    }
}

// AuthManager is loaded from auth.js

// Helper function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}