        function getAuthToken() {
            return localStorage.getItem('authToken');
        }
        const API_BASE = 'https://6s3e7o4sw6.execute-api.us-east-1.amazonaws.com/prod';
        let uploadedImages = [];
        let uploadedKeys = [];
        document.addEventListener('DOMContentLoaded', function() {
            $('#navbar-container').load('navbar.html');
            $('#footer-container').load('footer.html');
            const currentUser = getCurrentUser();
            if (currentUser.phone === null || currentUser.phone === undefined ||!currentUser.phone.match(/^(\+62|62|0)[0-9]{9,13}$/)) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
            modal.innerHTML = `
                    <div class="bg-white rounded-lg p-6 max-w-md">
                        <h3 class="text-xl font-bold text-red-600 mb-4">Nomor Telepon Tidak Valid</h3>
                        <p class="text-gray-700 mb-2">Nomor telepon Anda <strong>${currentUser.phone}</strong> tidak sesuai format Indonesia yang valid.</p>
                        <p class="text-gray-700 mb-4">Format yang diterima:</p>
                        <ul class="list-disc list-inside text-gray-600 mb-4 text-sm">
                            <li>08xxxxxxxxxx (contoh: 08123456789)</li>
                            <li>+628xxxxxxxxxx (contoh: +628123456789)</li>
                            <li>628xxxxxxxxxx (contoh: 628123456789)</li>
                        </ul>
                        <p class="text-gray-700 mb-4">Silakan perbarui nomor telepon Anda di halaman profil.</p>
                        <p class="text-center text-lg font-bold text-djahit-orange">Redirect dalam <span id="countdown">5</span> detik...</p>
                    </div>
                `;
                document.body.appendChild(modal);
                let seconds = 5;
                const countdownEl = document.getElementById('countdown');
                const interval = setInterval(() => {
                    seconds--;
                    countdownEl.textContent = seconds;
                    if (seconds <= 0) {
                        clearInterval(interval);
                        window.location.href = '/frontend/page/profile.html';
                    }
                }, 1000);
                const form = document.querySelector('form');
                if (form) {
                    form.style.pointerEvents = 'none';
                    form.style.opacity = '0.5';
                }
                return;
            }
            initLocationModal()
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const imageSlots = document.querySelectorAll('.image-slot');
            const konfirmasiBtn = document.getElementById('konfirmasiBtn');
            const form = document.getElementById('mainForm');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('Form submission blocked');
            });
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            imageSlots.forEach((slot, index) => {
                slot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fileInput.setAttribute('data-target-slot', index);
                    fileInput.click();
                });
            });
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-djahit-orange');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-djahit-orange');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-djahit-orange');
                const files = e.dataTransfer.files;
                handleFiles(files);
            });
            fileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
            });
            async function handleFiles(files) {
                const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
                if (imageFiles.length === 0) {
                    alert('Please upload image files only (JPG, PNG, GIF, etc.)');
                    return;
                }
                showLoadingModal();
                try {
                    for (let i = 0; i < imageFiles.length; i++) {
                        const file = imageFiles[i];
                        if (file.size > 1 * 1024 * 1024) {
                            alert(`File ${file.name} is too large. Maximum size is 1MB.`);
                            continue;
                        }
                        updateProgress((i / imageFiles.length) * 100, `Uploading ${file.name}...`);
                        const res1 = await fetch(`${API_BASE}/generate-upload-url`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename: file.name, contentType: file.type })
                        });
                        const { uploadUrl, key } = await res1.json();
                        await fetch(uploadUrl, { 
                            method: 'PUT', 
                            body: file, 
                            headers: { 'Content-Type': file.type } 
                        });
                        uploadedKeys.push(key);
                        displayImagePreview(file, i);   
                        uploadedImages.push({
                            name: file.name,
                            key: key,
                            size: file.size
                        });
                    }
                    updateProgress(100, 'Upload complete!');
                    setTimeout(() => {
                        hideLoadingModal();
                        showUploadSuccess();
                        enableProceedButton();
                    }, 1000);
                } catch (error) {
                    console.error('Upload error:', error);
                    hideLoadingModal();
                    alert('Error uploading images: ' + error.message);
                }
            }
            function displayImagePreview(file, index) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageSlots = document.querySelectorAll('.image-slot');
                    if (index < imageSlots.length) {
                        const slot = imageSlots[index];
                        slot.innerHTML = `
                            <div class="relative w-full h-full">
                                <img src="${e.target.result}" alt="${file.name}" class="w-full h-full object-cover rounded-lg">
                                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                                    <div class="truncate">${file.name}</div>
                                </div>
                                <div class="absolute top-1 right-1">
                                    <div class="bg-djahit-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                        ${index + 1}
                                    </div>
                                </div>
                            </div>
                        `;
                        slot.classList.remove('border-dashed', 'border-gray-300');
                        slot.classList.add('border-solid', 'border-djahit-orange');
                    }
                };
                reader.readAsDataURL(file);
            }
            function showLoadingModal() {
                document.getElementById('loadingModal').classList.remove('hidden');
            }
            function hideLoadingModal() {
                document.getElementById('loadingModal').classList.add('hidden');
            }
            function updateProgress(percent, text) {
                document.getElementById('progressBar').style.width = percent + '%';
                document.getElementById('progressText').textContent = Math.round(percent) + '%';
                document.getElementById('loadingText').textContent = text;
            }
            function showUploadSuccess() {
                const statusDiv = document.getElementById('uploadStatus');
                const countText = document.getElementById('uploadedCount');
                countText.textContent = `${uploadedImages.length} images processed`;
                statusDiv.classList.remove('hidden');
            }
            function enableProceedButton() {
                konfirmasiBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                konfirmasiBtn.classList.add('bg-djahit-orange', 'hover:bg-cream', 'hover:text-djahit-orange', 'hover:border', 'hover:border-djahit-orange', 'cursor-pointer');
                konfirmasiBtn.disabled = false;
                        konfirmasiBtn.addEventListener('click', async function(e) {
                        e.preventDefault();  
                        e.stopPropagation();
                        const damageType = document.querySelector('input[name="damage_type"]:checked');
                        const clothingType = document.querySelector('input[name="clothing_type"]:checked');
                        const size = document.querySelector('select[name="size"]').value;
                        const location = document.querySelector('input[name="location"]').value;
                        if (!damageType || !clothingType || !size.trim() || !location.trim()) {
                            alert('Mohon lengkapi semua field yang wajib diisi (*)');
                            return;
                        }
                        if (uploadedKeys.length === 0) {
                            alert('Please upload at least one image');
                            return;
                        }
                        showLoadingModal();
                        updateProgress(0, 'Starting analysis...');
                        try {
                            const analysisType = document.querySelector('input[name="analysisType"]:checked').value;
                            const useCustom = analysisType === "custom";
                            const analysisResults = await analyzeImages(uploadedKeys, useCustom);
                            const formData = {
                                damageType: damageType.value,
                                clothingType: clothingType.value,
                                damageDescription: document.querySelector('textarea[name="damage_description"]').value,
                                clothingDescription: document.querySelector('textarea[name="clothing_description"]').value,
                                size: size,
                                location: location,
                                threadColor: document.querySelector('input[name="thread_color"]').value,
                                voucherCode: document.querySelector('input[name="voucher_code"]').value,
                                imageCount: uploadedImages.length
                            };
                            const allAnalysisTexts = analysisResults.map(r => r.analysisText).filter(t => t).join('\n\n');
                            const analysisData = {
                                images: analysisResults.map(r => ({ url: r.imageUrl, key: r.key })),
                                analysisText: allAnalysisTexts || 'No analysis available',
                                clothing: analysisResults.flatMap(r => r.analysisRaw?.clothing || []),
                                defects: analysisResults.flatMap(r => r.analysisRaw?.defects || []),
                                timestamp: new Date().toISOString()
                            };
                            sessionStorage.setItem('djahitOrderData', JSON.stringify(formData));
                            sessionStorage.setItem('djahitAnalysisData', JSON.stringify(analysisData));
                            hideLoadingModal();
                            console.log('Analysis complete, redirecting...');
                            window.location.href = 'formpembayaran.html';
                        } catch (error) {
                            console.error('Analysis error:', error);
                            hideLoadingModal();
                            alert('Error during analysis: ' + error.message);
                        }
                    });
            }
            async function analyzeImages(keys, useCustom) {
                const results = [];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    updateProgress((i / keys.length) * 50, `Analyzing image ${i + 1} of ${keys.length}...`);
                    try {
                        const urlRes = await fetch(`${API_BASE}/get-url`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key })
                        });
                        const { getUrl } = await urlRes.json();
                        let analysisRaw, humanReadable;
                        if (useCustom) {
                            updateProgress((i / keys.length) * 50 + 10, `Running YOLO detection...`);
                            const fileRes = await fetch(getUrl);
                            const blob = await fileRes.blob();
                            const formData = new FormData();
                            formData.append("file", blob, key);
                            const yoloRes = await fetch("https://djahit.andikanugra.my.id/predict", {
                                method: "POST",
                                body: formData
                            });
                            analysisRaw = await yoloRes.json();
                            updateProgress((i / keys.length) * 50 + 25, `Generating description...`);
                            const chatbotRes = await fetch("https://3nw62fvjhg.execute-api.us-east-1.amazonaws.com/prod/chatbot", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    useCase: "yolo-analysis",
                                    yoloJson: analysisRaw
                                })
                            });
                            humanReadable = await chatbotRes.json();
                        } else {
                            updateProgress((i / keys.length) * 50 + 10, `Running AWS Rekognition...`);
                            const analysisRes = await fetch(`${API_BASE}/analyze`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key, use_custom: false })
                            });
                            analysisRaw = await analysisRes.json();
                            updateProgress((i / keys.length) * 50 + 25, `Generating description...`);   
                            const chatbotRes = await fetch("https://3nw62fvjhg.execute-api.us-east-1.amazonaws.com/prod/chatbot", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    useCase: "rekognition-analysis",
                                    rekognitionJson: analysisRaw
                                })
                            });
                            humanReadable = await chatbotRes.json();
                        }       
                        results.push({
                            key,
                            imageUrl: getUrl,
                            analysisRaw,
                            analysisText: humanReadable.reply || 'Analysis completed'
                        });
                        
                    } catch (error) {
                        console.error(`Error analyzing image ${i + 1}:`, error);
                        results.push({
                            key,
                            imageUrl: '',
                            analysisRaw: {},
                            analysisText: `Error analyzing image: ${error.message}`
                        });
                    }
                }
                updateProgress(100, 'Analysis complete!');
                await new Promise(resolve => setTimeout(resolve, 500));
                return results;
            }
            window.goBack = function() {
                window.location.href = '../../frontend/page/forminput.html';
            };
        });
        function getCurrentUser() {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        }
        const dropdownButton = document.getElementById('dropdown-button');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const selectedText = document.getElementById('selected-text');
        const actualSelect = document.getElementById('actual-size');
        const dropdownArrow = document.querySelector('.dropdown-arrow');
        const dropdownOptions = document.querySelectorAll('.dropdown-option');
        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('open');
            dropdownArrow.classList.toggle('open');
        });
        dropdownOptions.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                const text = this.textContent.trim();
                selectedText.textContent = text;
                selectedText.classList.remove('text-gray-400');
                selectedText.classList.add('text-gray-700');
                actualSelect.value = value;
                dropdownMenu.classList.remove('open');
                dropdownArrow.classList.remove('open');
                dropdownOptions.forEach(opt => opt.classList.remove('bg-djahit-orange', 'text-white'));              
                this.classList.add('bg-djahit-orange', 'text-white');
            });
        });
        document.addEventListener('click', function(e) {
            if (!dropdownButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('open');
                dropdownArrow.classList.remove('open');
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdownMenu.classList.remove('open');
                dropdownArrow.classList.remove('open');
            }
        });
