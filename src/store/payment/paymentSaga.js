import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import paymentController from './paymentController';
import { asyncStorage } from 'store/index';

// Saga for fetching Order Channel Types (dine-in, takeaway, etc.)
function* getOrderChannelsSaga() {
    try {
        const response = yield call(paymentController.getListChanelType);
        if (response.success) {
            // Cache the order channels data on successful API call
            yield call(asyncStorage.setCachedOrderChannels, response.channels);

            yield put({
                type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                payload: response,
            });
        } else {
            // API call failed, try to get cached data
            console.log('Order channels API call failed, attempting to retrieve cached data');
            const cachedChannels = yield call(asyncStorage.getCachedOrderChannels);

            if (cachedChannels) {
                console.log('Using cached order channels data for offline mode');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached order channels data available');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_ERROR,
                    payload: { success: false, message: 'No internet connection and no cached data available' },
                });
            }
        }
    } catch (error) {
        console.log('Order channels API error, attempting to retrieve cached data:', error);

        // Try to get cached data on network error
        try {
            const cachedChannels = yield call(asyncStorage.getCachedOrderChannels);

            if (cachedChannels) {
                console.log('Using cached order channels data due to network error');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached order channels data available for offline use');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_ERROR,
                    payload: { success: false, message: 'Network error and no cached data available' },
                });
            }
        } catch (cacheError) {
            console.error('Error accessing cached order channels data:', cacheError);
            yield put({
                type: NEOCAFE.GET_ORDER_CHANNELS_ERROR,
                payload: { success: false, message: error.message },
            });
        }
    }
}

// Saga for fetching Payment Methods (cash, card, etc.)
function* getPaymentMethodsSaga() {
    try {
        const response = yield call(paymentController.getTransType);
        if (response.success) {
            // Cache the payment channels data on successful API call
            yield call(asyncStorage.setCachedPaymentChannels, response.channels);

            yield put({
                type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                payload: response,
            });
        } else {
            // API call failed, try to get cached data
            console.log('Payment channels API call failed, attempting to retrieve cached data');
            const cachedChannels = yield call(asyncStorage.getCachedPaymentChannels);

            if (cachedChannels) {
                console.log('Using cached payment channels data for offline mode');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached payment channels data available');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_ERROR,
                    payload: { success: false, message: 'No internet connection and no cached data available' },
                });
            }
        }
    } catch (error) {
        console.log('Payment channels API error, attempting to retrieve cached data:', error);

        // Try to get cached data on network error
        try {
            const cachedChannels = yield call(asyncStorage.getCachedPaymentChannels);

            if (cachedChannels) {
                console.log('Using cached payment channels data due to network error');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached payment channels data available for offline use');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_ERROR,
                    payload: { success: false, message: 'Network error and no cached data available' },
                });
            }
        } catch (cacheError) {
            console.error('Error accessing cached payment channels data:', cacheError);
            yield put({
                type: NEOCAFE.GET_PAYMENT_CHANNELS_ERROR,
                payload: { success: false, message: error.message },
            });
        }
    }
}

function* paymentSaga() {
    yield takeLatest(NEOCAFE.GET_ORDER_CHANNELS_REQUEST, getOrderChannelsSaga);
    yield takeLatest(NEOCAFE.GET_PAYMENT_CHANNELS_REQUEST, getPaymentMethodsSaga);
}

export default paymentSaga; 