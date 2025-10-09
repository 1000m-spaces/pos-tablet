import Status from 'common/Status/Status';
import { NEOCAFE } from 'store/actionsTypes';

const initializeState = {
  currentOrder: {
    take_away: false,
    products: [],
    applied_products: [],
    table: '',
    tableId: '',
    note: '',
    delivery: null,
    orderType: null,
  },
  statusAddProductCart: Status.DEFAULT,
  onlineOrders: [],
  statusGetOnlineOrder: Status.DEFAULT,
  // new lists
  shippingOrders: [],
  statusGetOrderShipping: Status.DEFAULT,
  paidSuccessOrders: [],
  statusGetOrderPaidSuccess: Status.DEFAULT,
  statusSetOrder: Status.DEFAULT,
  statusConfirmOrderOnline: Status.DEFAULT,
  //order
  statusCreateOrder: Status.DEFAULT,
  order: null,
};

export default (state = initializeState, { type, payload }) => {
  switch (type) {
    // GET ONLINE ORDER
    case NEOCAFE.GET_ONLINE_ORDER_REQUEST:
      return {
        ...state,
        statusGetOnlineOrder: Status.LOADING,
      };
    case NEOCAFE.GET_ONLINE_ORDER_SUCCESS:
      console.log('payload:: GET_ONLINE_ORDER_SUCCESS', payload)
      return {
        ...state,
        onlineOrders: payload,
        statusGetOnlineOrder: Status.SUCCESS,
      };
    case NEOCAFE.GET_ONLINE_ORDER_ERROR:
      return {
        ...state,
        statusGetOnlineOrder: Status.ERROR,
      };
    case NEOCAFE.GET_ONLINE_ORDER_RESET:
      return {
        ...state,
        statusGetOnlineOrder: Status.DEFAULT,
      };
    // GET ORDER SHIPPING
    case NEOCAFE.GET_ORDER_SHIPPING_REQUEST:
      return {
        ...state,
        statusGetOrderShipping: Status.LOADING,
      };
    case NEOCAFE.GET_ORDER_SHIPPING_SUCCESS:
      return {
        ...state,
        shippingOrders: payload,
        statusGetOrderShipping: Status.SUCCESS,
      };
    case NEOCAFE.GET_ORDER_SHIPPING_ERROR:
      return {
        ...state,
        statusGetOrderShipping: Status.ERROR,
      };
    case NEOCAFE.GET_ORDER_SHIPPING_RESET:
      return {
        ...state,
        statusGetOrderShipping: Status.DEFAULT,
      };
    // GET ORDER PAID SUCCESS
    case NEOCAFE.GET_ORDER_PAID_SUCCESS_REQUEST:
      return {
        ...state,
        statusGetOrderPaidSuccess: Status.LOADING,
      };
    case NEOCAFE.GET_ORDER_PAID_SUCCESS_SUCCESS:
      return {
        ...state,
        paidSuccessOrders: payload,
        statusGetOrderPaidSuccess: Status.SUCCESS,
      };
    case NEOCAFE.GET_ORDER_PAID_SUCCESS_ERROR:
      return {
        ...state,
        statusGetOrderPaidSuccess: Status.ERROR,
      };
    case NEOCAFE.GET_ORDER_PAID_SUCCESS_RESET:
      return {
        ...state,
        statusGetOrderPaidSuccess: Status.DEFAULT,
      };
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
    case NEOCAFE.CREATE_ORDER_RESET:
      return {
        ...state,
        statusCreateOrder: Status.DEFAULT,
        order: null,
      };
    // CONFIRM ORDER ONLINE
    case NEOCAFE.CONFIRM_ORDER_ONLINE_REQUEST:
      return {
        ...state,
        statusConfirmOrderOnline: Status.LOADING,
      };
    case NEOCAFE.CONFIRM_ORDER_ONLINE_SUCCESS:
      return {
        ...state,
        statusConfirmOrderOnline: Status.SUCCESS,
      };
    case NEOCAFE.CONFIRM_ORDER_ONLINE_ERROR:
      return {
        ...state,
        statusConfirmOrderOnline: Status.ERROR,
      };
    case NEOCAFE.CONFIRM_ORDER_ONLINE_RESET:
      return {
        ...state,
        statusConfirmOrderOnline: Status.DEFAULT,
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
