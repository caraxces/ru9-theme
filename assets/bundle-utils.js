/**
 * Bundle Utilities - Helper functions for product bundle functionality
 * Extracted from main-product-bundle.liquid for better code organization
 */

// Create BundleUtils object immediately
window.BundleUtils = window.BundleUtils || {};

/**
 * Format money amount from cents to Vietnamese currency format
 * @param {number} cents - Price in cents
 * @returns {string} Formatted currency string
 */
function formatMoney(cents) {
  // Shopify returns price in cents, so we need to divide by 100
  const amount = cents / 100;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
}

// Add formatMoney to BundleUtils
window.BundleUtils.formatMoney = formatMoney;
/**
 * Simple Fixed-Width Sticky for Step 1
 */
function initStep1Sticky(productSection) {
  if (!productSection) return;
  if (window.innerWidth < 991) return; // Desktop only

  const gridContainer = productSection.querySelector('.grid');
  const imageColumn = productSection.querySelector('.product-grid__images');
  const infoColumn = productSection.querySelector('.product-grid__info');

  if (!gridContainer || !imageColumn || !infoColumn) return;

  // Lock column widths immediately to prevent layout shifts
  const setupFixedWidths = () => {
    if (window.innerWidth < 991) return;

    requestAnimationFrame(() => {
      const imageColWidth = imageColumn.offsetWidth;
      const infoColWidth = infoColumn.offsetWidth;
      
      // Only lock widths if they are valid (not 0) and ensure 50% layout
      if (imageColWidth > 0 && infoColWidth > 0) {
        // Ensure both columns maintain 50% width
        const containerWidth = gridContainer.offsetWidth;
        const targetWidth = Math.floor(containerWidth / 2);
        
        // Only set sticky position, let CSS handle the width
        imageColumn.style.position = 'sticky';
        imageColumn.style.top = '120px';
        imageColumn.style.alignSelf = 'start';
        imageColumn.style.flexShrink = '0';
        
        infoColumn.style.flexShrink = '0';
        
        console.log('✅ Step 1 - Locked widths to 50%:', {
          containerWidth: containerWidth,
          targetWidth: targetWidth,
          imageWidth: imageColWidth,
          infoWidth: infoColWidth
        });
      } else {
        console.warn('⚠️ Step 1 - Invalid column widths, skipping width lock:', {
          imageWidth: imageColWidth,
          infoWidth: infoColWidth
        });
      }
    });
  };
  
  setupFixedWidths();
  
  // Re-run on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupFixedWidths();
    }, 250);
  });
  
  // Re-run when accordions toggle
  const accordions = productSection.querySelectorAll('details.product-accordion');
  accordions.forEach(accordion => {
    accordion.addEventListener('toggle', () => {
      setTimeout(setupFixedWidths, 10);
    });
  });
}

// Initialize sticky for Step 1 only - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  const step1Section = document.querySelector('.bundle-step-1');
  if (step1Section) {
    // Delay initialization to ensure layout is stable
    setTimeout(() => {
      initStep1Sticky(step1Section);
    }, 100);
  }
});

// Re-initialize if section reloaded
document.addEventListener('shopify:section:load', function(event) {
  // Check if this is a bundle section by looking for bundle-step-1 class
  const reloadedStep1 = document.querySelector('.bundle-step-1');
  if (reloadedStep1) {
    initStep1Sticky(reloadedStep1);
  }
});

// This code is disabled and was moved from main-product-bundle.liquid
// It contains references to variables that are only available in the main script context
// Keeping it commented out to avoid errors
/*
// Initialize sticky columns for step 2 - DISABLED
// This code requires variables from the main script context and should not be moved
*/

// Initialize sticky columns for step 2
// This function requires the container variable from the main script context
// It should be called from within the main script where container is defined
function initializeStep2StickyColumns(container) {
  if (!container) {
    console.log('Container not provided to initializeStep2StickyColumns');
    return;
  }
  
  const step2Element = container.querySelector('.bundle-step-2');
  if (!step2Element) return;
  
  const gridContainer = step2Element.querySelector('.grid');
  const imageColumn = step2Element.querySelector('.product-single__sticky');
  const infoColumn = step2Element.querySelector('.product-single__meta').parentElement;
  const imageColumnInner = imageColumn ? imageColumn.querySelector('.product-column-content') : null;
  const infoColumnInner = infoColumn ? infoColumn.querySelector('.product-single__meta') : null;
  
  if (!gridContainer || !imageColumn || !infoColumn || !imageColumnInner || !infoColumnInner) {
    console.log('Step 2 sticky elements not found');
    return;
  }
  
  console.log('Initializing step 2 sticky columns');
  
  const setupStickyColumns = () => {
    // Clean up styles from previous calculations before re-running
    let scrollHandler = null;
    imageColumnInner.style.cssText = '';
    infoColumnInner.style.cssText = '';
    imageColumn.style.height = '';
    infoColumn.style.height = '';
    imageColumn.style.position = '';
    infoColumn.style.position = '';

    // This logic is for desktop viewports only
    if (window.innerWidth < 991) {
      return;
    }

    requestAnimationFrame(() => {
      // Measure the inner content elements, not the grid containers which are equal height.
      const imageColHeight = imageColumnInner.offsetHeight;
      const infoColHeight = infoColumnInner.offsetHeight;
      
      // Store original widths to maintain consistent sizing during sticky states
      const imageColWidth = imageColumnInner.offsetWidth;
      const infoColWidth = infoColumnInner.offsetWidth;
      
      // Set the grid container height to the taller column
      const maxHeight = Math.max(imageColHeight, infoColHeight);
      gridContainer.style.height = maxHeight + 'px';
      
      // Make the image column sticky
      imageColumn.style.position = 'sticky';
      imageColumn.style.top = '120px';
      imageColumn.style.alignSelf = 'start';
      
      // Set up scroll handler for dynamic positioning
      scrollHandler = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const containerRect = gridContainer.getBoundingClientRect();
        const containerTop = containerRect.top + scrollTop;
        const containerBottom = containerTop + gridContainer.offsetHeight;
        const viewportBottom = scrollTop + window.innerHeight;
        
        // Calculate sticky positioning
        if (scrollTop + 120 >= containerTop && scrollTop + 120 < containerBottom - imageColHeight) {
          imageColumnInner.style.position = 'sticky';
          imageColumnInner.style.top = '120px';
        } else if (scrollTop + 120 >= containerBottom - imageColHeight) {
          imageColumnInner.style.position = 'absolute';
          imageColumnInner.style.top = (containerBottom - imageColHeight - containerTop) + 'px';
        } else {
          imageColumnInner.style.position = 'static';
          imageColumnInner.style.top = 'auto';
        }
      };
      
      // Add scroll listener
      window.addEventListener('scroll', scrollHandler);
      
      // Initial call
      scrollHandler();
    });
  };
  
  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  const debouncedSetup = debounce(setupStickyColumns, 250);
  
  // Run setup
  debouncedSetup();
  
  // Re-run when the browser is resized
  window.addEventListener('resize', debouncedSetup);
}

// Add functions to BundleUtils for external access
window.BundleUtils.initStep1Sticky = initStep1Sticky;
window.BundleUtils.initializeStep2StickyColumns = initializeStep2StickyColumns;

// Add image update function to BundleUtils
window.BundleUtils.updateBundleProductImage = function(variant, container) {
  // This will be defined inside the initializeBundle function
  if (window.bundleInstance && window.bundleInstance.updateBundleProductImage) {
    return window.bundleInstance.updateBundleProductImage(variant, container);
  }
  console.warn('Bundle instance not available for image update');
};

