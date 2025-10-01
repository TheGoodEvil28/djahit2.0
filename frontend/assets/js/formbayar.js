function getAuthToken() {
            return localStorage.getItem('authToken');
    }
const API_CONFIG = {
    baseUrl: 'https://djahit.andikanugra.my.id',
    endpoints: {
        repairRequest: '/api/repair-requests',
        me: '/api/users/me'
    }
};
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}
document.addEventListener('DOMContentLoaded', function() {
    $('#navbar-container').load('navbar.html');
    $('#footer-container').load('footer.html');
    const formData = JSON.parse(sessionStorage.getItem('djahitOrderData') || '{}');
    const analysisData = JSON.parse(sessionStorage.getItem('djahitAnalysisData') || '{}');
    console.log('Loaded form data:', formData);
    console.log('Loaded analysis data:', analysisData);

    if (Object.keys(formData).length === 0) {
        alert('No order data found. Redirecting to form input page.');
        window.location.href = 'forminput.html';
        return;
    }

    displayImageGallery(analysisData);
    displayAnalysisResults(analysisData);
    populateFormData(formData);    
    const pricing = calculateDynamicPricing(formData, analysisData);
    displayPricing(pricing);    
    makeFormReadOnly();    
    setupPaymentSubmission(formData, analysisData, pricing);    
    setupPaymentGateway();
    setupVoucherHandler(formData, analysisData);
});

function displayImageGallery(analysisData) {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) {
        console.error('Image gallery element not found');
        return;
    }
    imageGallery.innerHTML = '';
    
    if (analysisData.images && analysisData.images.length > 0) {
        analysisData.images.forEach((img, index) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'relative group cursor-pointer aspect-square border-2 border-solid border-djahit-orange rounded-lg overflow-hidden';
            imageDiv.innerHTML = `
                <img src="${img.url}" alt="Image ${index + 1}" 
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                    <div class="truncate">Image ${index + 1}</div>
                </div>
                <div class="absolute top-1 right-1">
                    <div class="bg-djahit-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        ${index + 1}
                    </div>
                </div>
            `;
            
            imageDiv.addEventListener('click', () => showFullImage(img.url, index + 1));
            imageGallery.appendChild(imageDiv);
        });
    } else {
        imageGallery.innerHTML = '<p class="text-gray-500 col-span-full text-center">No images uploaded</p>';
    }
}

function displayAnalysisResults(analysisData) {
    const resultBox = document.getElementById('analysisResult');
    
    if (!resultBox) {
        console.error('Analysis result tidak bisa ditemukan');
        return;
    }
    
    if (analysisData.analysisText && analysisData.analysisText.trim()) {
        resultBox.innerHTML = `
            <div class="prose prose-sm max-w-none">
                <p class="text-gray-700 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                    ${analysisData.analysisText}
                </p>
            </div>
        `;
    } else {
        resultBox.innerHTML = `
            <p class="text-gray-500 text-center text-sm md:text-base italic">
                Analysis results not available
            </p>
        `;
    }
}

function populateFormData(formData) {
    if (formData.damageType) {
        const damageRadio = document.querySelector(`input[name="damage_type"][value="${formData.damageType}"]`);
        if (damageRadio) damageRadio.checked = true;
    }
    
    if (formData.clothingType) {
        const clothingRadio = document.querySelector(`input[name="clothing_type"][value="${formData.clothingType}"]`);
        if (clothingRadio) clothingRadio.checked = true;
    }
    
    const fieldMappings = {
        'damage_description': formData.damageDescription,
        'clothing_description': formData.clothingDescription,
        'size': formData.size,
        'location': formData.location,
        'thread_color': formData.threadColor,
        'voucher_code': formData.voucherCode
    };
    
    Object.entries(fieldMappings).forEach(([name, value]) => {
        const element = document.querySelector(`[name="${name}"]`);
        if (element && value) {
            element.value = value;
        }
    });
}

