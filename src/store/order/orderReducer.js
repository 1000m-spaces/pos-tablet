import Status from 'common/Status/Status';
import {NEOCAFE} from 'store/actionsTypes';

const initializeState = {
  currentOrder: {
    take_away: false,
    products: [],
    applied_products: [],
    table: 0,
    note: '',
    delivery: null,
  },
  statusAddProductCart: Status.DEFAULT,

  statusSetOrder: Status.DEFAULT,
  //order
  statusCreateOrder: Status.DEFAULT,
  order: null,
};

export default (state = initializeState, {type, payload}) => {
  switch (type) {
    // ADD PRODUCT TO CART
    case NEOCAFE.ADD_PRODUCT_CART_REQUEST:
      return {
        ...state,
        statusAddProductCart: Status.LOADING,
      };
    case NEOCAFE.ADD_PRODUCT_CART_SUCCESS:
      const products = handleCheckProduct(state.currentOrder.products, payload);
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          products,
          applied_products: products,
        },
        statusAddProductCart: Status.SUCCESS,
      };
    case NEOCAFE.ADD_PRODUCT_CART_ERROR:
      return {
        ...state,
        statusAddProductCart: Status.ERROR,
      };
    // SET CURRENT ORDER
    case NEOCAFE.SET_ORDER_REQUEST:
      return {
        ...state,
        statusSetOrder: Status.LOADING,
      };
    case NEOCAFE.SET_ORDER_SUCCESS:
      return {
        ...state,
        currentOrder: payload,
        statusSetOrder: Status.SUCCESS,
      };
    case NEOCAFE.SET_ORDER_ERROR:
      return {
        ...state,
        statusSetOrder: Status.ERROR,
      };
    case NEOCAFE.SET_ORDER_RESET:
      return {
        ...state,
        statusSetOrder: Status.DEFAULT,
      };
    // CREATE ORDER
    case NEOCAFE.CREATE_ORDER_REQUEST:
      return {
        ...state,
        statusCreateOrder: Status.LOADING,
      };
    case NEOCAFE.CREATE_ORDER_SUCCESS:
      return {
        ...state,
        // tokenConfirm: payload.tokenConfirm,
        order: payload,
        statusCreateOrder: Status.SUCCESS,
      };
    case NEOCAFE.CREATE_ORDER_ERROR:
      return {
        ...state,
        statusCreateOrder: Status.ERROR,
      };
    default: {
      return state;
    }
  }
};

const handleCheckProduct = (list, payload) => {
  let resultProducts = [];
  let tempMapCheck = new Map();
  if (list.length === 0) {
    tempMapCheck.set(
      `${payload.prodid}_${payload.option_item.id}_${payload.extraIds}`,
      payload,
    );
  } else {
    tempMapCheck = new Map(
      list.map(item => {
        return [`${item.prodid}_${item.option_item.id}_${item.extraIds}`, item];
      }),
    );
    if (
      tempMapCheck.has(
        `${payload.prodid}_${payload.option_item.id}_${payload.extraIds}`,
      ) === true
    ) {
      const existingProduct = tempMapCheck.get(
        `${payload.prodid}_${payload.option_item.id}_${payload.extraIds}`,
      );

      tempMapCheck.set(
        `${payload.prodid}_${payload.option_item.id}_${payload.extraIds}`,
        {
          ...existingProduct,
          quantity: existingProduct.quantity + payload.quantity,
        },
      );
    } else {
      tempMapCheck.set(
        `${payload.prodid}_${payload.option_item.id}_${payload.extraIds}`,
        payload,
      );
    }
  }
  resultProducts = Array.from(tempMapCheck.values());
  return resultProducts;
};
