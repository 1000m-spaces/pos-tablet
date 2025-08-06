// import { BASE_PATH_MENU } from 'assets/config';
// const BASE_PATH_MENU = 'https://test.mycafe.co/api1.0.php/';
const BASE_PATH_CAFE = 'https://api.neocafe.tech/v1/';
const BASE_PATH_CASE_DEV = 'https://v01api.1000m.vn/api1.0.php/'
const BASE_PATH_MENU = 'https://v01api.1000m.vn/api1.0.php/'

const BASE_PATH_1000M = 'https://api.1000m.vn/'
const BASE_PATH_POS = 'https://dev-pos.1000m.vn/'
// const BASE_PATH_POS = 'https://v01api.1000m.vn/'

// const BASE_PATH_1000M = 'https://dev-api.1000m.vn/'

export const UrlApi = {
  // ------------------ PRODUCT ------------------------
  getFavoriteProducts: BASE_PATH_MENU + 'getMyMenuCustomer',
  // addFavoriteProduct: BASE_PATH_MENU + 'createMyMenuCustomer',
  reomveFavoriteProduct: BASE_PATH_MENU + 'cancelMyMenuCustomer',
  getProductMenu: BASE_PATH_MENU + 'getMenuShop',
  getVoucher: BASE_PATH_CAFE + 'marketings-v2/voucher/event',
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
  getPaidOrder: BASE_PATH_CAFE + 'getOrderPaidSuccessNew',
  getNotPaidOrder: BASE_PATH_CAFE + 'getOrderNotPaidNew',
  getOnlineOrder: BASE_PATH_CASE_DEV + 'getOrderOnlineNew',
  getNotCompleteOrder: BASE_PATH_CAFE + 'getOrderNotCompleteNew',

  fetchOrder: BASE_PATH_1000M + 'synthetic/orders/v1/fetch',
  fetchOrderDetail: BASE_PATH_1000M + 'synthetic/orders/v1/detail',
  fetchOrderHistory: BASE_PATH_1000M + 'synthetic/orders/v1/histories',


  createOrder: BASE_PATH_MENU + 'order',
  cancelOrder: BASE_PATH_MENU + 'cancelOrderOnline',
  getListHistoryOrder: BASE_PATH_MENU + 'getOrderDetail',

  orderSuccessPayment: BASE_PATH_MENU + 'getOrderPaidSuccessNew', // don da thanh toan
  orderNotComplete: BASE_PATH_MENU + 'getOrderNotCompleteNew',
  orderWaitingPayment: BASE_PATH_MENU + 'getOrderNotPaidNew', // chua thanh toan
  onlineOrderList: BASE_PATH_MENU + 'getOrderOnlineNew',
  // --------------------- SHOP --------------------------------
  getListShop: BASE_PATH_MENU + 'getListShopByLocation1',
  getHistoryCashin: BASE_PATH_MENU + 'getTransactionsAddPoint',

  // ---------------------- USER -AUTH  ---------------------------
  getUserInfo: BASE_PATH_MENU + 'userinfo',
  getVersion: BASE_PATH_CAFE + 'version',
  sendPhone: BASE_PATH_MENU + 'phone',
  loginInternal: BASE_PATH_POS + 'login',
  internalMenuShop: BASE_PATH_MENU + 'getInternalMenuShop',
  orderInternal: BASE_PATH_MENU + 'orderInternal',
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

  getListStore: BASE_PATH_CASE_DEV + 'getListShop',

  // ----------------------- TABLES ----------------------------
  getListShopTable: BASE_PATH_CASE_DEV + 'getListShopTable',

  // ----------------------- PAYMENT & ORDER CHANNELS ------------------
  getTransType: BASE_PATH_CASE_DEV + 'getTransType', // Payment methods (cash, card, etc.)

  getListChanelType: BASE_PATH_CASE_DEV + 'getListChanelType', // Order channel types (dine-in, takeaway, etc.)


  // ----------------------- SYNC ORDERS -----------------------
  syncOrders: BASE_PATH_CASE_DEV + 'syncOrders',

  // ----------------------- PRODUCT DETAILS -------------------
  getProdDetail: BASE_PATH_CASE_DEV + 'getProdDetail',
};
