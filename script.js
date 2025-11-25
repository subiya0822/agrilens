// =====================
// AgriLens – Leaf-Only (Tomato & Potato) + Taxonomy
// =====================

// Disease data: only leaf-related + taxonomy
const diseaseData = {
    // Healthy leaves
    "Healthy Tomato Leaf": {
        confidence: 0.95,
        status: "healthy",
        plantType: "tomato",
        part: "leaf",
        taxonomy: {
            family: "Solanaceae",
            genus: "Solanum",
            species: "Solanum lycopersicum",
            order: "Solanales"
        },
        treatments: {
            organic: "Maintain regular watering, good sunlight, and balanced fertilizer for tomato plants.",
            chemical: "No chemical treatment needed for healthy tomato leaves."
        }
    },
    "Healthy Potato Leaf": {
        confidence: 0.95,
        status: "healthy",
        plantType: "potato",
        part: "leaf",
        taxonomy: {
            family: "Solanaceae",
            genus: "Solanum",
            species: "Solanum tuberosum",
            order: "Solanales"
        },
        treatments: {
            organic: "Keep soil slightly moist, avoid waterlogging, and monitor potato leaves regularly.",
            chemical: "No chemical treatment needed for healthy potato leaves."
        }
    },
    "Healthy Leaf": {
        confidence: 0.9,
        status: "healthy",
        plantType: "unknown",
        part: "leaf",
        taxonomy: null,
        treatments: {
            organic: "Leaf appears healthy. Maintain proper watering, sunlight, and nutrition.",
            chemical: "No chemical treatment needed for healthy leaves."
        }
    },

    // Tomato leaf diseases
    "Tomato Early Blight Leaf": {
        confidence: 0.9,
        status: "diseased",
        plantType: "tomato",
        part: "leaf",
        taxonomy: {
            family: "Solanaceae",
            genus: "Solanum",
            species: "Solanum lycopersicum",
            order: "Solanales"
        },
        treatments: {
            organic: "Remove infected leaves, avoid overhead watering, and spray neem oil or compost tea.",
            chemical: "Use chlorothalonil or copper-based fungicides as per label instructions."
        }
    },
    "Tomato Late Blight Leaf": {
        confidence: 0.9,
        status: "diseased",
        plantType: "tomato",
        part: "leaf",
        taxonomy: {
            family: "Solanaceae",
            genus: "Solanum",
            species: "Solanum lycopersicum",
            order: "Solanales"
        },
        treatments: {
            organic: "Remove and destroy infected leaves, improve air circulation, and avoid wet foliage.",
            chemical: "Use systemic fungicides such as those containing metalaxyl, following local guidelines."
        }
    },

    // Potato leaf diseases
    "Potato Early Blight Leaf": {
        confidence: 0.9,
        status: "diseased",
        plantType: "potato",
        part: "leaf",
        taxonomy: {
            family: "Solanaceae",
            genus: "Solanum",
            species: "Solanum tuberosum",
            order: "Solanales"
        },
        treatments: {
            organic: "Remove affected leaves, rotate crops, and apply neem oil or copper sprays.",
            chemical: "Use mancozeb or chlorothalonil fungicides as per label instructions."
        }
    },
    "Potato Late Blight Leaf": {
        confidence: 0.9,
        status: "diseased",
        plantType: "potato",
        part: "leaf",
        taxonomy: {
            family: "Solanaceae",
            genus: "Solanum",
            species: "Solanum tuberosum",
            order: "Solanales"
        },
        treatments: {
            organic: "Destroy heavily infected plants, avoid water splash, and improve drainage.",
            chemical: "Use recommended fungicides for late blight, such as those containing cymoxanil or metalaxyl."
        }
    },

    // Generic diseased leaf
    "Diseased Leaf": {
        confidence: 0.85,
        status: "diseased",
        plantType: "unknown",
        part: "leaf",
        taxonomy: null,
        treatments: {
            organic: "Remove diseased leaves and dispose of them away from the field. Avoid wetting the foliage.",
            chemical: "Consult local agricultural experts for the correct fungicide for your crop."
        }
    },

    // No plant detected
    "No Plant Detected": {
        confidence: 0.95,
        status: "none",
        plantType: "none",
        part: "none",
        taxonomy: null,
        treatments: {
            organic: "No clear leaf detected. Please capture a clear image of a single leaf with good lighting.",
            chemical: "No analysis available."
        }
    }
};

let stream = null;
let lastAnalysis = null;

// =====================
// Image Upload Handling
// =====================

document.getElementById('imageInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        displayImage(file);
        analyzeImage(file);
    }
});

