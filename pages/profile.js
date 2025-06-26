// Profile Page JavaScript

// Load profile page
async function loadProfilePage(container) {
    try {
        const response = await fetch('/pages/profile.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize profile functionality
        initializeProfile();
    } catch (error) {
        console.error('Failed to load profile page:', error);
        container.innerHTML = '<div class="profile-error">Failed to load profile page</div>';
    }
}

// Initialize profile functionality
function initializeProfile() {
    // Load user profile data
    loadUserProfile();
    
    // Initialize event listeners
    initializeProfileEventListeners();
    
    // Load user posts
    loadUserPosts();
}

// Initialize event listeners
function initializeProfileEventListeners() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const editProfilePictureBtn = document.getElementById('editProfilePictureBtn');
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    const editBio = document.getElementById('editBio');
    const bioCharCount = document.getElementById('bioCharCount');

    // Tab switching
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchTab(tabType);
        });
    });

    // Edit profile button
    editProfileBtn.addEventListener('click', () => {
        openEditProfileModal();
    });

    // Close modal handlers
    closeEditModal.addEventListener('click', closeEditProfileModal);
    cancelEditBtn.addEventListener('click', closeEditProfileModal);
    
    // Click outside modal to close
    editProfileModal.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            closeEditProfileModal();
        }
    });

    // Save profile
    saveProfileBtn.addEventListener('click', saveProfileChanges);

    // Profile picture upload
    editProfilePictureBtn.addEventListener('click', () => {
        profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', handleProfilePictureUpload);

    // Settings button
    profileSettingsBtn.addEventListener('click', () => {
        if (window.loadPage) {
            window.loadPage('settings');
        }
    });

    // Bio character counting
    editBio.addEventListener('input', (e) => {
        const length = e.target.value.length;
        bioCharCount.textContent = length;
        
        if (length > 180) {
            bioCharCount.style.color = '#dc3545';
        } else if (length > 150) {
            bioCharCount.style.color = '#ffc107';
        } else {
            bioCharCount.style.color = '#666';
        }
    });
}

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user.php', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const result = await response.json();
        if (result.success) {
            displayUserProfile(result.user);
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        showErrorMessage('Failed to load profile data');
    }
}

// Display user profile data
function displayUserProfile(user) {
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    document.getElementById('profileDisplayName').textContent = user.display_name || '';
    document.getElementById('profileBio').textContent = user.bio || '';
    
    // Stats
    document.getElementById('postCount').textContent = user.post_count || 0;
    document.getElementById('followerCount').textContent = user.follower_count || 0;
    document.getElementById('followingCount').textContent = user.following_count || 0;
    
    // Profile picture
    const profilePicture = document.getElementById('profilePicture');
    const profilePicturePlaceholder = document.getElementById('profilePicturePlaceholder');
    
    if (user.profile_picture_url) {
        profilePicture.src = user.profile_picture_url;
        profilePicture.style.display = 'block';
        profilePicturePlaceholder.style.display = 'none';
    } else {
        profilePicture.style.display = 'none';
        profilePicturePlaceholder.style.display = 'flex';
    }
}

