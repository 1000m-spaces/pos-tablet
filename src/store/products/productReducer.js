import Status from 'common/Status/Status';
import strings from 'localization/Localization';
import {NEOCAFE} from 'store/actionsTypes';

const initialState = {
  productMenu: [],
  statusProductMenu: Status.DEFAULT,
  errorProductMenu: '',

  currentProduct: null,
  statusSetProduct: Status.DEFAULT
};

export default (state = initialState, {type, payload}) => {
  switch (type) {
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
      return {
        ...state,
        productMenu: products || [],
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
    default:
      return state;
  }
};
function getFirstExtraType1(listExtra, type) {
  const tempExtraItem = listExtra.find(item => item.group_type === 1);
  return type === 1 && tempExtraItem ? [tempExtraItem] : [tempExtraItem.id];
}
function setupProduct(payload) {
  if (payload) {
    payload.map(cate => {
      cate?.products.map((product, index) => {
        product.option_item =
          product.options === false ? {id: -1} : product.options[0][0];
        product.extra_items =
          product.extras !== false && product.extras.length > 0
            ? getFirstExtraType1(product.extras[0], 1)
            : [];
        product.quantity = 0;
        product.extraIds =
          product.extras !== false && product.extras.length > 0
            ? getFirstExtraType1(product.extras[0], 2)
            : [];
        product.isExpired = false;
      });
    });
  }
  return payload;
}
