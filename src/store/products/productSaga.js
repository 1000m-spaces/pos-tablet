import { NEOCAFE } from 'store/actionsTypes';
import { takeLatest, call, put } from 'redux-saga/effects';
import ProductController from './productController';
import { asyncStorage } from 'store/index';

function* getMenuSaga({ payload }) {
  try {
    const result = yield call(ProductController.getProductMenu, payload);
    console.log('result::', result)
    if (result.success) {
      // Cache the menu data on successful API call
      yield call(asyncStorage.setCachedMenu, result.categories);

      yield put({
        type: NEOCAFE.GET_MENU_SUCCESS,
        payload: result.categories,
      });
    } else {
      // API call failed, try to get cached data
      console.log('API call failed, attempting to retrieve cached menu data');
      const cachedMenu = yield call(asyncStorage.getCachedMenu);

      if (cachedMenu) {
        console.log('Using cached menu data for offline mode');
        yield put({
          type: NEOCAFE.GET_MENU_SUCCESS,
          payload: cachedMenu,
        });
      } else {
        console.log('No cached menu data available');
        yield put({
          type: NEOCAFE.GET_MENU_ERROR,
          payload: {
            errorMsg: 'No internet connection and no cached data available',
          },
        });
      }
    }
  } catch (error) {
    console.log('Menu API error, attempting to retrieve cached data:', error);

    // Try to get cached data on network error
    try {
      const cachedMenu = yield call(asyncStorage.getCachedMenu);

      if (cachedMenu) {
        console.log('Using cached menu data due to network error');
        yield put({
          type: NEOCAFE.GET_MENU_SUCCESS,
          payload: cachedMenu,
        });
      } else {
        console.log('No cached menu data available for offline use');
        yield put({
          type: NEOCAFE.GET_MENU_ERROR,
          payload: {
            errorMsg: 'Network error and no cached data available',
          },
        });
      }
    } catch (cacheError) {
      console.error('Error accessing cached menu data:', cacheError);
      yield put({
        type: NEOCAFE.GET_MENU_ERROR,
        payload: {
          errorMsg: error,
        },
      });
    }
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