function makeFormReadOnly() {
    document.querySelectorAll('input[type="radio"]:not([name="analysisType"])').forEach(radio => {
        const isPaymentSection = radio.closest('.bg-section-white')?.querySelector('h3')?.textContent?.includes('Payment Gateway');
        if (!isPaymentSection) {
            radio.disabled = true;
            radio.classList.add('cursor-not-allowed');
        }
    });
    document.querySelectorAll('input[type="text"]').forEach(input => {
        if (input.id !== 'customPayment' && input.name !== 'custom_payment') {
            input.disabled = true;
            input.readOnly = true;
            input.classList.add('cursor-not-allowed');
        }
    });
    
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.disabled = true;
        textarea.readOnly = true;
        textarea.classList.add('cursor-not-allowed');
    });
    
    document.querySelectorAll('#paymentForm label').forEach(label => {
        const isPaymentLabel = label.closest('.bg-section-white')?.querySelector('h3')?.textContent?.includes('Payment Gateway');
        if (!isPaymentLabel) {
            label.classList.add('cursor-default');
        }
    });
    
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('cursor-not-allowed');
        option.classList.add('cursor-pointer');
    });
}

function setupPaymentGateway() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const customPaymentInput = document.getElementById('customPayment');
    let selectedPaymentMethod = null;
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => {
                opt.classList.remove('border-djahit-orange', 'bg-orange-50');
                opt.classList.add('border-gray-300');
            });
            
            option.classList.remove('border-gray-300');
            option.classList.add('border-djahit-orange', 'bg-orange-50');
            
            selectedPaymentMethod = option.getAttribute('data-payment');
            
            if (customPaymentInput) {
                customPaymentInput.value = '';
            }
        });
    });
    
    if (customPaymentInput) {
        customPaymentInput.addEventListener('input', function() {
            if (this.value.trim()) {
                paymentOptions.forEach(opt => {
                    opt.classList.remove('border-djahit-orange', 'bg-orange-50');
                    opt.classList.add('border-gray-300');
                });
                selectedPaymentMethod = null;
            }
        });
    }
    
    window.getSelectedPayment = function() {
        if (customPaymentInput && customPaymentInput.value.trim()) {
            return { type: 'custom', value: customPaymentInput.value.trim() };
        }
        if (selectedPaymentMethod) {
            return { type: 'gateway', value: selectedPaymentMethod };
        }
        return null;
    };
}

