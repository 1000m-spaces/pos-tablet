import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import syncController from './syncController';
import AsyncStorageService from 'store/async_storage';

function* syncOrdersSaga(action) {
    try {
        const response = yield call(syncController.syncOrders, action.payload);
        if (response.success) {
            yield put({
                type: NEOCAFE.SYNC_ORDERS_SUCCESS,
                payload: response,
            });
        } else {
            yield put({
                type: NEOCAFE.SYNC_ORDERS_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        yield put({
            type: NEOCAFE.SYNC_ORDERS_ERROR,
            payload: { success: false, message: error.message },
        });
    }
}

function* syncPendingOrdersSaga() {
    try {
        // Get pending orders from local storage
        const pendingOrders = yield call(AsyncStorageService.getPendingOrders);

        // Filter out already synced orders
        const ordersToSync = pendingOrders.filter(order => !order.syncStatus || order.syncStatus === 'pending');

        if (ordersToSync.length === 0) {
            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS,
                payload: { success: true, message: 'No pending orders to sync' },
            });
            return;
        }

        // Prepare orders for sync in the format expected by the API
        const syncPayload = {
            orders: ordersToSync
        };

        // Call the sync API
        const response = yield call(syncController.syncOrders, syncPayload);

        if (response.success) {
            // Update sync status for successfully synced orders
            const updatedOrders = pendingOrders.map(order => {
                if (ordersToSync.some(syncOrder => syncOrder.session === order.session)) {
                    return {
                        ...order,
                        syncStatus: 'synced',
                        synced_at: new Date().toISOString()
                    };
                }
                return order;
            });
            console.log('updatedOrders::', updatedOrders);

            // Update orders in local storage with sync status
            yield call(AsyncStorageService.setPendingOrders, updatedOrders);

            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS,
                payload: {
                    ...response,
                    syncedOrdersCount: ordersToSync.length
                },
            });
        } else {
            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        yield put({
            type: NEOCAFE.SYNC_PENDING_ORDERS_ERROR,
            payload: { success: false, message: error.message },
        });
    }
}

function* syncSaga() {
    yield takeLatest(NEOCAFE.SYNC_ORDERS_REQUEST, syncOrdersSaga);
    yield takeLatest(NEOCAFE.SYNC_PENDING_ORDERS_REQUEST, syncPendingOrdersSaga);
}

export default syncSaga; 