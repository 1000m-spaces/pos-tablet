import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import tableController from './tableController';
import { asyncStorage } from 'store/index';

function* getShopTablesSaga(action) {
    try {
        const response = yield call(
            tableController.getShopTables,
            action.payload,
        );
        if (response.success) {
            // Cache the shop tables data on successful API call
            yield call(asyncStorage.setCachedShopTables, response.tables);

            yield put({
                type: NEOCAFE.GET_SHOP_TABLES_SUCCESS,
                payload: response,
            });
        } else {
            // API call failed, try to get cached data
            console.log('Shop tables API call failed, attempting to retrieve cached data');
            const cachedTables = yield call(asyncStorage.getCachedShopTables);

            if (cachedTables) {
                console.log('Using cached shop tables data for offline mode');
                yield put({
                    type: NEOCAFE.GET_SHOP_TABLES_SUCCESS,
                    payload: { success: true, tables: cachedTables },
                });
            } else {
                console.log('No cached shop tables data available');
                yield put({
                    type: NEOCAFE.GET_SHOP_TABLES_ERROR,
                    payload: { success: false, message: 'No internet connection and no cached data available' },
                });
            }
        }
    } catch (error) {
        console.log('Shop tables API error, attempting to retrieve cached data:', error);

        // Try to get cached data on network error
        try {
            const cachedTables = yield call(asyncStorage.getCachedShopTables);

            if (cachedTables) {
                console.log('Using cached shop tables data due to network error');
                yield put({
                    type: NEOCAFE.GET_SHOP_TABLES_SUCCESS,
                    payload: { success: true, tables: cachedTables },
                });
            } else {
                console.log('No cached shop tables data available for offline use');
                yield put({
                    type: NEOCAFE.GET_SHOP_TABLES_ERROR,
                    payload: { success: false, message: 'Network error and no cached data available' },
                });
            }
        } catch (cacheError) {
            console.error('Error accessing cached shop tables data:', cacheError);
            yield put({
                type: NEOCAFE.GET_SHOP_TABLES_ERROR,
                payload: { success: false, message: error.message },
            });
        }
    }
}

function* tableSaga() {
    yield takeLatest(NEOCAFE.GET_SHOP_TABLES_REQUEST, getShopTablesSaga);
}

export default tableSaga;