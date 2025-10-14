const REQUEST = 'REQUEST';
const RESET = 'RESET';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';

const suffixTypes = [REQUEST, RESET, SUCCESS, ERROR];

function createRequestTypes(prefix = '', bases, suffixes = suffixTypes) {
  const req = {};
  bases.forEach(base => {
    suffixes.forEach(suffix => {
      req[`${base}_${suffix}`] = `${prefix}_${base}_${suffix}`;
    });
  });
  return req;
}

// Events related to Neocafe REST API
export const NEOCAFE = createRequestTypes(
  'NEOCAFE',
  [
    //auth
    'CHECK_AUTHENTICATION',
    'SEND_PHONE',
    'CONFIRM_OTP',
    'LOGIN_PHONE',
    'LOGIN',
    'LOGOUT',
    'GET_VERSION',

    //user
    'GET_DELETE_ACCOUNT',
    'CONFIRM_DELETE_OTP',
    'UPDATE_USER_INFO',
    'SET_LANGUAGE',

    //categories
    'GET_CATEGORIES',

    //order
    'CREATE_ORDER',
    'ADD_PRODUCT_CART',
    'SET_ORDER',
    'GET_ONLINE_ORDER',
    // newly added order fetchers
    'GET_ORDER_SHIPPING',
    'GET_ORDER_PAID_SUCCESS',
    'CONFIRM_ORDER_ONLINE',
    'CALL_DRIVER_BACK',
    'GET_ESTIMATE_AHAMOVE',
    // product
    'GET_MENU',
    'SET_PRODUCT',
    'GET_PRODUCT_DETAIL',
    // VOUCHER
    'APPLY_VOUCHER',
    'GET_VOUCHER',
    // TABLES
    'GET_SHOP_TABLES',
    // PAYMENT CHANNELS
    'GET_PAYMENT_CHANNELS',
    // ORDER CHANNELS 
    'GET_ORDER_CHANNELS',
    // SYNC
    'SYNC_ORDERS',
    'SYNC_PENDING_ORDERS',
  ],
  suffixTypes,
);
