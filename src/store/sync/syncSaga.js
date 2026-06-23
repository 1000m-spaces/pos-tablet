import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import syncController from './syncController';
import AsyncStorageService from 'store/async_storage';
import logService, { LOG_CATEGORIES } from '../../services/LogService';

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

        // Backup all pending orders before syncing (hidden from users, for emergency recovery)
        if (pendingOrders.length > 0) {
            yield call(AsyncStorageService.setBackupOrders, pendingOrders);
            console.log(`Backed up ${pendingOrders.length} orders before sync attempt`);
        }

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
        logService.info(LOG_CATEGORIES.SYNC, `Bắt đầu sync ${ordersToSync.length} đơn`, {
            sessions: ordersToSync.map(o => o.session),
        });

        // Prepare orders for sync in the format expected by the API
        const expandedOrders = ordersToSync.map(order => {
            const expandedProducts = order.products.flatMap(item =>
                Array(item.quanlity).fill(item)
            );
            return {
                ...order,
                products: expandedProducts
            };
        });
        const syncPayload = {
            orders: expandedOrders
        };

        console.log('Sync syncPayload:', expandedOrders);

        // Call the sync API
        const response = yield call(syncController.syncOrders, syncPayload);

        console.log('SSSSSSSync response:', response);

        if (response.success) {
            // Update sync status for successfully synced orders
            const ordersSyncedServer = response.result?.data || [];
            // ĐỌC LẠI storage mới nhất để không mất đơn đặt trong lúc chờ API
            const freshOrders = yield call(AsyncStorageService.getPendingOrders);
            const updatedOrders = freshOrders.map(order => {
                const serverResult = ordersSyncedServer.find(syncOrder => syncOrder.offline_code === order.session);
                if (serverResult && serverResult.match === true) {
                    return {
                        ...order,
                        syncStatus: 'synced',
                        synced_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                }
                // Nếu match === false, tăng retry_count để không sync lặp vô hạn
                if (serverResult && serverResult.match === false) {
                    const newRetryCount = (order.retry_count || 0) + 1;
                    const isPermanentFailure = newRetryCount >= 5;

                    // Log lý do server từ chối đơn hàng
                    if (isPermanentFailure) {
                        logService.error(LOG_CATEGORIES.SYNC, `Đơn hàng ${order.session} bị ngừng sync do lỗi quá 5 lần. Lỗi: ${serverResult.message || 'Server từ chối'}`, {
                            session: order.session,
                            serverResult
                        });
                    } else {
                        logService.warn(LOG_CATEGORIES.SYNC, `Server từ chối đơn ${order.session} (Lần ${newRetryCount}/5): ${serverResult.message || 'Sai lệch thông tin'}`, {
                            session: order.session,
                            retry_count: newRetryCount,
                            serverResult
                        });
                    }

                    return {
                        ...order,
                        retry_count: newRetryCount,
                        last_retry_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        syncStatus: isPermanentFailure ? 'failed' : 'pending'
                    };
                }
                return order;
            });
            console.log(`Successfully synced ${ordersToSync.length} orders`);
            const syncedCount = updatedOrders.filter(o => o.syncStatus === 'synced').length;
            const failedCount = updatedOrders.filter(o => o.syncStatus === 'failed').length;
            logService.info(LOG_CATEGORIES.SYNC, `Sync xong: ${syncedCount} thành công, ${failedCount} thất bại`, {
                total: ordersToSync.length,
                synced: syncedCount,
                failed: failedCount,
            });

            // Update orders in local storage with sync status
            yield call(AsyncStorageService.setPendingOrders, updatedOrders);

            // Update sync status in immutable order history for synced/failed orders
            for (const order of updatedOrders) {
                const wasAttempted = ordersToSync.some(o => o.session === order.session);
                if (wasAttempted && (order.syncStatus === 'synced' || order.syncStatus === 'failed')) {
                    yield call(AsyncStorageService.updateOrderSyncStatus, order.session, order.syncStatus);
                }
            }

            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS,
                payload: {
                    ...response,
                    syncedOrdersCount: ordersToSync.length
                },
            });
        } else {
            console.log('Sync failed, incrementing retry count for orders');
            logService.warn(LOG_CATEGORIES.SYNC, `Sync thất bại: response.success = false`, {
                message: response.message,
                orderCount: ordersToSync.length,
            });

            // ĐỌC LẠI storage mới nhất để không mất đơn đặt trong lúc chờ API
            const freshOrdersOnError = yield call(AsyncStorageService.getPendingOrders);
            // Increment retry count for failed orders
            const updatedOrders = freshOrdersOnError.map(order => {
                if (ordersToSync.some(syncOrder => syncOrder.session === order.session)) {
                    const newRetryCount = (order.retry_count || 0) + 1;
                    const isPermanentFailure = newRetryCount >= 5;

                    if (isPermanentFailure) {
                        logService.error(LOG_CATEGORIES.SYNC, `Đơn hàng ${order.session} bị ngừng sync do lỗi quá 5 lần. Nguyên nhân: ${response.message || 'Lỗi API'}`, {
                            session: order.session
                        });
                    }

                    return {
                        ...order,
                        retry_count: newRetryCount,
                        last_retry_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        syncStatus: isPermanentFailure ? 'failed' : 'pending' // Mark as failed after 5 attempts
                    };
                }
                return order;
            });

            // Update orders in local storage with incremented retry count
            yield call(AsyncStorageService.setPendingOrders, updatedOrders);

            // Update sync status in immutable order history for permanent failures
            for (const order of updatedOrders) {
                const wasAttempted = ordersToSync.some(o => o.session === order.session);
                if (wasAttempted && order.syncStatus === 'failed') {
                    yield call(AsyncStorageService.updateOrderSyncStatus, order.session, 'failed');
                }
            }

            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        console.log('Sync error occurred, incrementing retry count');

        // Log exception chi tiết (ví dụ: mất kết nối, timeout...)
        logService.error(LOG_CATEGORIES.SYNC, `Lỗi exception khi sync đơn hàng: ${error.message}`, {
            message: error.message,
            stack: error.stack ? error.stack.substring(0, 500) : ''
        });

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
                        const isPermanentFailure = newRetryCount >= 5;

                        if (isPermanentFailure) {
                            logService.error(LOG_CATEGORIES.SYNC, `Đơn hàng ${order.session} bị ngừng sync do lỗi quá 5 lần sau exception: ${error.message}`, {
                                session: order.session
                            });
                        }

                        return {
                            ...order,
                            retry_count: newRetryCount,
                            last_retry_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            syncStatus: isPermanentFailure ? 'failed' : 'pending'
                        };
                    }
                    return order;
                });

                yield call(AsyncStorageService.setPendingOrders, updatedOrders);

                // Update sync status in immutable order history for permanent failures after exception
                for (const order of updatedOrders) {
                    const wasAttempted = ordersToSync.some(o => o.session === order.session);
                    if (wasAttempted && order.syncStatus === 'failed') {
                        yield call(AsyncStorageService.updateOrderSyncStatus, order.session, 'failed');
                    }
                }
            }
        } catch (storageError) {
            console.log('Error updating retry count:', storageError);
            logService.error(LOG_CATEGORIES.SYSTEM, `Lỗi ghi storage khi xử lý exception sync: ${storageError.message}`);
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