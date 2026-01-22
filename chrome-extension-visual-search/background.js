// VIVR Visual Search - Background Service Worker

const VIVR_URL = 'http://localhost:3000';

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[VIVR Visual Search] Extension installed');

  // Set default settings
  chrome.storage.sync.set({ vivrApiUrl: VIVR_URL });

  // Create context menu for images
  chrome.contextMenus.create({
    id: 'vivr-visual-search',
    title: '🔍 VIVR - Trouver des produits similaires',
    contexts: ['image']
  });

  // Create context menu for selection (selected image)
  chrome.contextMenus.create({
    id: 'vivr-visual-search-link',
    title: '🔍 VIVR - Analyser cette image',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.jpg', '*://*/*.jpeg', '*://*/*.png', '*://*/*.webp', '*://*/*.gif']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let imageUrl = null;

  if (info.menuItemId === 'vivr-visual-search' && info.srcUrl) {
    imageUrl = info.srcUrl;
  } else if (info.menuItemId === 'vivr-visual-search-link' && info.linkUrl) {
    imageUrl = info.linkUrl;
  }

  if (imageUrl) {
    // Store the image URL for the popup
    await chrome.storage.local.set({
      pendingImageUrl: imageUrl,
      pendingImageSource: new URL(tab.url).hostname
    });

    // Open the visual search page
    chrome.storage.sync.get(['vivrApiUrl'], (result) => {
      const baseUrl = result.vivrApiUrl || VIVR_URL;
      chrome.tabs.create({
        url: `${baseUrl}/recherche-visuelle?image=${encodeURIComponent(imageUrl)}`
      });
    });
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeImage') {
    analyzeImage(request.imageUrl || request.imageBase64)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'openVisualSearch') {
    chrome.storage.sync.get(['vivrApiUrl'], (result) => {
      const baseUrl = result.vivrApiUrl || VIVR_URL;
      const url = request.imageUrl
        ? `${baseUrl}/recherche-visuelle?image=${encodeURIComponent(request.imageUrl)}`
        : `${baseUrl}/recherche-visuelle`;
      chrome.tabs.create({ url });
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['vivrApiUrl'], (result) => {
      sendResponse({ vivrApiUrl: result.vivrApiUrl || VIVR_URL });
    });
    return true;
  }

  return true;
});

// Analyze image via API
async function analyzeImage(imageData) {
  try {
    const settings = await chrome.storage.sync.get(['vivrApiUrl']);
    const baseUrl = settings.vivrApiUrl || VIVR_URL;

    const body = imageData.startsWith('http')
      ? { imageUrl: imageData }
      : { image: imageData };

    const response = await fetch(`${baseUrl}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return await response.json();
  } catch (error) {
    console.error('[VIVR Visual Search] Analysis error:', error);
    return { success: false, error: error.message };
  }
}

console.log('[VIVR Visual Search] Background service worker loaded');
