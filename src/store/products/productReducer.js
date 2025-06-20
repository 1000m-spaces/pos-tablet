import Status from 'common/Status/Status';
import strings from 'localization/Localization';
import { NEOCAFE } from 'store/actionsTypes';

const initialState = {
  productMenu: [],
  statusProductMenu: Status.DEFAULT,
  errorProductMenu: '',

  currentProduct: null,
  statusSetProduct: Status.DEFAULT,

  productDetail: null,
  statusProductDetail: Status.DEFAULT,
  errorProductDetail: '',

  vouchers: [],
  statusGetVoucher: Status.DEFAULT,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    // GET VOUCHER
    case NEOCAFE.GET_VOUCHER_REQUEST:
      return {
        ...state,
        statusGetVoucher: Status.LOADING,
      };
    case NEOCAFE.GET_VOUCHER_SUCCESS:
      return {
        ...state,
        vouchers: payload,
        statusGetVoucher: Status.SUCCESS,
      };
    case NEOCAFE.GET_VOUCHER_ERROR:
      return {
        ...state,
        statusGetVoucher: Status.ERROR,
      };
    case NEOCAFE.GET_VOUCHER_RESET:
      return {
        ...state,
        statusGetVoucher: Status.DEFAULT,
      };
    // SET CURRENT PRODUCT
    case NEOCAFE.SET_PRODUCT_REQUEST:
      return {
        ...state,
        statusSetProduct: Status.LOADING,
      };
    case NEOCAFE.SET_PRODUCT_SUCCESS:
      return {
        ...state,
        currentProduct: payload,
        statusSetProduct: Status.SUCCESS,
      };
    case NEOCAFE.SET_PRODUCT_ERROR:
      return {
        ...state,
        statusSetProduct: Status.ERROR,
      };
    case NEOCAFE.SET_PRODUCT_RESET:
      return {
        ...state,
        statusSetProduct: Status.DEFAULT,
      };
    // PRODUCT ALL SHOP
    case NEOCAFE.GET_MENU_REQUEST:
      return {
        ...state,
        statusProductMenu: Status.LOADING,
      };
    case NEOCAFE.GET_MENU_SUCCESS:
      const products = setupProduct(payload);
      console.log('products::', products)
      return {
        ...state,
        productMenu: products.filter(a => a.products.length > 0) || [],
        statusProductMenu: Status.SUCCESS,
      };
    case NEOCAFE.GET_MENU_ERROR:
      return {
        ...state,
        statusProductMenu: Status.ERROR,
      };
    case NEOCAFE.GET_MENU_RESET:
      return {
        ...state,
        statusProductMenu: Status.DEFAULT,
      };
    // GET PRODUCT DETAIL
    case NEOCAFE.GET_PRODUCT_DETAIL_REQUEST:
      return {
        ...state,
        statusProductDetail: Status.LOADING,
        errorProductDetail: '',
      };
    case NEOCAFE.GET_PRODUCT_DETAIL_SUCCESS:
      return {
        ...state,
        productDetail: payload,
        statusProductDetail: Status.SUCCESS,
        errorProductDetail: '',
      };
    case NEOCAFE.GET_PRODUCT_DETAIL_ERROR:
      return {
        ...state,
        statusProductDetail: Status.ERROR,
        errorProductDetail: payload.errorMsg || 'Failed to get product detail',
      };
    case NEOCAFE.GET_PRODUCT_DETAIL_RESET:
      return {
        ...state,
        productDetail: null,
        statusProductDetail: Status.DEFAULT,
        errorProductDetail: '',
      };
    default:
      return state;
  }
};

function getFirstExtraType1(listExtra, type) {
  if (!Array.isArray(listExtra) || listExtra.length === 0) {
    return [];
  }

  const tempExtraItem = listExtra.find(item => item.group_type === 1);

  if (!tempExtraItem) {
    return [];
  }

  return type === 1 ? [tempExtraItem] : [tempExtraItem.id];
}

function setupProduct(payload) {
  if (!payload || !Array.isArray(payload)) {
    return [];
  }
  payload.forEach(cate => {
    if (cate && Array.isArray(cate.products)) {
      cate.products.forEach((product, index) => {
        // Set option_item
        product.option_item =
          (!product.options || product.options === false || !Array.isArray(product.options) || product.options.length === 0)
            ? { id: -1 }
            : (Array.isArray(product.options[0]) && product.options[0].length > 0 ? product.options[0][0] : { id: -1 });

        // Set extra_items
        product.extra_items =
          (product.extras && product.extras !== false && Array.isArray(product.extras) && product.extras.length > 0)
            ? getFirstExtraType1(product.extras[0], 1)
            : [];

        // Set quantity
        product.quantity = 0;

        // Set extraIds
        product.extraIds =
          (product.extras && product.extras !== false && Array.isArray(product.extras) && product.extras.length > 0)
            ? getFirstExtraType1(product.extras[0], 2)
            : [];

        // Set isExpired
        product.isExpired = false;
      });
    }
  });
  return payload;
}
