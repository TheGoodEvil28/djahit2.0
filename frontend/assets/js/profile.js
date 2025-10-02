
        const API_CONFIG = {
            baseUrl: 'https://djahit.andikanugra.my.id', // Match your server port
            endpoints: {
                me: '/api/users/me'
            }
        };
        function getAuthToken() {
            return localStorage.getItem('authToken');
        }
        function getCurrentUser() {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        }
        function checkAuth() {
            const token = getAuthToken();
            if (!token) {
                window.location.href = '/frontend/page/login.html?error=Please log in to access this page';
                return false;
            }
            return true;
        }
        function updateProfileDisplay(user) {
            if (!user) return;
            if (typeof window.refreshNavbarUserData === 'function') {
                window.refreshNavbarUserData();
            }
            document.getElementById('firstname-display').textContent = user.firstname || 'N/A';
            document.getElementById('lastname-display').textContent = user.lastname || 'N/A';
            document.getElementById('email-display').textContent = user.email || 'N/A';
            document.getElementById('phone-display').textContent = user.phone || 'N/A';
            document.getElementById('firstname-display-mobile').textContent = user.firstname || 'N/A';
            document.getElementById('lastname-display-mobile').textContent = user.lastname || 'N/A';
            document.getElementById('email-display-mobile').textContent = user.email || 'N/A';
            document.getElementById('phone-display-mobile').textContent = user.phone || 'N/A';
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
        async function initializePage() {
            showLoading();
            try {
                if (!checkAuth()) {
                    return;
                }
                const userData = await fetchUserProfile();                
                if (userData) {
                    updateProfileDisplay(userData);
                }
            } catch (error) {
                console.error('Error initializing page:', error);
                showError('Failed to initialize page: ' + error.message);
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
    let pendingFormData = null;

    function openEditModal() {
        const user = getCurrentUser();
        if (!user) {
            showError('User data not found');
            return;
        }
        document.getElementById('edit-firstname').value = user.firstname || '';
        document.getElementById('edit-lastname').value = user.lastname || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';

        document.getElementById('edit-profile-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
    }
    function closeEditModal() {
        document.getElementById('edit-profile-modal').classList.add('hidden');
        document.body.style.overflow = ''; 
        pendingFormData = null;
    }
    function handleEditFormSubmit(e) {
        e.preventDefault();
        const formData = {
            firstname: document.getElementById('edit-firstname').value.trim(),
            lastname: document.getElementById('edit-lastname').value.trim(),
            phone: document.getElementById('edit-phone').value.trim()
        };
        if (!formData.firstname || !formData.lastname || !formData.phone) {
            showError('Semua field harus diisi');
            return;
        }
        if (formData.phone.length < 10) {
            showError('Nomor telepon tidak valid');
            return;
        }
        pendingFormData = formData;
        document.getElementById('edit-profile-modal').classList.add('hidden');
        document.getElementById('confirm-modal').classList.remove('hidden');
    }
    function cancelConfirm() {
        document.getElementById('confirm-modal').classList.add('hidden');
        document.getElementById('edit-profile-modal').classList.remove('hidden');
        pendingFormData = null;
    }
    async function confirmUpdate() {
        if (!pendingFormData) return;
        document.getElementById('confirm-modal').classList.add('hidden');
        showLoading();
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token tidak ditemukan. Silakan login kembali.');
            }
            const response = await fetch(`${API_CONFIG.baseUrl}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pendingFormData)
            });
            const result = await response.json();
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    window.location.href = '/frontend/page/login.html?error=session_expired';
                    return;
                }
                throw new Error(result.error?.message || 'Gagal memperbarui profil');
            }
            if (result.success && result.data && result.data.user) {
                localStorage.setItem('userData', JSON.stringify(result.data.user));
                updateProfileDisplay(result.data.user);
                hideLoading();
                document.getElementById('success-modal').classList.remove('hidden');
                pendingFormData = null;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            hideLoading();
            showError(error.message);
            pendingFormData = null;
        }
    }
    function closeSuccessModal() {
        document.getElementById('success-modal').classList.add('hidden');
        document.body.style.overflow = ''; 
    }
    window.openEditModal = openEditModal;
    window.closeEditModal = closeEditModal;
    window.cancelConfirm = cancelConfirm;
    window.confirmUpdate = confirmUpdate;
    window.closeSuccessModal = closeSuccessModal;
    window.closeErrorModal = closeErrorModal;
        document.addEventListener('DOMContentLoaded', function() {
            $('#navbar-container').load('navbar.html');
            $('#footer-container').load('footer.html');
            initializePage();
            setTimeout(() => {
            const editForm = document.getElementById('edit-profile-form');
            if (editForm) {
                editForm.addEventListener('submit', handleEditFormSubmit);
            }

            const editButtons = document.querySelectorAll('.mobile-button');
            console.log('Found buttons:', editButtons.length); // Debug
            editButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Button clicked!'); // Debug
                    openEditModal();
                });
            });
        }, 500);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEditModal();
            cancelConfirm();
            closeSuccessModal();
        }
    });
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
    