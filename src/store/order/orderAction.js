import {NEOCAFE} from 'store/actionsTypes';

export const getCategories = request => ({
  type: NEOCAFE.GET_CATEGORIES_REQUEST,
  payload: request,
});

export const createOrder = request => ({
  type: NEOCAFE.CREATE_ORDER_REQUEST,
  payload: request,
});
