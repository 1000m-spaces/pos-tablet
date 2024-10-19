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
