/**
 * Auto Add to Cart Feature
 * Tự động thêm sản phẩm vào giỏ hàng khi đủ điều kiện
 * 
 * Cấu hình:
 * - Điều kiện: tổng giá trị giỏ hàng, số lượng sản phẩm, sản phẩm cụ thể
 * - Sản phẩm tự động thêm: variant ID và số lượng
 */

(function() {
  'use strict';

  // ============================================
  // CẤU HÌNH - Đọc từ Shopify Theme Settings
  // ============================================
  function getAutoAddConfig() {
    // Đọc từ theme.settings nếu có
    if (window.theme && window.theme.settings && window.theme.settings.autoAddToCart) {
      const config = window.theme.settings.autoAddToCart;
      
      // Normalize dữ liệu: đảm bảo variantId là số hoặc null
      if (config.rules && Array.isArray(config.rules)) {
        config.rules = config.rules.map(rule => {
          if (rule.products && Array.isArray(rule.products)) {
            rule.products = rule.products.map(product => {
              // Đảm bảo variantId là số hoặc null
              if (product.variantId) {
                if (typeof product.variantId === 'string') {
                  const parsed = parseInt(product.variantId, 10);
                  product.variantId = isNaN(parsed) ? null : parsed;
                } else if (typeof product.variantId === 'number') {
                  // Đã là số rồi, giữ nguyên
                  product.variantId = product.variantId;
                } else {
                  product.variantId = null;
                }
              } else {
                product.variantId = null;
              }
              return product;
            });
          }
          
          // Parse condition value nếu cần (cho has_product)
          if (rule.condition && rule.condition.value && rule.condition.type === 'has_product') {
            if (typeof rule.condition.value === 'string') {
              rule.condition.value = parseInt(rule.condition.value, 10) || null;
            }
          }
          
          return rule;
        });
      }
      
      return config;
    }
    
    // Fallback: cấu hình mặc định (nếu chưa có settings)
    return {
      enabled: false,
      addOnce: true,
      rules: []
    };
  }
  
  const AUTO_ADD_CONFIG = getAutoAddConfig();

  // ============================================
  // BIẾN NỘI BỘ
  // ============================================
  let isProcessing = false;
  let addedProducts = new Set(); // Track đã thêm sản phẩm nào (để tránh thêm lặp)
  let cartData = null;

  // ============================================
  // HÀM CHÍNH
  // ============================================

  /**
   * Lấy dữ liệu giỏ hàng từ Shopify
   */
  async function getCartData() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      cartData = await response.json();
      return cartData;
    } catch (error) {
      console.error('Auto Add to Cart: Error fetching cart:', error);
      return null;
    }
  }

  /**
   * Kiểm tra điều kiện
   */
  function checkCondition(condition, cart) {
    if (!cart || !cart.items) {
      return false;
    }

    switch (condition.type) {
      case 'cart_total':
        const total = cart.total_price;
        return compareValues(total, condition.value, condition.operator);
      
      case 'item_count':
        const itemCount = cart.item_count;
        return compareValues(itemCount, condition.value, condition.operator);
      
      case 'has_product':
        const hasProduct = cart.items.some(item => {
          if (condition.value) {
            return item.product_id === condition.value || 
                   item.variant_id === condition.value ||
                   item.id === condition.value;
          }
          return false;
        });
        return condition.operator === '==' ? hasProduct : !hasProduct;
      
      case 'has_tag':
        const hasTag = cart.items.some(item => {
          return item.properties && 
                 Object.values(item.properties).some(prop => 
                   prop && prop.toString().toLowerCase().includes(condition.value.toLowerCase())
                 );
        });
        return condition.operator === '==' ? hasTag : !hasTag;
      
      default:
        console.warn('Auto Add to Cart: Unknown condition type:', condition.type);
        return false;
    }
  }

  /**
   * So sánh giá trị
   */
  function compareValues(a, b, operator) {
    switch (operator) {
      case '>=':
        return a >= b;
      case '>':
        return a > b;
      case '<=':
        return a <= b;
      case '<':
        return a < b;
      case '==':
        return a == b;
      case '!=':
        return a != b;
      default:
        return false;
    }
  }

  /**
   * Kiểm tra sản phẩm đã có trong giỏ hàng chưa
   */
  function isProductInCart(variantId, cart) {
    if (!cart || !cart.items) {
      return false;
    }
    return cart.items.some(item => item.variant_id === variantId);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async function addProductsToCart(products, ruleName) {
    if (isProcessing) {
      console.log('Auto Add to Cart: Already processing, skipping...');
      return false;
    }

    isProcessing = true;

    try {
      // Lọc sản phẩm chưa có trong giỏ và chưa được thêm tự động
      const productsToAdd = products.filter(product => {
        if (!product.variantId) {
          console.warn('Auto Add to Cart: Missing variantId for product');
          return false;
        }

        // Kiểm tra đã có trong giỏ chưa
        if (isProductInCart(product.variantId, cartData)) {
          console.log(`Auto Add to Cart: Product ${product.variantId} already in cart`);
          return false;
        }

        // Kiểm tra đã thêm tự động chưa (nếu addOnce = true)
        if (AUTO_ADD_CONFIG.addOnce) {
          const productKey = `${product.variantId}_${ruleName}`;
          if (addedProducts.has(productKey)) {
            console.log(`Auto Add to Cart: Product ${product.variantId} already auto-added`);
            return false;
          }
        }

        return true;
      });

      if (productsToAdd.length === 0) {
        console.log('Auto Add to Cart: No products to add');
        isProcessing = false;
        return false;
      }

      // Chuẩn bị dữ liệu để thêm vào giỏ
      const items = productsToAdd.map(product => ({
        id: product.variantId,
        quantity: product.quantity || 1,
        properties: {
          ...(product.properties || {}),
          '_auto_add_gift': 'true', // Đánh dấu là quà tặng tự động
          '_auto_add_rule': ruleName // Lưu tên quy tắc để debug
        }
      }));

      console.log('Auto Add to Cart: Adding products:', items);
      console.log('Auto Add to Cart: Products with gift property:', items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        hasGiftProperty: item.properties._auto_add_gift === 'true'
      })));

      // Gọi API thêm vào giỏ hàng
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ items: items })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.status && result.status !== 200) {
        throw new Error(result.description || 'Failed to add products');
      }

      // Đánh dấu đã thêm
      productsToAdd.forEach(product => {
        const productKey = `${product.variantId}_${ruleName}`;
        addedProducts.add(productKey);
      });

      // Cập nhật dữ liệu giỏ hàng
      await getCartData();

      // Dispatch event để các phần khác biết giỏ hàng đã thay đổi
      document.dispatchEvent(new CustomEvent('cart:updated', { 
        bubbles: true, 
        detail: result 
      }));

      // Dispatch event riêng cho auto-add
      document.dispatchEvent(new CustomEvent('autoAddToCart:added', {
        bubbles: true,
        detail: {
          products: productsToAdd,
          ruleName: ruleName,
          cart: cartData
        }
      }));

      // Hiển thị thông báo nếu có
      const rule = AUTO_ADD_CONFIG.rules.find(r => r.name === ruleName);
      if (rule && rule.message) {
        // Có thể hiển thị notification ở đây
        console.log('Auto Add to Cart:', rule.message);
      }

      console.log('Auto Add to Cart: Successfully added products');
      isProcessing = false;
      return true;

    } catch (error) {
      console.error('Auto Add to Cart: Error adding products:', error);
      isProcessing = false;
      return false;
    }
  }

  /**
   * Kiểm tra và thực thi các quy tắc tự động thêm
   */
  async function checkAndAutoAdd() {
    if (!AUTO_ADD_CONFIG.enabled) {
      console.log('Auto Add to Cart: ⚠️ Feature is disabled, skipping check');
      return;
    }

    if (isProcessing) {
      console.log('Auto Add to Cart: Already processing, skipping...');
      return;
    }

    // Lấy dữ liệu giỏ hàng mới nhất
    const cart = await getCartData();
    if (!cart) {
      console.log('Auto Add to Cart: ⚠️ Could not fetch cart data');
      return;
    }

    console.log('Auto Add to Cart: Checking rules...', {
      cartTotal: cart.total_price,
      itemCount: cart.item_count,
      rulesCount: AUTO_ADD_CONFIG.rules.length
    });

    // Kiểm tra từng quy tắc
    for (const rule of AUTO_ADD_CONFIG.rules) {
      if (!rule.condition || !rule.products || rule.products.length === 0) {
        console.log(`Auto Add to Cart: ⚠️ Rule "${rule.name}" is invalid, skipping`);
        continue;
      }

      // Kiểm tra điều kiện
      const conditionMet = checkCondition(rule.condition, cart);
      console.log(`Auto Add to Cart: Rule "${rule.name}" - Condition met:`, conditionMet);
      
      if (conditionMet) {
        console.log(`Auto Add to Cart: ✅ Condition met for rule "${rule.name}"`);
        
        // Thêm sản phẩm
        await addProductsToCart(rule.products, rule.name);
        
        // Nếu chỉ muốn thêm một lần, có thể break ở đây
        // break;
      } else {
        console.log(`Auto Add to Cart: ❌ Condition NOT met for rule "${rule.name}"`);
      }
    }
  }

  /**
   * Refresh cart drawer (nếu có)
   */
  function refreshCartUI() {
    // Gọi hàm rebuildCart nếu có
    if (typeof rebuildCart === 'function') {
      rebuildCart();
    } else if (typeof refreshCartDrawer === 'function') {
      refreshCartDrawer();
    } else if (window.theme && window.theme.CartDrawer) {
      // Có thể cần refresh cart drawer theo cách khác
      document.dispatchEvent(new CustomEvent('cart:refresh'));
    }
  }

  // ============================================
  // KHỞI TẠO
  // ============================================

  /**
   * Khởi tạo tính năng
   */
  function init() {
    console.log('Auto Add to Cart: Initializing...');
    console.log('Auto Add to Cart: Config:', AUTO_ADD_CONFIG);
    
    if (!AUTO_ADD_CONFIG.enabled) {
      console.log('Auto Add to Cart: ⚠️ Feature is DISABLED. Please enable it in Settings → Cart');
      return;
    }

    console.log('Auto Add to Cart: ✅ Feature is ENABLED');
    console.log('Auto Add to Cart: Rules count:', AUTO_ADD_CONFIG.rules.length);

    // Lắng nghe sự kiện giỏ hàng được cập nhật
    document.addEventListener('cart:updated', async function() {
      // Đợi một chút để đảm bảo giỏ hàng đã được cập nhật
      setTimeout(() => {
        checkAndAutoAdd();
      }, 500);
    });

    // Lắng nghe sự kiện ajaxProduct:added (khi thêm sản phẩm qua form)
    document.addEventListener('ajaxProduct:added', async function() {
      setTimeout(() => {
        checkAndAutoAdd();
      }, 500);
    });

    // Kiểm tra khi trang được load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async function() {
        setTimeout(() => {
          checkAndAutoAdd();
        }, 1000);
      });
    } else {
      setTimeout(() => {
        checkAndAutoAdd();
      }, 1000);
    }

    // Lắng nghe khi cart drawer được mở (nếu có)
    document.addEventListener('cart:open', async function() {
      setTimeout(() => {
        checkAndAutoAdd();
      }, 300);
    });

    console.log('Auto Add to Cart: Initialized');
  }

  // Khởi chạy
  init();

  // Export để có thể sử dụng từ bên ngoài
  window.AutoAddToCart = {
    check: checkAndAutoAdd,
    getCart: getCartData,
    config: AUTO_ADD_CONFIG
  };

})();
