import {NEOCAFE} from 'store/actionsTypes';

export const createOrder = request => ({
  type: NEOCAFE.CREATE_ORDER_REQUEST,
  payload: request,
});
