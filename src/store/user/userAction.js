import {NEOCAFE} from 'store/actionsTypes';

export const getDeleteAccount = () => ({
  type: NEOCAFE.GET_DELETE_ACCOUNT_REQUEST,
});
export const deleteAccountReset = () => ({
  type: NEOCAFE.GET_DELETE_ACCOUNT_RESET,
});
export const confirmDeleteAccountOtp = otp => ({
  type: NEOCAFE.CONFIRM_DELETE_OTP_REQUEST,
  payload: {
    otp,
  },
});
export const resetDeleteOtp = () => ({
  type: NEOCAFE.CONFIRM_DELETE_OTP_RESET,
});
export const updateUserInformation = payload => ({
  type: NEOCAFE.UPDATE_USER_INFO_REQUEST,
  payload,
});
export const resetUpdateUser = () => ({
  type: NEOCAFE.UPDATE_USER_INFO_RESET,
});
export const setLanguageAction = payload => ({
  type: NEOCAFE.SET_LANGUAGE_REQUEST,
  payload,
});
