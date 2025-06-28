// Privacy Page JavaScript

// Load privacy page
async function loadPrivacyPage(container) {
    try {
        const response = await fetch('/settings/privacy.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize privacy functionality
        initializePrivacy();
        
        // Load current privacy settings
        await loadCurrentPrivacySettings();
    } catch (error) {
        console.error('Failed to load privacy page:', error);
        container.innerHTML = '<div class="error-message">Failed to load privacy page</div>';
    }
}

// Initialize privacy functionality
function initializePrivacy() {
    // Save button (header)
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', savePrivacySettings);
    }
    
    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', savePrivacySettings);
    }
    
    // Form submission
    const form = document.getElementById('privacyForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            savePrivacySettings();
        });
    }
}

// Load current privacy settings
async function loadCurrentPrivacySettings() {
    try {
        showLoading();
        
        const response = await fetch('/api/privacy.php?action=get');
        const result = await response.json();
        
        if (result.success && result.settings) {
            const settings = result.settings;
            
            // Fill form with current settings
            document.getElementById('privateAccount').checked = settings.private_account || false;
            document.getElementById('whoCanSeePhotos').value = settings.who_can_see_photos || 'followers';
            document.getElementById('whoCanSeePosts').value = settings.who_can_see_posts || 'followers';
            document.getElementById('whoCanMessage').value = settings.who_can_message || 'followers';
            document.getElementById('whoCanComment').value = settings.who_can_comment || 'everyone';
            document.getElementById('allowMentions').checked = settings.allow_mentions !== false;
            document.getElementById('showActivity').checked = settings.show_activity !== false;
            document.getElementById('showOnlineStatus').checked = settings.show_online_status || false;
            document.getElementById('searchableByEmail').checked = settings.searchable_by_email !== false;
            document.getElementById('searchableByPhone').checked = settings.searchable_by_phone || false;
            document.getElementById('suggestToFriends').checked = settings.suggest_to_friends !== false;
            document.getElementById('saveLoginInfo').checked = settings.save_login_info !== false;
            document.getElementById('useDataForAds').checked = settings.use_data_for_ads || false;
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load privacy settings:', error);
        hideLoading();
        // Don't show error for loading settings - just use defaults
    }
}

// Save privacy settings
async function savePrivacySettings() {
    try {
        showLoading();
        
        // Prepare form data
        const formData = new FormData();
        
        // Add all settings
        formData.append('private_account', document.getElementById('privateAccount').checked ? '1' : '0');
        formData.append('who_can_see_photos', document.getElementById('whoCanSeePhotos').value);
        formData.append('who_can_see_posts', document.getElementById('whoCanSeePosts').value);
        formData.append('who_can_message', document.getElementById('whoCanMessage').value);
        formData.append('who_can_comment', document.getElementById('whoCanComment').value);
        formData.append('allow_mentions', document.getElementById('allowMentions').checked ? '1' : '0');
        formData.append('show_activity', document.getElementById('showActivity').checked ? '1' : '0');
        formData.append('show_online_status', document.getElementById('showOnlineStatus').checked ? '1' : '0');
        formData.append('searchable_by_email', document.getElementById('searchableByEmail').checked ? '1' : '0');
        formData.append('searchable_by_phone', document.getElementById('searchableByPhone').checked ? '1' : '0');
        formData.append('suggest_to_friends', document.getElementById('suggestToFriends').checked ? '1' : '0');
        formData.append('save_login_info', document.getElementById('saveLoginInfo').checked ? '1' : '0');
        formData.append('use_data_for_ads', document.getElementById('useDataForAds').checked ? '1' : '0');
        
        // Send to API
        const response = await fetch('/api/privacy.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Privacy settings updated successfully!');
            setTimeout(() => {
                handleSettings();
            }, 1500);
        } else {
            showError(result.message || 'Failed to update privacy settings');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to save privacy settings:', error);
        hideLoading();
        showError('Failed to save privacy settings');
    }
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
    
    const container = document.querySelector('.privacy-container');
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
    
    const container = document.querySelector('.privacy-container');
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
    window.PrivacyPage = {
        loadPrivacyPage
    };
}