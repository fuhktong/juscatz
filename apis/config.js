// API Configuration
// Simple vanilla JavaScript API configuration for JusCatz

class APIConfig {
    constructor() {
        // Base configuration
        this.baseURL = this.getBaseURL();
        this.timeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        
        // API endpoints
        this.endpoints = {
            // Authentication
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                logout: '/auth/logout',
                refresh: '/auth/refresh',
                verify: '/auth/verify',
                forgotPassword: '/auth/forgot-password',
                resetPassword: '/auth/reset-password'
            },
            
            // Users
            users: {
                profile: '/users/profile',
                update: '/users/update',
                delete: '/users/delete',
                search: '/users/search',
                follow: '/users/follow',
                unfollow: '/users/unfollow',
                followers: '/users/followers',
                following: '/users/following',
                block: '/users/block',
                unblock: '/users/unblock',
                report: '/users/report'
            },
            
            // Posts
            posts: {
                create: '/posts',
                get: '/posts',
                update: '/posts',
                delete: '/posts',
                like: '/posts/like',
                unlike: '/posts/unlike',
                feed: '/posts/feed',
                trending: '/posts/trending',
                search: '/posts/search',
                byUser: '/posts/user'
            },
            
            // Comments
            comments: {
                create: '/comments',
                get: '/comments',
                update: '/comments',
                delete: '/comments',
                like: '/comments/like',
                unlike: '/comments/unlike',
                replies: '/comments/replies'
            },
            
            // Hashtags
            hashtags: {
                trending: '/hashtags/trending',
                search: '/hashtags/search',
                posts: '/hashtags/posts'
            },
            
            // Stories
            stories: {
                create: '/stories',
                get: '/stories',
                delete: '/stories',
                view: '/stories/view',
                feed: '/stories/feed'
            },
            
            // Notifications
            notifications: {
                get: '/notifications',
                markRead: '/notifications/read',
                markAllRead: '/notifications/read-all',
                delete: '/notifications'
            },
            
            // Upload
            upload: {
                image: '/upload/image',
                avatar: '/upload/avatar',
                cover: '/upload/cover'
            }
        };
    }
    
    getBaseURL() {
        // Determine base URL based on environment
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const protocol = window.location.protocol;
            const port = window.location.port;
            
            // Development
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return `${protocol}//${hostname}:3001/api`; // Assuming API server on port 3001
            }
            
            // Production
            return `${protocol}//${hostname}/api`;
        }
        
        // Fallback for Node.js environment
        return 'http://localhost:3001/api';
    }
    
    getFullURL(endpoint) {
        return `${this.baseURL}${endpoint}`;
    }
    
    // Get headers with authentication
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (includeAuth && typeof AuthManager !== 'undefined') {
            const token = AuthManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }
    
    // Get headers for file upload
    getUploadHeaders(includeAuth = true) {
        const headers = {
            'Accept': 'application/json'
            // Don't set Content-Type for FormData, browser will set it with boundary
        };
        
        if (includeAuth && typeof AuthManager !== 'undefined') {
            const token = AuthManager.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }
}

// Create global instance
const apiConfig = new APIConfig();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.APIConfig = apiConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIConfig;
}