// Thông tin cấu hình Lark & Proxy
const LARK_CONFIG = {
  APP_ID: 'cli_a5fc5d59ccbb900a',
  APP_SECRET: 'KKlS3dXXugYYfTrCRhRzFeFchC8fHGjW',
  BITABLE_APP_TOKEN: 'WOcUb4zOAaW51IsefhTuWDYssQf',
  BITABLE_TABLE_ID: 'tbldS3JGzgqu8NR6',
  // Thay thế bằng URL Cloudflare Worker (hoặc server proxy) của bạn
  PROXY_URL: 'https://restless-king-31b2.trang-6be.workers.dev'
};

// Cache token để tránh gọi API nhiều lần
let cachedToken = null;
let tokenExpireTime = 0;

/**
 * Hàm gọi proxy để lấy tenant_access_token từ Lark
 */
async function getTenantAccessToken() {
  try {
    // Kiểm tra xem token còn hạn không
    if (cachedToken && Date.now() < tokenExpireTime) {
      return cachedToken;
    }

    console.log('Fetching new token...');
    
    // Gọi đến endpoint /token của proxy
    const response = await fetch(`${LARK_CONFIG.PROXY_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: LARK_CONFIG.APP_ID,
        app_secret: LARK_CONFIG.APP_SECRET
      })
    });

    if (!response.ok) {
      console.error('Token response not OK:', response.status);
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log('Token response:', data);
    
    if (data && data.tenant_access_token) {
      cachedToken = data.tenant_access_token;
      // Cộng expire (mặc định 7200s) và trừ 60s để an toàn
      tokenExpireTime = Date.now() + ((data.expire || 7200) * 1000) - 60000;
      return cachedToken;
    } else {
      console.error('Invalid token data:', data);
      throw new Error('Invalid token response');
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Hàm lấy dữ liệu từ Bitable (cũng thông qua proxy)
 */
async function getBitableRecords(phone) {
  try {
    console.log('Searching for phone:', phone);
    
    const token = await getTenantAccessToken();
    if (!token) {
      console.error('Failed to get token');
      return null;
    }
    
    console.log('Got token, fetching records...');

    // Gọi endpoint /records của proxy
    const response = await fetch(`${LARK_CONFIG.PROXY_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        phone
      })
    });

    if (!response.ok) {
      console.error('Records response not OK:', response.status);
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log('Records data:', data);
    
    // Tuỳ theo format JSON từ API
    if (data && data.data && data.data.items && data.data.items.length > 0) {
      return data.data.items[0].fields;
    } else {
      console.log('No matching records found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching records:', error);
    return null;
  }
}

// Xuất hàm để dùng ở nơi khác
window.LarkAPI = {
  getBitableRecords
};
