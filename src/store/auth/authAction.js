import {NEOCAFE} from 'store/actionsTypes';

export const sendPhone = phone => ({
  type: NEOCAFE.SEND_PHONE_REQUEST,
  payload: {
    phone,
  },
});

export const loginInternal = request => ({
  type: NEOCAFE.LOGIN_REQUEST,
  payload: request,
});

export const sendPhoneReset = () => ({
  type: NEOCAFE.SEND_PHONE_RESET,
});

export const confirmOtp = (otp, device_id, push_token) => ({
  type: NEOCAFE.CONFIRM_OTP_REQUEST,
  payload: {
    otp,
    device_id,
    push_token,
  },
});
export const confirmOtpReset = () => ({
  type: NEOCAFE.CONFIRM_OTP_RESET,
});

export const loginPhone = phone => ({
  type: NEOCAFE.LOGIN_PHONE_REQUEST,
  payload: {
    phone,
  },
});
export const loginPhoneReset = () => ({
  type: NEOCAFE.LOGIN_PHONE_RESET,
});

export const logout = () => ({
  type: NEOCAFE.LOGOUT_REQUEST,
});

export const getVersion = (os, version, app_id) => ({
  type: NEOCAFE.GET_VERSION_REQUEST,
  payload: {
    os,
    version,
    app_id,
  },
});

export const getUpdateInstalledCodePush = isInstalled => ({
  type: 'UPDATE_INSTALLED_CODE_PUSH',
  payload: isInstalled,
});
