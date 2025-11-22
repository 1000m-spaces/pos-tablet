export const getSyncResultSelector = state => state.sync.syncResult;
export const getSyncLoadingSelector = state => state.sync.loading;
export const getSyncErrorSelector = state => state.sync.error;

export const getPendingSyncResultSelector = state => state.sync.pendingSyncResult;
export const getPendingSyncLoadingSelector = state => state.sync.pendingSyncLoading;
export const getPendingSyncErrorSelector = state => state.sync.pendingSyncError;

// Combined status selector for sync operations
export const syncOrdersStatusSelector = state => ({
    isLoading: state.sync.loading,
    isSuccess: !state.sync.loading && state.sync.syncResult && !state.sync.error,
    isError: !state.sync.loading && state.sync.error,
    result: state.sync.syncResult,
    error: state.sync.error,
});