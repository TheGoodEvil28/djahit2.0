
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
            if (!currentUser.phone.match(/^(\+62|62|0)[0-9]{9,13}$/)) {
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
                        const size = document.querySelector('input[name="size"]').value;
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
    