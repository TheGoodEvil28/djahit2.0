
        document.addEventListener('DOMContentLoaded', function() {
            $('#navbar-container').load('navbar.html');
            $('#footer-container').load('footer.html');            
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            uploadArea.addEventListener('click', () => {
                fileInput.click();
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
            function handleFiles(files) {
                const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
                if (imageFiles.length === 0) {
                    alert('Please upload image files only (JPG, JPEG, PNG, GIF, etc.)');
                    return;
                }
                imageFiles.forEach((file, index) => {
                    if (file.size > 10 * 1024 * 1024) {
                        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                        return;
                    }
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                    if (validTypes.includes(file.type)) {
                        console.log('File uploaded:', file.name);
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            document.getElementById('uploadedFilesContainer').style.display = 'block';
                            document.getElementById('uploadedFileName').textContent = file.name;
                            updateImagePreview(e.target.result, file.name, index);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert('Hanya file JPG/JPEG/PNG dengan maksimal 10MB yang diperbolehkan.');
                    }
                });
            }
            
            function updateImagePreview(dataUrl, fileName, index) {
                const imageSlots = document.querySelectorAll('#imagePreviewGrid > div');
                const emptySlot = Array.from(imageSlots).find(slot => 
                    slot.classList.contains('border-dashed')
                );
                if (emptySlot) {
                    emptySlot.classList.remove('border-dashed', 'border-gray-300');
                    emptySlot.classList.add('border-solid', 'border-djahit-orange');
                    emptySlot.innerHTML = `
                        <div class="relative w-full h-full">
                            <img src="${dataUrl}" alt="${fileName}" class="w-full h-full object-cover rounded-lg">
                            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                                <div class="truncate">${fileName}</div>
                            </div>
                            <div class="absolute top-1 right-1">
                                <div class="bg-djahit-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    ${Array.from(imageSlots).indexOf(emptySlot) + 1}
                                </div>
                            </div>
                            <button type="button" class="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors remove-preview" data-index="${Array.from(imageSlots).indexOf(emptySlot)}">×</button>
                        </div>
                    `;
                }
            }
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-preview')) {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    removeImagePreview(index);
                }
            });
            
            function removeImagePreview(index) {
                const imageSlots = document.querySelectorAll('#imagePreviewGrid > div');
                if (index < imageSlots.length) {
                    const slot = imageSlots[index];                    
                    slot.innerHTML = `
                        <img src="../assets/img/img-vector.svg" alt="img vector" class="w-6 h-6 md:w-8 md:h-8">
                    `;
                    slot.classList.remove('border-solid', 'border-djahit-orange');
                    slot.classList.add('border-dashed', 'border-gray-300');
                    console.log(`Removed image preview ${index}`);
                }
            }
            const imageSlots = document.querySelectorAll('#imagePreviewGrid > div');
            imageSlots.forEach(slot => {
                slot.addEventListener('click', function(e) {
                    // Don't trigger file input if clicking remove button
                    if (e.target.classList.contains('remove-preview')) {
                        return;
                    }
                    // Only trigger file input for empty slots
                    if (slot.classList.contains('border-dashed')) {
                        fileInput.click();
                    }
                });
            });
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @media (max-width: 640px) {
                    .bg-section-white {
                        border-radius: 0.5rem;
                        padding: 1rem;
                    }
                    #uploadArea {
                        padding: 1rem;
                    }
                    #uploadArea svg {
                        width: 2rem;
                        height: 2rem;
                    }
                    .grid-cols-2.md\\:grid-cols-4 {
                        gap: 0.5rem;
                    }
                    .flex.flex-col.sm\\:flex-row button {
                        width: 100%;
                    }
                }
                @media (min-width: 640px) and (max-width: 1023px) {
                    .lg\\:grid-cols-2 {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .grid-cols-2.md\\:grid-cols-4 {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .space-y-6 > :not([hidden]) ~ :not([hidden]) {
                        --tw-space-y-reverse: 0;
                        margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
                        margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));
                    }
                }
                .aspect-square {
                    aspect-ratio: 1;
                }
                .hover\\:border-djahit-orange:hover {
                    border-color: #E07A5F;
                }
                .transition-colors {
                    transition-property: color, background-color, border-color;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }
                button:focus {
                    box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1);
                }
                input:focus {
                    box-shadow: 0 0 0 3px rgba(224, 122, 95, 0.1);
                }
            `;
            document.head.appendChild(style);
        });
        function goBack() {
            window.location.href = '../../index.html';
            }
 