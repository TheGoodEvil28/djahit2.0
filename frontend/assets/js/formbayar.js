    function getAuthToken() {
            return localStorage.getItem('authToken');
        }


        const API_BASE = 'https://6s3e7o4sw6.execute-api.us-east-1.amazonaws.com/prod';
        let analysisData = {};

        document.addEventListener('DOMContentLoaded', function() {
    $('#navbar-container').load('navbar.html');
    $('#footer-container').load('footer.html');

    // Only bind start button
    document.getElementById('startAnalysis').addEventListener('click', loadUploadedData);
});

async function loadUploadedData() {
    try {
        const uploadDataStr = sessionStorage.getItem('djahitUploadData');
        if (!uploadDataStr) {
            showError('No upload data found. Please upload images first.');
            return;
        }

        const uploadData = JSON.parse(uploadDataStr);
        if (!uploadData.keys || uploadData.keys.length === 0) {
            showError('No images found. Please upload images first.');
            return;
        }

        // Get selected analysis type
        const analysisType = document.querySelector('input[name="analysisType"]:checked').value;
        const useCustom = analysisType === "custom";

        // Start analysis
        await analyzeImages(uploadData.keys, useCustom);

    } catch (error) {
        console.error('Error loading upload data:', error);
        showError('Error loading upload data: ' + error.message);
    }
}
async function analyzeImages(keys, useCustom) {
    try {
        const results = [];

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            updateLoadingProgress(i, keys.length, `Analyzing image ${i + 1}...`);

            // 1. Get image URL (from your API)
            const urlRes = await fetch(`${API_BASE}/get-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
            const { getUrl } = await urlRes.json();

            let analysisRaw, humanReadable;

            if (useCustom) {
                // ==== On-Prem YOLO (Defect Analysis) ====
                const fileRes = await fetch(getUrl);
                const blob = await fileRes.blob();
                const formData = new FormData();
                formData.append("file", blob, key);

                const yoloRes = await fetch("https://djahit.andikanugra.my.id/predict", {
                    method: "POST",
                    body: formData
                });

                analysisRaw = await yoloRes.json();

                // === Send YOLO results to Bedrock chatbot ===
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
                // ==== AWS Rekognition (General Clothing Labels) ====
                const analysisRes = await fetch(`${API_BASE}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, use_custom: false })
                });

                analysisRaw = await analysisRes.json();

                // === Send Rekognition results to Bedrock chatbot ===
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
                analysisText: humanReadable.reply
            });
        }

        displayResults(results);

    } catch (err) {
        console.error("Error in analyzeImages:", err);
        showError("Analysis failed: " + err.message);
    }
}





        function updateLoadingProgress(current, total, message) {
            const loading = document.getElementById('loading');
            const progress = ((current / total) * 100).toFixed(0);
            loading.innerHTML = `
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-djahit-orange mx-auto mb-4"></div>
                <p class="text-button-green font-medium">${message}</p>
                <p class="text-sm text-gray-600 mt-2">Progress: ${progress}%</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div class="bg-djahit-orange h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
            `;
        }

        function displayResults(results) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');

    const imageGallery = document.getElementById('imageGallery');
    imageGallery.innerHTML = '';

    const allClothing = [];
    const allDefects = [];

   results.forEach((result, index) => {
    // Display image
    const imageDiv = document.createElement('div');
    imageDiv.className = 'relative group cursor-pointer';
    imageDiv.innerHTML = `
        <img src="${result.imageUrl}" alt="Image ${index + 1}" class="w-full h-24 object-cover rounded-lg border border-gray-300 group-hover:border-djahit-orange transition-colors">
        <div class="absolute bottom-1 right-1 bg-djahit-orange text-white text-xs px-2 py-1 rounded">
            ${index + 1}
        </div>
    `;
    imageDiv.addEventListener('click', () => showFullImage(result.imageUrl, index + 1));
    imageGallery.appendChild(imageDiv);

    // Combine clothing and defects safely
    const clothingItems = result.analysisRaw?.clothing ?? [];
    const defectItems = result.analysisRaw?.defects ?? [];
    allClothing.push(...clothingItems);
    allDefects.push(...defectItems);

    // --- ADD HUMAN-READABLE SUMMARY ---
    if (result.analysisText) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'my-2 p-2 bg-gray-50 rounded text-sm text-gray-800';
        summaryDiv.innerHTML = `<strong>Analysis Summary:</strong> <p>${result.analysisText}</p>`;
        imageGallery.appendChild(summaryDiv);
    }
});


    updateClothingTable(allClothing);
    updateDefectsTable(allDefects);
    updateRecommendations(allDefects);

    // Store for next page
    analysisData = {
        images: results.map(r => ({ url: r.imageUrl, key: r.key })),
        clothing: allClothing,
        defects: allDefects,
        timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('djahitAnalysisData', JSON.stringify(analysisData));
}



        function updateClothingTable(clothing) {
            const tbody = document.querySelector('#clothingTable tbody');
            tbody.innerHTML = '';
            
            if (clothing && clothing.length > 0) {
                // Remove duplicates and sort by confidence
                const uniqueClothing = clothing.reduce((acc, item) => {
                    const existing = acc.find(a => a.Name === item.Name);
                    if (!existing || existing.Confidence < item.Confidence) {
                        return [...acc.filter(a => a.Name !== item.Name), item];
                    }
                    return acc;
                }, []).sort((a, b) => b.Confidence - a.Confidence);

                uniqueClothing.forEach(item => {
                    const parents = (item.Parents || []).map(p => p.Name).join(', ') || 'General';
                    tbody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td class="p-2 border">${item.Name}</td>
                            <td class="p-2 border">${item.Confidence.toFixed(1)}%</td>
                            <td class="p-2 border">${parents}</td>
                        </tr>
                    `);
                });
            } else {
                tbody.innerHTML = '<tr><td class="p-2 border text-center text-gray-500" colspan="3">No clothing detected</td></tr>';
            }
        }

        function updateDefectsTable(defects) {
            const tbody = document.querySelector('#defectsTable tbody');
            tbody.innerHTML = '';
            
            if (defects && defects.length > 0) {
                // Remove duplicates and sort by confidence
                const uniqueDefects = defects.reduce((acc, item) => {
                    const existing = acc.find(a => a.Name === item.Name);
                    if (!existing || existing.Confidence < item.Confidence) {
                        return [...acc.filter(a => a.Name !== item.Name), item];
                    }
                    return acc;
                }, []).sort((a, b) => b.Confidence - a.Confidence);

                uniqueDefects.forEach(item => {
                    tbody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td class="p-2 border">${item.Name}</td>
                            <td class="p-2 border">${item.Confidence.toFixed(1)}%</td>
                        </tr>
                    `);
                });
            } else {
                tbody.innerHTML = '<tr><td class="p-2 border text-center text-gray-500" colspan="2">No defects detected</td></tr>';
            }
        }

        function updateAnalysisSummary(clothing, defects) {
            const summary = document.getElementById('analysisSummary');
            
            const clothingCount = clothing ? clothing.length : 0;
            const defectCount = defects ? defects.length : 0;
            const mainClothing = clothing && clothing.length > 0 ? clothing[0].Name : 'Unknown item';
            const mainDefect = defects && defects.length > 0 ? defects[0].Name : 'No defects';
            
            summary.innerHTML = `
                <div class="space-y-2">
                    <p class="text-sm"><strong>Item Detected:</strong> ${mainClothing}</p>
                    <p class="text-sm"><strong>Total Elements Found:</strong> ${clothingCount} clothing elements</p>
                    <p class="text-sm"><strong>Defects Found:</strong> ${defectCount} potential issues</p>
                    <p class="text-sm"><strong>Primary Concern:</strong> ${mainDefect}</p>
                </div>
            `;
        }

        function updateRecommendations(defects) {
            const recommendations = document.getElementById('recommendations');
            
            if (defects && defects.length > 0) {
                const recs = defects.map(defect => {
                    switch(defect.Name.toLowerCase()) {
                        case 'hole':
                        case 'tear':
                            return 'Professional patching or darning recommended';
                        case 'stain':
                            return 'Specialized cleaning treatment suggested';
                        case 'button':
                            return 'Button replacement or reinforcement needed';
                        case 'zipper':
                            return 'Zipper repair or replacement required';
                        default:
                            return 'Professional assessment recommended';
                    }
                });
                
                const uniqueRecs = [...new Set(recs)];
                recommendations.innerHTML = uniqueRecs.map(rec => 
                    `<div class="flex items-start space-x-2">
                        <svg class="w-4 h-4 text-djahit-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-gray-700">${rec}</p>
                    </div>`
                ).join('');
            } else {
                recommendations.innerHTML = `
                    <div class="flex items-start space-x-2">
                        <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p class="text-sm text-gray-700">No significant defects detected. Item appears to be in good condition.</p>
                    </div>
                `;
            }
        }

        function showFullImage(imageUrl, index) {
            // Create modal for full image view
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="relative max-w-4xl max-h-full">
                    <img src="${imageUrl}" alt="Image ${index}" class="max-w-full max-h-full object-contain rounded-lg">
                    <button class="absolute top-4 right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors" onclick="this.parentElement.parentElement.remove()">×</button>
                    <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
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

        function showError(message) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('errorState').classList.remove('hidden');
            document.getElementById('errorMessage').textContent = message;
        }

        function retryAnalysis() {
            document.getElementById('errorState').classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');
            loadUploadedData();
        }

        function goBack() {
            window.location.href = 'forminput.html';
        }

        // Proceed to payment button handler
        document.getElementById('proceedToPayment').addEventListener('click', function() {
            if (Object.keys(analysisData).length === 0) {
                alert('Analysis data not available. Please complete the analysis first.');
                return;
            }
            
            // Redirect to payment page (your existing payment page)
            window.location.href = '../../index.html';
        });
   