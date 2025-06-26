// Settings Page JavaScript

// Load settings page
function loadSettingsPage() {
    const contentArea = document.getElementById('page-content');
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="settings-page">
                <div class="settings-container">
                    <h2>Settings</h2>
                    
                    <div class="settings-section">
                        <h3>Account</h3>
                        <div class="settings-item">
                            <span class="settings-label">Edit Profile</span>
                            <button class="settings-btn">→</button>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Privacy</span>
                            <button class="settings-btn">→</button>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Change Password</span>
                            <button class="settings-btn">→</button>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Notifications</h3>
                        <div class="settings-item">
                            <span class="settings-label">Push Notifications</span>
                            <label class="settings-toggle">
                                <input type="checkbox" checked>
                                <span class="settings-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Email Notifications</span>
                            <label class="settings-toggle">
                                <input type="checkbox" checked>
                                <span class="settings-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Like Notifications</span>
                            <label class="settings-toggle">
                                <input type="checkbox" checked>
                                <span class="settings-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Comment Notifications</span>
                            <label class="settings-toggle">
                                <input type="checkbox" checked>
                                <span class="settings-toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>App</h3>
                        <div class="settings-item">
                            <span class="settings-label">Dark Mode</span>
                            <label class="settings-toggle">
                                <input type="checkbox" id="darkModeToggle">
                                <span class="settings-toggle-slider"></span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Language</span>
                            <select class="settings-select">
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Data Usage</span>
                            <button class="settings-btn">→</button>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Support</h3>
                        <div class="settings-item">
                            <span class="settings-label">Help Center</span>
                            <button class="settings-btn">→</button>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">Report a Problem</span>
                            <button class="settings-btn">→</button>
                        </div>
                        <div class="settings-item">
                            <span class="settings-label">About</span>
                            <button class="settings-btn">→</button>
                        </div>
                    </div>
                    
                    <div class="settings-section settings-danger-section">
                        <div class="settings-item settings-danger-item">
                            <span class="settings-label">Log Out</span>
                            <button class="settings-btn settings-danger-btn" id="logoutBtn">→</button>
                        </div>
                        <div class="settings-item settings-danger-item">
                            <span class="settings-label">Delete Account</span>
                            <button class="settings-btn settings-danger-btn">→</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
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

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.SettingsPage = {
        loadSettingsPage,
        toggleDarkMode
    };
}