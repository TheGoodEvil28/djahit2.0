// auth-guard.js - Add this to ALL protected pages
(function() {
    'use strict';
    
    const API_BASE = 'https://djahit.andikanugra.my.id/api';
    
    async function verifyAuth() {
        const token = localStorage.getItem('authToken');
        
        // No token = immediate redirect
        if (!token) {
            redirectToLogin('No authentication token found');
            return false;
        }
        
        try {
            // Verify token with backend
            const response = await fetch(`${API_BASE}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Token invalid/expired
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                redirectToLogin('Session expired or invalid');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Auth verification failed:', error);
            redirectToLogin('Authentication verification failed');
            return false;
        }
    }
    
    function redirectToLogin(reason) {
        // Store attempted URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        
        // Clear any auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Redirect to login with message
        const encodedReason = encodeURIComponent(reason);
        window.location.href = `/frontend/page/login.html?error=${encodedReason}`;
    }
    
    // Run verification immediately on page load
    verifyAuth();
    
    // Export for use in other scripts
    window.authGuard = {
        verify: verifyAuth,
        redirectToLogin: redirectToLogin
    };
})();