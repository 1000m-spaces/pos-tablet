import { NEOCAFE } from 'store/actionsTypes';

const initialState = {
    syncResult: null,
    loading: false,
    error: null,
    pendingSyncResult: null,
    pendingSyncLoading: false,
    pendingSyncError: null,
};

const syncReducer = (state = initialState, action) => {
    switch (action.type) {
        case NEOCAFE.SYNC_ORDERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                syncResult: null,
            };
        case NEOCAFE.SYNC_ORDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                syncResult: action.payload.result,
                error: null,
            };
        case NEOCAFE.SYNC_ORDERS_ERROR:
            return {
                ...state,
                loading: false,
                syncResult: null,
                error: action.payload.message || 'Failed to sync orders',
            };
        case NEOCAFE.SYNC_ORDERS_RESET:
            return initialState;
        case NEOCAFE.SYNC_PENDING_ORDERS_REQUEST:
            return {
                ...state,
                pendingSyncLoading: true,
                pendingSyncError: null,
            };
        case NEOCAFE.SYNC_PENDING_ORDERS_SUCCESS:
            return {
                ...state,
                pendingSyncLoading: false,
                pendingSyncResult: action.payload,
                pendingSyncError: null,
            };
        case NEOCAFE.SYNC_PENDING_ORDERS_ERROR:
            return {
                ...state,
                pendingSyncLoading: false,
                pendingSyncError: action.payload.message || 'Failed to sync pending orders',
            };
        case NEOCAFE.SYNC_PENDING_ORDERS_RESET:
            return {
                ...state,
                pendingSyncResult: null,
                pendingSyncLoading: false,
                pendingSyncError: null,
            };
        default:
            return state;
    }
};

export default syncReducer; 