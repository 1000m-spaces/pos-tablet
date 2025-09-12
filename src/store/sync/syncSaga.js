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
        console.log('Pending orders to sync:', pendingOrders);

        // Filter out already synced orders and limit retry attempts
        const ordersToSync = pendingOrders.filter(order => {
            const shouldRetry = (!order.syncStatus || order.syncStatus === 'pending') &&
                (order.retry_count || 0) < 5; // Max 5 retry attempts

            if (!shouldRetry && order.syncStatus === 'pending' && (order.retry_count || 0) >= 5) {
                console.log(`Order ${order.session} exceeded max retry attempts, marking as failed`);
            }

            return shouldRetry;
        });

        if (ordersToSync.length === 0) {
            console.log('No pending orders to sync or all exceeded retry limit');
            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS,
                payload: { success: true, message: 'No pending orders to sync' },
            });
            return;
        }

        console.log(`Attempting to sync ${ordersToSync.length} orders`);

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
                        synced_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                }
                return order;
            });
            console.log(`Successfully synced ${ordersToSync.length} orders`);

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
            console.log('Sync failed, incrementing retry count for orders');

            // Increment retry count for failed orders
            const updatedOrders = pendingOrders.map(order => {
                if (ordersToSync.some(syncOrder => syncOrder.session === order.session)) {
                    const newRetryCount = (order.retry_count || 0) + 1;
                    return {
                        ...order,
                        retry_count: newRetryCount,
                        last_retry_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        syncStatus: newRetryCount >= 5 ? 'failed' : 'pending' // Mark as failed after 5 attempts
                    };
                }
                return order;
            });

            // Update orders in local storage with incremented retry count
            yield call(AsyncStorageService.setPendingOrders, updatedOrders);

            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        console.log('Sync error occurred, incrementing retry count');

        try {
            // On exception, also increment retry count
            const pendingOrders = yield call(AsyncStorageService.getPendingOrders);
            const ordersToSync = pendingOrders.filter(order =>
                (!order.syncStatus || order.syncStatus === 'pending') &&
                (order.retry_count || 0) < 5
            );

            if (ordersToSync.length > 0) {
                const updatedOrders = pendingOrders.map(order => {
                    if (ordersToSync.some(syncOrder => syncOrder.session === order.session)) {
                        const newRetryCount = (order.retry_count || 0) + 1;
                        return {
                            ...order,
                            retry_count: newRetryCount,
                            last_retry_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            syncStatus: newRetryCount >= 5 ? 'failed' : 'pending'
                        };
                    }
                    return order;
                });

                yield call(AsyncStorageService.setPendingOrders, updatedOrders);
            }
        } catch (storageError) {
            console.log('Error updating retry count:', storageError);
        }

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