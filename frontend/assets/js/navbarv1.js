(function() {
    'use strict';

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
            const newMobileMenuBtn = mobileMenuBtn.cloneNode(true);
            mobileMenuBtn.parentNode.replaceChild(newMobileMenuBtn, mobileMenuBtn);            
            newMobileMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile menu button clicked');
                mobileMenu.classList.toggle('hidden');
                if (avatarDropdown) avatarDropdown.classList.add('hidden');
                if (mobileAvatarModal) mobileAvatarModal.classList.add('hidden');
            });
        }
        if (avatarBtn && avatarDropdown) {
            const newAvatarBtn = avatarBtn.cloneNode(true);
            avatarBtn.parentNode.replaceChild(newAvatarBtn, avatarBtn);
            newAvatarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Desktop avatar button clicked');
                avatarDropdown.classList.toggle('hidden');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        }
        if (mobileAvatarBtn && mobileAvatarModal) {
            const newMobileAvatarBtn = mobileAvatarBtn.cloneNode(true);
            mobileAvatarBtn.parentNode.replaceChild(newMobileAvatarBtn, mobileAvatarBtn);
            newMobileAvatarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile avatar button clicked');
                mobileAvatarModal.classList.remove('hidden');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        }
        if (closeMobileModal && mobileAvatarModal) {
            closeMobileModal.addEventListener('click', function(e) {
                e.preventDefault();
                mobileAvatarModal.classList.add('hidden');
            });            
            mobileAvatarModal.addEventListener('click', function(e) {
                if (e.target === mobileAvatarModal) {
                    mobileAvatarModal.classList.add('hidden');
                }
            });
        }
        document.addEventListener('click', function(event) {
            const newAvatarBtn = document.querySelector('[data-navbar-avatar-btn]');
            const newMobileMenuBtn = document.querySelector('[data-navbar-mobile-btn]');
            if (newAvatarBtn && avatarDropdown && 
                !newAvatarBtn.contains(event.target) && 
                !avatarDropdown.contains(event.target)) {
                avatarDropdown.classList.add('hidden');
            }
            if (newMobileMenuBtn && mobileMenu && 
                !newMobileMenuBtn.contains(event.target) && 
                !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });        
        console.log('Djahit Navbar initialized successfully');
    }
    function updateNavbarDisplay(userData) {
        if (!userData) return;
        const displayName = `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'User';
        const email = userData.email || 'No email';
        const desktopName = document.querySelector('[data-navbar-user-name]');
        const desktopEmail = document.querySelector('[data-navbar-user-email]');
        if (desktopName) desktopName.textContent = displayName;
        if (desktopEmail) desktopEmail.textContent = email;
        const mobileName = document.querySelector('[data-navbar-user-name-mobile]');
        const mobileEmail = document.querySelector('[data-navbar-user-email-mobile]');
        if (mobileName) mobileName.textContent = displayName;
        if (mobileEmail) mobileEmail.textContent = email;
        console.log('Navbar updated with user data:', displayName);
    }
    async function updateNavbarUserInfo() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.log('No auth token found');
                return;
            }
            let userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    userData = JSON.parse(userData);
                    updateNavbarDisplay(userData);
                    return;
                } catch (e) {
                    console.warn('Failed to parse userData');
                }
            }
            const response = await fetch('https://djahit.andikanugra.my.id/api/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    window.location.href = '/frontend/page/login.html?error=session_expired';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data && result.data.user) {
                localStorage.setItem('userData', JSON.stringify(result.data.user));
                updateNavbarDisplay(result.data.user);
            }
        } catch (error) {
            console.error('Error updating navbar user info:', error);
        }
    }
    function initializeDjahitNavbarWithAuth() {
        console.log('initializeDjahitNavbarWithAuth called');
        initializeDjahitNavbar();
        setTimeout(() => {
            updateNavbarUserInfo();
        }, 100);
    }
    window.initializeDjahitNavbar = initializeDjahitNavbar;
    window.initializeDjahitNavbarWithAuth = initializeDjahitNavbarWithAuth;
    window.refreshNavbarUserData = updateNavbarUserInfo;
    window.updateNavbarDisplay = updateNavbarDisplay;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeDjahitNavbarWithAuth, 50);
        });
    } else {
        setTimeout(initializeDjahitNavbarWithAuth, 50);
    }
})();
async function logout() {
    try {
        const token = localStorage.getItem('authToken');
        
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
                console.warn('Logout endpoint failed:', error);
            }
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userPreferences');
        sessionStorage.clear();
        window.location.href = '/frontend/page/login.html?message=Logout successful';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        window.location.href = '/frontend/page/login.html';
    }
}
async function logoutWithConfirmation() {
    if (confirm('Are you sure you want to sign out?')) {
        await logout();
    }
}
window.logout = logout;
window.logoutWithConfirmation = logoutWithConfirmation;