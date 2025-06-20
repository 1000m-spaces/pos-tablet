import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import paymentController from './paymentController';

function* getPaymentChannelsSaga() {
    try {
        const response = yield call(paymentController.getPaymentChannels);
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
    yield takeLatest(NEOCAFE.GET_PAYMENT_CHANNELS_REQUEST, getPaymentChannelsSaga);
}

export default paymentSaga; 