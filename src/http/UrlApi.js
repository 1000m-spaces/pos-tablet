import {BASE_PATH_CAFE, BASE_PATH_MENU} from 'assets/config';

export const UrlApi = {
  // ------------------ PRODUCT ------------------------
  getFavoriteProducts: BASE_PATH_MENU + 'getMyMenuCustomer',
  // addFavoriteProduct: BASE_PATH_MENU + 'createMyMenuCustomer',
  reomveFavoriteProduct: BASE_PATH_MENU + 'cancelMyMenuCustomer',
  getProductMenu: BASE_PATH_MENU + 'getMenuShop',
  getProductExpired: BASE_PATH_MENU + 'getProductExpired',
  getTopPurchasedApi: BASE_PATH_CAFE + 'reports/top-purchased-products',
  getRecommendedProductsUrl:
    BASE_PATH_CAFE + 'recommendations/products/sorting',
  // ------------------ VOUCHER --------------------------
  addVoucher: BASE_PATH_MENU + 'addvoucher',
  getVoucherAPI: BASE_PATH_CAFE + 'voucher/user',

  // ------------------- REVIEW-COMMENT------------------
  createReviewApi: BASE_PATH_CAFE + 'comments',
  // ------------------- AFFILIATE ------------------
  applyAffiliate: BASE_PATH_CAFE + 'affiliates/referrals/apply',
  checkAffiliate: BASE_PATH_CAFE + 'affiliates/referrals/check',

  // ------------------ MESSAGE -----------------------
  getMessage: BASE_PATH_MENU + 'get_all_message',
  updateMessage: BASE_PATH_MENU + 'updateMessage',

  // ---------------------- ORDER ------------------------------
  createOrder: BASE_PATH_MENU + 'order',
  cancelOrder: BASE_PATH_MENU + 'cancelOrderOnline',
  getListHistoryOrder: BASE_PATH_MENU + 'getOrderDetail',

  // --------------------- SHOP --------------------------------
  getListShop: BASE_PATH_MENU + 'getListShopByLocation1',
  getHistoryCashin: BASE_PATH_MENU + 'getTransactionsAddPoint',

  // ---------------------- USER -AUTH  ---------------------------
  getUserInfo: BASE_PATH_MENU + 'userinfo',
  getVersion: BASE_PATH_CAFE + 'version',
  sendPhone: BASE_PATH_MENU + 'phone',
  confirmPhone: BASE_PATH_MENU + 'phone',
  loginPhone: BASE_PATH_MENU + 'customerloginphone',
  deleteAccount: BASE_PATH_MENU + 'deleteAccount',
  confirmOtpDelete: BASE_PATH_MENU + 'confirmPhone',
  updateUserInfo: BASE_PATH_MENU + 'updateCustomerInfo',
  updateLanguageUrl: BASE_PATH_MENU + 'updatelanguages',

  // ----------------------- CATEGORY ------------------------------
  getListCategory: BASE_PATH_MENU + 'getListCategoryShop',

  // ------------------------ BANNER -------------------------------
  getListBanner: BASE_PATH_CAFE + 'ads-banners/query',

  // ----------------------- SHIPMENT -----------------------------
  getPackagesByShop: BASE_PATH_MENU + 'subscriptions/packages',
  subcribePackage: BASE_PATH_MENU + 'subscriptions/users/register',
  getMyPackage: BASE_PATH_CAFE + 'subscriptions/users/shipping-packages',
  paymentPackage: BASE_PATH_MENU + 'orderSubscription',
  showingPackage: BASE_PATH_CAFE + 'subscriptions/packages/all',
  unrenewPackage: BASE_PATH_CAFE + 'subscriptions/users/unrenew',
  storeShipmentAddress: BASE_PATH_MENU + 'addAddressWhenSubscriptionFalse',
};
