// VIVR Product Importer - Popup Script

(function() {
  'use strict';

  // State
  let productData = null;
  let selectedImageIndex = 0;
  let categories = [];
  let settings = {
    apiUrl: 'http://localhost:3000',
    apiKey: ''
  };

  // DOM Elements
  const elements = {
    // States
    loadingState: document.getElementById('loadingState'),
    noProductState: document.getElementById('noProductState'),
    productForm: document.getElementById('productForm'),
    successState: document.getElementById('successState'),
    errorState: document.getElementById('errorState'),
    // Settings
    settingsPanel: document.getElementById('settingsPanel'),
    apiUrl: document.getElementById('apiUrl'),
    apiKey: document.getElementById('apiKey'),
    saveSettings: document.getElementById('saveSettings'),
    cancelSettings: document.getElementById('cancelSettings'),
    openSettings: document.getElementById('openSettings'),
    // Product form
    previewImage: document.getElementById('previewImage'),
    imageGallery: document.getElementById('imageGallery'),
    productTitle: document.getElementById('productTitle'),
    productDescription: document.getElementById('productDescription'),
    productPrice: document.getElementById('productPrice'),
    productComparePrice: document.getElementById('productComparePrice'),
    productStock: document.getElementById('productStock'),
    productFeatured: document.getElementById('productFeatured'),
    productCategory: document.getElementById('productCategory'),
    sourceUrl: document.getElementById('sourceUrl'),
    // Buttons
    submitProduct: document.getElementById('submitProduct'),
    retryExtract: document.getElementById('retryExtract'),
    retrySubmit: document.getElementById('retrySubmit'),
    viewProduct: document.getElementById('viewProduct'),
    importAnother: document.getElementById('importAnother'),
    changeImage: document.getElementById('changeImage'),
    // Messages
    successMessage: document.getElementById('successMessage'),
    errorMessage: document.getElementById('errorMessage')
  };

  // Initialize
  async function init() {
    await loadSettings();
    setupEventListeners();
    await extractProduct();
  }

  // Load settings from storage
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['vivrApiUrl', 'vivrApiKey'], (result) => {
        if (result.vivrApiUrl) settings.apiUrl = result.vivrApiUrl;
        if (result.vivrApiKey) settings.apiKey = result.vivrApiKey;
        elements.apiUrl.value = settings.apiUrl;
        elements.apiKey.value = settings.apiKey;
        resolve();
      });
    });
  }

  // Save settings to storage
  async function saveSettings() {
    settings.apiUrl = elements.apiUrl.value.replace(/\/$/, ''); // Remove trailing slash
    settings.apiKey = elements.apiKey.value;

    return new Promise((resolve) => {
      chrome.storage.sync.set({
        vivrApiUrl: settings.apiUrl,
        vivrApiKey: settings.apiKey
      }, () => {
        showToast('Paramètres sauvegardés', 'success');
        hideSettingsPanel();
        resolve();
      });
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Settings
    elements.openSettings.addEventListener('click', showSettingsPanel);
    elements.saveSettings.addEventListener('click', saveSettings);
    elements.cancelSettings.addEventListener('click', hideSettingsPanel);

    // Form submission
    elements.submitProduct.addEventListener('click', submitProduct);

    // Retry buttons
    elements.retryExtract.addEventListener('click', extractProduct);
    elements.retrySubmit.addEventListener('click', () => {
      showState('productForm');
    });

    // Success actions
    elements.viewProduct.addEventListener('click', viewCreatedProduct);
    elements.importAnother.addEventListener('click', () => {
      showState('productForm');
    });

    // Image gallery click
    elements.changeImage.addEventListener('click', () => {
      // Cycle through images
      if (productData?.images?.length > 1) {
        selectedImageIndex = (selectedImageIndex + 1) % productData.images.length;
        updatePreviewImage();
      }
    });
  }

  // Show/hide settings panel
  function showSettingsPanel() {
    elements.settingsPanel.classList.remove('hidden');
  }

  function hideSettingsPanel() {
    elements.settingsPanel.classList.add('hidden');
  }

  // Show specific state
  function showState(stateName) {
    const states = ['loadingState', 'noProductState', 'productForm', 'successState', 'errorState'];
    states.forEach(state => {
      elements[state].classList.toggle('hidden', state !== stateName);
    });
  }

  // Extract product from current page
  async function extractProduct() {
    showState('loadingState');

    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('Aucun onglet actif trouvé');
      }

      // Inject content script if needed and extract data
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        // Content script might already be injected
        console.log('Content script may already be loaded');
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractProduct' });

      if (response?.success && response.data) {
        productData = response.data;
        await populateForm();
        showState('productForm');
      } else {
        showState('noProductState');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      showState('noProductState');
    }
  }

  // Populate form with extracted data
  async function populateForm() {
    if (!productData) return;

    // Set form values
    elements.productTitle.value = productData.title || '';
    elements.productDescription.value = productData.description || '';
    elements.productPrice.value = productData.price || '';
    elements.sourceUrl.textContent = truncateUrl(productData.sourceUrl);
    elements.sourceUrl.title = productData.sourceUrl;

    // Set images
    if (productData.images?.length > 0) {
      selectedImageIndex = 0;
      updatePreviewImage();
      renderImageGallery();
    } else {
      elements.previewImage.src = 'icons/no-image.png';
    }

  }

  // Update preview image
  function updatePreviewImage() {
    if (productData?.images?.[selectedImageIndex]) {
      elements.previewImage.src = productData.images[selectedImageIndex];
    }
    // Update gallery selection
    document.querySelectorAll('.image-gallery img').forEach((img, index) => {
      img.classList.toggle('selected', index === selectedImageIndex);
    });
  }

  // Render image gallery
  function renderImageGallery() {
    elements.imageGallery.innerHTML = '';

    if (!productData?.images?.length) return;

    productData.images.forEach((src, index) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Image ${index + 1}`;
      img.classList.toggle('selected', index === selectedImageIndex);
      img.addEventListener('click', () => {
        selectedImageIndex = index;
        updatePreviewImage();
      });
      img.addEventListener('error', () => {
        img.style.display = 'none';
      });
      elements.imageGallery.appendChild(img);
    });
  }

  // Load categories from API
  async function loadCategories() {
    try {
      const response = await fetch(`${settings.apiUrl}/api/categories`);
      const result = await response.json();

      if (result.success && result.data) {
        categories = result.data;
        renderCategories();
      } else {
        throw new Error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      elements.productCategory.innerHTML = '<option value="">Erreur de chargement</option>';
      showToast('Impossible de charger les catégories. Vérifiez vos paramètres.', 'error');
    }
  }

  // Render categories dropdown
  function renderCategories() {
    elements.productCategory.innerHTML = '<option value="">Sélectionner une catégorie</option>';

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = `${category.name} (${category.productCount || 0} produits)`;
      elements.productCategory.appendChild(option);
    });
  }

  // Generate slug from title
  function generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  // Submit product to VIVR
  async function submitProduct() {
    // Validate form
    if (!elements.productTitle.value.trim()) {
      showToast('Le titre est requis', 'error');
      elements.productTitle.focus();
      return;
    }

    if (!elements.productDescription.value.trim()) {
      showToast('La description est requise', 'error');
      elements.productDescription.focus();
      return;
    }

    if (!elements.productPrice.value || parseFloat(elements.productPrice.value) <= 0) {
      showToast('Le prix doit être supérieur à 0', 'error');
      elements.productPrice.focus();
      return;
    }

    // Disable submit button
    elements.submitProduct.disabled = true;
    elements.submitProduct.innerHTML = `
      <div class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></div>
      Transfert en cours...
    `;

    try {
      const productPayload = {
        name: elements.productTitle.value.trim(),
        slug: generateSlug(elements.productTitle.value),
        description: elements.productDescription.value.trim(),
        price: parseFloat(elements.productPrice.value),
        comparePrice: elements.productComparePrice.value ? parseFloat(elements.productComparePrice.value) : null,
        images: productData?.images || [],
        categoryId: elements.productCategory.value,
        stock: parseInt(elements.productStock.value) || 10,
        featured: elements.productFeatured.checked,
        sourceUrl: productData?.sourceUrl,
        sourceDomain: productData?.sourceDomain
      };

      const response = await fetch(`${settings.apiUrl}/api/extension/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': settings.apiKey
        },
        body: JSON.stringify(productPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Store created product info for viewing
        productData.createdProduct = result.data;
        elements.successMessage.textContent = `"${result.data.name}" a été ajouté à votre boutique.`;
        showState('successState');
      } else {
        throw new Error(result.error || 'Erreur lors de la création du produit');
      }
    } catch (error) {
      console.error('Submit error:', error);
      elements.errorMessage.textContent = error.message;
      showState('errorState');
    } finally {
      // Re-enable submit button
      elements.submitProduct.disabled = false;
      elements.submitProduct.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13"></path>
          <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
        </svg>
        Transférer vers VIVR
      `;
    }
  }

  // View created product
  function viewCreatedProduct() {
    if (productData?.createdProduct?.slug) {
      chrome.tabs.create({
        url: `${settings.apiUrl}/produits/${productData.createdProduct.slug}`
      });
    }
  }

  // Utility functions
  function truncateUrl(url) {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.length > 30
        ? urlObj.pathname.substring(0, 30) + '...'
        : urlObj.pathname;
      return urlObj.hostname + path;
    } catch {
      return url.substring(0, 50) + '...';
    }
  }

  function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();
