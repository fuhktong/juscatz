// Users API
// API methods for user management and social features

class UsersAPI {
    constructor() {
        this.client = typeof APIClient !== 'undefined' ? APIClient : new (require('./client.js'))();
        this.endpoints = this.client.config.endpoints.users;
    }
    
    // Get user profile
    async getProfile(userId = 'me') {
        try {
            const endpoint = userId === 'me' ? this.endpoints.profile : `${this.endpoints.profile}/${userId}`;
            const response = await this.client.get(endpoint);
            
            return {
                success: true,
                data: response,
                message: 'Profile retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load profile'
            };
        }
    }
    
    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await this.client.put(this.endpoints.update, {
                username: profileData.username,
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                bio: profileData.bio,
                location: profileData.location,
                website_url: profileData.websiteUrl,
                date_of_birth: profileData.dateOfBirth,
                is_private: profileData.isPrivate
            });
            
            return {
                success: true,
                data: response,
                message: 'Profile updated successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to update profile',
                errors: error.data?.errors || null
            };
        }
    }
    
    // Upload profile picture
    async uploadProfilePicture(file) {
        try {
            const response = await this.client.upload('/upload/avatar', file);
            
            return {
                success: true,
                data: response,
                message: 'Profile picture updated successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to upload profile picture'
            };
        }
    }
    
    // Upload cover photo
    async uploadCoverPhoto(file) {
        try {
            const response = await this.client.upload('/upload/cover', file);
            
            return {
                success: true,
                data: response,
                message: 'Cover photo updated successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to upload cover photo'
            };
        }
    }
    
    // Search users
    async searchUsers(query, page = 1, limit = 20) {
        try {
            const params = new URLSearchParams({
                q: query,
                page: page,
                limit: limit
            });
            
            const response = await this.client.get(`${this.endpoints.search}?${params}`);
            
            return {
                success: true,
                data: response.users || [],
                pagination: response.pagination || {},
                message: 'User search completed successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'User search failed'
            };
        }
    }
    
    // Follow user
    async followUser(userId) {
        try {
            const response = await this.client.post(`${this.endpoints.follow}/${userId}`);
            
            return {
                success: true,
                data: response,
                message: 'User followed successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to follow user'
            };
        }
    }
    
    // Unfollow user
    async unfollowUser(userId) {
        try {
            const response = await this.client.delete(`${this.endpoints.unfollow}/${userId}`);
            
            return {
                success: true,
                data: response,
                message: 'User unfollowed successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to unfollow user'
            };
        }
    }
    
    // Get followers
    async getFollowers(userId = 'me', page = 1, limit = 20) {
        try {
            const endpoint = userId === 'me' ? this.endpoints.followers : `${this.endpoints.followers}/${userId}`;
            const params = new URLSearchParams({ page: page, limit: limit });
            
            const response = await this.client.get(`${endpoint}?${params}`);
            
            return {
                success: true,
                data: response.followers || [],
                pagination: response.pagination || {},
                message: 'Followers retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load followers'
            };
        }
    }
    
    // Get following
    async getFollowing(userId = 'me', page = 1, limit = 20) {
        try {
            const endpoint = userId === 'me' ? this.endpoints.following : `${this.endpoints.following}/${userId}`;
            const params = new URLSearchParams({ page: page, limit: limit });
            
            const response = await this.client.get(`${endpoint}?${params}`);
            
            return {
                success: true,
                data: response.following || [],
                pagination: response.pagination || {},
                message: 'Following retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to load following'
            };
        }
    }
    
    // Block user
    async blockUser(userId, reason = '') {
        try {
            const response = await this.client.post(`${this.endpoints.block}/${userId}`, {
                reason: reason
            });
            
            return {
                success: true,
                data: response,
                message: 'User blocked successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to block user'
            };
        }
    }
    
    // Unblock user
    async unblockUser(userId) {
        try {
            const response = await this.client.delete(`${this.endpoints.unblock}/${userId}`);
            
            return {
                success: true,
                data: response,
                message: 'User unblocked successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to unblock user'
            };
        }
    }
    
    // Report user
    async reportUser(userId, reportData) {
        try {
            const response = await this.client.post(`${this.endpoints.report}/${userId}`, {
                report_type: reportData.type,
                reason: reportData.reason
            });
            
            return {
                success: true,
                data: response,
                message: 'User reported successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to report user'
            };
        }
    }
    
    // Delete account
    async deleteAccount(password) {
        try {
            const response = await this.client.delete(this.endpoints.delete, {
                body: JSON.stringify({ password: password }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            return {
                success: true,
                message: 'Account deleted successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to delete account'
            };
        }
    }
}

// Create global instance
const usersAPI = new UsersAPI();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.UsersAPI = usersAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UsersAPI;
}