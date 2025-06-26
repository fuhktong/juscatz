// Login Page JavaScript
class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.submitBtn = this.form.querySelector('.login-submit-btn');
        this.inputs = {
            emailOrUsername: document.getElementById('emailOrUsername'),
            password: document.getElementById('password'),
            rememberMe: document.getElementById('rememberMe')
        };
        this.errors = {
            emailOrUsername: document.getElementById('emailOrUsernameError'),
            password: document.getElementById('passwordError')
        };
        
        this.initEventListeners();
        this.checkExistingSession();
    }

    initEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.inputs.emailOrUsername.addEventListener('blur', () => this.validateField('emailOrUsername'));
        this.inputs.password.addEventListener('blur', () => this.validateField('password'));
        
        // Clear errors on input
        this.inputs.emailOrUsername.addEventListener('input', () => this.clearError('emailOrUsername'));
        this.inputs.password.addEventListener('input', () => this.clearError('password'));

        // Social login buttons
        const googleBtn = document.querySelector('.login-google-btn');
        const facebookBtn = document.querySelector('.login-facebook-btn');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleSocialLogin('google'));
        }
        
        if (facebookBtn) {
            facebookBtn.addEventListener('click', () => this.handleSocialLogin('facebook'));
        }
    }

    checkExistingSession() {
        // Check if user is already logged in
        const token = localStorage.getItem('juscatz_token');
        const user = localStorage.getItem('juscatz_user');
        
        if (token && user) {
            // User is already logged in, redirect to main app
            window.location.href = '../index.html';
        }
    }

    validateField(fieldName) {
        const input = this.inputs[fieldName];
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'emailOrUsername':
                if (!value) {
                    errorMessage = 'Email or username is required';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Please enter a valid email or username';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (value.length < 6) {
                    errorMessage = 'Password must be at least 6 characters';
                    isValid = false;
                }
                break;
        }

        this.showError(fieldName, errorMessage);
        this.updateInputState(fieldName, isValid);
        return isValid;
    }

    validateAll() {
        let isFormValid = true;
        ['emailOrUsername', 'password'].forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    showError(fieldName, message) {
        const errorElement = this.errors[fieldName];
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError(fieldName) {
        const errorElement = this.errors[fieldName];
        if (errorElement) {
            errorElement.textContent = '';
        }
        this.updateInputState(fieldName, true);
    }

    updateInputState(fieldName, isValid) {
        const input = this.inputs[fieldName];
        if (input) {
            if (isValid) {
                input.classList.remove('login-error-input');
            } else {
                input.classList.add('login-error-input');
            }
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('login-loading');
            this.submitBtn.textContent = '';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('login-loading');
            this.submitBtn.textContent = 'Sign In';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateAll()) {
            return;
        }

        this.setLoading(true);
        this.removeMessages();

        const formData = {
            emailOrUsername: this.inputs.emailOrUsername.value.trim(),
            password: this.inputs.password.value,
            rememberMe: this.inputs.rememberMe.checked
        };

        try {
            const response = await this.submitLogin(formData);
            
            // Store authentication data
            this.storeAuthData(response, formData.rememberMe);
            
            this.showSuccess('Login successful! Redirecting...');
            
            // Redirect after success
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            
        } catch (error) {
            this.showError('login', error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async submitLogin(formData) {
        try {
            const response = await fetch('/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Login failed');
            }

            return result;
        } catch (error) {
            throw new Error(error.message || 'Network error occurred');
        }
    }

    storeAuthData(response, rememberMe) {
        AuthManager.storeAuthData(response, rememberMe);
    }

    async handleSocialLogin(provider) {
        // Simulate social login - replace with actual implementation
        this.showMessage('info', `${provider} login coming soon!`);
        
        // In real implementation, this would:
        // 1. Redirect to OAuth provider
        // 2. Handle callback
        // 3. Store returned tokens
        // 4. Redirect to main app
    }

    showSuccess(message) {
        this.showMessage('success', message);
    }

    showError(type, message) {
        this.showMessage('error', message);
    }

    showMessage(type, message) {
        this.removeMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type === 'success' ? 'login-success' : 'login-error-message'}`;
        messageDiv.textContent = message;
        
        this.form.insertBefore(messageDiv, this.form.firstChild);
        
        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    removeMessages() {
        const existingMessages = this.form.querySelectorAll('.login-message');
        existingMessages.forEach(msg => msg.remove());
    }
}

// AuthManager is loaded from ../auth.js

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});