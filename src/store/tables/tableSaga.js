import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import tableController from './tableController';

function* getShopTablesSaga(action) {
    try {
        const response = yield call(
            tableController.getShopTables,
            action.payload,
        );
        if (response.success) {
            yield put({
                type: NEOCAFE.GET_SHOP_TABLES_SUCCESS,
                payload: response,
            });
        } else {
            yield put({
                type: NEOCAFE.GET_SHOP_TABLES_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        yield put({
            type: NEOCAFE.GET_SHOP_TABLES_ERROR,
            payload: { success: false, message: error.message },
        });
    }
}

function* tableSaga() {
    yield takeLatest(NEOCAFE.GET_SHOP_TABLES_REQUEST, getShopTablesSaga);
}

export default tableSaga; 