import { NEOCAFE } from 'store/actionsTypes';

export const syncOrdersAction = payload => ({
    type: NEOCAFE.SYNC_ORDERS_REQUEST,
    payload,
});

export const syncPendingOrdersAction = () => ({
    type: NEOCAFE.SYNC_PENDING_ORDERS_REQUEST,
});

export const resetSyncOrdersAction = () => ({
    type: NEOCAFE.SYNC_ORDERS_RESET,
}); 