// User Info Page JavaScript

// Load user info page
async function loadUserInfoPage(container) {
    try {
        const response = await fetch('/settings/userinfo.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize user info functionality
        initializeUserInfo();
        
        // Load current user data
        await loadCurrentUserData();
    } catch (error) {
        console.error('Failed to load user info page:', error);
        container.innerHTML = '<div class="error-message">Failed to load user info page</div>';
    }
}

// Initialize user info functionality
function initializeUserInfo() {
    // Save button (header)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveUserInfo);
    }
    
    
    // Form submission
    const form = document.getElementById('userinfoForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserInfo();
        });
    }
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', validateEmail);
    }
}

// Load current user data
async function loadCurrentUserData() {
    try {
        showLoading();
        
        const response = await fetch('/profile/profile.php?action=get&user_id=1');
        const result = await response.json();
        
        if (result.success && result.profile) {
            const profile = result.profile;
            
            // Store profile data globally for later use
            window.currentUserData = profile;
            
            // Fill form with current data
            document.getElementById('firstName').value = profile.first_name || '';
            document.getElementById('lastName').value = profile.last_name || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('location').value = profile.location || '';
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load user data:', error);
        hideLoading();
        // Don't show error for loading - just use empty form
    }
}

// Validate email
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (email.length === 0) {
        emailInput.classList.remove('error', 'success');
        return true; // Empty is valid (optional field)
    }
    
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (isValidEmail) {
        emailInput.classList.remove('error');
        emailInput.classList.add('success');
        return true;
    } else {
        emailInput.classList.remove('success');
        emailInput.classList.add('error');
        return false;
    }
}

// Save user info
async function saveUserInfo() {
    try {
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        showLoading();
        
        // Get current username and other data from the loaded profile data
        const userData = window.currentUserData;
        const currentUsername = userData?.username || 'testuser';
        
        // Prepare form data
        const formData = new FormData();
        formData.append('username', currentUsername); // Required by edit-profile.php
        formData.append('first_name', document.getElementById('firstName').value.trim());
        formData.append('last_name', document.getElementById('lastName').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('location', document.getElementById('location').value.trim());
        
        // Preserve existing values for fields not in user info form
        formData.append('display_name', userData?.display_name || '');
        formData.append('bio', userData?.bio || '');
        formData.append('website', userData?.website || '');
        formData.append('is_private', userData?.is_private ? '1' : '0');
        
        // Send to API (use edit-profile.php for now since it handles user data)
        const response = await fetch('/settings/edit-profile.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('User information updated successfully!');
            setTimeout(() => {
                handleSettings();
            }, 1500);
        } else {
            showError(result.message || 'Failed to update user information');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to save user info:', error);
        hideLoading();
        showError('Failed to save user information');
    }
}

// Validate form
function validateForm() {
    const email = document.getElementById('email').value.trim();
    
    // Email validation (if provided)
    if (email && !validateEmail()) {
        showError('Please enter a valid email address');
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
    
    const container = document.querySelector('.userinfo-container');
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
    
    const container = document.querySelector('.userinfo-container');
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

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.UserInfoPage = {
        loadUserInfoPage
    };
}