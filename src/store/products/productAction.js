import {NEOCAFE} from 'store/actionsTypes';

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
