import {takeLatest, call, put, select} from 'redux-saga/effects';
import {NEOCAFE} from 'store/actionsTypes';
import orderController from './orderController';
// import {isTokenConfirm} from './authSelector';
// import {confirmOtpReset, loginPhoneReset, sendPhoneReset} from './authAction';
import {asyncStorage} from 'store/index';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {resetGetListShop, resetOrder} from 'store/actions';
// import strings from 'localization/Localization';

function* createOrderSaga({payload}) {
  try {
    const result = yield call(orderController.createOrderController, payload);
    if (result.success === true && result?.data && result?.data?.status) {
      const {data} = result.data;
      console.log('result success order:', data);
      yield put({
        type: NEOCAFE.CREATE_ORDER_SUCCESS,
        payload: data,
      });
    } else if (result.success === true && result?.data?.status === false) {
      console.log('result errorr order:', result);
      yield put({
        type: NEOCAFE.CREATE_ORDER_ERROR,
        payload: {errorMsg: result?.data?.error},
      });
    } else {
      yield put({
        type: NEOCAFE.CREATE_ORDER_ERROR,
        payload: {errorMsg: 'Xảy ra lỗi trong quá trình tạo đơn'},
      });
    }
  } catch (e) {
    yield put({
      type: NEOCAFE.CREATE_ORDER_ERROR,
      payload: {
        errorMsg:
          'Xảy ra lỗi trong quá trình tạo đơn, vui lòng liên hệ nhân viên chăm sóc khách hàng',
      },
    });
  }
}

export default function* watcherSaga() {
  // yield takeLatest(NEOCAFE.SEND_PHONE_REQUEST, sendPhoneSaga);
  
  yield takeLatest(NEOCAFE.CREATE_ORDER_REQUEST, createOrderSaga);
  // yield takeLatest(NEOCAFE.LOGIN_PHONE_REQUEST, loginPhone);
  // yield takeLatest(NEOCAFE.LOGOUT_REQUEST, logout);
  // yield takeLatest(NEOCAFE.GET_VERSION_REQUEST, getVersions);
}
