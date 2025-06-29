import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import paymentController from './paymentController';

// Saga for fetching Order Channel Types (dine-in, takeaway, etc.)
function* getOrderChannelsSaga() {
    try {
        const response = yield call(paymentController.getListChanelType);
        if (response.success) {
            yield put({
                type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                payload: response,
            });
        } else {
            yield put({
                type: NEOCAFE.GET_ORDER_CHANNELS_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        yield put({
            type: NEOCAFE.GET_ORDER_CHANNELS_ERROR,
            payload: { success: false, message: error.message },
        });
    }
}

// Saga for fetching Payment Methods (cash, card, etc.)
function* getPaymentMethodsSaga() {
    try {
        const response = yield call(paymentController.getTransType);
        if (response.success) {
            yield put({
                type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                payload: response,
            });
        } else {
            yield put({
                type: NEOCAFE.GET_PAYMENT_CHANNELS_ERROR,
                payload: response,
            });
        }
    } catch (error) {
        yield put({
            type: NEOCAFE.GET_PAYMENT_CHANNELS_ERROR,
            payload: { success: false, message: error.message },
        });
    }
}

function* paymentSaga() {
    yield takeLatest(NEOCAFE.GET_ORDER_CHANNELS_REQUEST, getOrderChannelsSaga);
    yield takeLatest(NEOCAFE.GET_PAYMENT_CHANNELS_REQUEST, getPaymentMethodsSaga);
}

export default paymentSaga; 