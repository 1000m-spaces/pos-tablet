import {NEOCAFE} from 'store/actionsTypes';

export const createOrder = request => ({
  type: NEOCAFE.CREATE_ORDER_REQUEST,
  payload: request,
});
export const addProductCart = payload => ({
  type: NEOCAFE.ADD_PRODUCT_CART_REQUEST,
  payload,
});
export const setOrderAction = payload => ({
  type: NEOCAFE.SET_ORDER_REQUEST,
  payload,
});

export const getOnlineOrder = payload => ({
  type: NEOCAFE.GET_ONLINE_ORDER_REQUEST,
  payload,
});
export const resetGetOnlineOrder = payload => ({
  type: NEOCAFE.GET_ONLINE_ORDER_RESET,
  payload,
});
