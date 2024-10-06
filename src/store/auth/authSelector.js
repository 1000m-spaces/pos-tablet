export const isTokenConfirm = state => state.auth.tokenConfirm;
export const isStatusSendPhone = state => state.auth.statusSendPhone;
export const isStatusConfirmOtp = state => state.auth.statusConfirmOtp;
export const isStatusLoginPhone = state => state.auth.statusLoginPhone;
export const getTempUser = state => state.auth.tempUser;
export const isErrorConfirm = state => state.auth.errorConfirm;
export const getVersionNew = state => state.auth.versionNew;
export const getForceUpdate = state => state.auth.forceUpdate;
export const getUpdate = state => state.auth.update;
export const isErrorSendOtp = state => state.auth.errorSendOtp;
export const isUpdateInstalledCodePush = state =>
  state.auth.updateInstalledCodePush;
