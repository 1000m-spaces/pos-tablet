import { call, put, takeLatest } from 'redux-saga/effects';
import { NEOCAFE } from 'store/actionsTypes';
import paymentController from './paymentController';
import { asyncStorage } from 'store/index';

const DEFAULT_ORDER_CHANNELS = [
  {
    id: "1",
    name_vn: "Đặt tại cửa hàng",
    name_en: "Đặt tại cửa hàng",
    chanel_type_id: "1"
  },
  {
    id: "2",
    name_vn: "Grabfood",
    name_en: "Grabfood",
    chanel_type_id: "2"
  },
  {
    id: "3",
    name_vn: "Shopeefood",
    name_en: "Shopeefood",
    chanel_type_id: "3"
  },
  {
    id: "4",
    name_vn: "EGets",
    name_en: "EGets",
    chanel_type_id: "4"
  },
  {
    id: "5",
    name_vn: "Befood",
    name_en: "Befood",
    chanel_type_id: "5"
  },
  {
    id: "7",
    name_vn: "XanhSM Food",
    name_en: "XanhSM Food",
    chanel_type_id: "7"
  }
];

// Saga for fetching Order Channel Types (dine-in, takeaway, etc.)
function* getOrderChannelsSaga() {
    try {
        const response = yield call(paymentController.getListChanelType);
        if (response.success && response.channels && response.channels.length > 0) {
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

            if (cachedChannels && cachedChannels.length > 0) {
                console.log('Using cached order channels data for offline mode');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached order channels data available, using local defaults');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                    payload: { success: true, channels: DEFAULT_ORDER_CHANNELS },
                });
            }
        }
    } catch (error) {
        console.log('Order channels API error, attempting to retrieve cached data:', error);

        // Try to get cached data on network error
        try {
            const cachedChannels = yield call(asyncStorage.getCachedOrderChannels);

            if (cachedChannels && cachedChannels.length > 0) {
                console.log('Using cached order channels data due to network error');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached order channels data available, using local defaults');
                yield put({
                    type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                    payload: { success: true, channels: DEFAULT_ORDER_CHANNELS },
                });
            }
        } catch (cacheError) {
            console.error('Error accessing cached order channels data:', cacheError);
            yield put({
                type: NEOCAFE.GET_ORDER_CHANNELS_SUCCESS,
                payload: { success: true, channels: DEFAULT_ORDER_CHANNELS },
            });
        }
    }
}

const DEFAULT_PAYMENT_METHODS = [
    {
        id: "27",
        trans_name: "41",
        name: "Tiền mặt",
        desc_eng: "Cash",
        chanel_type_id: "27",
        icon: "cash"
    },
    {
        id: "28",
        trans_name: "42",
        name: "Chuyển khoản TK ngân hàng Cty",
        desc_eng: "Chuyển khoản TK ngân hàng Cty",
        chanel_type_id: "28",
        icon: "card"
    },
    {
        id: "30",
        trans_name: "44",
        name: "VNPay",
        desc_eng: "VNPay",
        chanel_type_id: "30",
        icon: "card"
    },
    {
        id: "22243",
        trans_name: "49",
        name: "Ví Food Apps",
        desc_eng: "Internet banking",
        chanel_type_id: "22243",
        icon: "card"
    },
    {
        id: "22244",
        trans_name: "50",
        name: "Chuyển khoản / quẹt thẻ qua Mpos",
        desc_eng: "Mobile Point of Sale",
        chanel_type_id: "22244",
        icon: "card"
    }
];

// Saga for fetching Payment Methods (cash, card, etc.)
function* getPaymentMethodsSaga() {
    try {
        const response = yield call(paymentController.getTransType);
        if (response.success && response.channels && response.channels.length > 0) {
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

            if (cachedChannels && cachedChannels.length > 0) {
                console.log('Using cached payment channels data for offline mode');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached payment channels data available, using local defaults');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                    payload: { success: true, channels: DEFAULT_PAYMENT_METHODS },
                });
            }
        }
    } catch (error) {
        console.log('Payment channels API error, attempting to retrieve cached data:', error);

        // Try to get cached data on network error
        try {
            const cachedChannels = yield call(asyncStorage.getCachedPaymentChannels);

            if (cachedChannels && cachedChannels.length > 0) {
                console.log('Using cached payment channels data due to network error');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                    payload: { success: true, channels: cachedChannels },
                });
            } else {
                console.log('No cached payment channels data available, using local defaults');
                yield put({
                    type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                    payload: { success: true, channels: DEFAULT_PAYMENT_METHODS },
                });
            }
        } catch (cacheError) {
            console.error('Error accessing cached payment channels data:', cacheError);
            yield put({
                type: NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS,
                payload: { success: true, channels: DEFAULT_PAYMENT_METHODS },
            });
        }
    }
}

function* paymentSaga() {
    yield takeLatest(NEOCAFE.GET_ORDER_CHANNELS_REQUEST, getOrderChannelsSaga);
    yield takeLatest(NEOCAFE.GET_PAYMENT_CHANNELS_REQUEST, getPaymentMethodsSaga);
}

export default paymentSaga; 