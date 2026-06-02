import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logService, { LOG_CATEGORIES } from '../services/LogService';
// import { API_URL } from 'react-native-dotenv';
/*
  Base client config for your application.
  Here you can define your base url, headers,
  timeouts and middleware used for each request.
*/

// ===== MAPPING API → CATEGORY =====
// Mỗi API sẽ tự động log vào đúng tab (Đơn hàng, Đồng bộ, In ấn...)
const API_CATEGORY_MAP = {
  // ─── Đơn hàng (order) ───
  'order': LOG_CATEGORIES.ORDER,
  'orderInternal': LOG_CATEGORIES.ORDER,
  'getOrderPaidSuccessNew': LOG_CATEGORIES.ORDER,
  'getOrderNotPaidNew': LOG_CATEGORIES.ORDER,
  'getOrderOnlineNew': LOG_CATEGORIES.ORDER,
  'getOrderShippingNew': LOG_CATEGORIES.ORDER,
  'getOrderNotCompleteNew': LOG_CATEGORIES.ORDER,
  'getOrderDetail': LOG_CATEGORIES.ORDER,
  'cancelOrderOnline': LOG_CATEGORIES.ORDER,
  'confirmOrderOnline': LOG_CATEGORIES.ORDER,
  'fetch': LOG_CATEGORIES.ORDER,       // synthetic/orders/v1/fetch
  'detail': LOG_CATEGORIES.ORDER,      // synthetic/orders/v1/detail
  'histories': LOG_CATEGORIES.ORDER,   // synthetic/orders/v1/histories

  // ─── Đồng bộ (sync) ───
  'syncOrders': LOG_CATEGORIES.SYNC,

  // ─── Hệ thống (system) ───
  'loginInternal': LOG_CATEGORIES.SYSTEM,
  'getInternalMenuShop': LOG_CATEGORIES.SYSTEM,
  'getListShopTable': LOG_CATEGORIES.SYSTEM,
  'getWifi': LOG_CATEGORIES.SYSTEM,
  'getTransType': LOG_CATEGORIES.SYSTEM,
  'getListChanelType': LOG_CATEGORIES.SYSTEM,
  'getMenuShop': LOG_CATEGORIES.SYSTEM,
  'getListCategoryShop': LOG_CATEGORIES.SYSTEM,
  'userinfo': LOG_CATEGORIES.SYSTEM,
  'getListShop': LOG_CATEGORIES.SYSTEM,
  'getListShopByLocation1': LOG_CATEGORIES.SYSTEM,
  'getProdDetail': LOG_CATEGORIES.SYSTEM,
  'version': LOG_CATEGORIES.SYSTEM,
};

// Lấy category từ URL
function getCategoryFromUrl(url) {
  if (!url) return LOG_CATEGORIES.API;
  // Lấy tên API cuối cùng trong URL path
  const parts = url.split('/').filter(Boolean);
  // Duyệt từ cuối lên tìm match
  for (let i = parts.length - 1; i >= 0; i--) {
    const segment = parts[i].split('?')[0]; // bỏ query string
    if (API_CATEGORY_MAP[segment]) {
      return API_CATEGORY_MAP[segment];
    }
  }
  return LOG_CATEGORIES.API; // Mặc định nếu không match
}

let defaultLanguage = 'vi';
export const setDefaultLanguage = language => {
  defaultLanguage = language;
};
console.log('default language:::', defaultLanguage);
const HttpClient = axios.create({
  timeout: 12000,
  headers: { 'content-type': 'application/json' },
});

// Custom middleware for requests
HttpClient.interceptors.request.use(
  async config => {
    config.headers['X-CUPIFY-APP'] = 'TRA1000M';
    config.headers['Accept-Language'] = defaultLanguage;

    // Add sessionkey to headers if user is logged in
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.sessionkey) {
          config.headers['Authorization'] = `Bearer ${userData.sessionkey}`;
          config.headers['X-Session-Key'] = userData.sessionkey;
        }
      }
    } catch (error) {
      console.log('Error getting session key:', error);
    }

    // Log API request — tự động phân loại category
    config._requestStartTime = Date.now();
    config._logCategory = getCategoryFromUrl(config.url);
    logService.logApiRequest(config.method, config.url, config.data, config._logCategory);

    // console.log('REQUEST API:', config);
    return config;
  },
  error => {
    logService.logApiError('unknown', error);
    return Promise.reject(error);
  },
);

// Custom middleware for responses
HttpClient.interceptors.response.use(
  response => {
    const duration = response.config._requestStartTime
      ? Date.now() - response.config._requestStartTime
      : 0;
    const category = response.config._logCategory || getCategoryFromUrl(response.config.url);
    logService.logApiResponse(
      response.status,
      response.config.url,
      response.data,
      duration,
      category
    );
    return response;
  },
  error => {
    const category = error.config?._logCategory || getCategoryFromUrl(error.config?.url);
    logService.logApiError(error.config?.url || 'unknown', error, category);
    return Promise.reject(error);
  },
);

export default HttpClient;
