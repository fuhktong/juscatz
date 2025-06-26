// Authentication API
// API methods for user authentication

class AuthAPI {
    constructor() {
        this.client = typeof APIClient !== 'undefined' ? APIClient : new (require('./client.js'))();
        this.endpoints = this.client.config.endpoints.auth;
    }
    
    // User registration
    async register(userData) {
        try {
            const response = await this.client.post(this.endpoints.register, {
                username: userData.username,
                email: userData.email,
                phone: userData.phone || null,
                password: userData.password,
                first_name: userData.firstName || null,
                last_name: userData.lastName || null
            }, { includeAuth: false });
            
            return {
                success: true,
                data: response,
                message: 'Registration successful'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Registration failed',
                errors: error.data?.errors || null
            };
        }
    }
    
    // User login
    async login(credentials) {
        try {
            const response = await this.client.post(this.endpoints.login, {
                emailOrUsername: credentials.emailOrUsername,
                password: credentials.password,
                rememberMe: credentials.rememberMe || false
            }, { includeAuth: false });
            
            return {
                success: true,
                token: response.token,
                user: response.user,
                message: 'Login successful'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }
    
    // User logout
    async logout() {
        try {
            await this.client.post(this.endpoints.logout);
            return {
                success: true,
                message: 'Logout successful'
            };
        } catch (error) {
            // Even if API call fails, we should clear local storage
            console.warn('Logout API call failed, but clearing local storage:', error);
            return {
                success: true,
                message: 'Logout completed locally'
            };
        }
    }
    
    // Refresh token
    async refreshToken() {
        try {
            const response = await this.client.post(this.endpoints.refresh);
            return {
                success: true,
                token: response.token,
                user: response.user
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Token refresh failed'
            };
        }
    }
    
    // Verify email
    async verifyEmail(token) {
        try {
            const response = await this.client.post(this.endpoints.verify, {
                token: token
            }, { includeAuth: false });
            
            return {
                success: true,
                message: response.message || 'Email verified successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Email verification failed'
            };
        }
    }
    
    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await this.client.post(this.endpoints.forgotPassword, {
                email: email
            }, { includeAuth: false });
            
            return {
                success: true,
                message: response.message || 'Password reset email sent'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Failed to send password reset email'
            };
        }
    }
    
    // Reset password
    async resetPassword(token, newPassword) {
        try {
            const response = await this.client.post(this.endpoints.resetPassword, {
                token: token,
                password: newPassword
            }, { includeAuth: false });
            
            return {
                success: true,
                message: response.message || 'Password reset successful'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Password reset failed'
            };
        }
    }
    
    // Check if user is authenticated (client-side)
    isAuthenticated() {
        if (typeof AuthManager !== 'undefined') {
            return AuthManager.isLoggedIn() && !AuthManager.isTokenExpired();
        }
        return false;
    }
    
    // Get current user (client-side)
    getCurrentUser() {
        if (typeof AuthManager !== 'undefined') {
            return AuthManager.getUser();
        }
        return null;
    }
}

// Create global instance
const authAPI = new AuthAPI();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.AuthAPI = authAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthAPI;
}