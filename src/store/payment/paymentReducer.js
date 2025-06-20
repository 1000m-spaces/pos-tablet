import { NEOCAFE } from 'store/actionsTypes';

const initialState = {
    channels: [],
    loading: false,
    error: null,
};

const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
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
            return initialState;
        default:
            return state;
    }
};

export default paymentReducer; 