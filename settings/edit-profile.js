// Edit Profile Page JavaScript

// Load edit profile page
async function loadEditProfilePage(container) {
    try {
        const response = await fetch('/settings/edit-profile.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize edit profile functionality
        initializeEditProfile();
        
        // Load current profile data
        await loadCurrentProfileData();
    } catch (error) {
        console.error('Failed to load edit profile page:', error);
        container.innerHTML = '<div class="error-message">Failed to load edit profile page</div>';
    }
}

// Initialize edit profile functionality
function initializeEditProfile() {
    // Save button (header)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfile);
    }
    
    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', saveProfile);
    }
    
    
    // Bio character counter
    const bioTextarea = document.getElementById('bio');
    const bioCharCount = document.getElementById('bioCharCount');
    
    if (bioTextarea && bioCharCount) {
        bioTextarea.addEventListener('input', () => {
            const count = bioTextarea.value.length;
            bioCharCount.textContent = count;
            
            if (count > 150) {
                bioCharCount.style.color = '#dc3545';
            } else {
                bioCharCount.style.color = '#666';
            }
        });
    }
    
    // Username validation
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', validateUsername);
    }
    
    // Form submission
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfile();
        });
    }
}

// Load current profile data
async function loadCurrentProfileData() {
    try {
        showLoading();
        
        const response = await fetch('/profile/profile.php?action=get&user_id=1');
        const result = await response.json();
        
        if (result.success && result.profile) {
            const profile = result.profile;
            
            // Fill form with current data
            document.getElementById('username').value = profile.username || '';
            document.getElementById('displayName').value = profile.display_name || '';
            document.getElementById('bio').value = profile.bio || '';
            document.getElementById('firstName').value = profile.first_name || '';
            document.getElementById('lastName').value = profile.last_name || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('website').value = profile.website || '';
            document.getElementById('location').value = profile.location || '';
            document.getElementById('privateAccount').checked = profile.is_private || false;
            
            // Update bio character count
            const bioCharCount = document.getElementById('bioCharCount');
            if (bioCharCount) {
                bioCharCount.textContent = (profile.bio || '').length;
            }
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load profile data:', error);
        hideLoading();
        showError('Failed to load profile data');
    }
}


// Validate username
function validateUsername() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    // Remove @ if user typed it
    if (username.startsWith('@')) {
        usernameInput.value = username.substring(1);
        return;
    }
    
    // Validate format
    const validFormat = /^[a-zA-Z0-9_]{3,30}$/.test(username);
    
    if (username && !validFormat) {
        usernameInput.style.borderColor = '#dc3545';
        showError('Username must be 3-30 characters, letters, numbers, and underscores only');
    } else {
        usernameInput.style.borderColor = '#e0e0e0';
        hideError();
    }
}

// Save profile
async function saveProfile() {
    try {
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        showLoading();
        
        // Prepare form data
        const formData = new FormData();
        
        // Add text fields
        formData.append('username', document.getElementById('username').value.trim());
        formData.append('display_name', document.getElementById('displayName').value.trim());
        formData.append('bio', document.getElementById('bio').value.trim());
        formData.append('first_name', document.getElementById('firstName').value.trim());
        formData.append('last_name', document.getElementById('lastName').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('website', document.getElementById('website').value.trim());
        formData.append('location', document.getElementById('location').value.trim());
        formData.append('is_private', document.getElementById('privateAccount').checked ? '1' : '0');
        
        // Send to API
        const response = await fetch('/settings/edit-profile.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Profile updated successfully!');
            setTimeout(() => {
                handleSettings();
            }, 1500);
        } else {
            showError(result.message || 'Failed to update profile');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to save profile:', error);
        hideLoading();
        showError('Failed to save profile');
    }
}

// Validate form
function validateForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const bio = document.getElementById('bio').value;
    
    // Username validation
    if (!username) {
        showError('Username is required');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        showError('Username must be 3-30 characters, letters, numbers, and underscores only');
        return false;
    }
    
    // Email validation (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    // Bio length validation
    if (bio.length > 150) {
        showError('Bio must be 150 characters or less');
        return false;
    }
    
    return true;
}


// Show loading overlay
function showLoading() {
    hideMessages();
    
    const existing = document.querySelector('.loading-overlay');
    if (existing) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Show success message
function showSuccess(message) {
    hideMessages();
    
    const container = document.querySelector('.edit-profile-container');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Show error message
function showError(message) {
    hideMessages();
    
    const container = document.querySelector('.edit-profile-container');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Hide all messages
function hideMessages() {
    const messages = document.querySelectorAll('.success-message, .error-message');
    messages.forEach(msg => msg.remove());
}

// Hide error
function hideError() {
    const errorMsg = document.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.EditProfilePage = {
        loadEditProfilePage
    };
}