import { NEOCAFE } from 'store/actionsTypes';
import { takeLatest, call, put } from 'redux-saga/effects';
import ProductController from './productController';
import { asyncStorage } from 'store/index';

function* getMenuSaga({ payload }) {
  try {
    const result = yield call(ProductController.getProductMenu, payload);
    console.log('result::', result)
    if (result.success) {
      yield put({
        type: NEOCAFE.GET_MENU_SUCCESS,
        payload: result.categories,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_MENU_ERROR,
      payload: {
        errorMsg: error,
      },
    });
  }
}
function* setProductSaga({ payload }) {
  try {
    yield put({
      type: NEOCAFE.SET_PRODUCT_SUCCESS,
      payload,
    });
  } catch (error) {
    yield put({
      type: NEOCAFE.SET_PRODUCT_ERROR,
      payload: {
        errorMsg: error,
      },
    });
  }
}

function* getVoucherSaga({ payload }) {
  console.log('payload saga::', payload)
  try {
    const result = yield call(ProductController.getVoucher, payload);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.GET_VOUCHER_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({
        type: NEOCAFE.GET_VOUCHER_ERROR,
        payload,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_VOUCHER_ERROR,
      payload: {
        errorMsg: error,
      },
    });
  }
}
function* getProductDetailSaga({ payload }) {
  try {
    const result = yield call(ProductController.getProductDetail, payload);
    if (result.success) {
      yield put({
        type: NEOCAFE.GET_PRODUCT_DETAIL_SUCCESS,
        payload: result.product,
      });
    } else {
      yield put({
        type: NEOCAFE.GET_PRODUCT_DETAIL_ERROR,
        payload: result,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_PRODUCT_DETAIL_ERROR,
      payload: {
        errorMsg: error,
      },
    });
  }
}

export default function* watcherSaga() {
  yield takeLatest(NEOCAFE.GET_MENU_REQUEST, getMenuSaga);
  yield takeLatest(NEOCAFE.SET_PRODUCT_REQUEST, setProductSaga);
  yield takeLatest(NEOCAFE.GET_VOUCHER_REQUEST, getVoucherSaga);
  yield takeLatest(NEOCAFE.GET_PRODUCT_DETAIL_REQUEST, getProductDetailSaga);
}
