import { call, put, takeLatest, takeLeading } from 'redux-saga/effects';
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
        logService.info(LOG_CATEGORIES.SYNC, `[Sync] === BẮT ĐẦU SYNC === pendingOrders: ${pendingOrders.length} đơn`, {
            sessions: pendingOrders.map(o => `${o.session}(${o.syncStatus},retry:${o.retry_count || 0})`),
        });

        // Backup all pending orders before syncing (hidden from users, for emergency recovery)
        if (pendingOrders.length > 0) {
            yield call(AsyncStorageService.setBackupOrders, pendingOrders);
        }

        // Filter out already synced orders and limit retry attempts
        const ordersToSync = pendingOrders.filter(order => {
            const shouldRetry = (!order.syncStatus || order.syncStatus === 'pending') &&
                (order.retry_count || 0) < 5; // Max 5 retry attempts

            if (!shouldRetry && order.syncStatus === 'pending' && (order.retry_count || 0) >= 5) {
                logService.warn(LOG_CATEGORIES.SYNC, `[Sync] Đơn ${order.session} quá 5 lần retry → ngừng sync`);
            }

            return shouldRetry;
        });

        if (ordersToSync.length === 0) {
            logService.info(LOG_CATEGORIES.SYNC, `[Sync] Không có đơn cần sync (${pendingOrders.length} pending tổng, 0 đủ điều kiện)`);
            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS,
                payload: { success: true, message: 'No pending orders to sync' },
            });
            return;
        }

        logService.info(LOG_CATEGORIES.SYNC, `[Sync] Sẽ gửi ${ordersToSync.length}/${pendingOrders.length} đơn lên server`, {
            sessionsToSync: ordersToSync.map(o => `${o.session}(retry:${o.retry_count || 0})`),
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
            logService.info(LOG_CATEGORIES.SYNC, `[Sync] API trả về ${ordersSyncedServer.length} kết quả`, {
                serverResults: ordersSyncedServer.map(o => ({
                    order_id: o.order_id,
                    match: o.match,
                    offline_code: o.offline_code || 'THIẾU_OFFLINE_CODE',
                    differences: o.differences,
                })),
            });

            // ĐỌC LẠI storage mới nhất để không mất đơn đặt trong lúc chờ API
            const freshOrders = yield call(AsyncStorageService.getPendingOrders);
            logService.info(LOG_CATEGORIES.SYNC, `[Sync] Đọc lại pendingOrders sau API: ${freshOrders.length} đơn`, {
                freshSessions: freshOrders.map(o => o.session).filter(Boolean),
            });

            const updatedOrders = freshOrders.map(order => {
                const serverResult = ordersSyncedServer.find(syncOrder => syncOrder.offline_code === order.session);

                // Log chi tiết quá trình matching cho MỖI đơn
                if (!serverResult) {
                    // Kiểm tra xem đơn có trong ordersToSync không
                    const wasInSync = ordersToSync.some(o => o.session === order.session);
                    if (wasInSync) {
                        logService.warn(LOG_CATEGORIES.SYNC, `[Sync] ĐƠN KẸT: ${order.session} đã gửi lên server nhưng KHÔNG tìm thấy trong response (server không trả về offline_code khớp)`, {
                            session: order.session,
                            offline_code: order.offline_code,
                            serverOfflineCodes: ordersSyncedServer.map(o => o.offline_code),
                            serverOrderIds: ordersSyncedServer.map(o => o.order_id),
                        });
                    }
                }

                if (serverResult && serverResult.match === true) {
                    logService.info(LOG_CATEGORIES.SYNC, `[Sync] ĐƠN KHỚP: ${order.session} → synced (server order_id: ${serverResult.order_id})`, {
                        session: order.session,
                        serverOrderId: serverResult.order_id,
                        offline_code: serverResult.offline_code,
                    });
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

                    logService.warn(LOG_CATEGORIES.SYNC, `[Sync] ĐƠN KHÔNG KHỚP: ${order.session} (Lần ${newRetryCount}/5)`, {
                        session: order.session,
                        serverOrderId: serverResult.order_id,
                        offline_code: serverResult.offline_code,
                        match: serverResult.match,
                        differences: serverResult.differences,
                        isPermanentFailure,
                    });

                    if (isPermanentFailure) {
                        logService.error(LOG_CATEGORIES.SYNC, `[Sync] NGỪNG SYNC: ${order.session} bị từ chối quá 5 lần`, {
                            session: order.session,
                            serverResult,
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

            const syncedCount = updatedOrders.filter(o => o.syncStatus === 'synced').length;
            const pendingCount = updatedOrders.filter(o => o.syncStatus === 'pending' || !o.syncStatus).length;
            const failedCount = updatedOrders.filter(o => o.syncStatus === 'failed').length;
            logService.info(LOG_CATEGORIES.SYNC, `[Sync] Kết quả: ${syncedCount} synced, ${pendingCount} pending, ${failedCount} failed (tổng: ${updatedOrders.length})`, {
                total: updatedOrders.length,
                synced: syncedCount,
                pending: pendingCount,
                failed: failedCount,
                allStatuses: updatedOrders.map(o => `${o.session}:${o.syncStatus}`),
            });

            // Update orders in local storage with sync status
            logService.info(LOG_CATEGORIES.SYNC, `[Sync] Ghi lại pendingOrders: ${updatedOrders.length} đơn`);
            yield call(AsyncStorageService.setPendingOrders, updatedOrders);

            // Update sync status in immutable order history for synced/failed orders in batch
            const syncStatusMap = {};
            for (const order of updatedOrders) {
                const wasAttempted = ordersToSync.some(o => o.session === order.session);
                if (wasAttempted && (order.syncStatus === 'synced' || order.syncStatus === 'failed')) {
                    syncStatusMap[order.session] = order.syncStatus;
                }
            }
            if (Object.keys(syncStatusMap).length > 0) {
                logService.info(LOG_CATEGORIES.SYNC, `[Sync] Kích hoạt updateOrdersSyncStatusBatch`, { syncStatusMap });
                yield call(AsyncStorageService.updateOrdersSyncStatusBatch, syncStatusMap);
            }


            yield put({
                type: NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS,
                payload: {
                    ...response,
                    syncedOrdersCount: ordersToSync.length
                },
            });
        } else {
            logService.warn(LOG_CATEGORIES.SYNC, `[Sync] API trả về success=false`, {
                message: response.message,
                status: response.status,
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
            logService.info(LOG_CATEGORIES.SYNC, `[Sync] Ghi lại pendingOrders sau lỗi: ${updatedOrders.length} đơn`);
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
        logService.error(LOG_CATEGORIES.SYNC, `[Sync] EXCEPTION: ${error.message}`, {
            message: error.message,
            stack: error.stack ? error.stack.substring(0, 500) : '',
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

                // Update sync status in immutable order history for permanent failures after exception in batch
                const syncStatusMap = {};
                for (const order of updatedOrders) {
                    const wasAttempted = ordersToSync.some(o => o.session === order.session);
                    if (wasAttempted && order.syncStatus === 'failed') {
                        syncStatusMap[order.session] = 'failed';
                    }
                }
                if (Object.keys(syncStatusMap).length > 0) {
                    logService.info(LOG_CATEGORIES.SYNC, `[Sync] Kích hoạt updateOrdersSyncStatusBatch (lỗi)`, { syncStatusMap });
                    yield call(AsyncStorageService.updateOrdersSyncStatusBatch, syncStatusMap);
                }

            }
        } catch (storageError) {
            logService.error(LOG_CATEGORIES.SYSTEM, `[Sync] Lỗi ghi storage trong exception handler: ${storageError.message}`, {
                error: storageError.message,
            });
        }

        yield put({
            type: NEOCAFE.SYNC_PENDING_ORDERS_ERROR,
            payload: { success: false, message: error.message },
        });
    }
}

function* syncSaga() {
    yield takeLatest(NEOCAFE.SYNC_ORDERS_REQUEST, syncOrdersSaga);
    yield takeLeading(NEOCAFE.SYNC_PENDING_ORDERS_REQUEST, syncPendingOrdersSaga);
}

export default syncSaga; 