
(function() {
    'use strict';
    
    // Original navbar functionality
    function initializeDjahitNavbar() {
        console.log('Initializing Djahit Navbar...');
        const mobileMenuBtn = document.querySelector('[data-navbar-mobile-btn]');
        const mobileMenu = document.querySelector('[data-navbar-mobile-menu]');
        const avatarBtn = document.querySelector('[data-navbar-avatar-btn]');
        const avatarDropdown = document.querySelector('[data-navbar-avatar-dropdown]');
        const mobileAvatarBtn = document.querySelector('[data-navbar-mobile-avatar-btn]');
        const mobileAvatarModal = document.querySelector('[data-navbar-mobile-avatar-modal]');
        const closeMobileModal = document.querySelector('[data-navbar-close-mobile-modal]');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
                if (avatarDropdown) {
                    avatarDropdown.classList.add('hidden');
                }
                console.log('Mobile menu toggled');
            });
        }
        if (avatarBtn && avatarDropdown) {
            avatarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                avatarDropdown.classList.toggle('hidden');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
                console.log('Avatar dropdown toggled');
            });
        }
        if (mobileAvatarBtn && mobileAvatarModal) {
            mobileAvatarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                mobileAvatarModal.classList.remove('hidden');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
                console.log('Mobile avatar modal opened');
            });
        }
        if (closeMobileModal && mobileAvatarModal) {
            closeMobileModal.addEventListener('click', function() {
                mobileAvatarModal.classList.add('hidden');
            });
            mobileAvatarModal.addEventListener('click', function(e) {
                if (e.target === mobileAvatarModal) {
                    mobileAvatarModal.classList.add('hidden');
                }
            });
        }
        document.addEventListener('click', function(event) {
            if (avatarBtn && avatarDropdown && 
                !avatarBtn.contains(event.target) && 
                !avatarDropdown.contains(event.target)) {
                avatarDropdown.classList.add('hidden');
            }
            if (mobileMenuBtn && mobileMenu && 
                !mobileMenuBtn.contains(event.target) && 
                !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
        console.log('Djahit Navbar initialized successfully');
    }

    // Function to update navbar DOM elements with user data
    function updateNavbarDisplay(userData) {
        if (!userData) return;

        const displayName = `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'User';
        const email = userData.email || 'No email';

        // Update desktop dropdown
        const desktopNameElement = document.querySelector('[data-navbar-user-name]');
        const desktopEmailElement = document.querySelector('[data-navbar-user-email]');
        
        if (desktopNameElement) {
            desktopNameElement.textContent = displayName;
        }
        if (desktopEmailElement) {
            desktopEmailElement.textContent = email;
        }

        // Update mobile modal
        const mobileNameElement = document.querySelector('[data-navbar-user-name-mobile]');
        const mobileEmailElement = document.querySelector('[data-navbar-user-email-mobile]');
        
        if (mobileNameElement) {
            mobileNameElement.textContent = displayName;
        }
        if (mobileEmailElement) {
            mobileEmailElement.textContent = email;
        }

        console.log('Navbar updated with user data:', displayName, email);
    }

    // Function to fetch and update navbar with user data
    async function updateNavbarUserInfo() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.log('No auth token found for navbar update');
                return;
            }

            // Try to get user data from localStorage first (faster)
            let userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    userData = JSON.parse(userData);
                    updateNavbarDisplay(userData);
                    return;
                } catch (e) {
                    console.warn('Failed to parse stored userData, fetching fresh data');
                }
            }

            // If no stored data, fetch from API
            const response = await fetch('http://localhost:8880/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, clear storage and redirect
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    window.location.href = '/frontend/page/login.html?error=session_expired';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.data && result.data.user) {
                // Update localStorage with fresh data
                localStorage.setItem('userData', JSON.stringify(result.data.user));
                updateNavbarDisplay(result.data.user);
            }

        } catch (error) {
            console.error('Error updating navbar user info:', error);
            // Don't redirect on navbar update errors, just log them
        }
    }

    // Enhanced navbar initialization function
    function initializeDjahitNavbarWithAuth() {
        // Call the original navbar initialization
        initializeDjahitNavbar();
        
        // Update user info after navbar is initialized
        setTimeout(() => {
            updateNavbarUserInfo();
        }, 100);
    }

    // Initialize navbar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDjahitNavbarWithAuth);
    } else {
        setTimeout(initializeDjahitNavbarWithAuth, 10);
    }

    setTimeout(initializeDjahitNavbarWithAuth, 100);
    setTimeout(initializeDjahitNavbarWithAuth, 500);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const hasNavbar = document.querySelector('[data-navbar-avatar-btn]');
                if (hasNavbar) {
                    setTimeout(initializeDjahitNavbarWithAuth, 10);
                    observer.disconnect(); 
                }
            }
        });
    });

    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        observer.observe(navbarContainer, { childList: true, subtree: true });
    }

    // Make functions available globally
    window.refreshNavbarUserData = updateNavbarUserInfo;
    window.updateNavbarDisplay = updateNavbarDisplay;
})();

// Logout function
async function logout() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Show loading state (optional)
        const logoutButton = event?.target;
        if (logoutButton) {
            logoutButton.disabled = true;
            logoutButton.textContent = 'Signing out...';
        }

        // Call logout endpoint (optional - for server-side logging/analytics)
        if (token) {
            try {
                await fetch('https://djahit.andikanugra.my.id/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.warn('Logout endpoint failed, but continuing with client-side logout:', error);
            }
        }

        // Clear all authentication data from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPreferences');
        localStorage.removeItem('cartItems');

        // Optional: Clear sessionStorage as well
        sessionStorage.clear();

        // Show success message (optional)
        console.log('Logout successful');

        // Redirect to login page
        window.location.href = '/frontend/page/login.html?message=Logout successful';

    } catch (error) {
        console.error('Logout error:', error);
        
        // Even if the server request fails, still clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Redirect anyway
        window.location.href = '/frontend/page/login.html?error=Logout completed with errors';
    }
}

// Enhanced logout with confirmation dialog
async function logoutWithConfirmation() {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (confirmed) {
        await logout();
    }
}

// Make logout functions available globally
window.logout = logout;
window.logoutWithConfirmation = logoutWithConfirmation;

