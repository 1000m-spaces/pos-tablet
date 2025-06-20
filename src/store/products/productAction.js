import { NEOCAFE } from 'store/actionsTypes';

export const resetMenuAction = () => ({
  type: NEOCAFE.GET_MENU_RESET,
});
export const getMenuAction = payload => {
  return {
    type: NEOCAFE.GET_MENU_REQUEST,
    payload,
  };
};
export const setProductAction = payload => ({
  type: NEOCAFE.SET_PRODUCT_REQUEST,
  payload,
});
export const resetSettingProductAction = () => ({
  type: NEOCAFE.SET_PRODUCT_RESET,
});

export const applyVoucherAction = payload => ({
  type: NEOCAFE.APPLY_VOUCHER_REQUEST,
  payload,
});

export const getVoucherAction = payload => ({
  type: NEOCAFE.GET_VOUCHER_REQUEST,
  payload,
});

export const getProductDetailAction = payload => ({
  type: NEOCAFE.GET_PRODUCT_DETAIL_REQUEST,
  payload,
});

export const resetProductDetailAction = () => ({
  type: NEOCAFE.GET_PRODUCT_DETAIL_RESET,
});
