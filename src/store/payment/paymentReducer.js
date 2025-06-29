import { NEOCAFE } from 'store/actionsTypes';

const initialState = {
    channels: [], // Payment methods (cash, card, etc.)
    loading: false,
    error: null,
    orderChannels: [], // Order types (dine-in, takeaway, etc.)
    orderChannelsLoading: false,
    orderChannelsError: null,
};

const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
        // Payment Channels (Payment Methods)
        case NEOCAFE.GET_PAYMENT_CHANNELS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case NEOCAFE.GET_PAYMENT_CHANNELS_SUCCESS:
            return {
                ...state,
                loading: false,
                channels: action.payload.channels,
                error: null,
            };
        case NEOCAFE.GET_PAYMENT_CHANNELS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload.message || 'Failed to fetch payment channels',
            };
        case NEOCAFE.GET_PAYMENT_CHANNELS_RESET:
            return {
                ...state,
                channels: [],
                loading: false,
                error: null,
            };

        // Order Channels (Order Types)
        case NEOCAFE.GET_ORDER_CHANNELS_REQUEST:
            return {
                ...state,
                orderChannelsLoading: true,
                orderChannelsError: null,
            };
        case NEOCAFE.GET_ORDER_CHANNELS_SUCCESS:
            return {
                ...state,
                orderChannelsLoading: false,
                orderChannels: action.payload.channels,
                orderChannelsError: null,
            };
        case NEOCAFE.GET_ORDER_CHANNELS_ERROR:
            return {
                ...state,
                orderChannelsLoading: false,
                orderChannelsError: action.payload.message || 'Failed to fetch order channels',
            };
        case NEOCAFE.GET_ORDER_CHANNELS_RESET:
            return {
                ...state,
                orderChannels: [],
                orderChannelsLoading: false,
                orderChannelsError: null,
            };
        default:
            return state;
    }
};

export default paymentReducer; 