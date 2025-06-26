// Register Page JavaScript
class RegisterForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.submitBtn = this.form.querySelector('.register-submit-btn');
        this.inputs = {
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            terms: document.getElementById('terms')
        };
        this.errors = {
            email: document.getElementById('emailError'),
            phone: document.getElementById('phoneError'),
            username: document.getElementById('usernameError'),
            password: document.getElementById('passwordError'),
            confirmPassword: document.getElementById('confirmPasswordError'),
            terms: document.getElementById('termsError')
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        Object.keys(this.inputs).forEach(key => {
            if (this.inputs[key]) {
                this.inputs[key].addEventListener('blur', () => this.validateField(key));
                this.inputs[key].addEventListener('input', () => this.clearError(key));
            }
        });
    }

    validateField(fieldName) {
        const input = this.inputs[fieldName];
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'phone':
                // Phone is optional, but if provided, should be valid
                if (value && !this.isValidPhone(value)) {
                    errorMessage = 'Please enter a valid phone number';
                    isValid = false;
                }
                break;

            case 'username':
                if (!value) {
                    errorMessage = 'Username is required';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Username must be at least 3 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    errorMessage = 'Username can only contain letters, numbers, and underscores';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (value.length < 8) {
                    errorMessage = 'Password must be at least 8 characters';
                    isValid = false;
                } else if (!this.isStrongPassword(value)) {
                    errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                    isValid = false;
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    errorMessage = 'Please confirm your password';
                    isValid = false;
                } else if (value !== this.inputs.password.value) {
                    errorMessage = 'Passwords do not match';
                    isValid = false;
                }
                break;

            case 'terms':
                if (!input.checked) {
                    errorMessage = 'You must agree to the terms and conditions';
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
        Object.keys(this.inputs).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Basic phone validation - accepts various formats
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    isStrongPassword(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        return hasUpperCase && hasLowerCase && hasNumber;
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
        if (input && input.type !== 'checkbox') {
            if (isValid) {
                input.classList.remove('register-error-input');
            } else {
                input.classList.add('register-error-input');
            }
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('register-loading');
            this.submitBtn.textContent = '';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('register-loading');
            this.submitBtn.textContent = 'Create Account';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateAll()) {
            return;
        }

        this.setLoading(true);

        // Collect form data
        const formData = {
            email: this.inputs.email.value.trim(),
            phone: this.inputs.phone.value.trim() || null,
            username: this.inputs.username.value.trim(),
            password: this.inputs.password.value
        };

        try {
            // TODO: Replace with actual API call
            await this.submitRegistration(formData);
            
            // Success - redirect to login or dashboard
            this.showSuccess();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            this.showSubmissionError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async submitRegistration(formData) {
        try {
            const response = await fetch('/api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            return result;
        } catch (error) {
            throw new Error(error.message || 'Network error occurred');
        }
    }

    showSuccess() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'register-success-message';
        successDiv.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                ✓ Account created successfully! Redirecting to login...
            </div>
        `;
        
        this.form.insertBefore(successDiv, this.form.firstChild);
    }

    showSubmissionError(message) {
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'register-submission-error';
        errorDiv.innerHTML = `
            <div style="background: #f8d7da; color: #721c24; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                ✗ ${message}
            </div>
        `;
        
        // Remove any existing error messages
        const existingError = this.form.querySelector('.register-submission-error');
        if (existingError) {
            existingError.remove();
        }
        
        this.form.insertBefore(errorDiv, this.form.firstChild);
        
        // Auto-remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterForm();
});