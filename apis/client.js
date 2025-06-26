// API Client
// Simple vanilla JavaScript HTTP client for JusCatz API

class APIClient {
    constructor() {
        this.config = typeof APIConfig !== 'undefined' ? APIConfig : new (require('./config.js'))();
    }
    
    // Generic request method
    async request(method, endpoint, data = null, options = {}) {
        const url = this.config.getFullURL(endpoint);
        const isUpload = options.isUpload || false;
        const includeAuth = options.includeAuth !== false; // Default to true
        
        const config = {
            method: method.toUpperCase(),
            headers: isUpload ? 
                this.config.getUploadHeaders(includeAuth) : 
                this.config.getHeaders(includeAuth),
            ...options.fetchOptions
        };
        
        // Add body for POST, PUT, PATCH requests
        if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            if (isUpload) {
                config.body = data; // FormData for uploads
            } else {
                config.body = JSON.stringify(data);
            }
        }
        
        try {
            const response = await this.fetchWithRetry(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            throw this.handleError(error);
        }
    }
    
    // Fetch with retry logic
    async fetchWithRetry(url, config, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response;
            
        } catch (error) {
            if (attempt < this.config.retryAttempts && this.shouldRetry(error)) {
                console.warn(`API request failed, retrying... (${attempt}/${this.config.retryAttempts})`);
                await this.delay(1000 * attempt); // Exponential backoff
                return this.fetchWithRetry(url, config, attempt + 1);
            }
            throw error;
        }
    }
    
    // Handle response
    async handleResponse(response) {
        if (!response.ok) {
            const error = await this.parseError(response);
            throw error;
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    }
    
    // Parse error response
    async parseError(response) {
        let errorData;
        
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: response.statusText || 'Unknown error' };
        }
        
        const error = new Error(errorData.message || 'API Error');
        error.status = response.status;
        error.data = errorData;
        
        // Handle specific status codes
        if (response.status === 401) {
            // Unauthorized - clear auth and redirect to login
            if (typeof AuthManager !== 'undefined') {
                AuthManager.logout();
            }
        }
        
        return error;
    }
    
    // Handle general errors
    handleError(error) {
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timeout');
            timeoutError.code = 'TIMEOUT';
            return timeoutError;
        }
        
        return error;
    }
    
    // Check if error is retryable
    shouldRetry(error) {
        // Retry on network errors, not on HTTP errors
        return !error.status || error.status >= 500;
    }
    
    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }
    
    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }
    
    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }
    
    async patch(endpoint, data, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }
    
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }
    
    // File upload helper
    async upload(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional form data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        return this.request('POST', endpoint, formData, { isUpload: true });
    }
}

// Create global instance
const apiClient = new APIClient();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.APIClient = apiClient;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}