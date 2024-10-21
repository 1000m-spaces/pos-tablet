import Status from 'common/Status/Status';
import {NEOCAFE} from 'store/actionsTypes';

const initializeState = {
  //categories
  categories: [],
  statusGetCategories: Status.DEFAULT,
  //order
  statusCreateOrder: Status.DEFAULT,
  order: null,
};

export default (state = initializeState, {type, payload}) => {
  switch (type) {
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
