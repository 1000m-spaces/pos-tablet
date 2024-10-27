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
