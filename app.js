// JusCatz Main App JavaScript - Core App Logic Only
console.log("juscatz app loaded!");

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
    // Initialize header buttons
    const notificationsBtn = document.getElementById('notifications-btn');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', handleNotifications);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', handleSettings);
    }

    // Initialize navigation
    initializeNavigation();
    
    // Show user info
    displayUserInfo();
    
    // Load home page by default
    loadPage('home');
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
        if (window.SettingsPage) {
            window.SettingsPage.loadSettingsPage();
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
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
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
                    if (window.PostPage) {
                        window.PostPage.loadPostPage(contentArea);
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
    link.href = `pages/${pageName}.css`;
    link.setAttribute('data-page-css', pageName);
    document.head.appendChild(link);
}

// Load page-specific JavaScript
function loadPageJS(pageName) {
    // Remove any existing page JS
    const existingPageJS = document.querySelector('script[data-page-js]');
    if (existingPageJS) {
        existingPageJS.remove();
    }
    
    // Load new page JS
    const script = document.createElement('script');
    script.src = `pages/${pageName}.js`;
    script.setAttribute('data-page-js', pageName);
    document.head.appendChild(script);
}

// Load page with both CSS and JS, then execute callback
function loadPageWithJS(pageName, callback) {
    loadPageCSS(pageName);
    loadPageJS(pageName);
    
    // Wait for script to load before executing callback
    setTimeout(callback, 200);
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