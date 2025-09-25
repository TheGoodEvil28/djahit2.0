
        document.addEventListener('DOMContentLoaded', function() {
    // Configuration - Update this with your actual API URL
    // const API_BASE = 'http://localhost:8880/api'; // Change to your ngrok URL when deployed
        // function getApiBaseUrl() {
        //         const hostname = window.location.hostname;
        //         const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                
        //         if (isLocalhost) {
        //             return 'http://localhost:8880/api';
        //         } else if (hostname.includes('ngrok')) {
        //             // If frontend is served via ngrok, use the same domain for API
        //             return `${window.location.protocol}//${hostname}/api`;
        //         } else {
        //             // Fallback or production URL
        //             return 'https://10.34.239.224/api';
        //         }
        //     }
            
        const API_BASE =  'http://10.34.239.224:8880/api'; 
    // Load navbar and footer
    $('#navbar-container').load('loginnavbar.html', function() {
        if (typeof initializeButtonEffects === 'function') {
            initializeButtonEffects();
        }
    });
    $('#footer-container').load('loginfooter.html');

    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token is still valid
        fetch(`${API_BASE}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // User is logged in, redirect to dashboard
                window.location.href = '/page/riwayatorder.html'; // Update with your dashboard URL
                return;
            }
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        })
        .catch(error => {
            console.log('Token verification failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        });
    }

    // Password toggle functionality
    const passwordToggle = document.querySelector('input[type="password"] + div button');
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = this.querySelector('svg');
            if (type === 'text') {
                icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>`;
            } else {
                icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
            }
        });
    }

    // TOAST SYSTEM
    function showToast(message, type = 'success') {
        console.log('Creating toast:', message, type);

        // Create or get toast container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;';
            document.body.appendChild(container);
        }

        // Create toast
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#10B981' : '#EF4444';
        
        toast.innerHTML = `
            <div style="background-color: ${bgColor}; color: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; transform: translateX(100%); transition: transform 0.3s ease;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; margin-left: 12px; cursor: pointer; padding: 0;">×</button>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.firstElementChild.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.firstElementChild.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Loading state management
    function setLoading(isLoading) {
        const submitButton = document.querySelector('button[type="submit"]');
        const form = document.querySelector('form');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
            `;
            form.style.opacity = '0.7';
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login';
            form.style.opacity = '1';
        }
    }

    // Form validation
    function validateForm(email, password) {
        const errors = [];
        
        if (!email) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!password) {
            errors.push('Password is required');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        return errors;
    }

    // Main login function
    async function handleLogin(email, password) {
        try {
            setLoading(true);
            console.log('sampe sini coy')
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password: password
                })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store authentication data
                localStorage.setItem('authToken', data.data.accessToken);
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                
                // Show success message
                showToast('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '../page/riwayatorder.html'; // Update with your actual dashboard URL
                }, 1500);
                
            } else {
                // Handle API errors
                let errorMessage = 'Login failed. Please try again.';
                
                if (data.error) {
                    switch (data.error.code) {
                        case 'UNAUTHORIZED':
                            errorMessage = 'Invalid email or password. Please check your credentials.';
                            break;
                        case 'VALIDATION_ERROR':
                            errorMessage = data.error.message || 'Please check your input and try again.';
                            break;
                        case 'RATE_LIMIT_EXCEEDED':
                            errorMessage = 'Too many login attempts. Please try again later.';
                            break;
                        default:
                            errorMessage = data.error.message || errorMessage;
                    }
                }
                
                showToast(errorMessage, 'error');
                setLoading(false);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showToast('Unable to connect to server. Please check your connection and try again.', 'error');
            } else {
                showToast('An unexpected error occurred. Please try again.', 'error');
            }
        }
    }

    // Form submission handler
    const form = document.querySelector('form');
    if (form) {
        // Remove the old action and method attributes
        form.removeAttribute('action');
        form.removeAttribute('method');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validate form
            const validationErrors = validateForm(email, password);
            if (validationErrors.length > 0) {
                showToast(validationErrors[0], 'error');
                return;
            }
            
            // Perform login
            handleLogin(email, password);
        });
    }

    // Google login handler (if you implement Google OAuth later)
    const googleButton = document.querySelector('button[type="button"]');
    if (googleButton) {
        googleButton.addEventListener('click', function() {
            showToast('Google login coming soon!', 'error');
            // TODO: Implement Google OAuth
        });
    }

    // Check URL parameters for messages
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success) {
        if (success === 'logout_successful') {
            showToast('Successfully logged out!', 'success');
        } else if (success === 'registration_successful') {
            showToast('Account created successfully! Please log in.', 'success');
        }
        // Clean URL
        history.replaceState(null, null, location.pathname);
    }

    if (error) {
        let message = decodeURIComponent(error);
        
        // Map common error messages
        const errorMap = {
            'either password or email are not correct': 'Invalid email or password. Please try again.',
            'Email is not registered': 'No account found with this email address.',
            'logout_failed': 'Logout failed. Please try again.',
            'session_expired': 'Your session has expired. Please log in again.',
            'account_not_verified': 'Please verify your email address before logging in.'
        };
        
        message = errorMap[message] || message;
        
        showToast(message, 'error');
        // Clean URL
        history.replaceState(null, null, location.pathname);
    }

    // Scroll effects
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('nav');
        if (navbar) {
            navbar.classList.toggle('shadow-lg', window.scrollY > 100);
        }
    });

    // Enhanced input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
        
        // Real-time validation feedback
        input.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            const errorDiv = document.getElementById('error-message');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        });
    });

    // Add enhanced styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        
        input:focus { 
            box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1); 
            border-color: #E07A5F;
        }
        button:focus { 
            box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1); 
        }
        input, button, .relative { 
            transition: all 0.2s ease-in-out; 
        }
        
        button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .border-red-500 {
            border-color: #ef4444 !important;
        }
        
        /* Enhanced hover effects */
        button[type="submit"]:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(224, 122, 95, 0.3);
        }
        
        /* Form container animation */
        form {
            animation: fadeIn 0.8s ease-out forwards;
        }
        
        /* Input validation styles */
        input:invalid {
            border-color: #ef4444;
        }
        
        input:valid {
            border-color: #10b981;
        }
    `;
    document.head.appendChild(style);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key to submit form when focused on inputs
        if (e.key === 'Enter' && (e.target.type === 'email' || e.target.type === 'password')) {
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton && !submitButton.disabled) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
});

// Utility functions for other pages to use
window.djahitAuth = {
    // Check if user is logged in
    isLoggedIn() {
        const token = localStorage.getItem('authToken');
        return token !== null;
    },
    
    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },
    
    // Get auth token
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    // Logout user
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login.html?success=logout_successful';
    },
    
    // Check if token is expired (basic check)
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;
        
        try {
            // Decode JWT payload (basic decode, not verification)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (e) {
            return true;
        }
    }
};
