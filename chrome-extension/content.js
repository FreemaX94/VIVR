// VIVR Product Importer - Content Script
// Extracts product information from any e-commerce website

(function() {
  'use strict';

  // Site-specific extractors
  const extractors = {
    // Amazon extractor
    amazon: {
      test: () => window.location.hostname.includes('amazon'),
      extract: () => ({
        title: document.querySelector('#productTitle')?.textContent?.trim() ||
               document.querySelector('.product-title-word-break')?.textContent?.trim(),
        description: document.querySelector('#productDescription')?.textContent?.trim() ||
                     document.querySelector('#feature-bullets')?.textContent?.trim() ||
                     document.querySelector('.a-expander-content')?.textContent?.trim(),
        price: extractAmazonPrice(),
        images: extractAmazonImages(),
        currency: 'EUR'
      })
    },

    // eBay extractor
    ebay: {
      test: () => window.location.hostname.includes('ebay'),
      extract: () => ({
        title: document.querySelector('.x-item-title__mainTitle')?.textContent?.trim() ||
               document.querySelector('h1[itemprop="name"]')?.textContent?.trim(),
        description: document.querySelector('#desc_ifr')?.contentDocument?.body?.textContent?.trim() ||
                     document.querySelector('.x-item-description')?.textContent?.trim(),
        price: extractEbayPrice(),
        images: extractEbayImages(),
        currency: 'EUR'
      })
    },

    // AliExpress extractor (updated for 2024-2025 structure)
    aliexpress: {
      test: () => window.location.hostname.includes('aliexpress'),
      extract: () => ({
        title: extractAliExpressTitle(),
        description: extractAliExpressDescription(),
        price: extractAliExpressPrice(),
        images: extractAliExpressImages(),
        currency: 'EUR'
      })
    },

    // Cdiscount extractor
    cdiscount: {
      test: () => window.location.hostname.includes('cdiscount'),
      extract: () => ({
        title: document.querySelector('.fpDesCol h1')?.textContent?.trim() ||
               document.querySelector('[itemprop="name"]')?.textContent?.trim(),
        description: document.querySelector('.fpDescTxt')?.textContent?.trim(),
        price: extractCdiscountPrice(),
        images: extractCdiscountImages(),
        currency: 'EUR'
      })
    },

    // Fnac extractor
    fnac: {
      test: () => window.location.hostname.includes('fnac'),
      extract: () => ({
        title: document.querySelector('.f-productHeader-Title')?.textContent?.trim(),
        description: document.querySelector('.f-productDetails-descriptionContent')?.textContent?.trim(),
        price: extractFnacPrice(),
        images: extractFnacImages(),
        currency: 'EUR'
      })
    },

    // Generic extractor (fallback)
    generic: {
      test: () => true,
      extract: () => ({
        title: extractGenericTitle(),
        description: extractGenericDescription(),
        price: extractGenericPrice(),
        images: extractGenericImages(),
        currency: 'EUR'
      })
    }
  };

  // Amazon specific helpers
  function extractAmazonPrice() {
    const priceWhole = document.querySelector('.a-price-whole')?.textContent?.trim();
    const priceFraction = document.querySelector('.a-price-fraction')?.textContent?.trim();
    if (priceWhole) {
      const price = parseFloat(`${priceWhole.replace(/[^0-9]/g, '')}.${priceFraction || '00'}`);
      return isNaN(price) ? null : price;
    }
    const priceText = document.querySelector('#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen')?.textContent;
    return parsePrice(priceText);
  }

  function extractAmazonImages() {
    const images = [];
    // Main image
    const mainImg = document.querySelector('#landingImage, #imgBlkFront');
    if (mainImg) {
      const src = mainImg.getAttribute('data-old-hires') || mainImg.getAttribute('src');
      if (src) images.push(cleanImageUrl(src));
    }
    // Thumbnail images
    document.querySelectorAll('#altImages img, .imageThumbnail img').forEach(img => {
      let src = img.getAttribute('src');
      if (src && !src.includes('icon') && !src.includes('sprite')) {
        // Convert thumbnail to full size
        src = src.replace(/\._[^.]+_\./, '.');
        if (!images.includes(src)) images.push(cleanImageUrl(src));
      }
    });
    return images.slice(0, 10);
  }

  // eBay specific helpers
  function extractEbayPrice() {
    const priceEl = document.querySelector('.x-price-primary span, [itemprop="price"]');
    return parsePrice(priceEl?.textContent || priceEl?.getAttribute('content'));
  }

  function extractEbayImages() {
    const images = [];
    document.querySelectorAll('.ux-image-carousel-item img, .pic img').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src && src.includes('ebayimg')) {
        images.push(cleanImageUrl(src.replace(/s-l[0-9]+/, 's-l1600')));
      }
    });
    return [...new Set(images)].slice(0, 10);
  }

  // AliExpress specific helpers (updated for 2024-2025)
  function extractAliExpressTitle() {
    // Try multiple selectors - AliExpress changes these frequently
    const selectors = [
      'h1[data-pl="product-title"]',
      '.product-title-text',
      '[class*="ProductTitle"]',
      '[class*="product-title"]',
      '[class*="Title__text"]',
      '[class*="title--wrap"] h1',
      '.pdp-info h1',
      'h1.pdp-mod-product-badge-title',
      '[data-spm="title"] h1',
      'h1'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text && text.length > 5 && text.length < 500) {
        return text;
      }
    }

    // Fallback: try to get from page title
    const pageTitle = document.title;
    if (pageTitle) {
      return pageTitle.split('|')[0].split('-')[0].trim();
    }
    return '';
  }

  function extractAliExpressDescription() {
    const selectors = [
      '.product-description',
      '.detail-desc-decorate-richtext',
      '[class*="ProductDescription"]',
      '[class*="description"]',
      '.pdp-product-desc',
      '[data-pl="product-description"]',
      '.product-overview',
      '[class*="Specification"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text && text.length > 10) {
        return text.substring(0, 2000); // Limit length
      }
    }

    // Try meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    return metaDesc?.getAttribute('content') || '';
  }

  function extractAliExpressPrice() {
    const selectors = [
      '[data-pl="product-price"]',
      '.product-price-value',
      '[class*="Price__current"]',
      '[class*="price--current"]',
      '[class*="product-price"]',
      '.pdp-price',
      '[class*="uniformBannerBoxPrice"]',
      '.snow-price_SnowPrice__mainS__1bjar',
      '[class*="es--wrap"]',
      '.es--wrap--erdmPRe span'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const price = parsePrice(el.textContent);
        if (price && price > 0) return price;
      }
    }

    // Try to find any element with price-like content
    const allElements = document.querySelectorAll('[class*="rice"], [class*="mount"]');
    for (const el of allElements) {
      const price = parsePrice(el.textContent);
      if (price && price > 0 && price < 100000) return price;
    }

    return null;
  }

  function extractAliExpressImages() {
    const images = [];

    // Multiple selector patterns for AliExpress image galleries
    const selectors = [
      '.images-view-item img',
      '.slider--img--D7MJNPZ img',
      '[class*="slider"] img',
      '[class*="gallery"] img',
      '[class*="magnifier"] img',
      '.pdp-info-right img',
      '[class*="image-view"] img',
      '.product-image img',
      '[data-pl="product-image"] img',
      '.main-image img',
      '[class*="ImageView"] img',
      'img[class*="product"]'
    ];

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(img => {
        let src = img.getAttribute('data-src') ||
                  img.getAttribute('src') ||
                  img.getAttribute('data-lazy-src');

        if (src && src.includes('alicdn')) {
          // Clean up the URL - remove size restrictions
          src = src.replace(/_[0-9]+x[0-9]+[^.]*/, '');
          src = src.replace(/_.webp/, '.jpg');
          if (!images.includes(src)) {
            images.push(cleanImageUrl(src));
          }
        }
      });
    }

    // If no images found, try broader search
    if (images.length === 0) {
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src && src.includes('alicdn') && !src.includes('icon') && !src.includes('logo')) {
          if (img.naturalWidth >= 100 || img.width >= 100 || src.includes('product')) {
            images.push(cleanImageUrl(src));
          }
        }
      });
    }

    return [...new Set(images)].slice(0, 10);
  }

  // Cdiscount specific helpers
  function extractCdiscountPrice() {
    const priceEl = document.querySelector('.fpPrice, [itemprop="price"]');
    return parsePrice(priceEl?.textContent || priceEl?.getAttribute('content'));
  }

  function extractCdiscountImages() {
    const images = [];
    document.querySelectorAll('.fpImgMain img, .fpGalImg img').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src) images.push(cleanImageUrl(src));
    });
    return [...new Set(images)].slice(0, 10);
  }

  // Fnac specific helpers
  function extractFnacPrice() {
    const priceEl = document.querySelector('.f-priceBox-price, [itemprop="price"]');
    return parsePrice(priceEl?.textContent || priceEl?.getAttribute('content'));
  }

  function extractFnacImages() {
    const images = [];
    document.querySelectorAll('.f-productVisuals-mainMedia img').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src) images.push(cleanImageUrl(src));
    });
    return [...new Set(images)].slice(0, 10);
  }

  // Generic extractors
  function extractGenericTitle() {
    // Try multiple selectors in order of preference
    const selectors = [
      'h1[itemprop="name"]',
      '[itemprop="name"]',
      '.product-title',
      '.product-name',
      '.product_title',
      '#product-title',
      '#product_title',
      'h1.title',
      '.pdp-title',
      'h1'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    }
    return document.title.split('|')[0].split('-')[0].trim();
  }

  function extractGenericDescription() {
    const selectors = [
      '[itemprop="description"]',
      '.product-description',
      '.product-desc',
      '#product-description',
      '.description',
      '.product-details',
      '.product-info',
      'meta[name="description"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const content = el.tagName === 'META' ? el.getAttribute('content') : el.textContent;
        if (content?.trim()) return content.trim();
      }
    }
    return '';
  }

  function extractGenericPrice() {
    const selectors = [
      '[itemprop="price"]',
      '.price',
      '.product-price',
      '.current-price',
      '.sale-price',
      '.regular-price',
      '#product-price',
      '.offer-price',
      '[data-price]',
      '.price-current'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const price = parsePrice(el.textContent || el.getAttribute('content') || el.getAttribute('data-price'));
        if (price) return price;
      }
    }
    return null;
  }

  function extractGenericImages() {
    const images = [];

    // Try specific product image selectors first
    const productSelectors = [
      '[itemprop="image"]',
      '.product-image img',
      '.product-gallery img',
      '.product-photo img',
      '#product-image img',
      '.main-image img',
      '.gallery img',
      '.swiper-slide img',
      '.carousel-item img'
    ];

    for (const selector of productSelectors) {
      document.querySelectorAll(selector).forEach(img => {
        const src = img.getAttribute('data-src') ||
                    img.getAttribute('data-lazy-src') ||
                    img.getAttribute('src') ||
                    img.getAttribute('content');
        if (src && isValidProductImage(src)) {
          images.push(cleanImageUrl(src));
        }
      });
    }

    // If no images found, try all large images
    if (images.length === 0) {
      document.querySelectorAll('img').forEach(img => {
        if (img.naturalWidth >= 200 && img.naturalHeight >= 200) {
          const src = img.getAttribute('src');
          if (src && isValidProductImage(src)) {
            images.push(cleanImageUrl(src));
          }
        }
      });
    }

    return [...new Set(images)].slice(0, 10);
  }

  // Utility functions
  function parsePrice(text) {
    if (!text) return null;
    // Remove currency symbols and clean up
    const cleaned = text.replace(/[^\d.,]/g, '').trim();
    // Handle European format (1.234,56) vs US format (1,234.56)
    let price;
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Determine format by position of comma vs dot
      const commaPos = cleaned.lastIndexOf(',');
      const dotPos = cleaned.lastIndexOf('.');
      if (commaPos > dotPos) {
        // European format
        price = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
      } else {
        // US format
        price = parseFloat(cleaned.replace(/,/g, ''));
      }
    } else if (cleaned.includes(',')) {
      // Could be either format, assume decimal separator
      price = parseFloat(cleaned.replace(',', '.'));
    } else {
      price = parseFloat(cleaned);
    }
    return isNaN(price) ? null : price;
  }

  function cleanImageUrl(url) {
    if (!url) return '';
    // Make sure URL is absolute
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      url = window.location.origin + url;
    }
    // Remove query parameters that might be for thumbnails
    try {
      const urlObj = new URL(url);
      // Keep the base URL but remove sizing params
      return urlObj.href;
    } catch {
      return url;
    }
  }

  function isValidProductImage(src) {
    if (!src) return false;
    const invalidPatterns = [
      'logo', 'icon', 'sprite', 'banner', 'placeholder',
      'loading', 'pixel', 'tracking', 'ad-', 'advertisement',
      'avatar', 'profile', 'social', 'facebook', 'twitter',
      'instagram', 'pinterest', 'youtube', 'payment', 'card',
      'visa', 'mastercard', 'paypal', 'footer', 'header'
    ];
    const srcLower = src.toLowerCase();
    return !invalidPatterns.some(pattern => srcLower.includes(pattern));
  }

  // Main extraction function
  function extractProductData() {
    // Find the right extractor
    for (const [name, extractor] of Object.entries(extractors)) {
      if (extractor.test()) {
        console.log(`[VIVR] Using ${name} extractor`);
        const data = extractor.extract();
        return {
          ...data,
          sourceUrl: window.location.href,
          sourceDomain: window.location.hostname,
          extractedAt: new Date().toISOString()
        };
      }
    }
    return null;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractProduct') {
      try {
        const productData = extractProductData();
        sendResponse({ success: true, data: productData });
      } catch (error) {
        console.error('[VIVR] Extraction error:', error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Keep message channel open for async response
  });

  console.log('[VIVR] Content script loaded');
})();
