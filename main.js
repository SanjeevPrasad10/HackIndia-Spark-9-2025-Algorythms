document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultCard = document.getElementById('resultCard');
    const resultText = document.getElementById('resultText');
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceBar = document.getElementById('confidenceBar');
    const previewImage = document.getElementById('previewImage');
    const explanation = document.getElementById('explanation');

    // Deepfake Detection
    async function handleFileUpload() {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file');
            return;
        }

        // Check file type
        if (!file.type.match('image/*|audio/*|video/*')) {
            alert('Please upload an image (JPEG, PNG), audio (MP3, WAV), or video (MP4, AVI) file');
            return;
        }

        // Show preview (only for images)
        const reader = new FileReader();
        reader.onload = async function(e) {
            if (file.type.startsWith('image/')) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            } else {
                previewImage.src = '';
                previewImage.style.display = 'none';
            }

            // Show loading indicator
            loadingIndicator.style.display = 'block';
            resultCard.style.display = 'none';

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Send to server for analysis
                const response = await fetch('/detect', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                loadingIndicator.style.display = 'none';

                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }

                // Display results
                if (data.is_fake) {
                    resultCard.className = 'result-card fake';
                    resultText.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> <span class="text-danger">Potential Deepfake Detected (${data.file_type})</span>`;
                    explanation.innerHTML = `
                        <p>Our analysis suggests this ${data.file_type} may be AI-generated or manipulated.</p>
                        <p>Look for these signs:</p>
                        <ul>
                            ${data.file_type === 'image' ? `
                                <li>Unnatural skin textures</li>
                                <li>Inconsistent lighting/shadow</li>
                                <li>Asymmetrical facial features</li>
                                <li>Blurry or distorted areas</li>
                            ` : data.file_type === 'audio' ? `
                                <li>Unnatural pitch variations</li>
                                <li>Robotic or synthetic tones</li>
                                <li>Inconsistent background noise</li>
                            ` : `
                                <li>Unnatural motion or lip-sync</li>
                                <li>Inconsistent frame transitions</li>
                                <li>Artificial facial movements</li>
                            `}
                        </ul>
                    `;
                } else {
                    resultCard.className = 'result-card real';
                    resultText.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span class="text-success">Authentic ${data.file_type.charAt(0).toUpperCase() + data.file_type.slice(1)}</span>`;
                    explanation.innerHTML = `
                        <p>Our analysis suggests this ${data.file_type} appears to be authentic.</p>
                        <p>Certificate ID: ${data.certificate_id}</p>
                        <p>Issued on: ${new Date().toLocaleString()}</p>
                    `;
                }

                confidenceValue.textContent = data.confidence;
                confidenceBar.style.width = data.confidence + '%';
                confidenceBar.className = `meter-bar ${data.is_fake ? 'bg-danger' : 'bg-success'}`;
                resultCard.style.display = 'block';

                // Smooth scroll to results
                resultCard.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                loadingIndicator.style.display = 'none';
                alert('Error analyzing file: ' + error.message);
            }
        };
        reader.readAsDataURL(file);
    }

    // Event Listeners
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.backgroundColor = 'white';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = 'white';
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload();
        }
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});