// Switch tabs
function switchTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.profile-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabType}Content`).classList.add('active');
    
    // Load content based on tab
    switch(tabType) {
        case 'posts':
            loadUserPosts();
            break;
        case 'liked':
            loadLikedPosts();
            break;
        case 'saved':
            loadSavedPosts();
            break;
    }
}

// Load user posts
async function loadUserPosts() {
    const postsGrid = document.getElementById('postsGrid');
    postsGrid.innerHTML = '<div class="profile-loading">Loading posts...</div>';
    
    try {
        // For now, use mock data until we have user-specific posts API
        const mockPosts = [
            {
                id: 1,
                image_url: 'https://placekitten.com/300/300',
                like_count: 42,
                comment_count: 8
            },
            {
                id: 2,
                image_url: 'https://placekitten.com/301/301',
                like_count: 38,
                comment_count: 12
            },
            {
                id: 3,
                image_url: 'https://placekitten.com/302/302',
                like_count: 51,
                comment_count: 6
            }
        ];
        
        if (mockPosts.length === 0) {
            postsGrid.innerHTML = `
                <div class="profile-empty">
                    <div class="profile-empty-icon">📷</div>
                    <p>No posts yet</p>
                    <button class="profile-empty-btn" onclick="window.loadPage && window.loadPage('post')">
                        Create your first post
                    </button>
                </div>
            `;
        } else {
            postsGrid.innerHTML = mockPosts.map(post => `
                <div class="profile-post-item" data-post-id="${post.id}">
                    <img src="${post.image_url}" alt="Post" class="profile-post-image">
                    <div class="profile-post-overlay">
                        <div class="profile-post-stats">
                            <span class="profile-post-stat">
                                <span class="profile-post-stat-icon">❤️</span>
                                <span class="profile-post-stat-count">${post.like_count}</span>
                            </span>
                            <span class="profile-post-stat">
                                <span class="profile-post-stat-icon">💬</span>
                                <span class="profile-post-stat-count">${post.comment_count}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers for posts
            document.querySelectorAll('.profile-post-item').forEach(item => {
                item.addEventListener('click', () => {
                    const postId = item.dataset.postId;
                    // Navigate to post detail view
                    console.log('Navigate to post:', postId);
                });
            });
        }
    } catch (error) {
        console.error('Failed to load posts:', error);
        postsGrid.innerHTML = '<div class="profile-error">Failed to load posts</div>';
    }
}

// Load liked posts (placeholder)
function loadLikedPosts() {
    const likedGrid = document.getElementById('likedGrid');
    likedGrid.innerHTML = '<div class="profile-empty">No liked posts yet</div>';
}

// Load saved posts (placeholder)
function loadSavedPosts() {
    const savedGrid = document.getElementById('savedGrid');
    savedGrid.innerHTML = '<div class="profile-empty">No saved posts yet</div>';
}

// Open edit profile modal
function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const displayName = document.getElementById('profileDisplayName').textContent;
    const bio = document.getElementById('profileBio').textContent;
    
    // Populate form with current data
    document.getElementById('editDisplayName').value = displayName;
    document.getElementById('editBio').value = bio;
    document.getElementById('editLocation').value = '';
    document.getElementById('editWebsite').value = '';
    
    // Update character count
    document.getElementById('bioCharCount').textContent = bio.length;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close edit profile modal
function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Save profile changes
async function saveProfileChanges() {
    const saveBtn = document.getElementById('saveProfileBtn');
    const originalText = saveBtn.textContent;
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
        const formData = {
            display_name: document.getElementById('editDisplayName').value.trim(),
            bio: document.getElementById('editBio').value.trim(),
            location: document.getElementById('editLocation').value.trim(),
            website: document.getElementById('editWebsite').value.trim()
        };
        
        const response = await fetch('/api/user.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        const result = await response.json();
        if (result.success) {
            // Update display
            document.getElementById('profileDisplayName').textContent = formData.display_name;
            document.getElementById('profileBio').textContent = formData.bio;
            
            closeEditProfileModal();
            showSuccessMessage('Profile updated successfully!');
        }
    } catch (error) {
        console.error('Failed to update profile:', error);
        showErrorMessage('Failed to update profile. Please try again.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

// Handle profile picture upload
async function handleProfilePictureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('profile_picture', file);
        
        const response = await fetch('/api/user.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload profile picture');
        }
        
        const result = await response.json();
        if (result.success) {
            // Update profile picture display
            const profilePicture = document.getElementById('profilePicture');
            const profilePicturePlaceholder = document.getElementById('profilePicturePlaceholder');
            
            profilePicture.src = result.profile_picture_url;
            profilePicture.style.display = 'block';
            profilePicturePlaceholder.style.display = 'none';
            
            showSuccessMessage('Profile picture updated!');
        }
    } catch (error) {
        console.error('Failed to upload profile picture:', error);
        showErrorMessage('Failed to upload profile picture. Please try again.');
    }
}

// Helper functions
function getAuthToken() {
    return localStorage.getItem('juscatz_token') || sessionStorage.getItem('juscatz_token');
}

function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'profile-message profile-success';
    messageDiv.textContent = message;
    
    const container = document.querySelector('.profile-container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'profile-message profile-error';
    messageDiv.textContent = message;
    
    const container = document.querySelector('.profile-container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.ProfilePage = {
        loadProfilePage
    };
}