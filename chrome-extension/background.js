// VIVR Product Importer - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('[VIVR] Extension installed');

  // Set default settings
  chrome.storage.sync.get(['vivrApiUrl', 'vivrApiKey'], (result) => {
    if (!result.vivrApiUrl) {
      chrome.storage.sync.set({ vivrApiUrl: 'http://localhost:3000' });
    }
  });
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
  return true;
});

console.log('[VIVR] Background service worker loaded');
