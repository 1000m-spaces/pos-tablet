import { NEOCAFE } from 'store/actionsTypes';

export const getPaymentChannelsAction = () => ({
    type: NEOCAFE.GET_PAYMENT_CHANNELS_REQUEST,
});

export const resetPaymentChannelsAction = () => ({
    type: NEOCAFE.GET_PAYMENT_CHANNELS_RESET,
}); 