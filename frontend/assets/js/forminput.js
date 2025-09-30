
        const API_BASE = 'https://6s3e7o4sw6.execute-api.us-east-1.amazonaws.com/prod';
        let uploadedImages = [];
        let uploadedKeys = [];

        document.addEventListener('DOMContentLoaded', function() {
            $('#navbar-container').load('navbar.html');
            $('#footer-container').load('footer.html');
            
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const imageSlots = document.querySelectorAll('.image-slot');
            const proceedBtn = document.getElementById('proceedBtn');

            // Upload area click handler
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            // Individual slot click handlers
            imageSlots.forEach((slot, index) => {
                slot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fileInput.setAttribute('data-target-slot', index);
                    fileInput.click();
                });
            });

            // Drag and drop handlers
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

            // File input change handler
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

                        // 1) Generate presigned PUT URL
                        const res1 = await fetch(`${API_BASE}/generate-upload-url`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename: file.name, contentType: file.type })
                        });
                        const { uploadUrl, key } = await res1.json();

                        // 2) Upload to S3
                        await fetch(uploadUrl, { 
                            method: 'PUT', 
                            body: file, 
                            headers: { 'Content-Type': file.type } 
                        });

                        // Store the key for later use
                        uploadedKeys.push(key);

                        // Display preview
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
                proceedBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                proceedBtn.classList.add('bg-djahit-orange', 'hover:bg-cream', 'hover:text-djahit-orange', 'hover:border', 'hover:border-djahit-orange', 'cursor-pointer');
                proceedBtn.disabled = false;
                proceedBtn.textContent = 'Proceed to Analysis';
                
                proceedBtn.addEventListener('click', function() {
                    // Store uploaded keys in sessionStorage for the next page
                    const uploadData = {
                        keys: uploadedKeys,
                        images: uploadedImages,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Use sessionStorage instead of localStorage to avoid persistence issues
                    const uploadDataStr = JSON.stringify(uploadData);
                    sessionStorage.setItem('djahitUploadData', uploadDataStr);
                    
                    // Redirect to analysis page
                    window.location.href = 'formpembayaran.html';
                });
            }

            // Back button functionality
            window.goBack = function() {
                window.location.href = '../../frontend/page/forminput.html';
            };
        });
    