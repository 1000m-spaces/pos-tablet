import Status from 'common/Status/Status';
import {NEOCAFE} from 'store/actionsTypes';

const initializeState = {
  currentUser: {},
  statusSetUser: Status.DEFAULT,

  statusDeleteAccount: Status.DEFAULT,

  statusConfirmDelete: Status.DEFAULT,
  errorDeleteAccount: '',

  statusUpdateUser: Status.DEFAULT,
  updatedUser: {},
  errorUpdateUser: '',

  statusSetLanguage: Status.DEFAULT,
  currentUserLanguage: '',
};

export default (state = initializeState, {type, payload}) => {
  switch (type) {
    case NEOCAFE.SET_LANGUAGE_REQUEST: {
      return {
        ...state,
        statusSetLanguage: Status.LOADING,
      };
    }
    case NEOCAFE.SET_LANGUAGE_SUCCESS: {
      return {
        ...state,
        currentUserLanguage: payload,
        statusSetLanguage: Status.SUCCESS,
      };
    }
    case NEOCAFE.SET_LANGUAGE_ERROR: {
      return {
        ...state,
        statusSetLanguage: Status.ERROR,
      };
    }
    case NEOCAFE.GET_DELETE_ACCOUNT_REQUEST:
      return {
        ...state,
        statusDeleteAccount: Status.LOADING,
      };
    case NEOCAFE.GET_DELETE_ACCOUNT_SUCCESS:
      return {
        ...state,
        statusDeleteAccount: Status.SUCCESS,
      };
    case NEOCAFE.GET_DELETE_ACCOUNT_RESET:
      return {
        ...state,
        statusDeleteAccount: Status.DEFAULT,
      };
    case NEOCAFE.CONFIRM_DELETE_OTP_REQUEST:
      return {
        ...state,
        statusConfirmDelete: Status.LOADING,
      };
    case NEOCAFE.CONFIRM_DELETE_OTP_SUCCESS:
      return {
        ...state,
        statusConfirmDelete: Status.SUCCESS,
      };
    case NEOCAFE.CONFIRM_DELETE_OTP_ERROR:
      return {
        ...state,
        statusConfirmDelete: Status.ERROR,
        errorDeleteAccount: payload,
      };
    case NEOCAFE.CONFIRM_DELETE_OTP_RESET:
      return {
        ...state,
        statusConfirmDelete: Status.DEFAULT,
        errorDeleteAccount: '',
      };
    case NEOCAFE.UPDATE_USER_INFO_REQUEST:
      return {
        ...state,
        statusUpdateUser: Status.LOADING,
      };
    case NEOCAFE.UPDATE_USER_INFO_SUCCESS:
      return {
        ...state,
        updatedUser: payload,
        statusUpdateUser: Status.SUCCESS,
      };
    case NEOCAFE.UPDATE_USER_INFO_ERROR:
      return {
        ...state,
        statusUpdateUser: Status.ERROR,
        errorUpdateUser: payload,
      };
    case NEOCAFE.UPDATE_USER_INFO_RESET:
      return {
        ...state,
        statusUpdateUser: Status.DEFAULT,
        updatedUser: {},
        errorUpdateUser: '',
      };
    default:
      return state;
  }
};
