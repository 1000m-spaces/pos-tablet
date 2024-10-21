import {takeLatest, call, put, select} from 'redux-saga/effects';
import {NEOCAFE} from 'store/actionsTypes';
import authController from './authController';
import {isTokenConfirm} from './authSelector';
import {confirmOtpReset, loginPhoneReset, sendPhoneReset} from './authAction';
import {asyncStorage} from 'store/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {resetGetListShop, resetOrder} from 'store/actions';
import strings from 'localization/Localization';

function* sendPhoneSaga({payload}) {
  try {
    const result = yield call(
      authController.sendPhoneController,
      payload.phone,
    );
    console.log('RESULT SAGA::: ', result);
    if (result.success === true && result?.data && result?.data?.status) {
      const {data} = result.data;
      console.log('result success sendPhone:', data);
      yield put({
        type: NEOCAFE.SEND_PHONE_SUCCESS,
        payload: {
          tokenConfirm: data?.otp_token,
        },
      });
      yield put(sendPhoneReset());
    } else if (result.success === true && result?.data?.status === false) {
      console.log('result errorr sendPhone:', result);
      yield put({
        type: NEOCAFE.SEND_PHONE_ERROR,
        payload: {errorMsg: result?.data?.error},
      });
    } else {
      yield put({
        type: NEOCAFE.SEND_PHONE_ERROR,
        payload: {errorMsg: 'Xảy ra lỗi trong quá trình nhận OTP'},
      });
    }
  } catch (e) {
    yield put({
      type: NEOCAFE.SEND_PHONE_ERROR,
      payload: {
        errorMsg:
          'Xảy ra lỗi trong quá trình nhật OTP, vui lòng liên hệ nhân viên chăm sóc khách hàng',
      },
    });
  }
}

function* loginInternalSaga({payload}) {
  try {
    const result = yield call(authController.loginInternalController, payload);
    if (result.success === true && result?.data && result?.data?.status) {
      const {data} = result.data;
      console.log('login data:::', data);
      yield asyncStorage.setUser(data);
      yield put({
        type: NEOCAFE.LOGIN_SUCCESS,
        payload: {
          userInfo: data,
        },
      });
      // yield put(sendPhoneReset());
    } else if (result.success === true && result?.data?.status === false) {
      console.log('result errorr loginInternal:', result);
      yield put({
        type: NEOCAFE.SEND_PHONE_ERROR,
        payload: {errorMsg: result?.data?.error},
      });
    } else {
      yield put({
        type: NEOCAFE.SEND_PHONE_ERROR,
        payload: {errorMsg: 'Xảy ra lỗi trong quá trình đăng nhập'},
      });
    }
  } catch (e) {
    yield put({
      type: NEOCAFE.SEND_PHONE_ERROR,
      payload: {
        errorMsg:
          'Xảy ra lỗi trong quá trình nhật OTP, vui lòng liên hệ nhân viên chăm sóc khách hàng',
      },
    });
  }
}

function* confirmOtp({payload}) {
  const tokenConfirm = yield select(state => isTokenConfirm(state));
  console.log('tokenConfirm', tokenConfirm);
  const query = {
    otp_token: tokenConfirm,
    otp: payload.otp,
    partnerid: 100,
    allownoti: 1,
    clientver: 1,
    device_id: payload.device_id,
    push_token: payload.push_token,
  };
  try {
    const result = yield call(authController.confirmOtpController, query);
    console.log('result confirmOtp:', result);
    if (result?.status) {
      yield put({
        type: NEOCAFE.CONFIRM_OTP_SUCCESS,
      });
      yield asyncStorage.setUser(result?.data);
      // yield put(confirmOtpReset());
    } else {
      yield put({
        type: NEOCAFE.CONFIRM_OTP_ERROR,
        payload: {
          errorMsg: strings.verifyScreen.errorMessageOtp,
        },
      });
    }
  } catch (e) {
    yield put({
      type: NEOCAFE.CONFIRM_OTP_ERROR,
      payload: {
        errorMsg: strings.verifyScreen.errorMessageApp,
      },
    });
  }
}

function* loginPhone({payload}) {
  try {
    const result = yield call(
      authController.loginPhoneController,
      payload.phone,
    );
    console.log('result loginPhone:', result, payload);
    if (result?.status) {
      yield put({
        type: NEOCAFE.LOGIN_PHONE_SUCCESS,
        payload: {
          user: payload,
        },
      });
      console.log('storeeeeee:', asyncStorage);
    }
    yield put(loginPhoneReset());
  } catch (e) {}
}

function* logout() {
  try {
    yield put(resetOrder());
    yield put(resetGetListShop({isLogout: true}));
    // yield put(resetGetListProduct());
    asyncStorage.clearStorage();
    asyncStorage.setTheFirstLogin('false');
  } catch (e) {
    console.log(e);
  }
}

function* getVersions({payload}) {
  try {
    const result = yield call(
      authController.getVersion,
      payload.os,
      payload.version,
      payload.app_id,
    );
    console.log('response Versionnnnnn:', result);
    yield put({
      type: NEOCAFE.GET_VERSION_SUCCESS,
      payload: {
        forceUpdate: result.force,
        versionNew: result.version,
        update: result.update,
      },
    });
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_VERSION_ERROR,
      payload: {errorMsg: error},
    });
  }
}

export default function* watcherSaga() {
  // yield takeLatest(NEOCAFE.SEND_PHONE_REQUEST, sendPhoneSaga);
  yield takeLatest(NEOCAFE.LOGIN_REQUEST, loginInternalSaga);
  yield takeLatest(NEOCAFE.CONFIRM_OTP_REQUEST, confirmOtp);
  yield takeLatest(NEOCAFE.LOGIN_PHONE_REQUEST, loginPhone);
  yield takeLatest(NEOCAFE.LOGOUT_REQUEST, logout);
  yield takeLatest(NEOCAFE.GET_VERSION_REQUEST, getVersions);
}