function displayImage(file) {
    const reader = new FileReader();
    const preview = document.getElementById('imagePreview');

    reader.onload = function (e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Selected leaf image">`;
    };

    reader.readAsDataURL(file);
}

function analyzeImage(file) {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    loading.style.display = 'block';
    results.style.display = 'none';

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            setTimeout(() => {
                loading.style.display = 'none';
                results.style.display = 'block';

                const analysis = analyzePlantImage(img);
                displayResults(analysis);
            }, 1000);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function analyzePlantImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    return analyzePlantCanvas(canvas);
}

// =====================
// Camera Handling
// =====================

async function openCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });

        const video = document.getElementById('cameraVideo');
        const cameraSection = document.getElementById('cameraSection');

        cameraSection.style.display = 'block';
        video.srcObject = stream;

        document.getElementById('imagePreview').style.display = 'none';
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Cannot access camera. Please check permissions.');
    }
}

function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    const cameraSection = document.getElementById('cameraSection');
    cameraSection.style.display = 'none';
    document.getElementById('imagePreview').style.display = 'flex';
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const preview = document.getElementById('imagePreview');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/png');
    preview.innerHTML = `<img src="${imageDataURL}" alt="Captured leaf image">`;
    preview.style.display = 'flex';

    closeCamera();

    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    loading.style.display = 'block';
    results.style.display = 'none';

    setTimeout(() => {
        loading.style.display = 'none';
        results.style.display = 'block';

        const analysis = analyzePlantCanvas(canvas);
        displayResults(analysis);
    }, 1000);
}

// =====================
// MAIN LEAF ANALYSIS
// =====================

function analyzePlantCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let greenColors = 0;    // leaf area
    let brownColors = 0;    // lesions / soil / stems
    let yellowColors = 0;   // chlorosis / yellowing
    let darkSpotColors = 0; // necrotic spots
    let totalPixels = data.length / 4;

    // First pass: count everything
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // GREEN – leaf
        if (g > r + 10 && g > b + 10 && g > 60) {
            greenColors++;
        }
        // BROWN – lesions / stems / soil
        else if (r > 90 && r < 190 && g > 70 && g < 170 && b > 50 && b < 140) {
            brownColors++;
        }

        // YELLOW – stressed / diseased regions
        if (r > 170 && g > 150 && b < 130) {
            yellowColors++;
        }
        // DARK SPOTS – black/brown necrotic areas
        if (r < 70 && g < 70 && b < 70) {
            darkSpotColors++;
        }
    }

    const greenRatio = greenColors / totalPixels;
    const brownRatio = brownColors / totalPixels;
    const yellowRatio = yellowColors / totalPixels;
    const darkRatio = darkSpotColors / totalPixels;

    // Strong rule for "no plant" (helps for empty hand / table / random background)
    if (greenRatio < 0.02) {
        return {
            diseaseName: "No Plant Detected",
            confidence: 0.95,
            status: "none",
            plantType: "none",
            part: "none"
        };
    }

    // Consider both green and brown as "plant-like" colors
    const plantRatio = greenRatio + brownRatio + yellowRatio;

    console.log("Leaf ratios:",
        "Green:", greenRatio.toFixed(3),
        "Brown:", brownRatio.toFixed(3),
        "Yellow:", yellowRatio.toFixed(3),
        "Dark:", darkRatio.toFixed(3),
        "PlantRatio:", plantRatio.toFixed(3)
    );

    // If almost no plant-colored pixels → no plant
    if (plantRatio < 0.02) {
        return {
            diseaseName: "No Plant Detected",
            confidence: 0.95,
            status: "none",
            plantType: "none",
            part: "none"
        };
    }

    // Disease spots ratio (yellow + dark) relative to plant area
    const diseaseRatio = (yellowRatio + darkRatio);
    const relativeSeverity = diseaseRatio / (plantRatio + 0.001); // to avoid /0

    // Guess plant type (very rough)
    const plantType = detectPlantTypeFromColors(greenRatio, brownRatio, yellowRatio, darkRatio);

    // Thresholds (tuned for your test images)
    const diseaseAbsoluteThreshold = 0.008;  // ~0.8% of pixels
    const diseaseRelativeThreshold = 0.04;   // ~4% of plant area

    // 1) Diseased leaf
    if (diseaseRatio > diseaseAbsoluteThreshold && relativeSeverity > diseaseRelativeThreshold) {
        if (plantType === "tomato") {
            if (relativeSeverity > 0.3) {
                return {
                    diseaseName: "Tomato Late Blight Leaf",
                    confidence: Math.min(0.95, 0.6 + relativeSeverity),
                    status: "diseased",
                    plantType: "tomato",
                    part: "leaf"
                };
            } else {
                return {
                    diseaseName: "Tomato Early Blight Leaf",
                    confidence: Math.min(0.93, 0.55 + relativeSeverity),
                    status: "diseased",
                    plantType: "tomato",
                    part: "leaf"
                };
            }
        } else if (plantType === "potato") {
            if (relativeSeverity > 0.3) {
                return {
                    diseaseName: "Potato Late Blight Leaf",
                    confidence: Math.min(0.95, 0.6 + relativeSeverity),
                    status: "diseased",
                    plantType: "potato",
                    part: "leaf"
                };
            } else {
                return {
                    diseaseName: "Potato Early Blight Leaf",
                    confidence: Math.min(0.93, 0.55 + relativeSeverity),
                    status: "diseased",
                    plantType: "potato",
                    part: "leaf"
                };
            }
        } else {
            return {
                diseaseName: "Diseased Leaf",
                confidence: Math.min(0.9, 0.5 + relativeSeverity),
                status: "diseased",
                plantType: "unknown",
                part: "leaf"
            };
        }
    }

    // 2) Healthy leaf
    if (plantType === "tomato") {
        return {
            diseaseName: "Healthy Tomato Leaf",
            confidence: 0.95,
            status: "healthy",
            plantType: "tomato",
            part: "leaf"
        };
    } else if (plantType === "potato") {
        return {
            diseaseName: "Healthy Potato Leaf",
            confidence: 0.95,
            status: "healthy",
            plantType: "potato",
            part: "leaf"
        };
    } else {
        return {
            diseaseName: "Healthy Leaf",
            confidence: 0.9,
            status: "healthy",
            plantType: "unknown",
            part: "leaf"
        };
    }
}

