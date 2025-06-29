// Payment Methods Selectors
export const getPaymentChannelsSelector = state => state.payment.channels;
export const getPaymentChannelsLoadingSelector = state => state.payment.loading;
export const getPaymentChannelsErrorSelector = state => state.payment.error;

// Order Channels Selectors
export const getOrderChannelsSelector = state => state.payment.orderChannels;
export const getOrderChannelsLoadingSelector = state => state.payment.orderChannelsLoading;
export const getOrderChannelsErrorSelector = state => state.payment.orderChannelsError; 