// VIVR Visual Search - Popup Script

const VIVR_URL = 'https://vivr-lac.vercel.app';

// DOM Elements
const uploadSection = document.getElementById('upload-section');
const previewSection = document.getElementById('preview-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imageUrlInput = document.getElementById('image-url');
const analyzeUrlBtn = document.getElementById('analyze-url-btn');
const previewImage = document.getElementById('preview-image');
const clearBtn = document.getElementById('clear-btn');
const searchBtn = document.getElementById('search-btn');
const newSearchBtn = document.getElementById('new-search-btn');
const viewProductsBtn = document.getElementById('view-products-btn');
const retryBtn = document.getElementById('retry-btn');
const analysisSummary = document.getElementById('analysis-summary');
const errorMessage = document.getElementById('error-message');

let currentImageData = null;
let currentAnalysis = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Check if there's a pending image from context menu
  const { pendingImageUrl } = await chrome.storage.local.get(['pendingImageUrl']);
  if (pendingImageUrl) {
    await chrome.storage.local.remove(['pendingImageUrl']);
    imageUrlInput.value = pendingImageUrl;
    await analyzeFromUrl(pendingImageUrl);
  }
});

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageFile(file);
  }
});

dropZone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleImageFile(file);
  }
});

// URL analysis
analyzeUrlBtn.addEventListener('click', async () => {
  const url = imageUrlInput.value.trim();
  if (url) {
    await analyzeFromUrl(url);
  }
});

imageUrlInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const url = imageUrlInput.value.trim();
    if (url) {
      await analyzeFromUrl(url);
    }
  }
});

// Button handlers
clearBtn.addEventListener('click', resetToUpload);
searchBtn.addEventListener('click', startAnalysis);
newSearchBtn.addEventListener('click', resetToUpload);
retryBtn.addEventListener('click', resetToUpload);

viewProductsBtn.addEventListener('click', () => {
  // Open VIVR visual search page with analysis results
  const searchParams = new URLSearchParams();
  if (currentImageData) {
    if (currentImageData.startsWith('http')) {
      searchParams.set('image', currentImageData);
    }
  }
  if (currentAnalysis && currentAnalysis.searchKeywords) {
    searchParams.set('keywords', currentAnalysis.searchKeywords.join(','));
  }

  chrome.tabs.create({
    url: `${VIVR_URL}/recherche-visuelle?${searchParams.toString()}`
  });
});

// Handle image file
function handleImageFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    showError('L\'image ne doit pas dépasser 10 Mo');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    showPreview(currentImageData);
  };
  reader.readAsDataURL(file);
}

// Analyze from URL
async function analyzeFromUrl(url) {
  currentImageData = url;
  showPreview(url);
  await startAnalysis();
}

// Show preview
function showPreview(src) {
  previewImage.src = src;
  showSection('preview');
}

// Start analysis
async function startAnalysis() {
  if (!currentImageData) return;

  showSection('loading');

  try {
    const body = currentImageData.startsWith('http')
      ? { imageUrl: currentImageData }
      : { image: currentImageData };

    const response = await fetch(`${VIVR_URL}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.success && data.analysis) {
      currentAnalysis = data.analysis;
      displayResults(data.analysis);
    } else {
      showError(data.error || 'Erreur lors de l\'analyse');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    showError('Impossible de contacter le serveur VIVR');
  }
}

// Display results
function displayResults(analysis) {
  let html = '';

  // Description
  if (analysis.description) {
    html += `<p class="analysis-description">${analysis.description}</p>`;
  }

  // Tags
  const tags = [];

  if (analysis.style && analysis.style.length > 0) {
    analysis.style.slice(0, 3).forEach(s => {
      tags.push(`<span class="tag tag-style">${s}</span>`);
    });
  }

  if (analysis.colors && analysis.colors.length > 0) {
    analysis.colors.slice(0, 3).forEach(c => {
      tags.push(`<span class="tag tag-color">${c}</span>`);
    });
  }

  if (analysis.materials && analysis.materials.length > 0) {
    analysis.materials.slice(0, 2).forEach(m => {
      tags.push(`<span class="tag tag-material">${m}</span>`);
    });
  }

  if (tags.length > 0) {
    html += `<div class="tags-container">${tags.join('')}</div>`;
  }

  // Objects
  if (analysis.objects && analysis.objects.length > 0) {
    html += `
      <div class="objects-found">
        <span class="label">Objets détectés :</span>
        <span class="value">${analysis.objects.slice(0, 4).join(', ')}</span>
      </div>
    `;
  }

  // Categories
  if (analysis.suggestedCategories && analysis.suggestedCategories.length > 0) {
    const cats = analysis.suggestedCategories.map(c =>
      `<a href="${VIVR_URL}/categories/${c}" class="category-link">${c}</a>`
    ).join('');
    html += `<div class="categories">${cats}</div>`;
  }

  analysisSummary.innerHTML = html;
  showSection('results');
}

// Show error
function showError(message) {
  errorMessage.textContent = message;
  showSection('error');
}

// Reset to upload
function resetToUpload() {
  currentImageData = null;
  currentAnalysis = null;
  fileInput.value = '';
  imageUrlInput.value = '';
  previewImage.src = '';
  showSection('upload');
}

// Show section
function showSection(section) {
  uploadSection.classList.add('hidden');
  previewSection.classList.add('hidden');
  loadingSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  errorSection.classList.add('hidden');

  switch (section) {
    case 'upload':
      uploadSection.classList.remove('hidden');
      break;
    case 'preview':
      previewSection.classList.remove('hidden');
      break;
    case 'loading':
      loadingSection.classList.remove('hidden');
      break;
    case 'results':
      resultsSection.classList.remove('hidden');
      break;
    case 'error':
      errorSection.classList.remove('hidden');
      break;
  }
}
