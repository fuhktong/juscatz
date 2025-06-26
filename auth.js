// Authentication utilities - Shared across the app
class AuthManager {
    static isLoggedIn() {
        return localStorage.getItem('juscatz_is_logged_in') === 'true';
    }

    static getToken() {
        return localStorage.getItem('juscatz_token') || sessionStorage.getItem('juscatz_token');
    }

    static getUser() {
        const userStr = localStorage.getItem('juscatz_user') || sessionStorage.getItem('juscatz_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static logout() {
        // Clear all authentication data
        localStorage.removeItem('juscatz_token');
        localStorage.removeItem('juscatz_user');
        localStorage.removeItem('juscatz_login_time');
        localStorage.removeItem('juscatz_is_logged_in');
        
        sessionStorage.removeItem('juscatz_token');
        sessionStorage.removeItem('juscatz_user');
        sessionStorage.removeItem('juscatz_login_time');
        
        // Redirect to login page
        window.location.href = 'pages/login.html';
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'pages/login.html';
            return false;
        }
        return true;
    }

    static storeAuthData(response, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem('juscatz_token', response.token);
        storage.setItem('juscatz_user', JSON.stringify(response.user));
        storage.setItem('juscatz_login_time', Date.now().toString());
        
        // Also store in localStorage for logout functionality
        localStorage.setItem('juscatz_is_logged_in', 'true');
    }

    static isTokenExpired() {
        const loginTime = localStorage.getItem('juscatz_login_time') || sessionStorage.getItem('juscatz_login_time');
        if (!loginTime) return true;
        
        const now = Date.now();
        const loginTimeMs = parseInt(loginTime);
        const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
        
        return (now - loginTimeMs) > expirationTime;
    }

    static refreshAuthCheck() {
        if (this.isLoggedIn() && this.isTokenExpired()) {
            this.logout();
            return false;
        }
        return this.isLoggedIn();
    }
}

// Make AuthManager available globally
window.AuthManager = AuthManager;