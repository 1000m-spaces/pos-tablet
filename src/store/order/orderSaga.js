import { takeLatest, takeEvery, call, put, select } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import orderController from './orderController';
// import {isTokenConfirm} from './authSelector';
// import {confirmOtpReset, loginPhoneReset, sendPhoneReset} from './authAction';
import { asyncStorage } from 'store/index';
import AsyncStorage from 'store/async_storage';
import { syncPendingOrdersAction } from 'store/actions';
import logService, { LOG_CATEGORIES } from '../../services/LogService';

function* createOrderSaga({ payload }) {
  const session = payload?.session || 'unknown';
  logService.info(LOG_CATEGORIES.ORDER, `[Saga] createOrderSaga BẮT ĐẦU: ${session}`, {
    session,
    displayID: payload?.displayID,
    table: payload?.shopTableName,
    total: payload?.total_amount,
    products: payload?.products?.length,
    offline_code: payload?.offline_code,
  });

  yield put({
    type: NEOCAFE.CREATE_ORDER_SUCCESS,
  });

  try {
    const orderForHistory = {
      ...payload,
      syncStatus: 'pending',
      error_reason: '',
      failed_at: new Date().toISOString(),
      retry_count: 0,
      updated_at: new Date().toISOString()
    };

    // Bước 1: Lưu đơn cuối cùng
    logService.info(LOG_CATEGORIES.ORDER, `[Saga] Bước 1/3: setLastOrder cho ${session}`);
    yield call(AsyncStorage.setLastOrder, orderForHistory);

    // Bước 2: Thêm vào pendingOrders
    logService.info(LOG_CATEGORIES.ORDER, `[Saga] Bước 2/3: addPendingOrder cho ${session}`);
    yield call(AsyncStorage.addPendingOrder, orderForHistory);

    // Bước 3: Thêm vào orderHistory (lịch sử bất biến)
    logService.info(LOG_CATEGORIES.ORDER, `[Saga] Bước 3/3: addOrderHistory cho ${session}`);
    yield call(AsyncStorage.addOrderHistory, orderForHistory);

    logService.info(LOG_CATEGORIES.ORDER, `[Saga] createOrderSaga HOÀN TẤT: ${session} — đã lưu cả pendingOrders + orderHistory`, {
      session,
      displayID: orderForHistory.displayID,
      table: orderForHistory.shopTableName,
      total: orderForHistory.total_amount,
    });
  } catch (storageError) {
    logService.error(LOG_CATEGORIES.ORDER, `[Saga] createOrderSaga LỖI STORAGE: ${session} - ${storageError.message}`, {
      session,
      error: storageError.message,
      stack: storageError.stack ? storageError.stack.substring(0, 300) : '',
    });
  }
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
      console.log('error:::', error);
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
    console.log('result:::', result);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.GET_ORDER_SHIPPING_SUCCESS,
        payload: result.data,
      });
    } else {
      yield put({ type: NEOCAFE.GET_ORDER_SHIPPING_ERROR });
    }
  } catch (error) {
    console.log('error:::', error);
    yield put({ type: NEOCAFE.GET_ORDER_SHIPPING_ERROR });
  }
}

