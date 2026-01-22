// VIVR Product Importer - Background Service Worker

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[VIVR] Extension installed');

  // Set default settings
  chrome.storage.sync.get(['vivrApiUrl', 'vivrApiKey'], (result) => {
    if (!result.vivrApiUrl) {
      chrome.storage.sync.set({ vivrApiUrl: 'http://localhost:3000' });
    }
  });

  // Create context menu for images
  chrome.contextMenus.create({
    id: 'vivr-analyze-image',
    title: 'VIVR - Analyser cette image',
    contexts: ['image']
  });

  // Create context menu for page
  chrome.contextMenus.create({
    id: 'vivr-import-product',
    title: 'VIVR - Importer ce produit',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'vivr-analyze-image' && info.srcUrl) {
    // Open visual search page with the image URL
    const imageUrl = encodeURIComponent(info.srcUrl);
    chrome.storage.sync.get(['vivrApiUrl'], (result) => {
      const baseUrl = result.vivrApiUrl || 'http://localhost:3000';
      chrome.tabs.create({
        url: `${baseUrl}/recherche-visuelle?image=${imageUrl}`
      });
    });
  } else if (info.menuItemId === 'vivr-import-product') {
    // Trigger product extraction on the current page
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'extractProduct' }, (response) => {
        if (response && response.success) {
          // Store the extracted data and open popup
          chrome.storage.local.set({ extractedProduct: response.data }, () => {
            chrome.action.openPopup();
          });
        }
      });
    }
  }
});

// Handle extension icon click (optional badge updates)
chrome.action.onClicked.addListener((tab) => {
  // The popup will open automatically, but we can add badge logic here
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    chrome.action.setBadgeText({ text: request.text || '' });
    chrome.action.setBadgeBackgroundColor({ color: request.color || '#667eea' });
  }

  if (request.action === 'analyzeImage') {
    // Analyze image via API
    analyzeImageViaAPI(request.imageUrl || request.imageBase64)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'openVisualSearch') {
    chrome.storage.sync.get(['vivrApiUrl'], (result) => {
      const baseUrl = result.vivrApiUrl || 'http://localhost:3000';
      const url = request.imageUrl
        ? `${baseUrl}/recherche-visuelle?image=${encodeURIComponent(request.imageUrl)}`
        : `${baseUrl}/recherche-visuelle`;
      chrome.tabs.create({ url });
    });
  }

  return true;
});

// Helper function to analyze image via VIVR API
async function analyzeImageViaAPI(imageData) {
  try {
    const settings = await chrome.storage.sync.get(['vivrApiUrl']);
    const baseUrl = settings.vivrApiUrl || 'http://localhost:3000';

    const body = imageData.startsWith('http')
      ? { imageUrl: imageData }
      : { image: imageData };

    const response = await fetch(`${baseUrl}/api/vision/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[VIVR] Image analysis error:', error);
    return { success: false, error: error.message };
  }
}

console.log('[VIVR] Background service worker loaded');
