// Settings Page JavaScript

// Load settings page
async function loadSettingsPage(container) {
    try {
        const response = await fetch('/settings/settings.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize settings functionality
        initializeSettings();
    } catch (error) {
        console.error('Failed to load settings page:', error);
        container.innerHTML = '<div class="settings-error">Failed to load settings page</div>';
    }
}

// Initialize settings functionality
function initializeSettings() {
    // Add user info functionality
    const userInfoBtn = document.getElementById('userInfoBtn');
    if (userInfoBtn) {
        userInfoBtn.addEventListener('click', () => {
            if (window.loadPageWithJS) {
                window.loadPageWithJS('userinfo', () => {
                    const contentArea = document.getElementById('page-content');
                    if (window.UserInfoPage && contentArea) {
                        window.UserInfoPage.loadUserInfoPage(contentArea);
                    }
                });
            }
        });
    }
    
    // Add edit profile functionality
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (window.loadPageWithJS) {
                window.loadPageWithJS('edit-profile', () => {
                    const contentArea = document.getElementById('page-content');
                    if (window.EditProfilePage && contentArea) {
                        window.EditProfilePage.loadEditProfilePage(contentArea);
                    }
                });
            }
        });
    }
    
    // Add privacy functionality
    const privacyBtn = document.getElementById('privacyBtn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            if (window.loadPageWithJS) {
                window.loadPageWithJS('privacy', () => {
                    const contentArea = document.getElementById('page-content');
                    if (window.PrivacyPage && contentArea) {
                        window.PrivacyPage.loadPrivacyPage(contentArea);
                    }
                });
            }
        });
    }
    
    // Add change password functionality
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            if (window.loadPageWithJS) {
                window.loadPageWithJS('change-password', () => {
                    const contentArea = document.getElementById('page-content');
                    if (window.ChangePasswordPage && contentArea) {
                        window.ChangePasswordPage.loadChangePasswordPage(contentArea);
                    }
                });
            }
        });
    }
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                // For development, just reload the page
                window.location.reload();
            }
        });
    }
    
    // Add dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    // Add notification toggle functionality
    const pushNotificationsMaster = document.getElementById('pushNotificationsMaster');
    if (pushNotificationsMaster) {
        pushNotificationsMaster.addEventListener('change', toggleNotificationSubItems);
        // Initialize the state on page load
        toggleNotificationSubItems({ target: pushNotificationsMaster });
    }
    
    // Add about page functionality
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            if (window.loadPageWithJS) {
                window.loadPageWithJS('about', () => {
                    const contentArea = document.getElementById('page-content');
                    if (window.AboutPage && contentArea) {
                        window.AboutPage.loadAboutPage(contentArea);
                    }
                });
            }
        });
    }
}

// Toggle dark mode
function toggleDarkMode(event) {
    const isEnabled = event.target.checked;
    if (isEnabled) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Toggle notification sub-items visibility
function toggleNotificationSubItems(event) {
    const isEnabled = event.target.checked;
    const subItems = document.getElementById('notificationSubItems');
    
    if (subItems) {
        if (isEnabled) {
            subItems.classList.remove('hidden');
        } else {
            subItems.classList.add('hidden');
            // Also disable all sub-toggles when master is disabled
            const subToggles = subItems.querySelectorAll('input[type="checkbox"]');
            subToggles.forEach(toggle => {
                toggle.checked = false;
            });
        }
    }
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.SettingsPage = {
        loadSettingsPage,
        toggleDarkMode
    };
}