// Main bundle functionality - will be called from main-product-bundle.liquid
window.BundleUtils.initializeBundle = function(sectionId, currentVariantId, productTitle, productVariants, productFeaturedImage) {
  const container = document.getElementById(`MainProductBundle-${sectionId}`);
  if (!container) return;
  
    // Cache for Shopify product data to avoid repeated API calls
    const productDataCache = {};
  
    // Helper function to fetch product data from Shopify with caching
    async function fetchShopifyProduct(handle) {
      // Check cache first
      if (productDataCache[handle]) {
        console.log('📦 Using cached data for:', handle);
        return productDataCache[handle];
      }
  
      console.log('🌐 Fetching from Shopify:', handle);
      const response = await fetch(`/products/${handle}.js`);
      const shopifyProduct = await response.json();
      
      // Convert Shopify product format to our format
      const productData = {
        id: shopifyProduct.id,
        title: shopifyProduct.title,
        handle: shopifyProduct.handle,
        media: shopifyProduct.media || shopifyProduct.images.map(img => ({
          id: img.id,
          media_type: 'image',
          src: img.src,
          alt: img.alt,
          preview_image: {
            src: img.src,
            aspect_ratio: img.width / img.height
          }
        })),
        variants: shopifyProduct.variants
      };
      
      // Cache the result
      productDataCache[handle] = productData;
      return productData;
    }
  
    // Helper function to render product images HTML for Step 2 (thumbnails below)
    function renderProductImagesHTML(productData, sectionId, step) {
      console.log('🖼️ renderProductImagesHTML called:', {
        step,
        hasProductData: !!productData,
        hasMedia: !!(productData && productData.media),
        mediaLength: productData?.media?.length,
        productTitle: productData?.title
      });
      
      if (!productData || !productData.media || productData.media.length === 0) {
        console.warn('❌ No images to render:', productData);
        return '<div class="product__photos"><p>Không có hình ảnh</p></div>';
      }
      
       // These will be passed as parameters from the main file
       const productCarouselEnable = window.bundleConfig?.productCarouselEnable || false;
       const thumbnailArrows = window.bundleConfig?.thumbnailArrows || false;
      
      console.log('🖼️ Rendering', productData.media.length, 'images for', productData.title);
      
      // Main slideshow HTML
      let slideshowHTML = '';
      productData.media.forEach((media, index) => {
        const mediaUrl = media.preview_image?.src || media.src || '';
        const aspectRatio = media.preview_image?.aspect_ratio || 1;
        
        console.log(`  Image ${index}:`, {
          mediaUrl,
          aspectRatio,
          rawMedia: media,
          previewImage: media.preview_image,
          src: media.src
        });
        
        slideshowHTML += `
          <div class="product-main-slide ${index === 0 ? 'starting-slide' : 'secondary-slide'}" data-index="${index}" ${index === 0 ? 'style="display: block;"' : 'style="display: none;"'}>
            <div data-product-image-main class="product-image-main">
              <div class="image-wrap loaded" style="position: relative; width: 100%; height: auto;">
                <img src="${mediaUrl}" 
                     alt="${productData.title}" 
                     class="product-featured-img lazyautosizes image-element lazyloaded" 
                     style="width: 100%; height: auto; object-fit: contain; display: block;"
                     loading="${index === 0 ? 'eager' : 'lazy'}"
                     data-index="${index}">
              </div>
            </div>
          </div>
        `;
      });
      
      // Thumbnails HTML (below)
      let thumbnailsHTML = '';
      if (productData.media.length > 1) {
        productData.media.forEach((media, index) => {
          const mediaUrl = media.preview_image?.src || media.src || '';
          const aspectRatio = media.preview_image?.aspect_ratio || 1;
          
          thumbnailsHTML += `
            <div class="product__thumb-item" data-index="${index}">
              <a href="${mediaUrl}" data-product-thumb class="product__thumb" data-index="${index}" data-id="${media.id || index}">
                <div class="image-wrap image-wrap__thumbnail" style="height: 0; padding-bottom: ${100 / aspectRatio}%;">
                  <img src="${mediaUrl}" alt="${productData.title}" loading="lazy">
                </div>
              </a>
            </div>
          `;
        });
      }
      
      // Complete HTML structure with thumbnails below
      return `
        <div class="product-column-content" data-product-images>
          <div class="product__photos${productCarouselEnable ? '' : ' product__photos--stack'} product__photos-${sectionId} product__photos--below">
            <div class="product__main-photos" data-product-single-media-group>
              <div data-product-photos class="product-slideshow" id="ProductPhotos-${step}-${sectionId}">
                ${slideshowHTML}
              </div>
            </div>
            
            ${productData.media.length > 1 ? `
              <div data-product-thumbs class="product__thumbs product__thumbs--below">
                ${thumbnailArrows ? `
                  <button type="button" class="product__thumb-arrow product__thumb-arrow--prev hide">
                    <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-chevron-left" viewBox="0 0 284.49 498.98">
                      <path d="M249.49 0a35 35 0 0 1 24.75 59.75L84.49 249.49l189.75 189.74a35.002 35.002 0 1 1-49.5 49.5L10.25 274.24a35 35 0 0 1 0-49.5L224.74 10.25A34.89 34.89 0 0 1 249.49 0Z"/>
                    </svg>
                  </button>
                ` : ''}
                
                <div class="${productCarouselEnable ? 'huan-false' : ''} product__thumbs--scroller">
                  ${thumbnailsHTML}
                </div>
                
                ${thumbnailArrows ? `
                  <button type="button" class="product__thumb-arrow product__thumb-arrow--next">
                    <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-chevron-right" viewBox="0 0 284.49 498.98">
                      <path d="M35 498.98a35 35 0 0 1-24.75-59.75l189.74-189.74L10.25 59.75a35.002 35.002 0 0 1 49.5-49.5l214.49 214.49a35 35 0 0 1 0 49.5L59.75 488.73A34.89 34.89 0 0 1 35 498.98Z"/>
                    </svg>
                  </button>
                ` : ''}
              </div>
            ` : ''}
          </div>
          <button class="custom-nav-button custom-nav-prev" aria-label="Previous image">
            <svg width="17" height="9" viewBox="0 0 17 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1.5L8.5 7.5L15 1.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="custom-nav-button custom-nav-next" aria-label="Next image">
            <svg width="17" height="9" viewBox="0 0 17 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 1.5L8.5 7.5L15 1.5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      `;
    }
    
    // Helper function to initialize Flickity carousel for mobile swipe
    function initializeFlickityForStep(container, step) {
      setTimeout(() => {
        // Try multiple selectors to find the slideshow
        let slideshow = container.querySelector('.product-slideshow, [data-product-photos], .product-main-slideshow');
        if (!slideshow) {
          // For Step 1, look for the main slideshow container
          slideshow = container.querySelector('.product-images, .product-main-images, .product-main-slideshow');
        }
        if (!slideshow) {
          console.warn('⚠️ No slideshow element found for step:', step);
          return;
        }
        
        if (!window.Flickity && !window.theme?.Slideshow) {
          console.warn('⚠️ Flickity library not loaded');
          return;
        }
        
        console.log('🎠 Initializing Flickity for', step, '- element:', slideshow);
        
        // Use theme.Slideshow (wrapper around Flickity) if available
        const SlideClass = window.theme?.Slideshow || Flickity;
        
        try {
          const flickityInstance = new SlideClass(slideshow, {
            cellAlign: 'left',
            contain: true,
            prevNextButtons: false,
            pageDots: true, // Show dots on mobile
            wrapAround: true,
            adaptiveHeight: true,
            draggable: true, // Enable drag/swipe
            freeScroll: false,
            dragThreshold: 10
          });
          
          console.log('✅ Flickity initialized for', step);
          
          // Connect custom nav buttons to Flickity
          const prevBtn = container.querySelector('.custom-nav-prev');
          const nextBtn = container.querySelector('.custom-nav-next');
          if (prevBtn && nextBtn) {
            const flkty = Flickity.data ? Flickity.data(slideshow) : flickityInstance;
            if (flkty) {
              prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (flkty.previous) flkty.previous();
                else if (flkty.flickity?.previous) flkty.flickity.previous();
              });
              nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (flkty.next) flkty.next();
                else if (flkty.flickity?.next) flkty.flickity.next();
              });
              console.log('✅ Nav buttons connected to Flickity');
            }
          }
        } catch (error) {
          console.error('❌ Error initializing Flickity:', error);
        }
      }, 300);
    }
  
     const configElement = document.getElementById(`BundleConfig-${sectionId}`);
     if (!configElement) return;
  
    
    let config;
    try {
      config = JSON.parse(configElement.textContent);
    } catch (error) {
      return;
    }
    
    
    if (config.bundleProducts.length === 0) {
      
      // Try to load products from debug info if available
      if (config.debug && config.debug.sectionSettingsRaw && Array.isArray(config.debug.sectionSettingsRaw)) {
        config.bundleProducts = config.debug.sectionSettingsRaw.map(productHandle => {
          return {
            handle: productHandle,
            title: productHandle, // Fallback title
            id: 0, // Fallback ID
            featured_image: '', // Fallback image
            price: 0, // Fallback price
            description: '', // Fallback description
            variants: [] // Fallback variants
          };
        });
      }
    }
    
    const dynamicContent = container.querySelector('.bundle-dynamic-content');
    const loadingOverlay = container.querySelector('.bundle-loading-overlay');
  
    // Bundle state
    let bundleState = {
      currentStep: 1,
      currentProductIndex: 0,
      bundleQuantity: 1,
       selectedProducts: {
         main: {
           variantId: currentVariantId,
           quantity: 1
         },
         bundle: []
       }
    };
  
    // Initialize variant picker for main product
    initializeVariantPicker();
    
    // Initialize Step 0 (main product page) immediately
    console.log('=== INITIALIZING STEP 0 (Main Product Page) ===');
    
    // Try multiple selectors for Step 0
    let step0Container = document.querySelector('.bundle-step-0');
    if (!step0Container) {
      step0Container = document.querySelector('.product-main-images');
    }
    if (!step0Container) {
      step0Container = document.querySelector('.product-images');
    }
    if (!step0Container) {
      step0Container = document.querySelector('.product-main-slideshow');
    }
    if (!step0Container) {
      step0Container = document.querySelector('[data-section-id] .product-main-slideshow');
    }
    
    console.log('🔍 Step 0 container found:', !!step0Container);
    console.log('🔍 Step 0 container:', step0Container);
    console.log('🔍 Step 0 container class:', step0Container ? step0Container.className : 'N/A');
    
    if (step0Container) {
      // Ensure first slide is visible
      const firstSlide = step0Container.querySelector('.product-main-slide');
      if (firstSlide) {
        firstSlide.style.display = 'block';
        console.log('✅ Step 0: First slide made visible');
      }
      
      // Ensure first thumbnail is active
      const firstThumb = step0Container.querySelector('[data-product-thumb]');
      if (firstThumb) {
        firstThumb.classList.add('active');
        console.log('✅ Step 0: First thumbnail made active');
      }
      
      // Check if thumbnails exist
      const thumbnails = step0Container.querySelectorAll('[data-product-thumb]');
      console.log('Found thumbnails in step 0:', thumbnails.length);
      
      // Check if slideshow exists
      const slideshow = step0Container.querySelector('.product-slideshow, [data-product-photos], .product-main-slideshow');
      console.log('🔍 Step 0 slideshow found:', !!slideshow);
      console.log('🔍 Step 0 slideshow element:', slideshow);
      
      // Check if Flickity already exists
      if (slideshow && window.Flickity) {
        const existingFlickity = Flickity.data(slideshow);
        console.log('🔍 Step 0 existing Flickity:', !!existingFlickity);
      }
      
      // Initialize thumbnail clicks
      setTimeout(() => {
        console.log('🔍 Step 0: Initializing thumbnail clicks...');
        initializeThumbnailClicks(step0Container);
      }, 400);
      
      // Force Flickity initialization
      setTimeout(() => {
        console.log('🎠 Step 0: Force initializing Flickity...');
        initializeFlickityForStep(step0Container, 'step0');
      }, 800);
    } else {
      console.warn('⚠️ Step 0: Container not found');
    }
  
    // Event listeners
    container.addEventListener('click', handleBundleEvents);
    
  
                  function handleBundleEvents(e) {
                  
                  // Add to cart button click
                  if (e.target.closest('.bundle-add-to-cart-btn')) {
                    e.preventDefault();
                    addBundleToCart();
                  }
                  // CTA button click
                  else if (e.target.closest('.bundle-cta-btn') || e.target.closest('[data-bundle-cta]')) {
                    e.preventDefault();
                    
                    // More robust check for bundle products
                    const hasProducts = config.hasBundleProducts === true || config.hasBundleProducts === 'true';
                    const productsArray = Array.isArray(config.bundleProducts) ? config.bundleProducts : [];
                    const hasValidProducts = productsArray.length > 0;
                    
                    // Alternative check using debug info
                    const debugHasProducts = config.debug && config.debug.hasBundleProducts === true;
                    const debugFirstProduct = config.debug && config.debug.firstProduct && config.debug.firstProduct !== '';
                    
                    
                    // Use multiple checks to ensure we have products
                    const shouldProceed = (hasProducts && hasValidProducts) || (debugHasProducts && debugFirstProduct);
                    
                    if (shouldProceed) {
                      showStep(2);
                      loadBundleProduct(0);
                    } else {
                      alert('Chưa có sản phẩm bundle được cấu hình!\n\nĐể thêm sản phẩm vào bundle:\n1. Vào Theme Editor\n2. Chọn section "Product Bundle"\n3. Trong settings, tìm "Bundle Products"\n4. Click "Change" và chọn các sản phẩm muốn thêm vào bundle');
                    }
                  }
  
      // Quantity selector
      if (e.target.closest('.quantity-display')) {
        e.preventDefault();
        const dropdown = e.target.closest('.quantity-dropdown');
        dropdown.classList.toggle('active');
      }
      
      if (e.target.closest('.quantity-option')) {
        e.preventDefault();
        const option = e.target.closest('.quantity-option');
        const newQuantity = parseInt(option.getAttribute('data-value'));
        const dropdown = option.closest('.quantity-dropdown');
        const display = dropdown.querySelector('.quantity-text');
        
        // Update display
        if (display) {
          display.textContent = newQuantity;
        }
        
        // Update data attribute
        dropdown.querySelector('.quantity-display').setAttribute('data-quantity', newQuantity);
        
        // Update selected state
        dropdown.querySelectorAll('.quantity-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        option.classList.add('selected');
        
        // Close dropdown
        dropdown.classList.remove('active');
        
        // Update bundle quantity
        bundleState.bundleQuantity = newQuantity;
        
        // Re-render bundle summary with new quantity
        if (bundleState.currentStep === 3) {
          renderBundleSummary();
        }
      }
      
      // Close dropdown when clicking outside
      if (!e.target.closest('.quantity-dropdown')) {
        container.querySelectorAll('.quantity-dropdown').forEach(dropdown => {
          dropdown.classList.remove('active');
        });
      }
  
      // Back button (only for step 2)
      if (e.target.closest('.bundle-back-btn')) {
        e.preventDefault();
        if (bundleState.currentStep === 2) {
          // Quay lại sản phẩm trước đó trong bundle
          if (bundleState.currentProductIndex > 0) {
            bundleState.currentProductIndex--;
            loadBundleProduct(bundleState.currentProductIndex);
          } else {
            // Nếu đang ở sản phẩm đầu tiên, quay lại step 1
            showStep(1);
          }
        } else if (bundleState.currentStep > 1) {
          showStep(bundleState.currentStep - 1);
        }
      }
  
      // Continue button
      if (e.target.closest('.bundle-continue-btn')) {
        e.preventDefault();
        
        if (bundleState.currentStep === 2) {
          console.log('=== CONTINUE BUTTON CLICKED ===');
          
          // CRITICAL: Save current product selection BEFORE moving to next product
          const currentProduct = config.bundleProducts[bundleState.currentProductIndex];
          if (currentProduct) {
            console.log('Saving current product selection:', currentProduct.title);
            
            // Get selected variant from ProductSelect
            const productSelect = container.querySelector(`#ProductSelect-bundle-${currentProduct.id}`);
            if (productSelect && productSelect.value) {
              const selectedVariantId = productSelect.value;
              const selectedVariant = currentProduct.variants.find(v => v.id.toString() === selectedVariantId.toString());
              
              console.log('Selected variant ID:', selectedVariantId);
              console.log('Selected variant:', selectedVariant);
              
              if (selectedVariant) {
                // Get variant image
                let variantImage = extractImageUrl(currentProduct.featured_image);
                if (selectedVariant.featured_image) {
                  variantImage = extractImageUrl(selectedVariant.featured_image);
                }
                
                // Check if this product already exists in bundle state
                const existingIndex = bundleState.selectedProducts.bundle.findIndex(p => p.productId === currentProduct.id);
                
                // Determine quantity based on product index (0-based, so index 2 = product 3)
                const productQuantity = bundleState.currentProductIndex === 2 ? (config.product3Quantity || 2) : 1;
                
                const productData = {
                  productId: currentProduct.id,
                  productHandle: currentProduct.handle,
                  productTitle: currentProduct.title,
                  image: variantImage,
                  variantId: selectedVariant.id,
                  variantTitle: selectedVariant.title,
                  variantPrice: selectedVariant.price,
                  compareAtPrice: selectedVariant.compare_at_price,
                  variantOptions: selectedVariant.options,
                  quantity: productQuantity
                };
                
                if (existingIndex >= 0) {
                  // Update existing product
                  bundleState.selectedProducts.bundle[existingIndex] = productData;
                  console.log('✅ Updated existing product in bundle state');
                } else {
                  // Add new product
                  bundleState.selectedProducts.bundle.push(productData);
                  console.log('✅ Added new product to bundle state');
                }
                
                console.log('Current bundle state:', bundleState.selectedProducts.bundle);
              }
            }
          }
          
          // Now move to next product or step 3
          if (bundleState.currentProductIndex < config.bundleProducts.length - 1) {
            bundleState.currentProductIndex++;
            loadBundleProduct(bundleState.currentProductIndex);
          } else {
            console.log('All products selected, moving to step 3');
            console.log('Final bundle state:', bundleState.selectedProducts.bundle);
            showStep(3);
            renderBundleSummary();
          }
        }
    }
  
    // Initialize thumbnail click functionality and mobile swipe
    function initializeThumbnailClicks(container) {
      // Try different selectors for thumbnails
      const thumbnails = container.querySelectorAll('[data-product-thumb]').length > 0 
        ? container.querySelectorAll('[data-product-thumb]')
        : container.querySelectorAll('.product__thumb-item a[data-index], .product__thumb[data-index]');
      const slides = container.querySelectorAll('.product-main-slide');
      
      console.log('🖼️ initializeThumbnailClicks:', {
        container: container,
        containerClass: container.className,
        thumbnailsCount: thumbnails.length,
        slidesCount: slides.length,
        allSlides: Array.from(slides).map(s => ({
          class: s.className,
          display: s.style.display,
          index: s.getAttribute('data-index')
        }))
      });
      
      if (!thumbnails.length && !slides.length) {
        console.warn('⚠️ No thumbnails or slides found in container');
        return;
      }
      
      if (!slides.length) {
        console.warn('⚠️ No slides found - might be Flickity carousel');
        return;
      }
      
      // Function to switch to slide by index
      function switchToSlide(targetIndex) {
        console.log('🖼️ Switching to slide:', { targetIndex, totalSlides: slides.length });
        
        // Hide all slides
        slides.forEach(slide => {
          slide.classList.remove('starting-slide');
          slide.classList.add('secondary-slide');
          slide.style.display = 'none';
        });
        
        // Show target slide
        if (slides[targetIndex]) {
          slides[targetIndex].classList.add('starting-slide');
          slides[targetIndex].classList.remove('secondary-slide');
          slides[targetIndex].style.display = 'block';
          console.log('🖼️ Showing slide:', targetIndex);
        }
        
        // Update thumbnail active states
        thumbnails.forEach(t => t.classList.remove('active-thumb'));
        if (thumbnails[targetIndex]) {
          thumbnails[targetIndex].classList.add('active-thumb');
        }
      }
      
      // Check if Flickity carousel is initialized
      const flickityElement = container.querySelector('.product-slideshow, [data-product-photos]');
      const flkty = flickityElement && typeof Flickity !== 'undefined' ? Flickity.data(flickityElement) : null;
      
      if (flkty) {
        console.log('✅ Flickity carousel detected - using Flickity navigation');
        
        // Thumbnail click handlers for Flickity
        thumbnails.forEach((thumb, index) => {
          thumb.addEventListener('click', function(e) {
            e.preventDefault();
            const targetIndex = parseInt(this.getAttribute('data-index'));
            console.log('🖼️ Flickity thumbnail clicked:', targetIndex);
            flkty.select(targetIndex);
            
            // Update thumbnail active states
            thumbnails.forEach(t => t.classList.remove('active-thumb'));
            this.classList.add('active-thumb');
          });
        });
        
        // Set first thumbnail as active
        if (thumbnails[0]) {
          thumbnails[0].classList.add('active-thumb');
        }
        
        // Update active thumbnail when Flickity changes
        flkty.on('change', function(index) {
          thumbnails.forEach((t, i) => {
            if (i === index) {
              t.classList.add('active-thumb');
            } else {
              t.classList.remove('active-thumb');
            }
          });
        });
        
        // Mobile swipe for Flickity (already built-in, just log for debug)
        if (window.innerWidth <= 768) {
          console.log('📱 Mobile swipe enabled via Flickity for', slides.length, 'slides');
        }
        
        return; // Skip custom slide logic
      }
      
      // Thumbnail click handlers for custom slides
      thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function(e) {
          e.preventDefault();
          const targetIndex = parseInt(this.getAttribute('data-index'));
          switchToSlide(targetIndex);
        });
      });
      
      // Mobile swipe functionality
      let touchStartX = 0;
      let touchEndX = 0;
      let currentSlideIndex = 0;
      
      // Try multiple container selectors
      const slideshowContainer = container.querySelector('.product-slideshow') || 
                                  container.querySelector('.product__main-photos') || 
                                  container.querySelector('.product__photos');
      
      if (slideshowContainer && slides.length > 1) {
        console.log('📱 Swipe initialized on:', slideshowContainer, 'with', slides.length, 'slides');
        
        slideshowContainer.addEventListener('touchstart', function(e) {
          touchStartX = e.changedTouches[0].screenX;
          console.log('📱 Touch start:', touchStartX);
        });
        
        slideshowContainer.addEventListener('touchend', function(e) {
          touchEndX = e.changedTouches[0].screenX;
          const swipeDistance = touchStartX - touchEndX;
          const minSwipeDistance = 50;
          
          console.log('📱 Touch end:', { touchEndX, swipeDistance, minSwipeDistance });
          
          // Find current active slide
          slides.forEach((slide, index) => {
            if (slide.classList.contains('starting-slide') || slide.style.display !== 'none') {
              currentSlideIndex = index;
            }
          });
          
          console.log('📱 Current slide index:', currentSlideIndex, 'Total slides:', slides.length);
          
          // Swipe left (next slide)
          if (swipeDistance > minSwipeDistance && currentSlideIndex < slides.length - 1) {
            console.log('📱 Swipe left - next slide');
            switchToSlide(currentSlideIndex + 1);
          }
          // Swipe right (previous slide)
          else if (swipeDistance < -minSwipeDistance && currentSlideIndex > 0) {
            console.log('📱 Swipe right - previous slide');
            switchToSlide(currentSlideIndex - 1);
          }
        });
      } else {
        console.warn('⚠️ Swipe not initialized:', { 
          slideshowContainer: !!slideshowContainer, 
          slidesCount: slides.length 
        });
      }
      
      // Set first thumbnail as active
      if (thumbnails[0]) {
        thumbnails[0].classList.add('active-thumb');
        console.log('🖼️ Set first thumbnail as active');
      }
    }
  
    // Buy now button
      if (e.target.closest('.bundle-buy-now-btn')) {
        e.preventDefault();
        buyBundleNow();
      }
      
      // Change product link
      if (e.target.closest('.bundle-product-change-link')) {
        e.preventDefault();
        const changeLink = e.target.closest('.bundle-product-change-link');
        const productIndex = parseInt(changeLink.getAttribute('data-product-index'));
        console.log('Change product clicked for index:', productIndex);
        changeProduct(productIndex);
      }
    }
  
    function showStep(step) {
      bundleState.currentStep = step;
      
      // Hide all steps
      container.querySelectorAll('.bundle-step').forEach(el => {
        el.style.display = 'none';
      });
      
      // Show current step
      const currentStepEl = container.querySelector(`[data-step="${step}"]`);
      if (currentStepEl) {
        currentStepEl.style.display = 'block';
      }
      
      // Initialize Flickity for Step 3
      if (step === 3) {
        setTimeout(() => {
          const step3Container = document.querySelector('.bundle-step-3');
          if (step3Container) {
            console.log('🎯 Step 3: Initializing Flickity carousel for mobile swipe');
            
            // Find the slideshow element
            const slideshow = step3Container.querySelector('.product-slideshow, [data-product-photos]');
            if (slideshow) {
              // Check if Flickity already initialized
              const existingFlickity = window.Flickity && Flickity.data(slideshow);
              if (existingFlickity) {
                console.log('✅ Step 3: Flickity already initialized');
              } else if (window.theme?.Slideshow || window.Flickity) {
                console.log('🎠 Step 3: Manually initializing Flickity...');
                initializeFlickityForStep(step3Container, 'step3');
              }
            }
            
            // Also init thumbnail clicks
            setTimeout(() => {
              initializeThumbnailClicks(step3Container);
            }, 400);
          }
        }, 100);
      }
      
      // Initialize step 0 (main product page)
      if (step === 0) {
        console.log('=== INITIALIZING STEP 0 (Main Product Page) ===');
        
        // Ensure first slide is visible
        const firstSlide = currentStepEl.querySelector('.product-main-slide');
        if (firstSlide) {
          firstSlide.style.display = 'block';
          console.log('✅ Step 0: First slide made visible');
        }
        
        // Ensure first thumbnail is active
        const firstThumb = currentStepEl.querySelector('[data-product-thumb]');
        if (firstThumb) {
          firstThumb.classList.add('active');
          console.log('✅ Step 0: First thumbnail made active');
        }
        
        // Check if thumbnails exist
        const thumbnails = currentStepEl.querySelectorAll('[data-product-thumb]');
        console.log('Found thumbnails in step 0:', thumbnails.length);
        
        // Check if product__thumbs--scroller exists
        const scroller = currentStepEl.querySelector('.product__thumbs--scroller');
        console.log('Found product__thumbs--scroller:', !!scroller);
        
        if (scroller) {
          console.log('Scroller innerHTML length:', scroller.innerHTML.length);
          console.log('Scroller children count:', scroller.children.length);
        }
        
        // Initialize thumbnail clicks
        setTimeout(() => {
          console.log('🔍 Step 0: Initializing thumbnail clicks...');
          initializeThumbnailClicks(currentStepEl);
        }, 400);
        
        // Force Flickity initialization
        setTimeout(() => {
          console.log('🎠 Step 0: Force initializing Flickity...');
          initializeFlickityForStep(currentStepEl, 'step0');
        }, 800);
      }
      
      // Initialize step 2 - tự động chọn sản phẩm đầu tiên
      if (step === 2) {
        console.log('=== INITIALIZING STEP 2 ===');
        
        // Tự động chọn sản phẩm đầu tiên nếu chưa có sản phẩm nào được chọn
        if (bundleState.selectedProducts.bundle.length === 0 && config.bundleProducts && config.bundleProducts.length > 0) {
          console.log('Auto-selecting first bundle product...');
          const firstProduct = config.bundleProducts[0];
          
          // Tạo sản phẩm mặc định với variant đầu tiên
          const defaultVariant = firstProduct.variants && firstProduct.variants.length > 0 ? firstProduct.variants[0] : null;
          const defaultImage = extractImageUrl(firstProduct.featured_image) || 
                              (firstProduct.media && firstProduct.media.length > 0 ? extractImageUrl(firstProduct.media[0]) : '');
          
          console.log('🔍 Auto-select debug:', {
            firstProduct: firstProduct,
            defaultVariant: defaultVariant,
            firstProductPrice: firstProduct.price,
            defaultVariantPrice: defaultVariant ? defaultVariant.price : 'no variant'
          });
          
          // Determine quantity based on product index
          const productQuantity = bundleState.currentProductIndex === 2 ? (config.product3Quantity || 2) : 1;
          
          const autoSelectedProduct = {
            productId: firstProduct.id,
            productHandle: firstProduct.handle,
            productTitle: firstProduct.title,
            image: defaultImage,
            variantId: defaultVariant ? defaultVariant.id : null,
            variantTitle: defaultVariant ? defaultVariant.title : 'Default Title',
            variantPrice: defaultVariant ? defaultVariant.price : firstProduct.price,
            compareAtPrice: defaultVariant ? defaultVariant.compare_at_price : firstProduct.compare_at_price,
            variantOptions: defaultVariant ? defaultVariant.options : [],
            quantity: productQuantity
          };
          
          bundleState.selectedProducts.bundle.push(autoSelectedProduct);
          console.log('✅ Auto-selected first product:', autoSelectedProduct);
        }
        
        // Initialize Step 0 (main product page) first
        console.log('=== INITIALIZING STEP 0 (Main Product Page) ===');
        
        // Try multiple selectors for Step 0
        let step0Container = document.querySelector('.bundle-step-0');
        if (!step0Container) {
          step0Container = document.querySelector('.product-main-images');
        }
        if (!step0Container) {
          step0Container = document.querySelector('.product-images');
        }
        if (!step0Container) {
          step0Container = document.querySelector('.product-main-slideshow');
        }
        if (!step0Container) {
          step0Container = document.querySelector('[data-section-id] .product-main-slideshow');
        }
        
        console.log('🔍 Step 0 container found:', !!step0Container);
        console.log('🔍 Step 0 container:', step0Container);
        console.log('🔍 Step 0 container class:', step0Container ? step0Container.className : 'N/A');
        
        if (step0Container) {
          // Ensure first slide is visible
          const firstSlide = step0Container.querySelector('.product-main-slide');
          if (firstSlide) {
            firstSlide.style.display = 'block';
            console.log('✅ Step 0: First slide made visible');
          }
          
          // Ensure first thumbnail is active
          const firstThumb = step0Container.querySelector('[data-product-thumb]');
          if (firstThumb) {
            firstThumb.classList.add('active');
            console.log('✅ Step 0: First thumbnail made active');
          }
          
          // Check if thumbnails exist
          const thumbnails = step0Container.querySelectorAll('[data-product-thumb]');
          console.log('Found thumbnails in step 0:', thumbnails.length);
          
          // Check if slideshow exists
          const slideshow = step0Container.querySelector('.product-slideshow, [data-product-photos], .product-main-slideshow');
          console.log('🔍 Step 0 slideshow found:', !!slideshow);
          console.log('🔍 Step 0 slideshow element:', slideshow);
          
          // Check if Flickity already exists
          if (slideshow && window.Flickity) {
            const existingFlickity = Flickity.data(slideshow);
            console.log('🔍 Step 0 existing Flickity:', !!existingFlickity);
          }
          
          // Initialize thumbnail clicks
          setTimeout(() => {
            console.log('🔍 Step 0: Initializing thumbnail clicks...');
            initializeThumbnailClicks(step0Container);
          }, 400);
          
          // Force Flickity initialization
          setTimeout(() => {
            console.log('🎠 Step 0: Force initializing Flickity...');
            initializeFlickityForStep(step0Container, 'step0');
          }, 800);
        } else {
          console.warn('⚠️ Step 0: Container not found');
        }
        
        // Load the first bundle product
        console.log('Loading first bundle product...');
        loadBundleProduct(0);
        
        // Initialize Step 1 (copy logic from working Step 2 & 3)
        setTimeout(() => {
          console.log('=== INITIALIZING STEP 1 ===');
          const step1Container = document.querySelector('.bundle-step-1');
          
          if (step1Container) {
            // Ensure first slide is visible (like Step 3)
            const firstSlide = step1Container.querySelector('.product-main-slide');
            if (firstSlide) {
              firstSlide.style.display = 'block';
              console.log('✅ Step 1: First slide made visible');
            }
            
            // Ensure first thumbnail is active (like Step 3)
            const firstThumb = step1Container.querySelector('[data-product-thumb]');
            if (firstThumb) {
              firstThumb.classList.add('active');
              console.log('✅ Step 1: First thumbnail made active');
            }
            
            // Check if thumbnails exist (like Step 3)
            const thumbnails = step1Container.querySelectorAll('[data-product-thumb]');
            console.log('Found thumbnails in step 1:', thumbnails.length);
            
            // Check if product__thumbs--scroller exists (like Step 3)
            const scroller = step1Container.querySelector('.product__thumbs--scroller');
            console.log('Found product__thumbs--scroller:', !!scroller);
            
            if (scroller) {
              console.log('Scroller innerHTML length:', scroller.innerHTML.length);
              console.log('Scroller children count:', scroller.children.length);
            }
            
            // Initialize thumbnail clicks (like Step 2 & 3)
            setTimeout(() => {
              console.log('🔍 Step 1: Initializing thumbnail clicks...');
              initializeThumbnailClicks(step1Container);
            }, 400);
            
             // Initialize Step 1 slideshow immediately
             const step1Slideshow = step1Container.querySelector(`#ProductPhotos-${sectionId}`);
            if (step1Slideshow && window.Flickity) {
              // Check if Flickity already exists
              const existingFlickity = Flickity.data(step1Slideshow);
              if (!existingFlickity) {
                const flickityInstance = new Flickity(step1Slideshow, {
                  cellAlign: 'left',
                  contain: true,
                  prevNextButtons: false,
                  pageDots: window.innerWidth <= 768 ? true : false, // Show dots on mobile
                  wrapAround: true,
                  draggable: true, // Enable drag/swipe for all screen sizes
                  adaptiveHeight: true,
                  dragThreshold: 10,
                  selectedAttraction: 0.025,
                  friction: 0.28
                });
                console.log('✅ Step 1: Flickity initialized for swipe');
              } else {
                console.log('✅ Step 1: Flickity already initialized');
              }
            } else if (step1Slideshow && window.theme?.Slideshow) {
              // Fallback to theme.Slideshow if Flickity not available
              const slideshowInstance = new theme.Slideshow(step1Slideshow, {
                cellAlign: 'left',
                contain: true,
                prevNextButtons: false,
                pageDots: window.innerWidth <= 768 ? true : false, // Show dots on mobile
                wrapAround: true,
                draggable: true, // Enable drag/swipe for all screen sizes
                adaptiveHeight: true,
                dragThreshold: 10,
                selectedAttraction: 0.025,
                friction: 0.28
              });
              console.log('✅ Step 1: Theme Slideshow initialized for swipe');
            } else {
              console.warn('⚠️ Step 1: Neither Flickity nor theme.Slideshow available');
            }
            
            // Force Flickity initialization (like Step 2 & 3)
            setTimeout(() => {
              console.log('🎠 Step 1: Force initializing Flickity...');
              initializeFlickityForStep(step1Container, 'step1');
              
                 // Additional mobile-specific initialization
                 if (window.innerWidth <= 768) {
                   console.log('📱 Step 1: Mobile-specific Flickity setup...');
                   const mobileSlideshow = step1Container.querySelector(`#ProductPhotos-${sectionId}`);
                if (mobileSlideshow && window.Flickity) {
                  const existingFlickity = Flickity.data(mobileSlideshow);
                  if (existingFlickity) {
                    // Force refresh for mobile
                    existingFlickity.resize();
                    existingFlickity.reposition();
                    console.log('📱 Step 1: Mobile Flickity refreshed');
                  }
                }
              }
            }, 800);
          } else {
            console.warn('⚠️ Step 1: Container not found');
          }
        }, 1500);
        
        // Initialize sticky columns for step 2
        setTimeout(() => {
          if (window.BundleUtils && window.BundleUtils.initializeStep2StickyColumns) {
            window.BundleUtils.initializeStep2StickyColumns(container);
          }
        }, 100);
      }
      
      // Initialize step 3 if needed
      if (step === 3) {
        console.log('=== INITIALIZING STEP 3 ===');
        
        // Initialize quantity selector
        initializeQuantitySelector();
        
        // Ensure first slide is visible
        const firstSlide = currentStepEl.querySelector('.product-main-slide');
        if (firstSlide) {
          firstSlide.style.display = 'block';
          console.log('✅ First slide made visible');
        }
        
        // Ensure first thumbnail is active
        const firstThumb = currentStepEl.querySelector('[data-product-thumb]');
        if (firstThumb) {
          firstThumb.classList.add('active');
          console.log('✅ First thumbnail made active');
        }
        
        // Check if thumbnails exist
        const thumbnails = currentStepEl.querySelectorAll('[data-product-thumb]');
        console.log('Found thumbnails in step 3:', thumbnails.length);
        
        // Check if product__thumbs--scroller exists
        const scroller = currentStepEl.querySelector('.product__thumbs--scroller');
        console.log('Found product__thumbs--scroller:', !!scroller);
        
        if (scroller) {
          console.log('Scroller innerHTML length:', scroller.innerHTML.length);
          console.log('Scroller children count:', scroller.children.length);
        }
      }
    }
  
    async function loadBundleProduct(index) {
      console.log('=== LOAD BUNDLE PRODUCT DEBUG ===');
      console.log('Index:', index);
      console.log('Config bundleProducts:', config.bundleProducts);
      console.log('Config bundleProducts length:', config.bundleProducts.length);
      console.log('Config bundleProducts type:', typeof config.bundleProducts);
      
      const product = config.bundleProducts[index];
      console.log('Product at index', index, ':', product);
      
      if (!product) {
        console.error('No product found at index:', index);
        return;
      }
  
      bundleState.currentProductIndex = index;
      
      // Update progress
      const progressCurrent = container.querySelector('.bundle-progress-current');
      const progressTotal = container.querySelector('.bundle-progress-total');
      if (progressCurrent) {
        progressCurrent.textContent = index + 1;
      }
      if (progressTotal) {
        progressTotal.textContent = config.bundleProducts.length;
      }
  
       // Step 2: Fetch real product data from Shopify and render images
       const step2ImageColumn = document.getElementById(`Step2ImageColumn-${sectionId}`);
      console.log('Step 2 Image Column found:', !!step2ImageColumn);
      console.log('Product handle:', product.handle);
      
      if (step2ImageColumn && product && product.handle) {
        // Fetch real product data from Shopify (with caching)
        fetchShopifyProduct(product.handle)
          .then(productData => {
            console.log('🎯 Product Data:', productData);
            console.log('🎯 Media:', productData.media);
            
             const imageHTML = renderProductImagesHTML(productData, sectionId, 'step2');
            step2ImageColumn.innerHTML = imageHTML;
            console.log('✅ Step 2 images rendered');
            
            // Initialize Flickity carousel for Step 2 (for mobile swipe)
            setTimeout(() => {
              const step2Container = document.querySelector('.bundle-step-2');
              if (step2Container) {
                console.log('🎯 Step 2: Initializing Flickity carousel for mobile swipe');
                initializeFlickityForStep(step2Container, 'step2');
                
                // Also init thumbnail clicks (will detect Flickity and use it)
                setTimeout(() => {
                  initializeThumbnailClicks(step2Container);
                }, 400);
              }
            }, 100);
            
            // Debug CSS after rendering
            setTimeout(() => {
              const slides = step2ImageColumn.querySelectorAll('.product-main-slide');
              const images = step2ImageColumn.querySelectorAll('img');
              console.log('🔍 Step 2 Debug - Slides found:', slides.length);
              console.log('🔍 Step 2 Debug - Images found:', images.length);
              
              slides.forEach((slide, idx) => {
                const computedStyle = window.getComputedStyle(slide);
                console.log(`🔍 Slide ${idx}:`, {
                  display: computedStyle.display,
                  visibility: computedStyle.visibility,
                  opacity: computedStyle.opacity,
                  classes: slide.className
                });
              });
              
              images.forEach((img, idx) => {
                const computedStyle = window.getComputedStyle(img);
                console.log(`🔍 Image ${idx}:`, {
                  display: computedStyle.display,
                  visibility: computedStyle.visibility,
                  opacity: computedStyle.opacity,
                  src: img.src,
                  loaded: img.complete
                });
              });
            }, 100);
            
            // Flickity is now always initialized for mobile swipe (handled above)
            // No need for duplicate initialization here
          })
          .catch(error => {
            console.error('❌ Error fetching product data:', error);
            step2ImageColumn.innerHTML = '<p>Không thể tải hình ảnh sản phẩm</p>';
          });
      } else {
        console.error('❌ Cannot render Step 2 images:', {
          hasColumn: !!step2ImageColumn,
          hasProduct: !!product,
          hasHandle: !!(product && product.handle)
        });
      }
  
      // Render product info in the right column
      const productsGrid = container.querySelector('.bundle-products-grid');
      console.log('Products grid element:', productsGrid);
      
      if (productsGrid) {
        try {
              console.log('Loading bundle product:', product.handle);
      console.log('Product data:', {
        title: product.title,
        price: product.price,
        description: product.description,
        variants: product.variants,
        featured_image: product.featured_image
      });
      
      // Debug variant structure
      if (product.variants && product.variants.length > 0) {
        console.log('Product variants count:', product.variants.length);
        console.log('First variant:', product.variants[0]);
        console.log('First variant options:', product.variants[0].options);
        console.log('Product options:', product.options);
      }
          
          // Use simplified product template structure for right column only
          const productHTML = `
            <div class="bundle-product-item" data-product-handle="${product.handle}" data-section-id="${config.sectionId}" data-product-id="${product.id}">
                        <!-- Product Header -->
                        <div class="product-block product-block--header">
                          <h1 class="h2 product-single__title">${product.title}</h1>
                        </div>
  
                        <!-- Price Block -->
                        <div class="product-block product-block--price">
                          <div class="price-container-wrapper">
                            <span class="product__price text-2xl f-smb" data-product-price data-product-price-base="${product.price}">
                              ${BundleUtils.formatMoney(product.price)}
                            </span>
                            ${product.compare_at_price ? `
                              <span class="product__price product__price--compare text-xl" data-compare-price>
                                ${BundleUtils.formatMoney(product.compare_at_price)}
                              </span>
                              <div class="product__discount-badge">
                                -${Math.round((product.compare_at_price - product.price) / product.compare_at_price * 100)}%
                              </div>
                            ` : ''}
                          </div>
                          
  
                        </div>
  
  
                        <!-- Hidden ProductSelect for variant tracking -->
                        <select name="id" id="ProductSelect-bundle-${product.id}" class="product-single__variants" style="display: none;">
                          ${product.variants.map(variant => `
                            <option value="${variant.id}" ${variant.available ? '' : 'disabled'} data-variant-price="${variant.price}" data-variant-compare-price="${variant.compare_at_price || ''}">
                              ${variant.title}
                            </option>
                          `).join('')}
                        </select>
                        
                        <!-- Hidden Sticky ProductSelect for variant tracking -->
                        <select name="id" id="ProductSelect-bundle-${product.id}-sticky" class="product-single__variants" style="display: none;">
                          ${product.variants.map(variant => `
                            <option value="${variant.id}" ${variant.available ? '' : 'disabled'} data-variant-price="${variant.price}" data-variant-compare-price="${variant.compare_at_price || ''}">
                              ${variant.title}
                            </option>
                          `).join('')}
                        </select>
  
                        <!-- Variant Picker - Using existing structure -->
                        ${product.variants && product.variants.length > 1 ? `
                          <div class="product-block" data-dynamic-variants-enabled>
                            ${(() => {
                              const options = [];
                              if (product.options && product.options.length > 0) {
                                product.options.forEach((option, optionIndex) => {
                                  options.push({
                                    name: option.name,
                                    values: option.values,
                                    index: optionIndex
                                  });
                                });
                              }
                              return options.map(option => {
                                const isColor = option.name.toLowerCase().includes('color') || option.name.toLowerCase().includes('màu') || option.name.toLowerCase().includes('colour');
                                const isSize = option.name.toLowerCase().includes('size') || 
                                              option.name.toLowerCase().includes('kích thước') ||
                                              option.name.toLowerCase().includes('kích thước') ||
                                              option.name.toLowerCase().includes('kích thước');
                                
                                let labelHtml = '<label class="variant__label" for="ProductSelect-bundle-' + product.id + '-option-' + option.index + '">' + option.name + ':';
                                // Always add variant label info for all options
                                labelHtml += '<span class="variant__label-info" data-index="' + option.index + '"><span data-variant-selected-label>' + option.values[0] + '</span></span>';
                                labelHtml += '</label>';
                                                              
                                // Add size lock note for non-first products
                                if (isSize && bundleState.currentProductIndex > 0 && bundleState.lockedSize) {
                                  const firstProduct = config.bundleProducts[0];
                                  const firstProductTitle = firstProduct ? firstProduct.title : 'Sản phẩm đầu tiên';
                                  labelHtml += '<div class="size-lock-note" style="font-size: 12px; color: #6B7280; margin-top: 4px; font-style: italic;">Bạn đã chọn size <strong>' + bundleState.lockedSize + '</strong> ở ' + firstProductTitle + '</div>';
                                }
  
                                let fieldsetHtml = '<fieldset class="variant-input-wrap flex ai-center gap-x-md flex-wrap" name="' + option.name + '" data-index="option' + (option.index + 1) + '" data-handle="' + option.name.toLowerCase().replace(/\s+/g, '-') + '" data-option-count="' + option.values.length + '" id="ProductSelect-bundle-' + product.id + '-option-' + option.index + '"><legend class="hide">' + option.name + '</legend>';
                                fieldsetHtml += option.values.map((value, valueIndex) => {
                                  const variant = product.variants.find(v => v.options[option.index] === value);
                                  const isAvailable = variant && variant.available !== false;
                                  const disabledClass = !isAvailable ? ' disabled' : '';
                                  const checked = valueIndex === 0 ? 'checked="checked"' : '';
                                  
                                  if (isColor) {
                                    // Chuẩn hóa tên màu cho file PNG
                                    const colorValue = value.toLowerCase().replace(/\s+/g, '-');
                                    const colorFileName = colorValue + '_50x50.png';
                                    // Đường dẫn CDN đúng chuẩn Shopify theme (tự động lấy file nếu có, fallback nếu không)
                                    const colorImageUrl = `https://ru9.vn/cdn/shop/files/${colorFileName}`;
                                    // Fallback màu cuối cùng nếu không có ảnh
                                    const colorSwatchFallback = value.split(' ').pop().toLowerCase();
                                    
                                    return '<div class="variant-input" data-index="option' + (option.index + 1) + '" data-value="' + value + '">' +
                                      '<input type="radio" ' + checked + ' value="' + value + '" data-index="option' + (option.index + 1) + '" name="' + option.name + '-' + product.id + '" data-variant-input class="variant__input--color-swatch' + (!isAvailable ? ' disabled' : '') + '" data-color-name="' + value + '" data-color-index="' + option.index + '" id="ProductSelect-bundle-' + product.id + '-option-' + option.name.toLowerCase().replace(/\s+/g, '-') + '-' + value.replace(/\s+/g, '-') + '">' +
                                      '<label for="ProductSelect-bundle-' + product.id + '-option-' + option.name.toLowerCase().replace(/\s+/g, '-') + '-' + value.replace(/\s+/g, '-') + '" class="variant__button-label color-swatch color-swatch--' + colorValue + disabledClass + '" style="background-color: ' + colorSwatchFallback + '; background-image: url(' + colorImageUrl + ') !important;" title="' + value + '"></label></div>';
                                  } else if (isSize) {
                                    // Parse size value to separate name and dimensions
                                    let sizeName = value;
                                    let sizeDimensions = '';
                                    
                                    // Check if value contains dimensions (e.g., "Single + 120 x 200cm")
                                    if (value.includes('+') || value.includes('x') || value.includes('cm')) {
                                      // Split by common separators
                                      const parts = value.split(/[\+\-\–]/);
                                      if (parts.length >= 2) {
                                        sizeName = parts[0].trim();
                                        sizeDimensions = parts.slice(1).join(' ').trim();
                                      } else if (value.includes('x') && value.includes('cm')) {
                                        // Try to extract dimensions from format like "120 x 200cm"
                                        const dimensionMatch = value.match(/(\d+\s*x\s*\d+cm)/);
                                        if (dimensionMatch) {
                                          sizeDimensions = dimensionMatch[1];
                                          sizeName = value.replace(dimensionMatch[1], '').trim();
                                        }
                                      }
                                    }
                                    
                                    return '<div class="variant-input" data-index="option' + (option.index + 1) + '" data-value="' + value + '">' +
                                      '<input type="radio" ' + checked + ' value="' + value + '" data-index="option' + (option.index + 1) + '" name="' + option.name + '" data-variant-input class="variant__input--pill' + (!isAvailable ? ' disabled' : '') + '" data-value-name="' + value + '" data-value-index="' + option.index + '" id="ProductSelect-bundle-' + product.id + '-option-' + option.name.toLowerCase().replace(/\s+/g, '-') + '-' + value.replace(/\s+/g, '-') + '">' +
                                      '<label for="ProductSelect-bundle-' + product.id + '-option-' + option.name.toLowerCase().replace(/\s+/g, '-') + '-' + value.replace(/\s+/g, '-') + '" class="variant__button-label t-center' + disabledClass + '">' +
                                      '<span class="label-head block text-sm f-smb">' + sizeName + '</span>' +
                                      (sizeDimensions ? '<span class="label-value block text-xs">' + sizeDimensions + '</span>' : '') +
                                      '</label></div>';
                                  } else {
                                    return '<div class="variant-input" data-index="option' + (option.index + 1) + '" data-value="' + value + '">' +
                                      '<input type="radio" ' + checked + ' value="' + value + '" data-index="option' + (option.index + 1) + '" name="' + option.name + '" data-variant-input class="variant__input' + (!isAvailable ? ' disabled' : '') + '" id="ProductSelect-bundle-' + product.id + '-option-' + option.name.toLowerCase().replace(/\s+/g, '-') + '-' + value.replace(/\s+/g, '-') + '">' +
                                      '<label for="ProductSelect-bundle-' + product.id + '-option-' + option.name.toLowerCase().replace(/\s+/g, '-') + '-' + value.replace(/\s+/g, '-') + '" class="variant__button-label' + disabledClass + '">' + value + '</label></div>';
                                  }
                                }).join('');
                                fieldsetHtml += '</fieldset>';
                                return '<div class="variant-wrapper js ' + option.name.toLowerCase().replace(/\s+/g, '-') + (isSize ? ' size' : '') + (isColor ? ' color' : '') + '" data-type="button">' + labelHtml + fieldsetHtml + '</div>';
                              }).join('');
                            })()}
                          </div>
                        ` : ''}
  
                        <!-- Navigation Buttons -->
                        <div class="product-block">
                          <div class="bundle-navigation">
                            <button type="button" class="btn btn--secondary bundle-back-btn">Quay lại</button>
                            <button type="button" class="btn btn--primary bundle-continue-btn">Tiếp tục</button>
                          </div>
                        </div>
  
                        <!-- Product Summary Block -->
                        <div class="product-block product-summary-block">
                          <div class="product-summary-content">
                            <!-- Description Accordion -->
                            <details class="product-accordion product-accordion--styled" open>
                              <summary>
                                <span>Mô tả sản phẩm</span>
                                <svg class="icon-toggle" width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L9 8.5L17 1.5" stroke="#1C2C58" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                              </summary>
                              <div class="product-accordion-content rte">
                                ${product.description}
                              </div>
                            </details>
  
                             <!-- Store System Accordion -->
                             ${window.bundleConfig?.storeSystemContent ? `
                             <details class="product-accordion product-accordion--styled">
                               <summary>
                                 <span>Hệ thống cửa hàng</span>
                                 <svg class="icon-toggle" width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L9 8.5L17 1.5" stroke="#1C2C58" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                               </summary>
                                 <div class="product-accordion-content rte">
                                   ${window.bundleConfig.storeSystemContent}
                                   </div>
                               </details>
                             ` : ''}
                                  </div>
                        </div>
  
                        <!-- Service Grid -->
                        <div class="product-block product-block--service-grid">
                          <div class="service-grid-wrapper">
                            <div class="service-grid" style="grid-template-columns: repeat(4, 1fr);">
                              <div class="service-grid-item">
                                <div class="service-item">
                                   <div class="service-item__icon">
                                     ${window.bundleConfig?.serviceIcon1 ? 
                                       `<img src="${window.bundleConfig.serviceIcon1}" alt="${window.bundleConfig.serviceText1 || '100 đêm ngủ thử'}" width="40" height="40">` :
                                       `<img src="/assets/Layer_1_3.svg" alt="${window.bundleConfig?.serviceText1 || '100 đêm ngủ thử'}" width="40" height="40">`
                                     }
                                   </div>
                                   <div class="service-item__text">
                                     <p>${window.bundleConfig?.serviceText1 || "100 đêm ngủ thử"}</p>
                                   </div>
                                </div>
                              </div>
                              <div class="service-grid-item">
                                <div class="service-item">
                                  <div class="service-item__icon">
                                    ${window.bundleConfig?.serviceIcon2 ? 
                                      `<img src="${window.bundleConfig.serviceIcon2}" alt="${window.bundleConfig.serviceText2 || 'Miễn phí vận chuyển'}" width="40" height="40">` :
                                      `<img src="/assets/Layer_1_4.svg" alt="${window.bundleConfig?.serviceText2 || 'Miễn phí vận chuyển'}" width="40" height="40">`
                                    }
                                  </div>
                                  <div class="service-item__text">
                                    <p>${window.bundleConfig?.serviceText2 || "Miễn phí vận chuyển"}</p>
                                  </div>
                                </div>
                              </div>
                              <div class="service-grid-item">
                                <div class="service-item">
                                  <div class="service-item__icon">
                                    ${window.bundleConfig?.serviceIcon3 ? 
                                      `<img src="${window.bundleConfig.serviceIcon3}" alt="${window.bundleConfig.serviceText3 || 'Bảo hành dài lâu'}" width="40" height="40">` :
                                      `<img src="/assets/Layer_1_5.svg" alt="${window.bundleConfig?.serviceText3 || 'Bảo hành dài lâu'}" width="40" height="40">`
                                    }
                                  </div>
                                  <div class="service-item__text">
                                    <p>${window.bundleConfig?.serviceText3 || "Bảo hành dài lâu"}</p>
                                  </div>
                                </div>
                              </div>
                              <div class="service-grid-item">
                                <div class="service-item">
                                  <div class="service-item__icon">
                                    ${window.bundleConfig?.serviceIcon4 ? 
                                      `<img src="${window.bundleConfig.serviceIcon4}" alt="${window.bundleConfig.serviceText4 || 'Thanh toán linh hoạt'}" width="40" height="40">` :
                                      `<img src="/assets/Layer_1_6.svg" alt="${window.bundleConfig?.serviceText4 || 'Thanh toán linh hoạt'}" width="40" height="40">`
                                    }
                                  </div>
                                  <div class="service-item__text">
                                    <p>${window.bundleConfig?.serviceText4 || "Thanh toán linh hoạt"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
  
              </div>
            </div>
          `;
          
          console.log('Generated HTML:', productHTML);
          productsGrid.innerHTML = productHTML;
          
          console.log('HTML set successfully. Products grid innerHTML length:', productsGrid.innerHTML.length);
          console.log('Products grid children count:', productsGrid.children.length);
          
  
          
          // Initialize variant picker
          const productContainer = productsGrid.querySelector('.bundle-product-item');
          if (productContainer) {
            initializeBundleProductVariantPicker(productContainer);
            
            // INITIAL SYNC: Update option2 availability based on default option1
            setTimeout(() => {
              const firstOption1Input = productContainer.querySelector('[data-variant-input][data-index="option1"]:checked');
              if (firstOption1Input) {
                console.log('🔄 Initial sync: Triggering option1 change to update option2...');
                firstOption1Input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, 200);
          }
      
          // Update progress
          updateBundleProgress();
        } catch (error) {
          console.error('Error loading bundle product:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            product: product
          });
          // Show error message
          productsGrid.innerHTML = `
            <div class="bundle-product-item" data-product-handle="${product.handle}">
              <div class="error-message" style="text-align: center; padding: 2rem; color: red;">
                <h3>Lỗi tải sản phẩm</h3>
                <p>Không thể tải thông tin sản phẩm: ${product.title}</p>
                <p>Lỗi: ${error.message}</p>
              </div>
            </div>
          `;
        }
      }
    }
  
    function updateBundleProgress() {
      const progressCurrent = container.querySelector('.bundle-progress-current');
      const progressTotal = container.querySelector('.bundle-progress-total');
      
      if (progressCurrent) {
        progressCurrent.textContent = bundleState.currentProductIndex + 1;
      }
      if (progressTotal) {
        progressTotal.textContent = config.bundleProducts.length;
      }
    }
  
  
  
    // Helper function to extract image URL from various formats
    function extractImageUrl(imageData) {
      if (!imageData) return '';
      
      // If it's already a string URL, return it
      if (typeof imageData === 'string') {
        return imageData;
      }
      
      // If it's an object, try to extract the URL
      if (typeof imageData === 'object') {
        // Try different possible properties
        return imageData.src || 
               imageData.url || 
               imageData.preview_image || 
               imageData.featured_image ||
               (imageData.media && imageData.media.length > 0 ? imageData.media[0].src : '') ||
               '';
      }
      
      return '';
    }
  
    function renderBundleSummary() {
      const summaryProducts = container.querySelector('.bundle-summary-products');
      const bundlePhotos = container.querySelector(`#BundlePhotos-${sectionId}`);
      
      console.log('=== RENDER BUNDLE SUMMARY DEBUG ===');
      console.log('summaryProducts found:', !!summaryProducts);
      console.log('bundlePhotos found:', !!bundlePhotos);
      console.log('bundleState:', bundleState);
      console.log('bundleState.selectedProducts:', bundleState.selectedProducts);
      console.log('bundleState.selectedProducts.bundle:', bundleState.selectedProducts.bundle);
      console.log('bundleState.selectedProducts.bundle.length:', bundleState.selectedProducts.bundle.length);
      
      if (!summaryProducts) {
        console.error('❌ Summary products element not found!');
        return;
      }
  
      let totalOriginal = 0;
      let totalFinal = 0;
  
      // Add main product - use selected variant if available
      console.log('=== MAIN PRODUCT DEBUG ===');
      console.log('bundleState.selectedProducts.main:', bundleState.selectedProducts.main);
      
       const mainProduct = {
         productTitle: productTitle,
         variantTitle: bundleState.selectedProducts.main.variantTitle || 'Default Title',
         variantOptions: bundleState.selectedProducts.main.variantOptions || [],
         quantity: bundleState.selectedProducts.main.quantity || 1,
         price: bundleState.selectedProducts.main.variantPrice || 0,
         image: extractImageUrl(bundleState.selectedProducts.main.image) || extractImageUrl(productFeaturedImage)
       };
      
      console.log('=== MAIN PRODUCT PRICE DEBUG ===');
      console.log('bundleState.selectedProducts.main:', bundleState.selectedProducts.main);
      console.log('mainProduct.price:', mainProduct.price);
      console.log('mainProduct.price type:', typeof mainProduct.price);
      
      console.log('Final mainProduct:', mainProduct);
  
      // Add bundle products - ensure we use variantPrice and compareAtPrice
      const bundleProductsWithCorrectPrice = bundleState.selectedProducts.bundle.map(product => ({
        ...product,
        price: product.variantPrice || product.price, // Giá sau giảm (price)
        compareAtPrice: product.compareAtPrice || product.variantPrice || product.price, // Giá gốc (compare_at_price)
        image: extractImageUrl(product.image) // Extract proper image URL
      }));
      
      console.log('=== PRICE MAPPING DEBUG ===');
      bundleState.selectedProducts.bundle.forEach((originalProduct, index) => {
        const mappedProduct = bundleProductsWithCorrectPrice[index];
        console.log(`Product ${index} price mapping:`, {
          title: originalProduct.productTitle,
          variantPrice: originalProduct.variantPrice,
          compareAtPrice: originalProduct.compareAtPrice,
          mappedPrice: mappedProduct.price,
          mappedCompareAtPrice: mappedProduct.compareAtPrice,
          variantTitle: originalProduct.variantTitle
        });
      });
      
      // Chỉ tính các sản phẩm bundle được chọn từ step 2, không tính sản phẩm mặc định từ step 1
      const allProducts = [...bundleProductsWithCorrectPrice];
      
      console.log('=== ALL PRODUCTS DEBUG ===');
      console.log('mainProduct (không tính vào bundle):', mainProduct);
      console.log('bundleState.selectedProducts.bundle:', bundleState.selectedProducts.bundle);
      console.log('bundleProductsWithCorrectPrice:', bundleProductsWithCorrectPrice);
      console.log('allProducts (chỉ sản phẩm bundle được chọn):', allProducts);
      console.log('allProducts length:', allProducts.length);
      
      // If no bundle products selected, try to auto-select from config
      if (allProducts.length === 0) {
        console.warn('⚠️ No bundle products selected, trying to auto-select...');
        
        if (config.bundleProducts && config.bundleProducts.length > 0) {
          const firstProduct = config.bundleProducts[0];
          const defaultVariant = firstProduct.variants && firstProduct.variants.length > 0 ? firstProduct.variants[0] : null;
          
          const fallbackProduct = {
            productId: firstProduct.id,
            productHandle: firstProduct.handle,
            productTitle: firstProduct.title,
            image: extractImageUrl(firstProduct.featured_image),
            variantId: defaultVariant ? defaultVariant.id : null,
            variantTitle: defaultVariant ? defaultVariant.title : 'Default Title',
            variantPrice: defaultVariant ? defaultVariant.price : firstProduct.price,
            compareAtPrice: defaultVariant ? defaultVariant.compare_at_price : firstProduct.compare_at_price,
            variantOptions: defaultVariant ? defaultVariant.options : [],
            quantity: 1
          };
          
          allProducts.push(fallbackProduct);
          console.log('✅ Added fallback product:', fallbackProduct);
        } else {
          console.error('❌ No bundle products available in config!');
          summaryProducts.innerHTML = '<div class="error-message">Không có sản phẩm bundle nào được cấu hình.</div>';
          return;
        }
      }
      
      // Debug each product's price
      allProducts.forEach((product, index) => {
        console.log(`Product ${index} price debug:`, {
          title: product.productTitle,
          price: product.price,
          priceType: typeof product.price,
          compareAtPrice: product.compareAtPrice,
          compareAtPriceType: typeof product.compareAtPrice,
          quantity: product.quantity,
          quantityType: typeof product.quantity,
          variantTitle: product.variantTitle,
          variantId: product.variantId
        });
      });
      
      // Check if all products have valid prices
      const productsWithValidPrices = allProducts.filter(product => {
        const price = parseFloat(product.price) || 0;
        const compareAtPrice = parseFloat(product.compareAtPrice) || 0;
        return price > 0 || compareAtPrice > 0;
      });
      
      console.log('Products with valid prices:', productsWithValidPrices.length, 'out of', allProducts.length);
      
      if (productsWithValidPrices.length === 0) {
        console.error('❌ No products have valid prices!');
        summaryProducts.innerHTML = '<div class="error-message">Không thể tính toán giá vì các sản phẩm không có giá hợp lệ.</div>';
        return;
      }
      
      // Debug bundle state specifically
      console.log('=== BUNDLE STATE PRICE DEBUG ===');
      bundleState.selectedProducts.bundle.forEach((product, index) => {
        console.log(`Bundle product ${index}:`, {
          title: product.productTitle,
          variantTitle: product.variantTitle,
          variantId: product.variantId,
          variantPrice: product.variantPrice,
          price: product.price,
          variantPriceType: typeof product.variantPrice,
          priceType: typeof product.price
        });
      });
      
      // Debug variant options for each product
      allProducts.forEach((product, index) => {
        console.log(`Product ${index} (${product.productTitle}):`, {
          variantTitle: product.variantTitle,
          variantOptions: product.variantOptions,
          hasVariantOptions: !!product.variantOptions,
          variantOptionsLength: product.variantOptions ? product.variantOptions.length : 0
        });
        
        // Debug the actual HTML generation for this product
        if (product.variantOptions && product.variantOptions.length > 0) {
          const generatedHTML = product.variantOptions.map((option, optionIndex) => {
            const optionName = optionIndex === 0 ? 'Kích thước' : 
                              optionIndex === 1 ? 'Màu sắc' : 
                              `Tùy chọn ${optionIndex + 1}`;
            return `${optionName}: ${option}`;
          }).join(', ');
          console.log(`  Generated HTML for product ${index}:`, generatedHTML);
        } else {
          console.log(`  Fallback HTML for product ${index}: Variant: ${product.variantTitle}`);
        }
      });
      
      // Calculate totals - 2 TẦNG GIẢM GIÁ
      console.log('=== CALCULATING BUNDLE TOTALS (NEW LOGIC) ===');
      
      // Get bundle quantity (default to 1 if not set)
      const bundleQuantity = bundleState.bundleQuantity || 1;
      console.log('Bundle quantity:', bundleQuantity);
      
      // Get target discount from config
      const targetDiscount = config.targetDiscountPercentage || 15;
      console.log('Target discount percentage:', targetDiscount + '%');
      
      // --- NEW CALCULATION LOGIC ---
      // This logic is now a DIRECT COPY of the theme editor's "runPricingCalculator" function
      // to ensure 100% consistency.
      let newTotalOriginal = 0;
      let totalAfter1stDiscount = 0;
  
      allProducts.forEach((product, index) => {
        const compareAtPrice = parseFloat(product.compareAtPrice) || parseFloat(product.price) || 0;
        const price = parseFloat(product.price) || 0;
        const quantity = parseInt(product.quantity) || 1;
        
        console.log(`Product ${index} calculation:`, {
          title: product.productTitle,
          compareAtPrice: product.compareAtPrice,
          parsedCompareAtPrice: compareAtPrice,
          price: product.price,
          parsedPrice: price,
          quantity: quantity,
          compareAtPriceTotal: compareAtPrice * quantity,
          priceTotal: price * quantity
        });
        
        newTotalOriginal += compareAtPrice * quantity;
        totalAfter1stDiscount += price * quantity;
      });
      
      console.log('=== PRICE CALCULATION TOTALS ===');
      console.log('newTotalOriginal:', newTotalOriginal);
      console.log('totalAfter1stDiscount:', totalAfter1stDiscount);
      
      // 1. Calculate the ideal target price
      const targetFinalPriceIdeal = newTotalOriginal * (1 - targetDiscount / 100);
      
      // 2. Calculate the exact voucher discount needed
      const neededVoucherDiscountExact = totalAfter1stDiscount > 0 ? 
        ((totalAfter1stDiscount - targetFinalPriceIdeal) / totalAfter1stDiscount) * 100 : 0;
        
      // 3. Round the voucher discount to the nearest whole number
      const neededVoucherDiscountRounded = Math.round(neededVoucherDiscountExact);
      
      // 4. Calculate the actual final price using the rounded voucher discount
      const newTotalFinal = totalAfter1stDiscount * (1 - neededVoucherDiscountRounded / 100);
  
      // Apply the overall bundle quantity to the totals
      newTotalOriginal *= bundleQuantity;
      // newTotalFinal is already calculated based on per-bundle logic, so we just multiply it.
      let finalPriceWithQuantity = newTotalFinal * bundleQuantity;
      
      // Update totals for display
      totalOriginal = newTotalOriginal;
      totalFinal = finalPriceWithQuantity;
      
      // Update the badge to show the target discount, as per user request
      const effectiveDiscount = targetDiscount;
  
      console.log('--- BUNDLE PRICING DEBUG (STEP 3) ---');
      console.log('Target Discount:', targetDiscount + '%');
      console.log('Tổng Compare-at Price (Original):', totalOriginal);
      console.log('Tổng sau giảm giá tầng 1 (Sum of Prices):', totalAfter1stDiscount * bundleQuantity);
      console.log('Ideal Target Price:', targetFinalPriceIdeal * bundleQuantity);
      console.log('Needed Voucher Discount % (Rounded):', neededVoucherDiscountRounded);
      console.log('Actual Final Price (sau chiết khấu tầng 2):', totalFinal);
      // --- END NEW CALCULATION LOGIC ---
      
      // Voucher code is now displayed directly from Liquid template
      // No need for JavaScript manipulation since it's rendered from section.settings.voucher_code
  
      // Update bundle summary products (right side) - chỉ hiển thị các sản phẩm bundle được chọn
      summaryProducts.innerHTML = allProducts.map((product, index) => {
        const productQty = product.quantity || 1;
        const showQuantity = productQty > 1;
        
        return `
          <div class="bundle-summary-product">
            <div class="bundle-product-number">${index + 1}.</div>
            <div class="bundle-product-content">
              <div class="bundle-product-info">
                <div class="bundle-product-title">
                  ${product.productTitle}
                  ${showQuantity ? `<span style="color: #234085; font-weight: 600;"> × ${productQty}</span>` : ''}
                </div>
                <div class="bundle-product-attributes">
                  ${showQuantity ? `<div class="bundle-product-attribute">Số lượng: ${productQty}</div>` : ''}
                  ${product.variantOptions && product.variantOptions.length > 0 ? 
                    product.variantOptions.map((option, optionIndex) => {
                      const optionName = optionIndex === 0 ? 'Kích thước' : 
                                        optionIndex === 1 ? 'Màu sắc' : 
                                        `Tùy chọn ${optionIndex + 1}`;
                      return `<div class="bundle-product-attribute">${optionName}: ${option}</div>`;
                    }).join('') : 
                    `<div class="bundle-product-attribute">Variant: ${product.variantTitle}</div>`
                  }
                </div>
                <div class="bundle-product-change-link" data-product-index="${index}">Thay đổi</div>
              </div>
              <div class="bundle-product-image">
                <img src="${product.image}" alt="${product.productTitle}" width="80" height="80">
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      // Display summary
      console.log('=== BUNDLE PRICE SUMMARY ===');
      console.log('Total Original (compare_at_price):', totalOriginal);
      console.log('Total Final (sau 2 tầng giảm):', totalFinal);
      console.log('Display discount percentage:', targetDiscount + '%');
      
      const discountAmount = totalOriginal - totalFinal;
      console.log('Discount amount:', discountAmount);
  
      // Update totals in UI
      const originalTotalEl = container.querySelector('.bundle-original-total');
      const discountBadgeEl = container.querySelector('.bundle-discount-badge');
      const finalTotalEl = container.querySelector('.bundle-final-total');
      
      console.log('Price elements found:', {
        originalTotal: !!originalTotalEl,
        discountBadge: !!discountBadgeEl,
        finalTotal: !!finalTotalEl
      });
      
      // Update bundle-original-total (tổng compare_at_price)
      if (originalTotalEl) {
        const formattedOriginal = window.BundleUtils && window.BundleUtils.formatMoney ? 
          window.BundleUtils.formatMoney(totalOriginal) : 
          `${Math.round(totalOriginal).toLocaleString('vi-VN')}đ`;
        originalTotalEl.textContent = formattedOriginal;
        console.log('✅ Updated original total (compare_at_price):', formattedOriginal, 'from value:', totalOriginal);
      } else {
        console.log('❌ Original total element not found');
      }
      
      // Update bundle-discount-badge to show the TARGET discount, not the effective one
      if (discountBadgeEl) {
        discountBadgeEl.textContent = `-${targetDiscount}%`;
        console.log('✅ Updated discount badge to target discount:', `-${targetDiscount}%`);
      } else {
        console.log('❌ Discount badge element not found');
      }
      
      // Update bundle-final-total (tổng price)
      if (finalTotalEl) {
        const formattedFinal = window.BundleUtils && window.BundleUtils.formatMoney ? 
          window.BundleUtils.formatMoney(totalFinal) : 
          `${Math.round(totalFinal).toLocaleString('vi-VN')}đ`;
        finalTotalEl.textContent = formattedFinal;
        console.log('✅ Updated final total (price):', formattedFinal, 'from value:', totalFinal);
      } else {
        console.log('❌ Final total element not found');
      }
      
      // Initialize thumbnail click events
      initializeBundleThumbnailEvents();
      
      // Initialize buy now button with direct event listener
      initializeBuyNowButton();
    }
  
    function initializeQuantitySelector() {
      console.log('=== INITIALIZING QUANTITY SELECTOR ===');
      
      const quantityDisplay = container.querySelector('.quantity-display');
      const quantityText = container.querySelector('.quantity-text');
      const quantityOptions = container.querySelectorAll('.quantity-option');
      
      if (quantityDisplay && quantityText) {
        // Set initial value
        const currentQuantity = bundleState.bundleQuantity || 1;
        quantityText.textContent = currentQuantity;
        quantityDisplay.setAttribute('data-quantity', currentQuantity);
        
        // Set selected state
        quantityOptions.forEach(option => {
          option.classList.remove('selected');
          if (parseInt(option.getAttribute('data-value')) === currentQuantity) {
            option.classList.add('selected');
          }
        });
        
        console.log('✅ Quantity selector initialized with value:', currentQuantity);
      } else {
        console.log('❌ Quantity selector elements not found');
      }
    }
  
    function initializeBuyNowButton() {
      console.log('=== INITIALIZING BUY NOW BUTTON ===');
      
      // Try multiple selectors to find the buy now button
      const buyNowBtn = container.querySelector('.bundle-buy-now-btn') || 
                       container.querySelector('.btn--primary.bundle-buy-now-btn') ||
                       container.querySelector('button.bundle-buy-now-btn');
      
      console.log('Buy now button found:', !!buyNowBtn);
      console.log('Buy now button element:', buyNowBtn);
      
      if (buyNowBtn) {
        // Remove any existing event listeners
        buyNowBtn.removeEventListener('click', handleBuyNowClick);
        
        // Add direct event listener
        buyNowBtn.addEventListener('click', handleBuyNowClick);
        console.log('✅ Buy now button event listener added');
        
        // Also add onclick attribute as fallback
        buyNowBtn.onclick = handleBuyNowClick;
        console.log('✅ Buy now button onclick attribute added');
      } else {
        console.log('❌ Buy now button not found');
      }
    }
    
    function handleBuyNowClick(e) {
      console.log('=== BUY NOW BUTTON CLICKED ===');
      e.preventDefault();
      e.stopPropagation();
      console.log('Event:', e);
      console.log('Target:', e.target);
      buyBundleNow();
    }
  
    // Step 3 uses product-images snippet, no custom events needed
  
    function changeProduct(productIndex) {
      console.log('Changing product at index:', productIndex);
      
      // If it's the main product (index 0), go back to step 1
      if (productIndex === 0) {
        showStep(1);
        return;
      }
      
      // If it's a bundle product, go back to step 2 with the specific product
      const bundleIndex = productIndex - 1; // Convert to bundle array index
      if (bundleIndex >= 0 && bundleIndex < bundleState.selectedProducts.bundle.length) {
        bundleState.currentProductIndex = bundleIndex;
        showStep(2);
        return;
      }
    }
  
    function addBundleToCart() {
      console.log('=== ADD BUNDLE TO CART ===');
      
      
      console.log('Bundle state:', bundleState);
      console.log('Selected products:', bundleState.selectedProducts);
      
      const items = [];
      const bundleQty = bundleState.bundleQuantity || 1;
      const bundleId = Date.now();
      const voucherCode = config.voucherCode;
      
      console.log('Bundle quantity:', bundleQty);
      console.log('Bundle ID:', bundleId);
      
      // Add all bundle products to cart
      bundleState.selectedProducts.bundle.forEach((product, index) => {
        console.log(`Processing bundle product ${index}:`, product);
        
        if (product.variantId) {
           let properties = {
             '_bundle_id': bundleId,
             '_bundle_title': productTitle,
             '_product_title': product.productTitle,
             '_variant_title': product.variantTitle || 'Default'
           };
          
          // Attach the voucher code as a property if it exists
          if (voucherCode && voucherCode.trim() !== '') {
            properties['_bundle_voucher'] = voucherCode.trim();
          }
  
          const bundleItem = {
            id: product.variantId,
            quantity: (product.quantity || 1) * bundleQty,
            properties: properties
          };
          items.push(bundleItem);
          console.log('✅ Added item to cart array:', bundleItem);
        } else {
          console.log('❌ Product missing variantId:', product);
        }
      });
  
      console.log('Total items to add:', items.length);
      console.log('Items array:', items);
  
      if (items.length === 0) {
        console.error('❌ No items to add to cart!');
        alert('Không có sản phẩm nào để thêm vào giỏ hàng!');
        return;
      }
  
      console.log('Sending request to /cart/add.js...');
  
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ items: items })
      })
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Response error text:', text);
            throw new Error(`HTTP error! status: ${response.status}, details: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Cart API response:', data);
        
        if (data.status && data.status !== 200) {
          throw new Error(`Cart API error: ${data.description || 'Unknown error'}`);
        }
        
        console.log('✅ Successfully added to cart!');
        
        
        // Auto-apply voucher code if bundle is complete
        if (voucherCode && voucherCode.trim() !== '') {
          console.log('Auto-applying voucher code:', voucherCode);
          autoApplyVoucherCode(voucherCode.trim());
        } else {
          console.log('❌ Voucher code not found or empty:', voucherCode);
        }
        
        // Update cart count
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
        
        // Refresh cart drawer immediately
        refreshCartDrawer();
        
        // Show success message
        // alert(`✅ Đã thêm ${items.length} sản phẩm vào giỏ hàng!`);
      })
      .catch(error => {
        console.error('❌ Error adding to cart:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        alert(`Lỗi khi thêm vào giỏ hàng: ${error.message}`);
      });
    }
  
    function autoApplyVoucherCode(voucherCode) {
      console.log('=== AUTO APPLY VOUCHER CODE ===');
      console.log('Voucher code:', voucherCode);
      
      // Apply voucher and store in bundle items in one go
      fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 'discount': voucherCode })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Voucher application response:', data);
        
        if (!data.status && voucherCode) {
          // Store voucher directly in bundle items
          const bundleItems = data.items.filter(item => 
            item.properties && item.properties._bundle_id
          );
          
          if (bundleItems.length > 0) {
            // Update each bundle item to include voucher
            const updatePromises = bundleItems.map(item => {
              const updatedProperties = {
                ...item.properties,
                '_bundle_voucher': voucherCode,
                '_voucher_applied': 'true'
              };
              
              return fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  id: item.key,
                  properties: updatedProperties
                })
              });
            });
            
            Promise.all(updatePromises)
              .then(responses => {
                console.log('✅ Voucher stored in bundle items');
                // Refresh cart once after all updates
                setTimeout(() => refreshCartDrawer(), 500);
              })
              .catch(error => {
                console.error('❌ Error storing voucher in items:', error);
                setTimeout(() => refreshCartDrawer(), 500);
              });
          }
        } else {
          console.log('❌ Auto voucher application failed:', data.description);
          setTimeout(() => refreshCartDrawer(), 500);
        }
      })
      .catch(error => {
        console.error('❌ Error auto-applying voucher:', error);
        setTimeout(() => refreshCartDrawer(), 500);
      });
    }
  
  
    function forceUpdateCartPrices(cartData) {
      // Force update cart drawer prices immediately
      if (typeof theme !== 'undefined' && typeof theme.CartForm === 'function') {
        const cartFormInstance = new theme.CartForm(document.getElementById('CartDrawerForm'));
        if (cartFormInstance && cartFormInstance.buildCart) {
          cartFormInstance.buildCart();
        }
      }
      
      // Also fetch fresh cart data and update
      fetch('/cart.js')
        .then(response => response.json())
        .then(freshCartData => {
          // Update cart drawer with fresh data
          if (typeof theme !== 'undefined' && typeof theme.CartForm === 'function') {
            const cartFormInstance = new theme.CartForm(document.getElementById('CartDrawerForm'));
            if (cartFormInstance && cartFormInstance.buildCart) {
              cartFormInstance.buildCart();
            }
          }
        })
        .catch(error => {
          console.error('❌ Error fetching fresh cart data:', error);
        });
      
      // Trigger custom event to update prices
      const cartUpdateEvent = new CustomEvent('cart:force-update', {
        detail: { cartData: cartData }
      });
      document.dispatchEvent(cartUpdateEvent);
      
      // Direct DOM update for cart totals
      if (cartData.total_price && cartData.original_total_price) {
        const totalPriceEl = document.querySelector('.cart-drawer__total-price, .cart__total-price, [data-cart-total]');
        const subtotalEl = document.querySelector('.cart-drawer__subtotal, .cart__subtotal, [data-cart-subtotal]');
        
        if (totalPriceEl) {
          const formattedTotal = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(cartData.total_price / 100);
          totalPriceEl.textContent = formattedTotal;
        }
        
        if (subtotalEl) {
          const formattedSubtotal = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(cartData.original_total_price / 100);
          subtotalEl.textContent = formattedSubtotal;
        }
        
        // Force update savings display
        const savingsAmount = cartData.original_total_price - cartData.total_price;
        if (savingsAmount > 0) {
          const savingsEl = document.querySelector('.cart-drawer__savings, .cart__savings, [data-savings-display]');
          if (savingsEl) {
            const formattedSavings = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(savingsAmount / 100);
            savingsEl.textContent = formattedSavings;
          }
        }
      }
      
    }
  
    function refreshCartDrawer() {
      console.log('=== REFRESH CART DRAWER ===');
      
      // Use the same method as cart-drawer.liquid
      if (typeof theme !== 'undefined' && typeof theme.CartForm === 'function') {
        const cartFormInstance = new theme.CartForm(document.getElementById('CartDrawerForm'));
        cartFormInstance.buildCart();
        
        // Wait for cart to rebuild, then check for stored vouchers
        setTimeout(() => {
          console.log('Triggering bundle headers display...');
          
          // Trigger bundle header display manually
          const event = new CustomEvent('cart:updated');
          document.dispatchEvent(event);
          
          // Also check for stored bundle vouchers
          if (typeof checkStoredBundleVoucher === 'function') {
            checkStoredBundleVoucher();
          }
          
        }, 500);
      } else {
        // Fallback: reload the page
        window.location.href = window.location.href;
      }
      
      // Open the cart drawer
      openCartDrawer();
    }
  
    function openCartDrawer() {
      // Try multiple methods to open the cart drawer
      
      // Method 1: Try theme.Drawer if it exists
      if (typeof theme !== 'undefined' && theme.Drawer) {
        if (typeof theme.Drawer.open === 'function') {
          theme.Drawer.open('CartDrawer');
          return;
        }
      }
      
      // Method 2: Try to trigger cart drawer open event
      const cartDrawer = document.getElementById('CartDrawer');
      if (cartDrawer) {
        // Add active class to show drawer
        cartDrawer.classList.add('drawer--open', 'active', 'is-open');
        document.body.classList.add('drawer-open', 'cart-open');
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('cart:open'));
        window.dispatchEvent(new CustomEvent('drawer:open', { detail: { id: 'CartDrawer' } }));
        return;
      }
      
      // Method 3: Try to click cart icon to open drawer
      const cartTrigger = document.querySelector('[data-cart-drawer-toggle], .js-drawer-open-cart, .cart-icon, [href="#CartDrawer"]');
      if (cartTrigger) {
        cartTrigger.click();
        return;
      }
      
      // Method 4: Try to find and click any element that opens cart
      const cartButton = document.querySelector('button[aria-controls="CartDrawer"], [data-drawer-target="CartDrawer"]');
      if (cartButton) {
        cartButton.click();
      }
    }
  
    function initializeVariantPicker() {
      console.log('=== INITIALIZE VARIANT PICKER FOR MAIN PRODUCT ===');
      
      // Listen for variant changes on main product
      container.addEventListener('change', function(event) {
        if (event.target.closest('.bundle-step-1') && event.target.hasAttribute('data-variant-input')) {
          console.log('🔍 Main product variant changed');
          
          // Get the selected variant
          const selectedVariant = event.target.closest('.bundle-step-1').querySelector('[data-variant-input]:checked');
          if (selectedVariant) {
            const variantId = selectedVariant.value;
            console.log('🔍 Selected variant ID:', variantId);
            
             // Find the variant data
             const variant = productVariants.find(v => v.id.toString() === variantId);
            if (variant) {
              console.log('🔍 Found variant:', variant);
              
              // Update main product in bundle state
              bundleState.selectedProducts.main = {
                variantId: variant.id,
                variantTitle: variant.title,
                variantOptions: variant.options,
                variantPrice: variant.price,
                image: extractImageUrl(variant.featured_image) || extractImageUrl(productFeaturedImage),
                quantity: bundleState.selectedProducts.main.quantity
              };
              
              console.log('🔍 Updated main product in bundle state:', bundleState.selectedProducts.main);
            }
          }
        }
        
        // Listen for variant changes on Step 2 bundle products
        if (event.target.closest('.bundle-step-2') && event.target.hasAttribute('data-variant-input')) {
          console.log('🔍 Step 2 bundle product variant changed');
          
          // Get the selected variant
          const selectedVariant = event.target.closest('.bundle-step-2').querySelector('[data-variant-input]:checked');
          if (selectedVariant) {
            const variantId = selectedVariant.value;
            console.log('🔍 Step 2 - Selected variant ID:', variantId);
            
            // Find the current product being edited
            const productContainer = event.target.closest('.bundle-product-item');
            if (productContainer) {
              const productId = productContainer.getAttribute('data-product-id');
              console.log('🔍 Step 2 - Product ID:', productId);
              
              // Find the variant data from the current product
              const productData = bundleState.selectedProducts.bundle.find(p => p.id.toString() === productId);
              if (productData && productData.variants) {
                const variant = productData.variants.find(v => v.id.toString() === variantId);
                if (variant) {
                  console.log('🔍 Step 2 - Found variant:', variant);
                  
                  // Update the product in bundle state
                  productData.variantId = variant.id;
                  productData.variantTitle = variant.title;
                  productData.variantOptions = variant.options;
                  productData.variantPrice = variant.price;
                  productData.image = extractImageUrl(variant.featured_image) || productData.image;
                  
                  console.log('🔍 Step 2 - Updated product in bundle state:', productData);
                  
                  // Update the image display
                  updateProductImageForStep2(productData);
                }
              }
            }
          }
        }
      });
    }
  
     // Update Step 2 images when variant changes
     function updateProductImageForStep2(productData) {
       console.log('=== UPDATE PRODUCT IMAGE FOR STEP 2 ===');
       console.log('Product data:', productData);
       
       const step2ImageColumn = document.getElementById(`Step2ImageColumn-${sectionId}`);
       if (!step2ImageColumn) {
         console.warn('❌ Step 2 image column not found');
         return;
       }
       
       // Get the current variant from bundle state
       const currentProduct = config.bundleProducts[bundleState.currentProductIndex];
       if (!currentProduct) {
         console.warn('❌ Current product not found');
         return;
       }
       
       // Find the selected variant
       const productSelect = document.querySelector(`#ProductSelect-bundle-${currentProduct.id}`);
       if (!productSelect || !productSelect.value) {
         console.warn('❌ Product select not found or no value');
         return;
       }
       
       const selectedVariantId = productSelect.value;
       const selectedVariant = currentProduct.variants.find(v => v.id.toString() === selectedVariantId.toString());
       
       if (!selectedVariant) {
         console.warn('❌ Selected variant not found');
         return;
       }
       
       console.log('Selected variant for image update:', selectedVariant);
       
       // Use the same logic as updateBundleProductImage
       updateBundleProductImage(selectedVariant, step2ImageColumn);
       
       // Also re-initialize Flickity if carousel is enabled
       if (window.bundleConfig?.productCarouselEnable) {
         setTimeout(() => {
           initializeFlickityForStep(step2ImageColumn, 'step2');
         }, 100);
       }
    }
  
    function initializeBundleProductVariantPicker(container) {
      console.log('=== INITIALIZE BUNDLE PRODUCT VARIANT PICKER ===');
      
      const currentProduct = config.bundleProducts[bundleState.currentProductIndex];
      if (!currentProduct) {
        console.error('No current product found');
        return;
      }
      
      console.log('Initializing variant picker for product:', currentProduct.title);
      console.log('Product options:', currentProduct.options);
      console.log('Product variants:', currentProduct.variants);
      
      // Debug: Check if variants have correct structure
      if (currentProduct.variants && currentProduct.variants.length > 0) {
        console.log('First variant structure:', currentProduct.variants[0]);
        console.log('Variant options:', currentProduct.variants[0].options);
        
        // Debug all variants
        currentProduct.variants.forEach((variant, index) => {
          console.log(`Variant ${index}:`, {
            id: variant.id,
            title: variant.title,
            price: variant.price,
            options: variant.options,
            available: variant.available
          });
        });
      }
      
      // Use theme.js Variants class instead of custom logic
      const productSelect = container.querySelector(`#ProductSelect-bundle-${currentProduct.id}`);
      if (!productSelect) {
        console.error('ProductSelect not found');
        return;
      }
      
      // Initialize theme.js Variants class with correct parameters
      const variants = new theme.Variants({
        container: container,
        variants: currentProduct.variants,
        singleOptionSelector: '[data-variant-input]',
        originalSelectorId: `#ProductSelect-bundle-${currentProduct.id}`,
        originalSelectorIdSticky: `#ProductSelect-bundle-${currentProduct.id}-sticky`,
        enableHistoryState: false,
        dynamicVariantsEnabled: true
      });
      
      // Store variants instance for later use
      container.variantsInstance = variants;
      
      function syncVariantAvailability() {
        const productVariants = currentProduct.variants;
        const singleOptionSelector = '[data-variant-input]';
        const optionsContainer = container.querySelector('.product-form__controls');
        if (!optionsContainer) return;
  
        const getCurrentOptions = () => {
          const result = [];
          optionsContainer.querySelectorAll(`${singleOptionSelector}:checked`).forEach((el) => {
            result.push({
              value: el.value,
              index: el.dataset.index,
            });
          });
          return result;
        };
  
        const currentlySelectedValues = getCurrentOptions();
        const allOptionInputs = optionsContainer.querySelectorAll(singleOptionSelector);
        const optionKeys = [...new Set(Array.from(allOptionInputs, input => input.dataset.index))];
  
        optionKeys.forEach(optionKey => {
          const otherSelectedValues = currentlySelectedValues.filter(
            (option) => option.index !== optionKey
          );
  
          const possibleVariants = productVariants.filter(variant => {
            return otherSelectedValues.every(option => {
              return variant[option.index] === option.value;
            });
          });
  
          const availableValuesForOption = [...new Set(possibleVariants
            .filter(variant => variant.available)
            .map(variant => variant[optionKey]))];
  
          optionsContainer.querySelectorAll(`${singleOptionSelector}[data-index="${optionKey}"]`).forEach(input => {
            const wrapper = input.closest('.variant-input');
            const label = wrapper ? wrapper.querySelector('label') : null;
            if (availableValuesForOption.includes(input.value)) {
              input.disabled = false;
              if (wrapper) wrapper.classList.remove('disabled');
              if (label) label.classList.remove('disabled');
            } else {
              input.disabled = true;
              if (wrapper) wrapper.classList.add('disabled');
              if (label) label.classList.add('disabled');
            }
          });
        });
      }
  
      // Listen for variant changes to update the state and UI
      container.addEventListener('variantChange', (event) => {
        const { variant } = event.detail;
        if (variant) {
          bundleState.selectedProducts.bundle[bundleState.currentProductIndex].variantId = variant.id;
          bundleState.selectedProducts.bundle[bundleState.currentProductIndex].variantOptions = variant.options;
  
          const sizeOptionIndex = currentProduct.options.findIndex(opt =>
            opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'kích thước'
          );
          
          if (sizeOptionIndex !== -1) {
            const newSize = variant[`option${sizeOptionIndex + 1}`];
            if (bundleState.lockedSize !== newSize) {
              bundleState.lockedSize = newSize;
            }
          }
        }
        syncVariantAvailability();
        updateSummary();
      });
      
      // Tự động chọn variant đầu tiên khi khởi tạo
      setTimeout(() => {
        console.log('=== AUTO-SELECTING FIRST VARIANT ===');
        
        // Tìm tất cả các option groups
        const optionGroups = container.querySelectorAll('.variant-wrapper');
        console.log('Found option groups:', optionGroups.length);
        
        optionGroups.forEach((optionGroup, groupIndex) => {
          // Check if this is a size option and we have a locked size
          const isSizeGroup = optionGroup.classList.contains('size') || 
                             optionGroup.querySelector('.variant__label')?.textContent.toLowerCase().includes('kích thước') ||
                             optionGroup.querySelector('.variant__label')?.textContent.toLowerCase().includes('size');
          
          if (isSizeGroup && bundleState.lockedSize && bundleState.currentProductIndex > 0) {
            // Auto-select the locked size for non-first products
            console.log(`🔒 Auto-selecting locked size: ${bundleState.lockedSize} for product ${bundleState.currentProductIndex + 1}`);
            
            const sizeInputs = optionGroup.querySelectorAll('[data-variant-input]');
            
            // Improved matching logic for size inputs
            const matchingInput = Array.from(sizeInputs).find(input => {
              const inputValue = input.value;
              
              // Direct match
              if (inputValue === bundleState.lockedSize) {
                return true;
              }
              
              // Extract dimensions from both sizes
              const extractDimensions = (sizeStr) => {
                const dimensions = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
                if (dimensions) {
                  return {
                    width: parseInt(dimensions[1]),
                    height: parseInt(dimensions[2])
                  };
                }
                return null;
              };
              
              const lockedDimensions = extractDimensions(bundleState.lockedSize);
              const inputDimensions = extractDimensions(inputValue);
              
              // If both have dimensions, compare them
              if (lockedDimensions && inputDimensions) {
                return lockedDimensions.width === inputDimensions.width && 
                       lockedDimensions.height === inputDimensions.height;
              }
              
              // Fallback: check if both contain same size keywords
              const sizeKeywords = ['single', 'full', 'queen', 'king', '150', '180', '200', '220', '250', '300'];
              const lockedHasKeyword = sizeKeywords.some(keyword => 
                bundleState.lockedSize.toLowerCase().includes(keyword)
              );
              const inputHasKeyword = sizeKeywords.some(keyword => 
                inputValue.toLowerCase().includes(keyword)
              );
              
              if (lockedHasKeyword && inputHasKeyword) {
                // Check if they share any size keyword
                return sizeKeywords.some(keyword => 
                  bundleState.lockedSize.toLowerCase().includes(keyword) && 
                  inputValue.toLowerCase().includes(keyword)
                );
              }
              
              return false;
            });
            
            if (matchingInput && !matchingInput.disabled) {
              console.log(`🔒 Found matching size input: ${matchingInput.value}`);
              matchingInput.checked = true;
              matchingInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              console.log(`⚠️ Locked size ${bundleState.lockedSize} not found or disabled, falling back to first available`);
              const firstInput = optionGroup.querySelector('[data-variant-input]:not([disabled])');
              if (firstInput) {
                firstInput.checked = true;
                firstInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          } else {
            // Tìm input đầu tiên trong mỗi group (default behavior)
            const firstInput = optionGroup.querySelector('[data-variant-input]');
            if (firstInput && !firstInput.disabled) {
              console.log(`Auto-selecting first input in group ${groupIndex}:`, firstInput.value);
              firstInput.checked = true;
              
              // Trigger change event để cập nhật variant
              firstInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
        
        syncVariantAvailability(); // Initial sync
        
        // Force update variant labels after auto-selection
        setTimeout(() => {
          console.log('=== FORCE UPDATE VARIANT LABELS AFTER AUTO-SELECTION ===');
          const productSelect = container.querySelector(`#ProductSelect-bundle-${currentProduct.id}`);
          if (productSelect && productSelect.value) {
            const selectedVariantId = productSelect.value;
            const selectedVariant = currentProduct.variants.find(v => v.id.toString() === selectedVariantId.toString());
            if (selectedVariant) {
              console.log('Force updating labels for auto-selected variant:', selectedVariant.title);
              updateBundleVariantLabels(selectedVariant, container);
            }
          }
        }, 200);
      }, 100); // Delay nhỏ để đảm bảo DOM đã sẵn sàng
      
      // Use event delegation for variant inputs (works with dynamically created elements)
      container.addEventListener('change', function(event) {
        if (event.target.hasAttribute('data-variant-input')) {
          console.log('=== VARIANT INPUT CHANGED ===');
          console.log('Input value:', event.target.value);
          console.log('Input name:', event.target.name);
          console.log('Input data-index:', event.target.dataset.index);
          
          // Get current product at the beginning to avoid reference error
          const currentProduct = config.bundleProducts[bundleState.currentProductIndex];
          console.log('Current product at start:', currentProduct);
          
          if (!currentProduct) {
            console.error('❌ No current product found for index:', bundleState.currentProductIndex);
            return;
          }
          
          // Get all selected options
          const selectedOptions = {};
          const checkedInputs = container.querySelectorAll('[data-variant-input]:checked');
          console.log('Total checked inputs:', checkedInputs.length);
          
          checkedInputs.forEach((input, index) => {
            console.log(`Checked input ${index}:`, {
              value: input.value,
              name: input.name,
              dataIndex: input.dataset.index,
              id: input.id
            });
            const optionIndex = parseInt(input.dataset.index.replace('option', '')) - 1;
            selectedOptions[optionIndex] = input.value;
            console.log('Selected option:', optionIndex, '=', input.value);
          });
          
          // Ensure at least one option is selected for each option group
          const allVariantInputs = container.querySelectorAll('[data-variant-input]');
          const optionGroups = {};
          
          // Group inputs by option
          allVariantInputs.forEach(input => {
            const optionIndex = parseInt(input.dataset.index.replace('option', '')) - 1;
            if (!optionGroups[optionIndex]) {
              optionGroups[optionIndex] = [];
            }
            optionGroups[optionIndex].push(input);
          });
          
          // For each option group, ensure at least one is selected
          Object.keys(optionGroups).forEach(optionIndex => {
            if (!selectedOptions[optionIndex]) {
              // Find the first checked input in this group, or the first available input
              const groupInputs = optionGroups[optionIndex];
              const checkedInput = groupInputs.find(input => input.checked);
              const firstAvailableInput = groupInputs.find(input => !input.disabled);
              
              const inputToUse = checkedInput || firstAvailableInput;
              if (inputToUse) {
                selectedOptions[optionIndex] = inputToUse.value;
                console.log('✅ Ensured option', optionIndex, '=', inputToUse.value);
              }
            }
          });
          
          console.log('Selected options:', selectedOptions);
          
          // ===== SIMPLE SOLUTION: 2-Way Sync Between Option1 ↔ Option2 =====
          
          // When option1 (Kích thước) changes → update option2 (Comfort top)
          if (event.target.dataset.index === 'option1') {
            console.log('🔄 Option1 changed, updating option2 availability...');
            
            const selectedOption1 = selectedOptions[0];
            if (selectedOption1) {
              // Find all variants that have this option1 value
              const variantsWithThisSize = currentProduct.variants.filter(v => 
                v.options && v.options[0] === selectedOption1
              );
              
              // Get available option2 values for this option1
              const availableOption2Values = [...new Set(
                variantsWithThisSize
                  .filter(v => v.available)
                  .map(v => v.options[1])
                  .filter(val => val) // Remove undefined
              )];
              
              console.log('Available option2 values for', selectedOption1, ':', availableOption2Values);
              
              // Update option2 inputs
              const option2Inputs = container.querySelectorAll('[data-variant-input][data-index="option2"]');
              option2Inputs.forEach(input => {
                const wrapper = input.closest('.variant-input');
                const label = wrapper ? wrapper.querySelector('label') : null;
                
                if (availableOption2Values.includes(input.value)) {
                  input.disabled = false;
                  if (wrapper) wrapper.classList.remove('disabled');
                  if (label) label.classList.remove('disabled');
                  console.log('  ✅ Enabled option2:', input.value);
                } else {
                  input.disabled = true;
                  if (wrapper) wrapper.classList.add('disabled');
                  if (label) label.classList.add('disabled');
                  console.log('  ❌ Disabled option2:', input.value);
                }
              });
            }
          }
          
          // When option2 (Comfort top) changes → update option1 (Kích thước)
          if (event.target.dataset.index === 'option2') {
            console.log('🔄 Option2 changed, updating option1 availability...');
            
            const selectedOption2 = selectedOptions[1];
            if (selectedOption2) {
              // Find all variants that have this option2 value
              const variantsWithThisComfort = currentProduct.variants.filter(v => 
                v.options && v.options[1] === selectedOption2
              );
              
              // Get available option1 values for this option2
              const availableOption1Values = [...new Set(
                variantsWithThisComfort
                  .filter(v => v.available)
                  .map(v => v.options[0])
                  .filter(val => val) // Remove undefined
              )];
              
              console.log('Available option1 values for', selectedOption2, ':', availableOption1Values);
              
              // Update option1 inputs
              const option1Inputs = container.querySelectorAll('[data-variant-input][data-index="option1"]');
              option1Inputs.forEach(input => {
                const wrapper = input.closest('.variant-input');
                const label = wrapper ? wrapper.querySelector('label') : null;
                
                if (availableOption1Values.includes(input.value)) {
                  input.disabled = false;
                  if (wrapper) wrapper.classList.remove('disabled');
                  if (label) label.classList.remove('disabled');
                  console.log('  ✅ Enabled option1:', input.value);
                } else {
                  input.disabled = true;
                  if (wrapper) wrapper.classList.add('disabled');
                  if (label) label.classList.add('disabled');
                  console.log('  ❌ Disabled option1:', input.value);
                }
              });
            }
          }
          
          // Find matching variant - IMPROVED LOGIC
          console.log('=== VARIANT MATCHING DEBUG ===');
          console.log('Current product variants count:', currentProduct.variants.length);
          console.log('Selected options to match:', selectedOptions);
          console.log('Selected options keys:', Object.keys(selectedOptions));
          
          const matchingVariant = currentProduct.variants.find(variant => {
            console.log(`\n--- Checking variant: ${variant.title} ---`);
            console.log('Variant options:', variant.options);
            
            if (!variant.options) {
              console.log('❌ Variant has no options array');
              return false;
            }
            
            // Check if all selected options match this variant
            const matches = variant.options.every((option, index) => {
              const selectedOption = selectedOptions[index];
              const optionMatches = option === selectedOption;
              console.log(`  Option ${index}: variant="${option}" vs selected="${selectedOption}" = ${optionMatches}`);
              return optionMatches;
            });
            
            console.log(`Result for ${variant.title}:`, {
              variantOptions: variant.options,
              selectedOptions: selectedOptions,
              matches: matches
            });
            
            return matches;
          });
          
          // IMMEDIATELY update variant labels when options change
          console.log('=== IMMEDIATE VARIANT LABEL UPDATE ===');
          if (matchingVariant) {
            console.log('Found matching variant, updating labels immediately:', matchingVariant.title);
            updateBundleVariantLabels(matchingVariant, container);
          } else {
            console.log('No matching variant found yet, will update later');
          }
          
          console.log('Matching variant:', matchingVariant);
          
          // Fallback: If no matching variant found, use the first available variant
          let variantToUse = matchingVariant;
          if (!variantToUse) {
            console.log('❌ No matching variant found, using fallback...');
            console.log('Available variants:', currentProduct.variants.map(v => ({
              title: v.title,
              options: v.options
            })));
            
            // Try to find a variant that matches at least the first option (size)
            if (selectedOptions[0]) {
              variantToUse = currentProduct.variants.find(v => v.options && v.options[0] === selectedOptions[0]);
              console.log('Fallback variant found by size:', variantToUse ? variantToUse.title : 'none');
            }
            
            // If still no match, use the first available variant
            if (!variantToUse) {
              variantToUse = currentProduct.variants.find(v => v.available !== false) || currentProduct.variants[0];
              console.log('Using first available variant as final fallback:', variantToUse ? variantToUse.title : 'none');
            }
          }
          
          if (variantToUse) {
            console.log('✅ Using variant:', variantToUse.title);
            console.log('Variant price:', variantToUse.price);
            
            // Update product select
            const productSelect = container.querySelector(`#ProductSelect-bundle-${currentProduct.id}`);
            if (productSelect) {
              productSelect.value = variantToUse.id;
              productSelect.dispatchEvent(new Event('change'));
              console.log('✅ Updated product select to variant ID:', variantToUse.id);
            }
            
            // Check if price elements exist before updating
            const priceContainer = container.querySelector('.price-container-wrapper');
            console.log('Price container found:', !!priceContainer);
            if (priceContainer) {
              const mainPriceElement = priceContainer.querySelector('[data-product-price]');
              console.log('Main price element found:', !!mainPriceElement);
            }
            
            // Update price and labels
            console.log('=== UPDATING UI ===');
            console.log('Calling updateBundleProductPrice...');
            updateBundleProductPrice(variantToUse, container);
            console.log('Calling updateBundleVariantLabels...');
            updateBundleVariantLabels(variantToUse, container);
            console.log('UI update completed');
            
                    // Dispatch custom event
          container.dispatchEvent(new CustomEvent('variantChange', {
            detail: { variant: variantToUse }
          }));
          
          // Also update the bundle state immediately for this product
          console.log('=== BUNDLE STATE UPDATE DEBUG ===');
          console.log('currentProductIndex:', bundleState.currentProductIndex);
          console.log('currentProduct:', currentProduct);
          console.log('variantToUse:', variantToUse);
          
          if (currentProduct) {
            // Get variant image
            let variantImage = currentProduct.featured_image;
            if (variantToUse.featured_image) {
              variantImage = variantToUse.featured_image;
            } else if (currentProduct.media && currentProduct.media.length > 0) {
              const variantMedia = currentProduct.media.find(media => {
                const mediaAlt = (media.alt || '').toLowerCase();
                const mediaTitle = (media.title || '').toLowerCase();
                const variantTitle = variantToUse.title.toLowerCase();
                
                return mediaAlt.includes(variantTitle) || 
                       mediaTitle.includes(variantTitle) ||
                       variantToUse.options && variantToUse.options.some(option => {
                         const optionLower = option.toLowerCase();
                         return mediaAlt.includes(optionLower) || mediaTitle.includes(optionLower);
                       });
              });
              
              if (variantMedia) {
                variantImage = variantMedia.src;
              }
            }
            
            // Update bundle state immediately
            const existingIndex = bundleState.selectedProducts.bundle.findIndex(p => p.productId === currentProduct.id);
            if (existingIndex >= 0) {
              bundleState.selectedProducts.bundle[existingIndex].variantTitle = variantToUse.title;
              bundleState.selectedProducts.bundle[existingIndex].variantId = variantToUse.id;
              bundleState.selectedProducts.bundle[existingIndex].variantPrice = variantToUse.price;
              bundleState.selectedProducts.bundle[existingIndex].compareAtPrice = variantToUse.compare_at_price;
              bundleState.selectedProducts.bundle[existingIndex].variantOptions = variantToUse.options;
              bundleState.selectedProducts.bundle[existingIndex].image = extractImageUrl(variantImage);
              console.log('✅ Updated bundle state immediately for product:', currentProduct.title, 'variant:', variantToUse.title, 'image:', variantImage);
              console.log('✅ Bundle state updated:', bundleState.selectedProducts.bundle[existingIndex]);
              console.log('✅ Variant options saved:', variantToUse.options);
              console.log('✅ Variant options type:', typeof variantToUse.options);
              console.log('✅ Variant options is array:', Array.isArray(variantToUse.options));
              console.log('✅ Variant options length:', variantToUse.options ? variantToUse.options.length : 'undefined');
              
              // Check if this is the first product and has size variant
              if (bundleState.currentProductIndex === 0 && variantToUse.options && variantToUse.options.length > 0) {
                const firstOption = variantToUse.options[0];
                const isSizeOption = firstOption && (
                  firstOption.toLowerCase().includes('single') || 
                  firstOption.toLowerCase().includes('full') || 
                  firstOption.toLowerCase().includes('queen') || 
                  firstOption.toLowerCase().includes('king') ||
                  firstOption.toLowerCase().includes('150') ||
                  firstOption.toLowerCase().includes('180') ||
                  firstOption.toLowerCase().includes('200') ||
                  firstOption.toLowerCase().includes('220') ||
                  firstOption.toLowerCase().includes('250') ||
                  firstOption.toLowerCase().includes('300') ||
                  firstOption.toLowerCase().includes('cm')
                );
                
                if (isSizeOption) {
                  console.log('🎯 First product size selected:', firstOption);
                  console.log('🔒 Locking size for all other products to:', firstOption);
                  
                  // Store the selected size for other products
                  bundleState.lockedSize = firstOption;
                  
                  // Update all other products in bundle to use the same size
                  bundleState.selectedProducts.bundle.forEach((product, index) => {
                    if (index > 0) { // Skip first product
                      const productData = config.bundleProducts.find(p => p.id === product.productId);
                      if (productData && productData.variants) {
                        // Find variant with matching size (improved logic)
                        const matchingVariant = productData.variants.find(variant => {
                          if (!variant.options || variant.options.length === 0) return false;
                          
                          const variantSize = variant.options[0];
                          
                          // Direct match
                          if (variantSize === firstOption) {
                            return true;
                          }
                          
                          // Extract dimensions from both sizes
                          const extractDimensions = (sizeStr) => {
                            const dimensions = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
                            if (dimensions) {
                              return {
                                width: parseInt(dimensions[1]),
                                height: parseInt(dimensions[2])
                              };
                            }
                            return null;
                          };
                          
                          const firstDimensions = extractDimensions(firstOption);
                          const variantDimensions = extractDimensions(variantSize);
                          
                          // If both have dimensions, compare them
                          if (firstDimensions && variantDimensions) {
                            return firstDimensions.width === variantDimensions.width && 
                                   firstDimensions.height === variantDimensions.height;
                          }
                          
                          // Fallback: check if both contain same size keywords
                          const sizeKeywords = ['single', 'full', 'queen', 'king', '150', '180', '200', '220', '250', '300'];
                          const firstHasKeyword = sizeKeywords.some(keyword => 
                            firstOption.toLowerCase().includes(keyword)
                          );
                          const variantHasKeyword = sizeKeywords.some(keyword => 
                            variantSize.toLowerCase().includes(keyword)
                          );
                          
                          if (firstHasKeyword && variantHasKeyword) {
                            // Check if they share any size keyword
                            return sizeKeywords.some(keyword => 
                              firstOption.toLowerCase().includes(keyword) && 
                              variantSize.toLowerCase().includes(keyword)
                            );
                          }
                          
                          return false;
                        });
                        
                        if (matchingVariant) {
                          console.log(`🔒 Auto-updating product ${bundleState.currentProductIndex + 1} (${product.productTitle}) to size: ${firstOption}`);
                          product.variantId = matchingVariant.id;
                          product.variantTitle = matchingVariant.title;
                          product.variantPrice = matchingVariant.price;
                          product.compareAtPrice = matchingVariant.compare_at_price;
                          product.variantOptions = matchingVariant.options;
                        }
                      }
                    }
                  });
                }
              }
              
              // If we have a locked size and this is not the first product, disable other size options
              if (bundleState.lockedSize && bundleState.currentProductIndex > 0) {
                const sizeInputs = container.querySelectorAll('.variant-wrapper.size [data-variant-input]');
                sizeInputs.forEach(input => {
                  const inputValue = input.value;
                  
                  // Check if this input matches the locked size (using improved logic)
                  const isMatchingSize = (() => {
                    // Direct match
                    if (inputValue === bundleState.lockedSize) {
                      return true;
                    }
                    
                    // Extract dimensions from both sizes
                    const extractDimensions = (sizeStr) => {
                      const dimensions = sizeStr.match(/(\d+)\s*x\s*(\d+)/i);
                      if (dimensions) {
                        return {
                          width: parseInt(dimensions[1]),
                          height: parseInt(dimensions[2])
                        };
                      }
                      return null;
                    };
                    
                    const lockedDimensions = extractDimensions(bundleState.lockedSize);
                    const inputDimensions = extractDimensions(inputValue);
                    
                    // If both have dimensions, compare them
                    if (lockedDimensions && inputDimensions) {
                      return lockedDimensions.width === inputDimensions.width && 
                             lockedDimensions.height === inputDimensions.height;
                    }
                    
                    // Fallback: check if both contain same size keywords
                    const sizeKeywords = ['single', 'full', 'queen', 'king', '150', '180', '200', '220', '250', '300'];
                    const lockedHasKeyword = sizeKeywords.some(keyword => 
                      bundleState.lockedSize.toLowerCase().includes(keyword)
                    );
                    const inputHasKeyword = sizeKeywords.some(keyword => 
                      inputValue.toLowerCase().includes(keyword)
                    );
                    
                    if (lockedHasKeyword && inputHasKeyword) {
                      // Check if they share any size keyword
                      return sizeKeywords.some(keyword => 
                        bundleState.lockedSize.toLowerCase().includes(keyword) && 
                        inputValue.toLowerCase().includes(keyword)
                      );
                    }
                    
                    return false;
                  })();
                  
                  if (!isMatchingSize) {
                    input.disabled = true;
                    input.closest('.variant__button-label')?.classList.add('disabled');
                    console.log(`🔒 Disabled size option: ${input.value}`);
                  } else {
                    input.disabled = false;
                    input.closest('.variant__button-label')?.classList.remove('disabled');
                    console.log(`🔒 Enabled matching size option: ${input.value}`);
                  }
                });
              }
            } else {
              // Add new product to bundle state
              // Determine quantity (index 2 = product 3)
              const productQuantity = bundleState.currentProductIndex === 2 ? (config.product3Quantity || 2) : 1;
              
              const newProduct = {
                productId: currentProduct.id,
                productHandle: currentProduct.handle,
                productTitle: currentProduct.title,
                image: variantImage,
                variantId: variantToUse.id,
                variantTitle: variantToUse.title,
                variantPrice: variantToUse.price,
                compareAtPrice: variantToUse.compare_at_price,
                variantOptions: variantToUse.options,
                quantity: productQuantity
              };
              bundleState.selectedProducts.bundle.push(newProduct);
              console.log('✅ Added new product to bundle state:', newProduct);
              console.log('✅ Variant options saved:', variantToUse.options);
              console.log('✅ Variant options type:', typeof variantToUse.options);
              console.log('✅ Variant options is array:', Array.isArray(variantToUse.options));
              console.log('✅ Variant options length:', variantToUse.options ? variantToUse.options.length : 'undefined');
            }
          }
          } else {
            console.log('❌ No matching variant found for options:', selectedOptions);
            console.log('Available variants:', currentProduct.variants.map(v => ({
              title: v.title,
              options: v.options
            })));
          }
        }
      });
      
      // Listen to variant change events
      container.addEventListener('variantChange', function(evt) {
        console.log('Variant change event:', evt.detail);
        const variant = evt.detail.variant;
        
        if (variant) {
          updateBundleProductPrice(variant, container);
          updateBundleVariantLabels(variant, container);
        }
      });
      
      console.log('✅ Variant picker initialized successfully');
    }
  
    function updateBundleVariantLabels(variant, container) {
      console.log('=== UPDATE VARIANT LABELS ===');
      console.log('Function called with variant:', variant);
      console.log('Updating variant labels for variant:', variant.title);
      console.log('Variant options:', variant.options);
      
      if (!variant || !variant.options || !container) {
        console.warn('❌ Missing variant, options, or container');
        return;
      }
      
      // Find all variant__label-info elements
      const allLabelInfoElements = container.querySelectorAll('.variant__label-info');
      console.log('Found variant__label-info elements:', allLabelInfoElements.length);
      
      // Update each label based on its data-index
      allLabelInfoElements.forEach((labelInfo, index) => {
        const dataIndex = labelInfo.getAttribute('data-index');
        console.log(`Label ${index}: data-index = ${dataIndex}`);
        
        if (dataIndex !== null) {
          const optionIndex = parseInt(dataIndex);
          console.log(`Label ${index}: optionIndex = ${optionIndex}`);
          
          if (!isNaN(optionIndex) && variant.options && variant.options[optionIndex]) {
            const newValue = variant.options[optionIndex];
            console.log(`Updating label ${index} to: ${newValue}`);
            
            // Try to update the inner span with data-variant-selected-label first
            const innerSpan = labelInfo.querySelector('span[data-variant-selected-label]');
            if (innerSpan) {
              innerSpan.textContent = newValue;
              console.log('✅ Updated inner span to:', newValue);
            } else {
              // Fallback: update the container's text content
              labelInfo.textContent = newValue;
              console.log('✅ Updated container text to:', newValue);
            }
          }
        } else {
          // If no data-index, try to determine the option by position
          console.log(`Label ${index} has no data-index, trying position-based update`);
          
          // Get the parent label to determine which option this is
          const parentLabel = labelInfo.closest('.variant__label');
          if (parentLabel) {
            const labelText = parentLabel.textContent.toLowerCase();
            console.log(`Parent label text: ${labelText}`);
            
            if (labelText.includes('kích thước') || labelText.includes('size')) {
              // This is a size label (option 0)
              if (variant.options && variant.options[0]) {
                const innerSpan = labelInfo.querySelector('span[data-variant-selected-label]');
                if (innerSpan) {
                  innerSpan.textContent = variant.options[0];
                } else {
                  labelInfo.textContent = variant.options[0];
                }
                console.log('✅ Updated size label to:', variant.options[0]);
              }
            } else if (labelText.includes('màu') || labelText.includes('color') || labelText.includes('màu sắc')) {
              // This is a color label (option 1)
              if (variant.options && variant.options[1]) {
                const innerSpan = labelInfo.querySelector('span[data-variant-selected-label]');
                if (innerSpan) {
                  innerSpan.textContent = variant.options[1];
                } else {
                  labelInfo.textContent = variant.options[1];
                }
                console.log('✅ Updated color label to:', variant.options[1]);
              }
            } else if (labelText.includes('comfort') || labelText.includes('độ cứng')) {
              // This might be a comfort/firmness label (option 2)
              if (variant.options && variant.options[2]) {
                const innerSpan = labelInfo.querySelector('span[data-variant-selected-label]');
                if (innerSpan) {
                  innerSpan.textContent = variant.options[2];
                } else {
                  labelInfo.textContent = variant.options[2];
                }
                console.log('✅ Updated comfort label to:', variant.options[2]);
              }
            }
          }
        }
      });
      
      // Also update any spans with data-variant-selected-label directly
      const selectedLabelSpans = container.querySelectorAll('span[data-variant-selected-label]');
      console.log('Found data-variant-selected-label spans:', selectedLabelSpans.length);
      
      selectedLabelSpans.forEach((span, index) => {
        const parentLabelInfo = span.closest('.variant__label-info');
        if (parentLabelInfo) {
          const dataIndex = parentLabelInfo.getAttribute('data-index');
          if (dataIndex !== null) {
            const optionIndex = parseInt(dataIndex);
            if (!isNaN(optionIndex) && variant.options && variant.options[optionIndex]) {
              span.textContent = variant.options[optionIndex];
              console.log(`✅ Updated selected label span ${index} to:`, variant.options[optionIndex]);
            }
          }
        }
      });
      
      // Update color swatch visual state
      updateColorSwatchState(variant, container);
      
      console.log('✅ Variant labels update completed');
    }
  
    function updateBundleProductPrice(variant, container) {
      console.log('=== UPDATE PRODUCT PRICE ===');
      console.log('Updating product price for variant:', variant.title);
      console.log('Variant price:', variant.price, 'Compare price:', variant.compare_at_price);
      
      // Update price elements
      const priceContainer = container.querySelector('.price-container-wrapper');
      console.log('Price container found:', !!priceContainer);
      
      if (priceContainer) {
        // Update main price
        const mainPriceElement = priceContainer.querySelector('[data-product-price]');
        console.log('Main price element found:', !!mainPriceElement);
        console.log('Main price element before update:', mainPriceElement ? mainPriceElement.textContent : 'not found');
        
        if (mainPriceElement) {
          const formattedPrice = BundleUtils.formatMoney(variant.price);
          mainPriceElement.textContent = formattedPrice;
          console.log('✅ Updated main price from', mainPriceElement.getAttribute('data-product-price-base'), 'to:', formattedPrice);
          console.log('✅ Main price element after update:', mainPriceElement.textContent);
        }
        
        // Update compare price
        const comparePriceElement = priceContainer.querySelector('[data-compare-price]');
        console.log('Compare price element found:', !!comparePriceElement);
        console.log('Compare price element before update:', comparePriceElement ? comparePriceElement.textContent : 'not found');
        
        if (comparePriceElement) {
          if (variant.compare_at_price) {
            const formattedComparePrice = BundleUtils.formatMoney(variant.compare_at_price);
            comparePriceElement.textContent = formattedComparePrice;
            comparePriceElement.style.display = 'inline';
            console.log('✅ Updated compare price to:', formattedComparePrice);
            console.log('✅ Compare price element after update:', comparePriceElement.textContent);
          } else {
            comparePriceElement.style.display = 'none';
            console.log('✅ Hiding compare price');
          }
        }
        
        // Update discount badge
        const discountBadge = priceContainer.querySelector('.product__discount-badge');
        console.log('Discount badge found:', !!discountBadge);
        console.log('Discount badge before update:', discountBadge ? discountBadge.textContent : 'not found');
        
        if (discountBadge) {
          if (variant.compare_at_price) {
            const discountPercent = Math.round((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
            discountBadge.textContent = `-${discountPercent}%`;
            discountBadge.style.display = 'inline';
            console.log('✅ Updated discount badge to:', `-${discountPercent}%`);
            console.log('✅ Discount badge after update:', discountBadge.textContent);
          } else {
            discountBadge.style.display = 'none';
            console.log('✅ Hiding discount badge');
          }
        }
      }
      
      // Update installment price
      const installmentPrice = container.querySelector('[data-installment-price]');
      if (installmentPrice) {
        const installmentAmount = Math.round(variant.price / 12);
        installmentPrice.textContent = BundleUtils.formatMoney(installmentAmount);
        console.log('✅ Updated installment price to:', BundleUtils.formatMoney(installmentAmount));
      }
      
      console.log('✅ Price update completed');
      
      // Update product image if variant has different image
      updateBundleProductImage(variant, container);
    }
  
    // Update bundle product image when variant changes
    function updateBundleProductImage(variant, container) {
      console.log('=== UPDATE BUNDLE PRODUCT IMAGE ===');
      console.log('Updating product image for variant:', variant.title);
      console.log('Variant featured_image:', variant.featured_image);
      
      if (!variant || !container) {
        console.warn('❌ Missing variant or container');
        return;
      }
      
      // For Step 2, we need to find the image column (left side), not the info column (right side)
      // The container passed in might be the product-item container, so we need to search broader
      const step2ImageColumn = document.getElementById(`Step2ImageColumn-${sectionId}`);
      const imageContainer = step2ImageColumn || container;
      
      console.log('🔍 Image container:', imageContainer);
      console.log('🔍 Container class:', imageContainer ? imageContainer.className : 'N/A');
      
      // Find the main product image elements
      const mainImageElements = imageContainer.querySelectorAll('.product-featured-img, .product-image-main img, [data-product-image-main] img');
      console.log('Found main image elements:', mainImageElements.length);
      
      // Find the main slide elements
      const mainSlides = imageContainer.querySelectorAll('.product-main-slide');
      console.log('Found main slide elements:', mainSlides.length);
      
      // Get variant image URL
      let variantImageUrl = '';
      
      if (variant.featured_image) {
        variantImageUrl = extractImageUrl(variant.featured_image);
        console.log('Using variant featured_image:', variantImageUrl);
      } else {
        // Try to find variant image from product media
        const currentProduct = config.bundleProducts[bundleState.currentProductIndex];
        if (currentProduct && currentProduct.media && currentProduct.media.length > 0) {
          // Look for media that matches the variant
          const variantMedia = currentProduct.media.find(media => {
            const mediaAlt = (media.alt || '').toLowerCase();
            const mediaTitle = (media.title || '').toLowerCase();
            const variantTitle = variant.title.toLowerCase();
            
            // Check if media alt/title contains variant options
            return variant.options && variant.options.some(option => {
              const optionLower = option.toLowerCase();
              return mediaAlt.includes(optionLower) || mediaTitle.includes(optionLower);
            }) || mediaAlt.includes(variantTitle) || mediaTitle.includes(variantTitle);
          });
          
          if (variantMedia) {
            variantImageUrl = extractImageUrl(variantMedia);
            console.log('Found variant image from media:', variantImageUrl);
          } else {
            // Fallback to first product image
            variantImageUrl = extractImageUrl(currentProduct.featured_image);
            console.log('Using fallback product image:', variantImageUrl);
          }
        } else {
          // Fallback to product featured image
          const currentProduct = config.bundleProducts[bundleState.currentProductIndex];
          if (currentProduct) {
            variantImageUrl = extractImageUrl(currentProduct.featured_image);
            console.log('Using product featured_image as fallback:', variantImageUrl);
          }
        }
      }
      
      if (!variantImageUrl) {
        console.warn('❌ No variant image URL found');
        return;
      }
      
      console.log('Final variant image URL:', variantImageUrl);
      
      // Update main image elements
      mainImageElements.forEach((img, index) => {
        console.log(`Updating main image ${index}:`, img.src, '->', variantImageUrl);
        img.src = variantImageUrl;
        img.alt = variant.title || img.alt;
        
        // Trigger image load event
        img.dispatchEvent(new Event('load'));
      });
      
      // Update main slides - show the first slide and update its image
      if (mainSlides.length > 0) {
        const firstSlide = mainSlides[0];
        const slideImg = firstSlide.querySelector('img');
        
        if (slideImg) {
          console.log('Updating first slide image:', slideImg.src, '->', variantImageUrl);
          slideImg.src = variantImageUrl;
          slideImg.alt = variant.title || slideImg.alt;
          
          // Show the first slide
          firstSlide.style.display = 'block';
          firstSlide.classList.add('starting-slide');
          firstSlide.classList.remove('secondary-slide');
          
          // Hide other slides
          mainSlides.forEach((slide, index) => {
            if (index > 0) {
              slide.style.display = 'none';
              slide.classList.remove('starting-slide');
              slide.classList.add('secondary-slide');
            }
          });
          
          // Trigger image load event
          slideImg.dispatchEvent(new Event('load'));
        }
      }
      
      // Sync with Flickity if it exists
      const slideshowElement = imageContainer.querySelector('.product-slideshow, [data-product-photos]');
      if (slideshowElement && window.Flickity) {
        const flickityInstance = Flickity.data(slideshowElement);
        if (flickityInstance) {
          console.log('🔄 Syncing Flickity with variant image change');
          
          // Force Flickity to re-read the DOM and update
          flickityInstance.reloadCells();
          flickityInstance.resize();
          flickityInstance.reposition();
          
          // Select the first slide to show the variant image
          flickityInstance.select(0, false, true);
          
          console.log('✅ Flickity synced with new variant image');
        }
      }
      
      // Fallback: Ensure first slide is visible if Flickity isn't active
      if (!slideshowElement || !Flickity.data(slideshowElement)) {
        const firstSlide = mainSlides[0];
        if (firstSlide) {
          firstSlide.style.display = 'block';
          firstSlide.classList.add('starting-slide', 'is-selected');
          console.log('✅ First slide made visible (no Flickity)');
        }
      }
      
      // Update thumbnails if they exist
      const thumbnails = imageContainer.querySelectorAll('[data-product-thumb] img, .product__thumb img');
      console.log('Found thumbnail images:', thumbnails.length);
      
      // Find the thumbnail that matches the variant image
      let matchingThumbnail = null;
      thumbnails.forEach((thumb, index) => {
        if (thumb.src === variantImageUrl || thumb.getAttribute('data-src') === variantImageUrl) {
          matchingThumbnail = thumb;
          console.log(`Found matching thumbnail ${index}`);
        }
      });
      
      // If we found a matching thumbnail, make it active
      if (matchingThumbnail) {
        // Remove active state from all thumbnails
        thumbnails.forEach(thumb => {
          const thumbContainer = thumb.closest('[data-product-thumb], .product__thumb');
          if (thumbContainer) {
            thumbContainer.classList.remove('active', 'active-thumb');
          }
        });
        
        // Add active state to matching thumbnail
        const matchingThumbContainer = matchingThumbnail.closest('[data-product-thumb], .product__thumb');
        if (matchingThumbContainer) {
          matchingThumbContainer.classList.add('active', 'active-thumb');
          console.log('✅ Activated matching thumbnail');
        }
      } else {
        // If no matching thumbnail, activate the first one
        if (thumbnails.length > 0) {
          const firstThumb = thumbnails[0];
          const firstThumbContainer = firstThumb.closest('[data-product-thumb], .product__thumb');
          if (firstThumbContainer) {
            // Remove active state from all thumbnails
            thumbnails.forEach(thumb => {
              const thumbContainer = thumb.closest('[data-product-thumb], .product__thumb');
              if (thumbContainer) {
                thumbContainer.classList.remove('active', 'active-thumb');
              }
            });
            
            // Add active state to first thumbnail
            firstThumbContainer.classList.add('active', 'active-thumb');
            console.log('✅ Activated first thumbnail as fallback');
          }
        }
      }
      
      console.log('✅ Product image update completed');
    }
  
    function updateColorSwatchState(variant, container) {
      console.log('=== UPDATE COLOR SWATCH STATE ===');
      console.log('Updating color swatch state for variant:', variant.title);
      
      // Remove active state from all color swatches
      const allColorSwatches = container.querySelectorAll('.color-swatch');
      allColorSwatches.forEach(swatch => {
        swatch.classList.remove('active', 'selected');
      });
      
      // Add active state to the selected color swatch
      if (variant.options && variant.options[1]) { // Assuming option2 is color
        // Try multiple selectors to find the color swatch
        let selectedColorSwatch = container.querySelector(`.color-swatch[for*="${variant.options[1].replace(/\s+/g, '-')}"]`);
        
        if (!selectedColorSwatch) {
          // Try finding by data-color-name attribute
          const colorInput = container.querySelector(`[data-variant-input][data-color-name="${variant.options[1]}"]`);
          if (colorInput) {
            selectedColorSwatch = container.querySelector(`label[for="${colorInput.id}"]`);
          }
        }
        
        if (selectedColorSwatch) {
          selectedColorSwatch.classList.add('active', 'selected');
          console.log('✅ Updated color swatch state for:', variant.options[1]);
        } else {
          console.log('❌ Could not find color swatch for:', variant.options[1]);
          console.log('Available color swatches:', container.querySelectorAll('.color-swatch').length);
          console.log('Available color inputs:', container.querySelectorAll('[data-variant-input][data-color-name]').length);
        }
      }
      
      // Also update the input state
      const colorInputs = container.querySelectorAll('[data-variant-input][data-color-name]');
      colorInputs.forEach(input => {
        if (input.value === variant.options[1]) {
          input.checked = true;
          console.log('✅ Updated color input state for:', variant.options[1]);
        } else {
          input.checked = false;
        }
      });
    }
  
  
  
    function renderIconWithText(settings) {
      if (!config.iconWithTextSettings) {
                // Fallback to default icons if no settings
          return `
            <div class="product-block">
              <div class="icon-with-text">
                <div class="icon-with-text__grid">
                  <div class="icon-with-text__item">
                    <div class="icon-with-text__icon">
                      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="icon-with-text__content">
                      <h3 class="icon-with-text__heading">Miễn phí vận chuyển *</h3>
                    </div>
                  </div>
                  
                  <div class="icon-with-text__item">
                    <div class="icon-with-text__icon">
                      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="icon-with-text__content">
                      <h3 class="icon-with-text__heading">Bảo hành dài lâu</h3>
                    </div>
                  </div>
                  
                  <div class="icon-with-text__item">
                    <div class="icon-with-text__icon">
                      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 5V3a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div class="icon-with-text__content">
                      <h3 class="icon-with-text__heading">Chất liệu Foam cao cấp</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
      }
  
      const iconSettings = config.iconWithTextSettings;
      const iconSize = iconSettings.icon_size || 25;
      const alignment = iconSettings.icon_alignment || 'center';
      const gridColumns = iconSettings.grid_columns || "2";
      const showIcon4 = iconSettings.show_icon_4 !== false; // Default to true
      
      let iconItems = [];
      
      // Icon 1
      if (iconSettings.icon_1_image || iconSettings.icon_1_heading) {
        const icon1Html = `
          <div class="icon-with-text__item">
            <div class="icon-with-text__icon">
              ${iconSettings.icon_1_image ? 
                `<img src="${iconSettings.icon_1_image}" 
                     alt="${iconSettings.icon_1_heading || 'Icon 1'}"
                     width="${iconSize}"
                     height="${iconSize}"
                     style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain;">` :
                `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>`
              }
            </div>
            <div class="icon-with-text__content">
              <h3 class="icon-with-text__heading">${iconSettings.icon_1_heading || '100 đêm ngủ thử'}</h3>
            </div>
          </div>
        `;
        iconItems.push(icon1Html);
      }
      
      // Icon 2
      if (iconSettings.icon_2_image || iconSettings.icon_2_heading) {
        const icon2Html = `
          <div class="icon-with-text__item">
            <div class="icon-with-text__icon">
              ${iconSettings.icon_2_image ? 
                `<img src="${iconSettings.icon_2_image}" 
                     alt="${iconSettings.icon_2_heading || 'Icon 2'}"
                     width="${iconSize}"
                     height="${iconSize}"
                     style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain;">` :
                `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 5V3a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
              }
            </div>
            <div class="icon-with-text__content">
              <h3 class="icon-with-text__heading">${iconSettings.icon_2_heading || 'Miễn phí vận chuyển *'}</h3>
            </div>
          </div>
        `;
        iconItems.push(icon2Html);
      }
      
      // Icon 3
      if (iconSettings.icon_3_image || iconSettings.icon_3_heading) {
        const icon3Html = `
          <div class="icon-with-text__item">
            <div class="icon-with-text__icon">
              ${iconSettings.icon_3_image ? 
                `<img src="${iconSettings.icon_3_image}" 
                     alt="${iconSettings.icon_3_heading || 'Icon 3'}"
                     width="${iconSize}"
                     height="${iconSize}"
                     style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain;">` :
                `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
              }
            </div>
            <div class="icon-with-text__content">
              <h3 class="icon-with-text__heading">${iconSettings.icon_3_heading || 'Bảo hành dài lâu'}</h3>
            </div>
          </div>
        `;
        iconItems.push(icon3Html);
      }
      
      // Icon 4
      if (showIcon4 && (iconSettings.icon_4_image || iconSettings.icon_4_heading)) {
        const icon4Html = `
          <div class="icon-with-text__item">
            <div class="icon-with-text__icon">
              ${iconSettings.icon_4_image ? 
                `<img src="${iconSettings.icon_4_image}" 
                     alt="${iconSettings.icon_4_heading || 'Icon 4'}"
                     width="${iconSize}"
                     height="${iconSize}"
                     style="width: ${iconSize}px; height: ${iconSize}px; object-fit: contain;">` :
                `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8 5V3a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`
              }
            </div>
            <div class="icon-with-text__content">
              <h3 class="icon-with-text__heading">${iconSettings.icon_4_heading || 'Chất liệu Foam cao cấp'}</h3>
            </div>
          </div>
        `;
        iconItems.push(icon4Html);
      }
      
      return `
        <div class="product-block">
          <div class="icon-with-text">
            <div class="icon-with-text__grid" style="text-align: ${alignment};" data-columns="${gridColumns}">
              ${iconItems.join('')}
            </div>
          </div>
        </div>
      `;
    }
  
    
    // ===== BUNDLE PRICING CALCULATOR (Theme Editor Only) =====
    function runPricingCalculator() {
      const calculatorResults = document.getElementById('calculator-results');
      if (!calculatorResults) return; // Not in theme editor
      
      console.log('=== RUNNING PRICING CALCULATOR ===');
      
      if (!config.bundleProducts || config.bundleProducts.length === 0) {
        calculatorResults.innerHTML = `
          <p style="margin: 8px 0; color: #E53E3E; font-size: 14px;">
            ⚠️ <strong>Chưa có bundle products!</strong> Vui lòng add products vào bundle trước.
          </p>
        `;
        return;
      }
      
      const targetDiscount = config.targetDiscountPercentage || 15;
      
      // Calculate totals for all bundle products
      let totalPrice = 0;           // Tổng price hiện tại
      let totalCompareAtPrice = 0;  // Tổng compare_at_price
      
      const productCalculations = config.bundleProducts.map((product, idx) => {
        // Get first variant or use product price
        const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        const price = variant ? variant.price : product.price;
        const compareAtPrice = variant ? (variant.compare_at_price || variant.price) : (product.compare_at_price || product.price);
        
        // Determine quantity (product index 2 = product thứ 3)
        const quantity = idx === 2 ? (config.product3Quantity || 2) : 1;
        
        totalPrice += price * quantity;
        totalCompareAtPrice += compareAtPrice * quantity;
        
        // Calculate current discount for this product
        const currentDiscount = compareAtPrice > 0 ? 
          Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;
        
        return {
          title: product.title,
          price: price,
          compareAtPrice: compareAtPrice,
          currentDiscount: currentDiscount,
          quantity: quantity
        };
      });
      
      // Calculate bundle-level metrics
      const currentBundleDiscount = totalCompareAtPrice > 0 ? 
        Math.round(((totalCompareAtPrice - totalPrice) / totalCompareAtPrice) * 100) : 0;
      
      // Calculate target final price (ideal)
      const targetFinalPriceIdeal = totalCompareAtPrice * (1 - targetDiscount / 100);
      
      // CÔNG THỨC: Voucher % = (Current Price - Target Price) / Current Price × 100
      const neededVoucherDiscountExact = totalPrice > 0 ? 
        ((totalPrice - targetFinalPriceIdeal) / totalPrice) * 100 : 0;
      
      // Round voucher về số nguyên (Shopify không hỗ trợ thập phân)
      const neededVoucherDiscountRounded = Math.round(neededVoucherDiscountExact);
      
      // Tính giá cuối THỰC TẾ sau 2 tầng giảm
      // = Compare-at Price × (1 - currentDiscount%) × (1 - voucherDiscount%)
      const actualFinalPrice = totalPrice * (1 - neededVoucherDiscountRounded / 100);
      
      // Generate HTML
      calculatorResults.innerHTML = `
        <div style="margin-bottom: 16px;">
          <h4 style="color: #234085; margin: 0 0 12px 0; font-size: 16px;">📊 Phân tích Bundle:</h4>
          ${productCalculations.map((product, idx) => `
            <div style="padding: 8px; background: #F9FAFB; border-radius: 4px; margin-bottom: 8px; font-size: 13px;">
              <strong>${idx + 1}. ${product.title}</strong>
              ${product.quantity > 1 ? `<span style="color: #234085; font-weight: 600;"> × ${product.quantity}</span>` : ''}<br>
              <span style="color: #888;">Price: ${BundleUtils.formatMoney(product.price)}${product.quantity > 1 ? ` × ${product.quantity} = ${BundleUtils.formatMoney(product.price * product.quantity)}` : ''}</span><br>
              <span style="color: #666;">Compare: ${BundleUtils.formatMoney(product.compareAtPrice)}${product.quantity > 1 ? ` × ${product.quantity} = ${BundleUtils.formatMoney(product.compareAtPrice * product.quantity)}` : ''}</span> | 
              <span style="color: ${product.currentDiscount > 0 ? '#16A34A' : '#888'};">
                Giảm: ${product.currentDiscount}%
              </span>
            </div>
          `).join('')}
        </div>
        
        <div style="background: #F0F9FF; padding: 16px; border-radius: 8px; border-left: 4px solid #234085;">
          <div style="margin-bottom: 12px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Tổng Compare-at Price:</div>
            <div style="font-size: 20px; font-weight: bold; color: #1C2C58;">${BundleUtils.formatMoney(totalCompareAtPrice)}</div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Tổng Price hiện tại:</div>
            <div style="font-size: 20px; font-weight: bold; color: #16A34A;">${BundleUtils.formatMoney(totalPrice)}</div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">% Giảm hiện tại:</div>
            <div style="font-size: 24px; font-weight: bold; color: ${currentBundleDiscount >= targetDiscount ? '#16A34A' : '#F59E0B'};">
              ${currentBundleDiscount}%
            </div>
          </div>
          
          <div style="border-top: 2px dashed #234085; margin: 16px 0; padding-top: 16px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
              ${neededVoucherDiscountRounded > 0 ? '⚠️ CẦN TẠO VOUCHER GIẢM THÊM:' : '✅ ĐÃ ĐẠT MỤC TIÊU:'}
            </div>
            <div style="font-size: 32px; font-weight: bold; color: ${neededVoucherDiscountRounded > 0 ? '#E53E3E' : '#16A34A'};">
              ${neededVoucherDiscountRounded}%
            </div>
            ${neededVoucherDiscountRounded > 0 ? `
              <div style="margin-top: 12px; padding: 12px; background: #FEF2F2; border-radius: 6px; font-size: 13px;">
                <strong>🎫 Tạo Discount Code trong Shopify Admin:</strong><br>
                • Type: <strong>Percentage</strong><br>
                • Value: <strong>${neededVoucherDiscountRounded}%</strong> (số nguyên)<br>
                • Applies to: <strong>All bundle products</strong><br>
                • Code example: <strong>BUNDLE${neededVoucherDiscountRounded}</strong>
              </div>
              <div style="margin-top: 8px; padding: 10px; background: #FFF9E6; border-radius: 6px; font-size: 12px;">
                <strong>📐 Công thức 2 tầng giảm:</strong><br>
                • Giá gốc: ${BundleUtils.formatMoney(totalCompareAtPrice)}<br>
                • Sau giảm ${currentBundleDiscount}%: ${BundleUtils.formatMoney(totalPrice)}<br>
                • Sau voucher ${neededVoucherDiscountRounded}%: ${BundleUtils.formatMoney(actualFinalPrice)}<br>
                • Target (${targetDiscount}%): ${BundleUtils.formatMoney(targetFinalPriceIdeal)}<br>
                • Chênh lệch: ${BundleUtils.formatMoney(Math.abs(actualFinalPrice - targetFinalPriceIdeal))}
              </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #93C5FD;">
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">💵 Giá cuối (sau 2 tầng giảm):</div>
            <div style="font-size: 28px; font-weight: bold; color: #234085;">${BundleUtils.formatMoney(actualFinalPrice)}</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">
              = ${BundleUtils.formatMoney(totalCompareAtPrice)} × ${((100 - currentBundleDiscount)/100).toFixed(2)} × ${((100 - neededVoucherDiscountRounded)/100).toFixed(2)}
            </div>
          </div>
        </div>
      `;
      
      console.log('=== CALCULATOR RESULTS ===');
      console.log('Target Discount:', targetDiscount + '%');
      console.log('Total Compare-at Price:', BundleUtils.formatMoney(totalCompareAtPrice));
      console.log('Total Current Price:', BundleUtils.formatMoney(totalPrice));
      console.log('Current Discount %:', currentBundleDiscount + '%');
      console.log('Voucher Needed (exact):', neededVoucherDiscountExact.toFixed(2) + '%');
      console.log('Voucher Needed (rounded):', neededVoucherDiscountRounded + '%');
      console.log('Target Final (ideal):', BundleUtils.formatMoney(targetFinalPriceIdeal));
      console.log('Actual Final (sau 2 tầng):', BundleUtils.formatMoney(actualFinalPrice));
      console.log('Chênh lệch:', BundleUtils.formatMoney(Math.abs(actualFinalPrice - targetFinalPriceIdeal)));
    }
    
    // Run calculator in theme editor
    if (document.querySelector('.bundle-pricing-calculator')) {
      setTimeout(() => {
        runPricingCalculator();
      }, 500);
    }
  
    // Check for stored voucher on page load and re-apply if needed
    function checkAndReapplyVoucher() {
      console.log('=== CHECK AND REAPPLY VOUCHER ===');
      console.log('Current URL:', window.location.href);
      
      // Check if we're on checkout/cart page
      const isCheckoutPage = window.location.pathname.includes('/checkout') || 
                            window.location.pathname.includes('/cart');
      
      if (isCheckoutPage) {
        console.log('On checkout/cart page, checking for voucher...');
        
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const urlVoucher = urlParams.get('discount');
        
        if (urlVoucher && urlVoucher.trim() !== '') {
          console.log('Found voucher in URL:', urlVoucher);
          reapplyVoucher(urlVoucher);
          return;
        }
        
        // Check bundle items for voucher
        fetch('/cart.js')
          .then(response => response.json())
          .then(cartData => {
            const hasDiscount = cartData.cart_level_discount_applications && 
                               cartData.cart_level_discount_applications.length > 0;
            
            // Find voucher from bundle items
            let bundleVoucher = null;
            for (const item of cartData.items) {
              if (item.properties && item.properties._bundle_voucher) {
                bundleVoucher = item.properties._bundle_voucher;
                break;
              }
            }
            
            if (bundleVoucher && !hasDiscount) {
              console.log('Re-applying voucher from bundle items:', bundleVoucher);
              reapplyVoucher(bundleVoucher);
            } else if (bundleVoucher && hasDiscount) {
              console.log('Voucher already applied in cart');
            } else {
              console.log('No voucher found in bundle items');
            }
          })
          .catch(error => {
            console.error('Error checking cart for voucher:', error);
          });
      }
    }
  
    function reapplyVoucher(voucherCode) {
      console.log('=== REAPPLY VOUCHER ===');
      console.log('Re-applying voucher:', voucherCode);
      
      fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 'discount': voucherCode })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Re-apply voucher response:', data);
        
        if (!data.status) {
          console.log('✅ Voucher re-applied successfully');
          
          // Store voucher in bundle items for persistence
          const bundleItems = data.items.filter(item => 
            item.properties && item.properties._bundle_id
          );
          
          if (bundleItems.length > 0) {
            // Update each bundle item to include voucher
            const updatePromises = bundleItems.map(item => {
              const updatedProperties = {
                ...item.properties,
                '_bundle_voucher': voucherCode,
                '_voucher_applied': 'true'
              };
              
              return fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  id: item.key,
                  properties: updatedProperties
                })
              });
            });
            
            Promise.all(updatePromises)
              .then(responses => {
                console.log('✅ Voucher stored in bundle items after re-apply');
                
                // Reload page to show updated prices
                if (window.location.pathname.includes('/checkout')) {
                  console.log('Reloading checkout page to show updated prices');
                  setTimeout(() => window.location.reload(), 500);
                }
              })
              .catch(error => {
                console.error('❌ Error storing voucher in items:', error);
                // Still reload page
                if (window.location.pathname.includes('/checkout')) {
                  setTimeout(() => window.location.reload(), 500);
                }
              });
          } else {
            // No bundle items, just reload
            if (window.location.pathname.includes('/checkout')) {
              setTimeout(() => window.location.reload(), 500);
            }
          }
        } else {
          console.log('❌ Failed to re-apply voucher:', data.description);
          
          // Try alternative approach - redirect to checkout with voucher in URL
          if (window.location.pathname.includes('/checkout')) {
            console.log('Attempting alternative approach with URL parameter');
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('discount', voucherCode);
            window.location.href = currentUrl.toString();
          }
        }
      })
      .catch(error => {
        console.error('❌ Error re-applying voucher:', error);
        
        // Fallback: redirect to checkout with voucher in URL
        if (window.location.pathname.includes('/checkout')) {
          console.log('Fallback: redirecting with voucher in URL');
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('discount', voucherCode);
          window.location.href = currentUrl.toString();
        }
      });
    }
  
    // Run check on page load
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        checkAndReapplyVoucher();
    }, 1000);
  });
  
  // Carousel Navigation
  document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('[data-slideshow]');
    
    carousels.forEach(carousel => {
      const items = carousel.querySelectorAll('.carousel-item');
      const prevBtn = carousel.querySelector('.carousel-nav--prev');
      const nextBtn = carousel.querySelector('.carousel-nav--next');
      let currentIndex = 0;
      
      if (items.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
      }
      
      function showSlide(index) {
        items.forEach((item, i) => {
          item.style.display = i === index ? 'block' : 'none';
        });
        
        // Update navigation buttons
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === items.length - 1;
      }
      
      function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
      }
      
      function prevSlide() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
      }
      
      // Initialize
      showSlide(0);
    });
  });
  
  // MAIN PRODUCT PAGE: Fix mobile swipe for main product slideshow
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing main product page mobile swipe fix...');
    
    // Wait for theme's slideshow scripts to load
    setTimeout(() => {
      const mainSlideshow = document.querySelector('.product-slideshow');
      if (mainSlideshow && window.Flickity) {
        console.log('📱 Main product slideshow found:', mainSlideshow);
        
        // Check if Flickity is already initialized
        const existingFlickity = Flickity.data(mainSlideshow);
        console.log('🔍 Main product Flickity exists:', !!existingFlickity);
        
        if (existingFlickity) {
          // Force refresh Flickity options for mobile
          if (window.innerWidth <= 768) {
            console.log('📱 Refreshing main product Flickity for mobile...');
            existingFlickity.resize();
            existingFlickity.reposition();
            
            // Ensure draggable is enabled
            if (!existingFlickity.options.draggable) {
              console.log('⚠️ Main product Flickity draggable disabled, reinitializing...');
              existingFlickity.destroy();
              
              // Reinitialize with mobile-friendly options
              const newFlickity = new Flickity(mainSlideshow, {
                cellAlign: 'left',
                contain: true,
                prevNextButtons: false,
                pageDots: true, // Show dots on mobile
                wrapAround: true,
                draggable: true, // CRITICAL: Enable swipe
                adaptiveHeight: true,
                dragThreshold: 5,
                selectedAttraction: 0.025,
                friction: 0.28,
                touchVerticalScroll: true
              });
              
              console.log('✅ Main product Flickity reinitialized with swipe enabled');
            }
          }
        } else {
          // Initialize Flickity if not already done
          console.log('🎠 Initializing main product Flickity...');
          const flickityInstance = new Flickity(mainSlideshow, {
            cellAlign: 'left',
            contain: true,
            prevNextButtons: false,
            pageDots: window.innerWidth <= 768,
            wrapAround: true,
            draggable: true,
            adaptiveHeight: true,
            dragThreshold: 5,
            selectedAttraction: 0.025,
            friction: 0.28,
            touchVerticalScroll: true
          });
          
          console.log('✅ Main product Flickity initialized');
        }
      } else {
        console.warn('⚠️ Main product slideshow or Flickity not found');
      }
    }, 1000);
  });
  
  // Return the bundle state and functions for external access
  return {
    bundleState: bundleState,
    config: config,
    container: container,
    fetchShopifyProduct: fetchShopifyProduct,
    renderProductImagesHTML: renderProductImagesHTML,
    initializeFlickityForStep: initializeFlickityForStep,
    initializeThumbnailClicks: initializeThumbnailClicks,
    showStep: showStep,
    loadBundleProduct: loadBundleProduct,
    renderBundleSummary: renderBundleSummary,
    addBundleToCart: addBundleToCart,
    initializeBundleProductVariantPicker: initializeBundleProductVariantPicker,
    updateBundleProductPrice: updateBundleProductPrice,
    updateBundleVariantLabels: updateBundleVariantLabels,
    updateBundleProductImage: updateBundleProductImage,
    updateColorSwatchState: updateColorSwatchState,
    extractImageUrl: extractImageUrl
  };
};