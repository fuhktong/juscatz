// Change Password Page JavaScript

// Load change password page
async function loadChangePasswordPage(container) {
    try {
        const response = await fetch('/settings/change-password.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize change password functionality
        initializeChangePassword();
    } catch (error) {
        console.error('Failed to load change password page:', error);
        container.innerHTML = '<div class="error-message">Failed to load change password page</div>';
    }
}

// Initialize change password functionality
function initializeChangePassword() {
    // Save button (header)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', changePassword);
    }
    
    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', changePassword);
    }
    
    // Form submission
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            changePassword();
        });
    }
    
    // Password validation
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', validatePassword);
        newPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Real-time password requirements checking
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordRequirements);
    }
}

// Update password requirements visual indicators
function updatePasswordRequirements() {
    const password = document.getElementById('newPassword').value;
    
    // Length requirement (8+ characters)
    const lengthReq = document.getElementById('lengthReq');
    if (password.length >= 8) {
        lengthReq.classList.add('met');
    } else {
        lengthReq.classList.remove('met');
    }
    
    // Uppercase requirement
    const uppercaseReq = document.getElementById('uppercaseReq');
    if (/[A-Z]/.test(password)) {
        uppercaseReq.classList.add('met');
    } else {
        uppercaseReq.classList.remove('met');
    }
    
    // Lowercase requirement
    const lowercaseReq = document.getElementById('lowercaseReq');
    if (/[a-z]/.test(password)) {
        lowercaseReq.classList.add('met');
    } else {
        lowercaseReq.classList.remove('met');
    }
    
    // Number requirement
    const numberReq = document.getElementById('numberReq');
    if (/[0-9]/.test(password)) {
        numberReq.classList.add('met');
    } else {
        numberReq.classList.remove('met');
    }
    
    // Special character requirement
    const specialReq = document.getElementById('specialReq');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        specialReq.classList.add('met');
    } else {
        specialReq.classList.remove('met');
    }
}

// Validate password strength
function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const input = document.getElementById('newPassword');
    
    if (password.length === 0) {
        input.classList.remove('error', 'success');
        return false;
    }
    
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
    
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
        return true;
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        return false;
    }
}

// Check if passwords match
function checkPasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword.length === 0) {
        confirmInput.classList.remove('error', 'success');
        return false;
    }
    
    if (newPassword === confirmPassword) {
        confirmInput.classList.remove('error');
        confirmInput.classList.add('success');
        return true;
    } else {
        confirmInput.classList.remove('success');
        confirmInput.classList.add('error');
        return false;
    }
}

// Change password
async function changePassword() {
    try {
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        showLoading();
        
        // Prepare form data
        const formData = new FormData();
        formData.append('current_password', document.getElementById('currentPassword').value);
        formData.append('new_password', document.getElementById('newPassword').value);
        formData.append('confirm_password', document.getElementById('confirmPassword').value);
        formData.append('logout_all_devices', document.getElementById('logoutAllDevices').checked ? '1' : '0');
        formData.append('send_email_notification', document.getElementById('sendEmailNotification').checked ? '1' : '0');
        
        // Send to API
        const response = await fetch('/api/change-password.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Password changed successfully!');
            
            // Clear form
            document.getElementById('changePasswordForm').reset();
            updatePasswordRequirements();
            
            setTimeout(() => {
                handleSettings();
            }, 1500);
        } else {
            showError(result.message || 'Failed to change password');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to change password:', error);
        hideLoading();
        showError('Failed to change password');
    }
}

// Validate form
function validateForm() {
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Current password validation
    if (!currentPassword) {
        showError('Current password is required');
        return false;
    }
    
    // New password validation
    if (!validatePassword()) {
        showError('New password does not meet requirements');
        return false;
    }
    
    // Password match validation
    if (!checkPasswordMatch()) {
        showError('New passwords do not match');
        return false;
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
        showError('New password must be different from current password');
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
    
    const container = document.querySelector('.change-password-container');
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
    
    const container = document.querySelector('.change-password-container');
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
    window.ChangePasswordPage = {
        loadChangePasswordPage
    };
}