const API_KEY = '3bc8eb9f8b0767b9d31fb96171e5efc4dfcb3f487fac1d2168cdc8a75ab08d0b';
const BASE_URL = 'https://api.binderbyte.com/wilayah';
const locationState = {
    provinsi: null,
    kota: null,
    kecamatan: null,
    kelurahan: null
};
function initLocationModal() {
    const locationModal = document.getElementById('location-modal');
    const locationDisplay = document.getElementById('location-display');
    const closeLocationModal = document.getElementById('location-close-modal');
    const cancelLocationBtn = document.getElementById('location-cancel-btn');
    const confirmLocationBtn = document.getElementById('location-confirm-btn');
    locationDisplay.addEventListener('click', () => {
        locationModal.classList.add('active');
        loadProvinsi();
    });
    const closeModalFn = () => {
        locationModal.classList.remove('active');
    };
    closeLocationModal.addEventListener('click', closeModalFn);
    cancelLocationBtn.addEventListener('click', closeModalFn);
    locationModal.addEventListener('click', (e) => {
        if (e.target === locationModal) closeModalFn();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && locationModal.classList.contains('active')) {
            closeModalFn();
        }
    });
    confirmLocationBtn.addEventListener('click', () => {
        const fullLocation = `${locationState.kelurahan.name}, ${locationState.kecamatan.name}, ${locationState.kota.name}, ${locationState.provinsi.name}`;
        locationDisplay.value = fullLocation;
        closeModalFn();
    });
    setupLocationSelect('provinsi-btn', 'provinsi-dropdown', 'provinsi-text', (data) => {
        locationState.provinsi = data;
        locationState.kota = null;
        locationState.kecamatan = null;
        locationState.kelurahan = null;
        document.getElementById('kota-btn').classList.remove('disabled');
        document.getElementById('kecamatan-btn').classList.add('disabled');
        document.getElementById('kelurahan-btn').classList.add('disabled');
        document.getElementById('kota-text').textContent = 'Pilih kota/kabupaten';
        document.getElementById('kota-text').classList.remove('selected');
        document.getElementById('kecamatan-text').textContent = 'Pilih kecamatan';
        document.getElementById('kecamatan-text').classList.remove('selected');
        document.getElementById('kelurahan-text').textContent = 'Pilih kelurahan/desa';
        document.getElementById('kelurahan-text').classList.remove('selected');
        confirmLocationBtn.disabled = true;
        loadKota(data.id);
    });
    setupLocationSelect('kota-btn', 'kota-dropdown', 'kota-text', (data) => {
        locationState.kota = data;
        locationState.kecamatan = null;
        locationState.kelurahan = null;
        document.getElementById('kecamatan-btn').classList.remove('disabled');
        document.getElementById('kelurahan-btn').classList.add('disabled');
        document.getElementById('kecamatan-text').textContent = 'Pilih kecamatan';
        document.getElementById('kecamatan-text').classList.remove('selected');
        document.getElementById('kelurahan-text').textContent = 'Pilih kelurahan/desa';
        document.getElementById('kelurahan-text').classList.remove('selected');
        confirmLocationBtn.disabled = true;
        loadKecamatan(data.id);
    });
    setupLocationSelect('kecamatan-btn', 'kecamatan-dropdown', 'kecamatan-text', (data) => {
        locationState.kecamatan = data;
        locationState.kelurahan = null;
        document.getElementById('kelurahan-btn').classList.remove('disabled');
        document.getElementById('kelurahan-text').textContent = 'Pilih kelurahan/desa';
        document.getElementById('kelurahan-text').classList.remove('selected');
        confirmLocationBtn.disabled = true;
        loadKelurahan(data.id);
    });
    setupLocationSelect('kelurahan-btn', 'kelurahan-dropdown', 'kelurahan-text', (data) => {
        locationState.kelurahan = data;
        confirmLocationBtn.disabled = false;
    });
}
function setupLocationSelect(buttonId, dropdownId, textId, onSelect) {
    const btn = document.getElementById(buttonId);
    const dropdown = document.getElementById(dropdownId);
    const text = document.getElementById(textId);
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.classList.contains('disabled')) return;
        const isOpen = dropdown.classList.contains('active');
        closeAllLocationDropdowns();
        if (!isOpen) {
            dropdown.classList.add('active');
            btn.classList.add('open');
        }
    });
    dropdown.addEventListener('click', (e) => {
        if (e.target.classList.contains('location-select-option') && !e.target.classList.contains('loading')) {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            text.textContent = name;
            text.classList.add('selected');
            dropdown.classList.remove('active');
            btn.classList.remove('open');
            onSelect({ id, name });
        }
    });
}
function closeAllLocationDropdowns() {
    document.querySelectorAll('.location-select-dropdown').forEach(d => d.classList.remove('active'));
    document.querySelectorAll('.location-select-button').forEach(b => b.classList.remove('open'));
}
async function loadProvinsi() {
    const dropdown = document.getElementById('provinsi-dropdown');
    dropdown.innerHTML = '<div class="location-select-option loading">Memuat...</div>';
    try {
        const response = await fetch(`${BASE_URL}/provinsi?api_key=${API_KEY}`);
        const data = await response.json();
        if (data.code === '200') {
            dropdown.innerHTML = data.value.map(prov => 
                `<div class="location-select-option" data-id="${prov.id}" data-name="${prov.name}">${prov.name}</div>`
            ).join('');
        } else {
            dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
        }
    } catch (error) {
        console.error('Error loading provinsi:', error);
        dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
    }
}
async function loadKota(provinsiId) {
    const dropdown = document.getElementById('kota-dropdown');
    dropdown.innerHTML = '<div class="location-select-option loading">Memuat...</div>';
    try {
        const response = await fetch(`${BASE_URL}/kabupaten?api_key=${API_KEY}&id_provinsi=${provinsiId}`);
        const data = await response.json();
        if (data.code === '200') {
            dropdown.innerHTML = data.value.map(kota => 
                `<div class="location-select-option" data-id="${kota.id}" data-name="${kota.name}">${kota.name}</div>`
            ).join('');
        } else {
            dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
        }
    } catch (error) {
        console.error('Error loading kota:', error);
        dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
    }
}
async function loadKecamatan(kotaId) {
    const dropdown = document.getElementById('kecamatan-dropdown');
    dropdown.innerHTML = '<div class="location-select-option loading">Memuat...</div>';
    try {
        const response = await fetch(`${BASE_URL}/kecamatan?api_key=${API_KEY}&id_kabupaten=${kotaId}`);
        const data = await response.json();
        if (data.code === '200') {
            dropdown.innerHTML = data.value.map(kec => 
                `<div class="location-select-option" data-id="${kec.id}" data-name="${kec.name}">${kec.name}</div>`
            ).join('');
        } else {
            dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
        }
    } catch (error) {
        console.error('Error loading kecamatan:', error);
        dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
    }
}
async function loadKelurahan(kecamatanId) {
    const dropdown = document.getElementById('kelurahan-dropdown');
    dropdown.innerHTML = '<div class="location-select-option loading">Memuat...</div>';
    try {
        const response = await fetch(`${BASE_URL}/kelurahan?api_key=${API_KEY}&id_kecamatan=${kecamatanId}`);
        const data = await response.json();
        if (data.code === '200') {
            dropdown.innerHTML = data.value.map(kel => 
                `<div class="location-select-option" data-id="${kel.id}" data-name="${kel.name}">${kel.name}</div>`
            ).join('');
        } else {
            dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
        }
    } catch (error) {
        console.error('Error loading kelurahan:', error);
        dropdown.innerHTML = '<div class="location-select-option loading">Gagal memuat data</div>';
    }
}
document.addEventListener('click', closeAllLocationDropdowns);