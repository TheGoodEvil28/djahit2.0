 
        const API_CONFIG = {
            baseUrl: 'https://djahit.andikanugra.my.id', // Match your server port
            endpoints: {
                repairRequests: '/api/repair-requests'
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
        function formatCurrency(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        }
        function formatDate(dateString) {
            const date = new Date(dateString);
            const options = { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            };
            return date.toLocaleDateString('id-ID', options);
        }

        function getStatusStyle(status) {
            const statusMap = {
                'Pending': { bg: 'bg-yellow-200', text: 'text-yellow-800', label: 'Pending' },
                'Order Diterima': { bg: 'bg-button-diterima', text: 'text-text-radio', label: 'Order Diterima' },
                'Sedang Dijahit': { bg: 'bg-button-green', text: 'text-white', label: 'Sedang Dijahit' },
                'Dalam Pengiriman': { bg: 'bg-button-dalam', text: 'text-white', label: 'Dalam Pengiriman' },
                'Selesai': { bg: 'bg-djahit-orange', text: 'text-white', label: 'Selesai' }
            };
            return statusMap[status] || statusMap['Pending'];
        }

        function createDesktopRow(item) {
            const statusStyle = getStatusStyle(item.status);
            const itemName = getItemDisplayName(item);
            const itemType = item.clothing_type || 'N/A';
            const totalPrice = item.estimated_cost || 0;
            
            return `
                <tr class="hover:bg-[#EBE7D3]" data-id="${item.id}">
                    <td class="px-6 py-4 text-sm text-gray-900">${itemName}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${itemType}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${formatCurrency(totalPrice)}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${formatDate(item.created_at || new Date())}</td>
                    <td class="px-6 py-4 text-center">
                        <span class="px-3 py-1 text-xs mx-auto font-medium ${statusStyle.bg} w-[133px] h-[40px] ${statusStyle.text} rounded-full flex items-center justify-center">
                            ${statusStyle.label}
                        </span>
                    </td>
                </tr>
            `;
        }
        function createMobileCard(item) {
            const statusStyle = getStatusStyle(item.status);
            const itemName = getItemDisplayName(item);
            const itemType = item.clothing_type || 'N/A';
            const totalPrice = item.estimated_cost || 0;
            
            return `
                <div class="bg-[#EEE9D4] rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow" data-id="${item.id}">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-semibold text-gray-900 text-sm sm:text-base">${itemName}</h3>
                            <p class="text-gray-600 text-xs sm:text-sm">${itemType}</p>
                        </div>
                    </div>
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <p class="text-gray-600 text-xs">Total Pembayaran</p>
                            <p class="font-semibold text-gray-900 text-sm">${formatCurrency(totalPrice)}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-xs">Tanggal</p>
                            <p class="font-medium text-gray-900 text-sm">${formatDate(item.created_at || new Date())}</p>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <span class="px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} rounded-full">
                            ${statusStyle.label}
                        </span>
                    </div>
                </div>
            `;
        }
        function getItemDisplayName(item) {
            const damageType = item.damage_type || 'Perbaikan';
            const clothingType = item.clothing_type || 'Pakaian';            
            if (item.damage_type === 'Lainnya' && item.damage_type_other_desc) {
                return `${item.damage_type_other_desc} - ${clothingType}`;
            }
            
            if (item.clothing_type === 'Lainnya' && item.clothing_type_other_desc) {
                return `${damageType} - ${item.clothing_type_other_desc}`;
            } 
            return `${damageType} - ${clothingType}`;
        }
        async function fetchRepairRequests() {
            try {
                showLoading(true);
                hideError();
                const token = getAuthToken();
                if (!token) {
                    throw new Error('Token tidak ditemukan. Silakan login kembali.');
                }
                const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.repairRequests}`, {
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
                    } else if (response.status === 403) {
                        throw new Error('Tidak memiliki akses untuk melihat data ini.');
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }
                const result = await response.json();
                if (result.success && result.data && result.data.repair_requests) {
                    populateTable(result.data.repair_requests);
                } else if (result.success && result.data && Array.isArray(result.data)) {
                    populateTable(result.data);
                } else {
                    throw new Error(result.error?.message || 'Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching repair requests:', error);
                showError(error.message);
            } finally {
                showLoading(false);
            }
        }
        function populateTable(data) {
            const desktopTableBody = document.getElementById('desktop-table-body');
            const mobileCards = document.getElementById('mobile-cards');
            const desktopTable = document.getElementById('desktop-table');
            const emptyState = document.getElementById('empty-state');
            
            if (data.length === 0) {
                desktopTable.classList.add('hidden');
                mobileCards.classList.add('hidden');
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            desktopTable.classList.remove('hidden');
            desktopTable.classList.add('lg:block');
            desktopTableBody.innerHTML = data.map(item => createDesktopRow(item)).join('');
            
            mobileCards.classList.remove('hidden');
            mobileCards.classList.add('lg:hidden');
            mobileCards.innerHTML = data.map(item => createMobileCard(item)).join('');
        }
        function showLoading(show) {
            const loading = document.getElementById('loading');
            const desktopTable = document.getElementById('desktop-table');
            const mobileCards = document.getElementById('mobile-cards');
            const emptyState = document.getElementById('empty-state');
            if (show) {
                loading.classList.remove('hidden');
                desktopTable.classList.add('hidden');
                mobileCards.innerHTML = '';
                emptyState.classList.add('hidden');
            } else {
                loading.classList.add('hidden');
            }
        }
        function showError(message) {
            const errorDiv = document.getElementById('error');
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        function hideError() {
            const errorDiv = document.getElementById('error');
            errorDiv.classList.add('hidden');
        }
        function refreshData() {
            fetchRepairRequests();
        }
        document.addEventListener('DOMContentLoaded', function() {
            if (!checkAuth()) {
                return; 
            }
            $('#navbar-container').load('navbar.html');
            $('#footer-container').load('footer.html');            
            fetchRepairRequests();
        });
        setInterval(refreshData, 2 * 60 * 1000);