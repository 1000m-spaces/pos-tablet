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
function* setOrderSaga({payload}) {
  try {
    yield put({
      type: NEOCAFE.SET_ORDER_SUCCESS,
      payload,
    });
  } catch (error) {
    yield put({
      type: NEOCAFE.SET_ORDER_ERROR,
    });
  }
}
function* addProductCartSaga({payload}) {
  try {
    yield put({
      type: NEOCAFE.ADD_PRODUCT_CART_SUCCESS,
      payload,
    });
  } catch (error) {
    yield put({
      type: NEOCAFE.ADD_PRODUCT_CART_ERROR,
    });
  }
}
function* getOnlineOrderSaga({payload}) {
  try {
    const result = yield call(orderController.getOnlineOrder, payload);
    console.log('result:::', result);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.GET_ONLINE_ORDER_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({
        type: NEOCAFE.GET_ONLINE_ORDER_ERROR,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_ONLINE_ORDER_ERROR,
    });
  }
}
export default function* watcherSaga() {
  yield takeLatest(NEOCAFE.CREATE_ORDER_REQUEST, createOrderSaga);
  yield takeLatest(NEOCAFE.ADD_PRODUCT_CART_REQUEST, addProductCartSaga);
  yield takeLatest(NEOCAFE.SET_ORDER_REQUEST, setOrderSaga);
  yield takeLatest(NEOCAFE.GET_ONLINE_ORDER_REQUEST, getOnlineOrderSaga);
}
