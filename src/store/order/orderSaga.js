import { takeLatest, call, put, select } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import orderController from './orderController';
// import {isTokenConfirm} from './authSelector';
// import {confirmOtpReset, loginPhoneReset, sendPhoneReset} from './authAction';
import { asyncStorage } from 'store/index';
import AsyncStorage from 'store/async_storage';
import { syncPendingOrdersAction } from 'store/actions';

function* createOrderSaga({ payload }) {
  // try {
  // const result = yield call(orderController.createOrderController, payload);
  // if (result.success === true && result?.data && result?.data?.status) {
  //   const { data } = result.data;
  //   console.log('result success order:', data);

  //   // Save successful order to local storage for history
  //   try {
  //     const orderForHistory = {
  //       ...payload,
  //       syncStatus: 'synced',
  //       synced_at: new Date().toISOString(),
  //       api_response: data, // Store API response data
  //       order_id: data.order_id || data.id, // Store server order ID if available
  //       updated_at: new Date().toISOString()
  //     };

  //     // Save as last order
  //     yield call(AsyncStorage.setLastOrder, orderForHistory);

  //     // Add to pending orders list (which serves as order history)
  //     yield call(AsyncStorage.addPendingOrder, orderForHistory);

  //     console.log('Order saved to local storage after successful API call:', orderForHistory);
  //   } catch (storageError) {
  //     console.log('Error saving order to local storage:', storageError);
  //     // Don't fail the entire operation if storage fails
  //   }

  //   yield put({
  //     type: NEOCAFE.CREATE_ORDER_SUCCESS,
  //     payload: data,
  //   });
  // } else if (result.success === true && result?.data?.status === false) {
  //   console.log('result errorr order:', result);

  //   // Save failed order to local storage for retry (consolidate error handling here)
  //   try {
  //     const failedOrder = {
  //       ...payload,
  //       syncStatus: 'pending',
  //       error_reason: result?.data?.error || 'API returned false status',
  //       failed_at: new Date().toISOString(),
  //       retry_count: 0,
  //       updated_at: new Date().toISOString()
  //     };

  //     yield call(AsyncStorage.setLastOrder, failedOrder);
  //     yield call(AsyncStorage.addPendingOrder, failedOrder);
  //     console.log('Failed order saved to local storage for retry:', failedOrder);
  //   } catch (storageError) {
  //     console.log('Error saving failed order to local storage:', storageError);
  //   }

  //   yield put({
  //     type: NEOCAFE.CREATE_ORDER_ERROR,
  //     payload: { errorMsg: result?.data?.error },
  //   });
  // } else {
  //   // Save failed order to local storage for retry (consolidate error handling here)
  //   try {
  //     const failedOrder = {
  //       ...payload,
  //       syncStatus: 'pending',
  //       error_reason: 'Invalid API response format',
  //       failed_at: new Date().toISOString(),
  //       retry_count: 0,
  //       updated_at: new Date().toISOString()
  //     };

  //     yield call(AsyncStorage.setLastOrder, failedOrder);
  //     yield call(AsyncStorage.addPendingOrder, failedOrder);
  //     console.log('Failed order saved to local storage for retry:', failedOrder);
  //   } catch (storageError) {
  //     console.log('Error saving failed order to local storage:', storageError);
  //   }

  //   yield put({
  //     type: NEOCAFE.CREATE_ORDER_ERROR,
  //     payload: { errorMsg: 'Xảy ra lỗi trong quá trình tạo đơn' },
  //   });
  // }
  // } catch (e) {
  // console.log('API call exception:', e);
  yield put({
    type: NEOCAFE.CREATE_ORDER_SUCCESS,
  });

  // Save failed order to local storage for retry (consolidate error handling here)
  console.log('payloaDDDDDDDDDDDD:', payload);
  try {
    const orderForHistory = {
      ...payload,
      syncStatus: 'pending',
      error_reason: '',
      failed_at: new Date().toISOString(),
      retry_count: 0,
      updated_at: new Date().toISOString()
    };

    yield call(AsyncStorage.setLastOrder, orderForHistory);
    yield call(AsyncStorage.addPendingOrder, orderForHistory);
  } catch (storageError) {
    console.log('Error saving failed order to local storage:', storageError);
  }

  // yield put({
  //   type: NEOCAFE.CREATE_ORDER_ERROR,
  //   payload: {
  //     errorMsg:
  //       'Xảy ra lỗi trong quá trình tạo đơn, vui lòng liên hệ nhân viên chăm sóc khách hàng',
  //   },
  // });
  // }
}
function* setOrderSaga({ payload }) {
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
function* addProductCartSaga({ payload }) {
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

function* getOnlineOrderSaga({ payload }) {
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

function* confirmOrderOnlineSaga({ payload }) {
  try {
    const result = yield call(orderController.confirmOrderOnline, payload);
    if (result.success === true) {
      yield put({
        type: NEOCAFE.CONFIRM_ORDER_ONLINE_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({
        type: NEOCAFE.CONFIRM_ORDER_ONLINE_ERROR,
        payload: { errorMsg: result.error || 'Xảy ra lỗi khi xác nhận đơn hàng' },
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.CONFIRM_ORDER_ONLINE_ERROR,
      payload: { errorMsg: 'Xảy ra lỗi khi xác nhận đơn hàng' },
    });
  }
}

function* getOrderShippingSaga({ payload }) {
  try {
    const result = yield call(orderController.getOrderShipping, payload);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.GET_ORDER_SHIPPING_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({ type: NEOCAFE.GET_ORDER_SHIPPING_ERROR });
    }
  } catch (error) {
    yield put({ type: NEOCAFE.GET_ORDER_SHIPPING_ERROR });
  }
}

function* getOrderPaidSuccessSaga({ payload }) {
  try {
    const result = yield call(orderController.getOrderPaidSuccess, payload);
    if (result && result.success) {
      const pendingOrders = yield call(AsyncStorage.getPendingOrders);
      const pendingItems = pendingOrders.filter(item => item.syncStatus === "pending");
      const resultItems = result.data?.data || [];
      resultItems.forEach(item => {
        item.syncStatus = "synced";
      });
      const dataSynced = [...pendingItems, ...resultItems];
      console.log('dataSynced:', dataSynced)
      yield call(AsyncStorage.setPendingOrders, dataSynced);
      put(syncPendingOrdersAction());
      yield put({
        type: NEOCAFE.GET_ORDER_PAID_SUCCESS_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({ type: NEOCAFE.GET_ORDER_PAID_SUCCESS_ERROR });
    }
  } catch (error) {
    console.log('error:', error)
    yield put({ type: NEOCAFE.GET_ORDER_PAID_SUCCESS_ERROR });
  }
}

function* callDriverBackSaga({ payload, checksum }) {
  try {
    const result = yield call(orderController.callDriverBackController, payload, checksum);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.CALL_DRIVER_BACK_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({ type: NEOCAFE.CALL_DRIVER_BACK_ERROR });
    }
  } catch (error) {
    yield put({ type: NEOCAFE.CALL_DRIVER_BACK_ERROR });
  }
}

function* estimateAhamove({ payload }) {
  const selectedDelivery = yield select(state => getSelectedDelivery(state));
  try {
    const result = yield call(locationController.getEstimateAhamove, payload);
    console.log(typeof result?.data?.total_price);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.GET_ESTIMATE_AHAMOVE_SUCCESS,
      });
    } else {
      yield put({
        type: NEOCAFE.GET_ESTIMATE_AHAMOVE_ERROR,
      });
    }
  } catch (error) {
    yield put({
      type: NEOCAFE.GET_ESTIMATE_AHAMOVE_ERROR,
    });
  }
}

export default function* watcherSaga() {
  yield takeLatest(NEOCAFE.CREATE_ORDER_REQUEST, createOrderSaga);
  yield takeLatest(NEOCAFE.ADD_PRODUCT_CART_REQUEST, addProductCartSaga);
  yield takeLatest(NEOCAFE.SET_ORDER_REQUEST, setOrderSaga);
  yield takeLatest(NEOCAFE.GET_ONLINE_ORDER_REQUEST, getOnlineOrderSaga);
  yield takeLatest(NEOCAFE.CONFIRM_ORDER_ONLINE_REQUEST, confirmOrderOnlineSaga);
  yield takeLatest(NEOCAFE.GET_ORDER_SHIPPING_REQUEST, getOrderShippingSaga);
  yield takeLatest(NEOCAFE.GET_ORDER_PAID_SUCCESS_REQUEST, getOrderPaidSuccessSaga);
  yield takeLatest(NEOCAFE.CALL_DRIVER_BACK_REQUEST, callDriverBackSaga);
  yield takeLatest(NEOCAFE.GET_ESTIMATE_AHAMOVE_REQUEST, estimateAhamove);
}
