document.addEventListener('DOMContentLoaded', () => {
  const bundleWrapper = document.querySelector('.product-bundle-init-wrapper');
  if (!bundleWrapper) return;

  // --- DOM Elements ---
  const initialScreen = bundleWrapper.querySelector('.bundle-initial-screen');
  const stepperScreen = bundleWrapper.querySelector('.bundle-stepper-screen');
  const summaryScreen = bundleWrapper.querySelector('.bundle-summary-screen');
  
  const startBtn = bundleWrapper.querySelector('#start-building-btn');
  const nextBtn = bundleWrapper.querySelector('#bundle-next-btn');
  const prevBtn = bundleWrapper.querySelector('#bundle-prev-btn');
  const addToCartBtn = bundleWrapper.querySelector('#bundle-add-to-cart-btn');

  const productContainer = bundleWrapper.querySelector('#bundle-product-container');
  const summaryContainer = bundleWrapper.querySelector('#bundle-summary-container');
  
  const dataScript = bundleWrapper.querySelector('#BundleInitData');
  const config = JSON.parse(dataScript.textContent);

  // --- State ---
  let currentStep = 0;
  let selections = {}; // { 'product-handle': { variantId: 123, quantity: 1 } }
  let productCache = {}; // Cache for fetched product data

  // --- Functions ---
  
  async function loadStep(stepIndex) {
    const productHandle = config.products[stepIndex];
    if (!productHandle) return;

    // Show loading state
    productContainer.innerHTML = '<p>Loading product...</p>';

    const product = await getProduct(productHandle);
    if (!product) {
        productContainer.innerHTML = '<p>Could not load product. Please try again.</p>';
        return;
    }

    renderProductForm(product);
    updateNavButtons();
  }

  async function getProduct(handle) {
    if (productCache[handle]) {
      return productCache[handle];
    }
    try {
      const response = await fetch(`/products/${handle}.js`);
      const product = await response.json();
      productCache[handle] = product;
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  function renderProductForm(product) {
      let variantRadios = product.variants.map(variant => {
          const isSelected = selections[product.handle] && selections[product.handle].variantId == variant.id;
          return `
              <input type="radio" name="bundle-variant" value="${variant.id}" id="variant-${variant.id}" ${isSelected ? 'checked' : ''} required>
              <label for="variant-${variant.id}">${variant.title} - ${formatMoney(variant.price)}</label><br>
          `;
      }).join('');

      productContainer.innerHTML = `
          <h3>${product.title}</h3>
          <img src="${product.featured_image}" alt="${product.title}" style="max-width:300px; margin-bottom: 20px;" />
          <form id="bundle-product-form-${product.handle}">
              ${variantRadios}
          </form>
      `;
  }

  function saveCurrentSelection() {
    const currentHandle = config.products[currentStep];
    const selectedRadio = productContainer.querySelector('input[name="bundle-variant"]:checked');
    if (selectedRadio) {
      selections[currentHandle] = {
        variantId: parseInt(selectedRadio.value, 10),
        quantity: 1
      };
      return true;
    }
    alert('Please select an option.');
    return false;
  }

  function updateNavButtons() {
    prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
    nextBtn.textContent = currentStep === config.products.length - 1 ? 'Finish' : 'Kế tiếp';
  }
  
  function showSummary() {
    initialScreen.style.display = 'none';
    stepperScreen.style.display = 'none';
    summaryScreen.style.display = 'block';

    summaryContainer.innerHTML = '';
    let originalTotal = 0;

    Object.keys(selections).forEach(handle => {
        const product = productCache[handle];
        const selection = selections[handle];
        const variant = product.variants.find(v => v.id === selection.variantId);

        if (variant) {
            originalTotal += variant.price;
            const itemHTML = `
                <div class="bundle-summary-item">
                    <img src="${variant.featured_image ? variant.featured_image.src : product.featured_image}" class="bundle-summary-item-image" alt="${variant.title}">
                    <div class="bundle-summary-item-details">
                        <p class="bundle-summary-item-title">${product.title}</p>
                        <p class="bundle-summary-item-variant">${variant.title}</p>
                    </div>
                    <p class="bundle-summary-item-price">${formatMoney(variant.price)}</p>
                </div>
            `;
            summaryContainer.innerHTML += itemHTML;
        }
    });

    const discountAmount = originalTotal * (config.discountPercentage / 100);
    const finalTotal = originalTotal - discountAmount;

    bundleWrapper.querySelector('#bundle-original-total').textContent = formatMoney(originalTotal);
    bundleWrapper.querySelector('#bundle-discount-amount').textContent = formatMoney(discountAmount);
    bundleWrapper.querySelector('#bundle-final-total').textContent = formatMoney(finalTotal);
  }

  async function handleAddToCart() {
      let items = Object.values(selections).map(sel => ({
          id: sel.variantId,
          quantity: sel.quantity
      }));

      try {
          const response = await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: items })
          });
          
          if (response.ok) {
              window.location.href = '/cart';
          } else {
              const errorData = await response.json();
              alert(`Error adding to cart: ${errorData.description}`);
          }
      } catch (error) {
          console.error('Error adding to cart:', error);
          alert('Could not add items to cart.');
      }
  }

  function formatMoney(cents) {
      // A better placeholder for VND, which doesn't use cents.
      const amount = Math.round(cents / 100);
      return `${amount.toLocaleString('vi-VN')} ₫`;
  }


  // --- Event Listeners ---
  startBtn.addEventListener('click', () => {
    initialScreen.style.display = 'none';
    stepperScreen.style.display = 'block';
    loadStep(0);
  });

  nextBtn.addEventListener('click', () => {
    if (!saveCurrentSelection()) return;

    if (currentStep < config.products.length - 1) {
      currentStep++;
      loadStep(currentStep);
    } else {
      showSummary();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      loadStep(currentStep);
    }
  });

  addToCartBtn.addEventListener('click', handleAddToCart);

}); 