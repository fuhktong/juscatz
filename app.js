// JusCatz Main App JavaScript
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
}

function handleNotifications() {
    console.log('Notifications clicked');
    // TODO: Show notifications panel or navigate to notifications page
    alert('Notifications feature coming soon!');
}

function handleSettings() {
    console.log('Settings clicked');
    // TODO: Show settings panel or navigate to settings page
    alert('Settings feature coming soon!');
}

function initializeNavigation() {
    // Navigation functionality (existing code can go here)
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            loadPage(page);
        });
    });
}

function loadPage(page) {
    // Page loading functionality (placeholder)
    console.log(`Loading page: ${page}`);
    // Update active state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
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

// AuthManager is now loaded from auth.js
