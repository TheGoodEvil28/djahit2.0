
        const API_CONFIG = {
            baseUrl: 'https://djahit.andikanugra.my.id', // Match your server port
            endpoints: {
                me: '/api/users/me'
            }
        };

        // Get token from localStorage (matches your login implementation)
        function getAuthToken() {
            return localStorage.getItem('authToken');
        }

        // Get current user data
        function getCurrentUser() {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        }

        // Check if user is logged in and redirect if not
        function checkAuth() {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/frontend/page/login.html?error=Please log in to access this page';
                return false;
            }
            return true;
        }


        // UI Functions
        function updateProfileDisplay(user) {
            if (!user) return;
            if (typeof window.refreshNavbarUserData === 'function') {
                window.refreshNavbarUserData();
            }
            // Update desktop view
            document.getElementById('firstname-display').textContent = user.firstname || 'N/A';
            document.getElementById('lastname-display').textContent = user.lastname || 'N/A';
            document.getElementById('email-display').textContent = user.email || 'N/A';
            document.getElementById('phone-display').textContent = user.phone || 'N/A';

            // Update mobile view
            document.getElementById('firstname-display-mobile').textContent = user.firstname || 'N/A';
            document.getElementById('lastname-display-mobile').textContent = user.lastname || 'N/A';
            document.getElementById('email-display-mobile').textContent = user.email || 'N/A';
            document.getElementById('phone-display-mobile').textContent = user.phone || 'N/A';

            // Update title
            document.title = `Djahit - ${user.firstname} ${user.lastname}`;
        }

        function showLoading() {
            document.getElementById('loading-spinner').classList.remove('hidden');
        }

        function hideLoading() {
            document.getElementById('loading-spinner').classList.add('hidden');
        }

        function showError(message) {
            document.getElementById('error-message').textContent = message;
            document.getElementById('error-modal').classList.remove('hidden');
        }

        function closeErrorModal() {
            document.getElementById('error-modal').classList.add('hidden');
        }

        // Initialize page
        async function initializePage() {
    showLoading();

    try {
        // Check authentication first
        if (!checkAuth()) {
            return;
        }

        // Fetch user profile from API
        const userData = await fetchUserProfile();
        
        if (userData) {
            updateProfileDisplay(userData);
        }

    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to initialize page: ' + error.message);
        
        // If it's an auth error, redirect to login
        if (error.message.includes('Token tidak ditemukan') || 
            error.message.includes('session_expired')) {
            setTimeout(() => {
                window.location.href = '/frontend/page/login.html?error=session_expired';
            }, 2000);
        }
    } finally {
        hideLoading();
    }
}
        async function fetchUserProfile(){
            try{
                const token = getAuthToken();
                if (!token) {
                    throw new Error('Token tidak ditemukan. Silakan login kembali.');
                }

                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.me}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expired or invalid, redirect to login
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                        window.location.href = '/frontend/page/login.html?error=session_expired';
                        return null;
                    } else if (response.status === 403) {
                        throw new Error('Tidak memiliki akses untuk melihat data ini.');
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }

                const result = await response.json();
                if(result.success && result.data && result.data.user){
                    localStorage.setItem('userData',JSON.stringify(result.data.user));
                    return result.data.user;
                }
                else{
                    throw new Error(result.error?.message || 'Invalid response format');
                }
            }catch (error) {
                console.error('Error fetching user profile: ', error);
                showError(error.message);
        }
    }
        document.addEventListener('DOMContentLoaded', function() {
            $('#navbar-container').load('navbar.html');
            $('#footer-container').load('footer.html');
            initializePage();

            document.documentElement.style.scrollBehavior = 'smooth';
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.addEventListener('load', function() {
                    this.style.opacity = '1';
                });
                img.addEventListener('error', function() {
                    this.style.display = 'none';
                    console.warn('Failed to load image:', this.src);
                });
            });            
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                const buttons = document.querySelectorAll('button');
                buttons.forEach(button => {
                    button.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        if (this.classList.contains('mobile-button')) {
                            this.style.backgroundColor = '#CA6E56';
                        }
                    });
                    button.addEventListener('touchend', function(e) {
                        setTimeout(() => {
                            if (this.classList.contains('mobile-button')) {
                                this.style.backgroundColor = '';
                            }
                        }, 150);
                    });
                });
            }
            function preventHorizontalScroll() {
                const body = document.body;
                const html = document.documentElement;
                if (body.scrollWidth > window.innerWidth) {
                    body.style.overflowX = 'hidden';
                    html.style.overflowX = 'hidden';
                }
            }
            preventHorizontalScroll();
            window.addEventListener('resize', preventHorizontalScroll);
            let resizeTimeout;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    preventHorizontalScroll();
                }, 250);
            });
        });
    