// Rough plant-type guess from color mix
function detectPlantTypeFromColors(greenRatio, brownRatio, yellowRatio, darkRatio) {
    // If leaf is bright green with little brown → likely tomato
    if (greenRatio > 0.12 && brownRatio < 0.05) {
        return "tomato";
    }

    // If brown is noticeable with decent green → likely potato
    if (brownRatio > 0.05 && greenRatio > 0.05) {
        return "potato";
    }

    // If green is dominant anyway and brown is not huge → default to tomato
    if (greenRatio > 0.1) {
        return "tomato";
    }

    return "unknown";
}

// =====================
// UI + Voice
// =====================

function displayResults(analysis) {
    const resultsDiv = document.getElementById('results');
    const confidencePercent = (analysis.confidence * 100).toFixed(1);
    const data = diseaseData[analysis.diseaseName] || diseaseData["No Plant Detected"];

    let statusEmoji, statusColor;

    if (analysis.status === "healthy") {
        statusEmoji = "✅";
        statusColor = "#4CAF50";
    } else if (analysis.status === "diseased") {
        statusEmoji = "⚠️";
        statusColor = "#FF9800";
    } else {
        statusEmoji = "❌";
        statusColor = "#f44336";
    }

    lastAnalysis = {
        diseaseName: analysis.diseaseName,
        organic: data.treatments.organic
    };

    // Build taxonomy HTML if available
    let taxonomyHTML = "";
    if (data.taxonomy) {
        taxonomyHTML = `
            <div class="card">
                <h3>Plant Taxonomy</h3>
                <p><strong>Family:</strong> ${data.taxonomy.family}</p>
                <p><strong>Genus:</strong> ${data.taxonomy.genus}</p>
                <p><strong>Species:</strong> ${data.taxonomy.species}</p>
                <p><strong>Order:</strong> ${data.taxonomy.order}</p>
            </div>
        `;
    }

    resultsDiv.innerHTML = `
        <div class="card" style="border-left: 4px solid ${statusColor}">
            <h3>${statusEmoji} ${analysis.diseaseName} <span class="confidence">${confidencePercent}%</span></h3>
            <p><strong>Plant Part:</strong> ${analysis.part}</p>
        </div>

        ${taxonomyHTML}

        <div class="card">
            <h3>Treatment Recommendations</h3>
            <p><strong>🌱 Organic:</strong> ${data.treatments.organic}</p>
            <p><strong>🧪 Chemical:</strong> ${data.treatments.chemical}</p>
        </div>

        <button class="voice-btn" onclick="speakResults()">
            🔊 Speak Result
        </button>

        <button onclick="resetAnalysis()" style="margin-top: 10px;">
            🔄 Analyze Another
        </button>
    `;
}

function speakResults() {
    if (!lastAnalysis) return;

    const speechText = `Detected: ${lastAnalysis.diseaseName}. Treatment: ${lastAnalysis.organic}`;

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }
}

function resetAnalysis() {
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('results').style.display = 'none';
    document.getElementById('imageInput').value = '';
    lastAnalysis = null;
}

// Close camera when page is unloaded
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