function setupPaymentSubmission(formData, analysisData, pricing) {
    const paymentForm = document.getElementById('paymentForm');
    
    if (!paymentForm) {
        console.error('Payment form not found');
        return;
    }
    
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const payment = window.getSelectedPayment();
        
        if (!payment) {
            alert('Mohon pilih metode pembayaran atau masukkan metode pembayaran lainnya');
            
            const paymentSection = document.querySelector('.bg-section-white:has(#customPayment)');
            if (paymentSection) {
                paymentSection.classList.add('payment-error');
                setTimeout(() => {
                    paymentSection.classList.remove('payment-error');
                }, 500);
            }
            return;
        }

        const token = getAuthToken();
        if (!token) {
            alert('Anda harus login terlebih dahulu');
            window.location.href = '/frontend/page/login.html';
            return;
        }

        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.phone) {
            alert('Data user tidak lengkap. Silakan login kembali.');
            window.location.href = '/frontend/page/login.html';
            return;
        }

        const submitButton = document.querySelector('button[type="submit"][form="paymentForm"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Memproses...';
        
        const capitalizeFirst = (str) => {
            if (!str) return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };

        const damageTypeMap = {
            'sobek': 'Sobek',
            'kancing_hilang': 'Kancing Hilang',
            'resleting_rusak': 'Resleting Rusak',
            'lainnya': 'Lainnya'
        };

        const clothingTypeMap = {
            'baju': 'Baju',
            'celana': 'Celana',
            'outer': 'Outer',
            'lainnya': 'Lainnya'
        };
        //coba cek
        const imageData = analysisData.images[0];
        console.log('Full image data:', imageData); 


        try {
            const apiPayload = {
                original_img_url: imageData.url,
                img_filename: imageData.filename || imageData.name || imageData.url.split('/').pop().split('?')[0] || 'clothing-image.jpg',
                file_size: parseInt(imageData.size || imageData.fileSize) || 1024, 
                mime_type: imageData.type || imageData.mimeType || imageData.mime_type || 'image/jpeg',
                ai_scan_desc: analysisData.analysisText || '',
                
                damage_type: damageTypeMap[formData.damageType] || 'Lainnya',
                damage_type_other_desc: formData.damageDescription || null,
        
                clothing_type: clothingTypeMap[formData.clothingType] || 'Lainnya',
                clothing_type_other_desc: formData.clothingDescription || null,
                clothing_size: formData.size.toUpperCase(),
                
                pickup_location: formData.location || '',
                pickup_phone: currentUser.phone, 
                
                thread_color_pref: formData.threadColor || null,
                
                estimated_cost: pricing.finalPrice,
                
                status: 'Pending'
            };

            console.log('Sending payload:', apiPayload);

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.repairRequest}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiPayload)
            });

            const result = await response.json();

            console.log('Response status:', response.status);
            console.log('Response data:', result);

            if (!response.ok) {
                console.error('Full error response:', result);
                throw new Error(result.error?.message || `Server error: ${response.status}`);
            }
            if (result.success) {
                const paymentMethodName = payment.type === 'custom' 
                    ? payment.value 
                    : payment.value.toUpperCase();
                
                alert(`Pembayaran berhasil diproses!\n\nDetail:\n- Kerusakan: ${formData.damageType}\n- Pakaian: ${formData.clothingType}\n- Ukuran: ${formData.size}\n- Lokasi: ${formData.location}\n- Pembayaran: ${paymentMethodName}\n- Total: Rp ${pricing.finalPrice.toLocaleString('id-ID')},00`);
                
                sessionStorage.removeItem('djahitOrderData');
                sessionStorage.removeItem('djahitAnalysisData');
                
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1500);
            } else {
                throw new Error('Unexpected response format');
            }

        } catch (error) {
            console.error('Payment submission error:', error);
            alert(`Terjadi kesalahan: ${error.message}\n\nSilakan coba lagi atau hubungi customer service.`);
            
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

function showFullImage(imageUrl, index) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="relative max-w-4xl max-h-full">
            <img src="${imageUrl}" alt="Image ${index}" 
                 class="max-w-full max-h-[90vh] object-contain rounded-lg">
            <button class="absolute top-4 right-4 m-auto bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors text-2xl font-bold shadow-lg" 
                    onclick="this.parentElement.parentElement.remove()">×</button>
            <div class="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
                Image ${index}
            </div>
        </div>
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

window.goBack = function() {
    if (confirm('Kembali ke halaman sebelumnya? Data akan tetap tersimpan.')) {
        window.location.href = 'forminput.html';
    }
};

function calculateDynamicPricing(formData, analysisData) {
    const damageTypePrices = {
        'sobek': 15000,
        'kancing_hilang': 8000,
        'resleting_rusak': 20000,
        'lainnya': 12000
    };
    
    const clothingTypeMultipliers = {
        'baju': 1.0,
        'celana': 1.2,
        'outer': 1.5,
        'lainnya': 1.0
    };
    
    const baseRepairCost = damageTypePrices[formData.damageType] || 10000;
    
    const clothingMultiplier = clothingTypeMultipliers[formData.clothingType] || 1.0;
    const adjustedRepairCost = Math.round(baseRepairCost * clothingMultiplier);
    
    let defectCount = 0;
    let defectCost = 0;
    
    if (analysisData.defects && Array.isArray(analysisData.defects)) {
        defectCount = analysisData.defects.length;
        defectCost = defectCount * 3000; 
    }
    
    let clothingCount = 0;
    if (analysisData.clothing && Array.isArray(analysisData.clothing)) {
        clothingCount = analysisData.clothing.length;
    }
    
    const shippingCost = 5000;
    
    const subtotal = adjustedRepairCost + defectCost + shippingCost;
    
    let discount = 0;
    let voucherCode = formData.voucherCode?.trim().toUpperCase() || '';
    
    if (voucherCode) {
        const voucherDiscounts = {
            'DJAHIT10': { type: 'percentage', value: 10 }, // 10% off
            'DJAHIT15': { type: 'percentage', value: 15 }, // 15% off
            'DJAHIT20': { type: 'percentage', value: 20 }, // 20% off
            'HEMAT5K': { type: 'fixed', value: 5000 },     // Rp 5,000 off
            'HEMAT10K': { type: 'fixed', value: 10000 },   // Rp 10,000 off
            'NEWUSER': { type: 'percentage', value: 25 }   // 25% off for new users
        };
        
        const voucher = voucherDiscounts[voucherCode];
        if (voucher) {
            if (voucher.type === 'percentage') {
                discount = Math.round(subtotal * (voucher.value / 100));
            } else {
                discount = voucher.value;
            }
        }
    }
    
    const finalPrice = Math.max(subtotal - discount, 0); 
    
    return {
        baseRepairCost: adjustedRepairCost,
        damageType: formData.damageType,
        clothingType: formData.clothingType,
        clothingMultiplier: clothingMultiplier,
        defectCount: defectCount,
        defectCost: defectCost,
        clothingCount: clothingCount,
        shippingCost: shippingCost,
        subtotal: subtotal,
        voucherCode: voucherCode,
        discount: discount,
        finalPrice: finalPrice
    };
}

function displayPricing(pricing) {
    const paymentDetailSection = document.querySelector('.space-y-3');
    
    if (!paymentDetailSection) {
        console.error('Payment detail section not found');
        return;
    }
    
    let pricingHTML = `
        <div class="flex justify-between items-center text-xs md:text-sm">
            <span class="text-font-sec font-medium pl-2 md:pl-4">Jasa Jahit (${pricing.damageType})</span>
            <span class="text-font-sec font-medium">Rp ${pricing.baseRepairCost.toLocaleString('id-ID')}</span>
        </div>
    `;
    
    if (pricing.defectCount > 0) {
        pricingHTML += `
            <div class="flex justify-between items-center text-xs md:text-sm">
                <span class="text-font-sec font-medium pl-2 md:pl-4">Perbaikan Kerusakan (${pricing.defectCount} titik)</span>
                <span class="text-font-sec font-medium">Rp ${pricing.defectCost.toLocaleString('id-ID')}</span>
            </div>
        `;
    }
    
    if (pricing.clothingMultiplier > 1.0) {
        pricingHTML += `
            <div class="flex justify-between items-center text-xs md:text-sm">
                <span class="text-font-sec font-medium pl-2 md:pl-4 text-djahit-orange">Kompleksitas ${pricing.clothingType} (×${pricing.clothingMultiplier})</span>
                <span class="text-font-sec font-medium text-djahit-orange">Sudah termasuk</span>
            </div>
        `;
    }
    
    pricingHTML += `
        <div class="flex justify-between items-center text-xs md:text-sm">
            <span class="text-font-sec font-medium pl-2 md:pl-4">Ongkos Kirim</span>
            <span class="text-font-sec font-medium">Rp ${pricing.shippingCost.toLocaleString('id-ID')}</span>
        </div>
    `;
    
    if (pricing.discount > 0) {
        pricingHTML += `
            <div class="flex justify-between items-center text-xs md:text-sm bg-green-50 -mx-2 px-4 py-2 rounded">
                <span class="text-green-700 font-medium">Diskon (${pricing.voucherCode})</span>
                <span class="text-green-700 font-medium">- Rp ${pricing.discount.toLocaleString('id-ID')}</span>
            </div>
        `;
    }
    
    pricingHTML += `
        <hr class="border-gray-300">
        <div class="flex justify-between items-center font-medium text-xs md:text-sm">
            <span class="text-font-sec font-medium pl-1">Total Bayar</span>
            <span class="text-gray-900"></span>
        </div>
    `;
    
    paymentDetailSection.innerHTML = pricingHTML;
    
    const totalPriceDisplay = document.querySelector('.bg-\\[\\#E2E7DB\\] .text-djahit-orange');
    if (totalPriceDisplay) {
        totalPriceDisplay.textContent = `Rp ${pricing.finalPrice.toLocaleString('id-ID')},00`;
    }
    
    console.log('Pricing calculated:', pricing);
}

function setupVoucherHandler(formData, analysisData) {
    
    const voucherInput = document.querySelector('input[name="voucher_code"]');
    if (voucherInput && !voucherInput.disabled) {
        voucherInput.addEventListener('input', function() {
            const updatedFormData = { ...formData, voucherCode: this.value };
            
            const newPricing = calculateDynamicPricing(updatedFormData, analysisData);
            displayPricing(newPricing);
            
            window.currentPricing = newPricing;
        });
    }
}