function* getOrderPaidSuccessSaga({ payload }) {
  try {
    logService.info(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] BẮT ĐẦU lấy đơn đã thanh toán`);
    const result = yield call(orderController.getOrderPaidSuccess, payload);
    if (result && result.success) {
      // ĐỌC storage mới nhất
      const pendingOrders = yield call(AsyncStorage.getPendingOrders);
      const resultItems = result.data?.data || [];

      logService.info(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] Server trả về ${resultItems.length} đơn, local có ${pendingOrders.length} đơn`, {
        serverSessions: resultItems.map(i => i.offline_code || i.session).filter(Boolean),
        localSessions: pendingOrders.map(o => o.session).filter(Boolean),
      });

      // Đánh dấu đơn server là synced
      resultItems.forEach(item => {
        item.syncStatus = "synced";
      });

      // Danh sách các mã đơn từ server
      const serverKeys = new Set(resultItems.map(item => item.offline_code || item.session).filter(Boolean));

      // Cập nhật trạng thái synced cho các đơn local đã có trên server
      const newlySyncedLocalOrders = [];
      const updatedPendingOrders = pendingOrders.map(order => {
        const key = order.session || order.offline_code;
        if (key && serverKeys.has(key) && order.syncStatus !== 'synced') {
          const updated = { ...order, syncStatus: 'synced' };
          newlySyncedLocalOrders.push(updated);
          return updated;
        }
        return order;
      });

      logService.info(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] ${newlySyncedLocalOrders.length} đơn local mới chuyển sang synced`, {
        newlySynced: newlySyncedLocalOrders.map(o => o.session),
      });

      // Cập nhật vào lịch sử đơn hàng (orderHistory) để giao diện đồng bộ
      for (const order of newlySyncedLocalOrders) {
        const key = order.session || order.offline_code;
        if (key) {
          logService.info(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] Cập nhật orderHistory: ${key} → synced`);
          yield call(AsyncStorage.updateOrderSyncStatus, key, 'synced');
        }
      }

      // Giữ TẤT CẢ đơn local (KHÔNG xóa bất kỳ đơn nào)
      // Thêm đơn server mà local chưa có (tránh trùng lặp)
      const localKeys = new Set(updatedPendingOrders.map(o => o.session || o.offline_code).filter(Boolean));
      const newServerOrders = resultItems
        .filter(item => {
          const key = item.offline_code || item.session;
          return key && !localKeys.has(key);
        })
        .map(item => ({
          ...item,
          session: item.session || item.offline_code,
          offlineOrderId: item.offlineOrderId || item.offline_code,
        }));

      const dataSynced = [...updatedPendingOrders, ...newServerOrders];
      logService.info(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] GHI pendingOrders: ${dataSynced.length} đơn (${updatedPendingOrders.length} local + ${newServerOrders.length} server mới)`, {
        allSessions: dataSynced.map(o => `${o.session}:${o.syncStatus}`),
      });
      yield call(AsyncStorage.setPendingOrders, dataSynced);
      logService.info(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] Trigger syncPendingOrders sau merge`);
      yield put(syncPendingOrdersAction());
      yield put({
        type: NEOCAFE.GET_ORDER_PAID_SUCCESS_SUCCESS,
        payload: result.data,
      });
    } else {
      logService.warn(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] API thất bại hoặc result null`);
      yield put({ type: NEOCAFE.GET_ORDER_PAID_SUCCESS_ERROR });
    }
  } catch (error) {
    logService.error(LOG_CATEGORIES.SYNC, `[GetPaidSuccess] EXCEPTION: ${error.message}`, {
      error: error.message,
      stack: error.stack ? error.stack.substring(0, 300) : '',
    });
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
  try {
    const result = yield call(orderController.getEstimateAhamove, payload);
    console.log(typeof result?.data?.total_price);
    if (result && result.success) {
      yield put({
        type: NEOCAFE.GET_ESTIMATE_AHAMOVE_SUCCESS,
        payload: result.data,
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
  yield takeEvery(NEOCAFE.CREATE_ORDER_REQUEST, createOrderSaga);
  yield takeLatest(NEOCAFE.ADD_PRODUCT_CART_REQUEST, addProductCartSaga);
  yield takeLatest(NEOCAFE.SET_ORDER_REQUEST, setOrderSaga);
  yield takeLatest(NEOCAFE.GET_ONLINE_ORDER_REQUEST, getOnlineOrderSaga);
  yield takeLatest(NEOCAFE.CONFIRM_ORDER_ONLINE_REQUEST, confirmOrderOnlineSaga);
  yield takeLatest(NEOCAFE.GET_ORDER_SHIPPING_REQUEST, getOrderShippingSaga);
  yield takeLatest(NEOCAFE.GET_ORDER_PAID_SUCCESS_REQUEST, getOrderPaidSuccessSaga);
  yield takeLatest(NEOCAFE.CALL_DRIVER_BACK_REQUEST, callDriverBackSaga);
  yield takeLatest(NEOCAFE.GET_ESTIMATE_AHAMOVE_REQUEST, estimateAhamove);
}
