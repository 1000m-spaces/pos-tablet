import { NEOCAFE } from 'store/actionsTypes';

export const createOrder = request => ({
  type: NEOCAFE.CREATE_ORDER_REQUEST,
  payload: request,
});
export const resetCreateOrder = () => ({
  type: NEOCAFE.CREATE_ORDER_RESET,
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

export const confirmOrderOnline = payload => ({
  type: NEOCAFE.CONFIRM_ORDER_ONLINE_REQUEST,
  payload,
});

// Newly added actions for shipping and paid-success orders
export const getOrderShipping = payload => ({
  type: NEOCAFE.GET_ORDER_SHIPPING_REQUEST,
  payload,
});
export const resetGetOrderShipping = () => ({
  type: NEOCAFE.GET_ORDER_SHIPPING_RESET,
});

export const getOrderPaidSuccess = payload => ({
  type: NEOCAFE.GET_ORDER_PAID_SUCCESS_REQUEST,
  payload,
});
export const resetGetOrderPaidSuccess = () => ({
  type: NEOCAFE.GET_ORDER_PAID_SUCCESS_RESET,
});

// call the driver back
export const callDriverBack = (payload, checksum) => ({
  type: NEOCAFE.CALL_DRIVER_BACK_REQUEST,
  payload,
  checksum,
});

export const resetCallDriverBack = () => ({
  type: NEOCAFE.CALL_DRIVER_BACK_RESET,
});
export const resetConfirmOrderOnline = () => ({
  type: NEOCAFE.CONFIRM_ORDER_ONLINE_RESET,
});
export const getEstimateAhamove = payload => ({
  type: NEOCAFE.GET_ESTIMATE_AHAMOVE_REQUEST,
  payload,
});