export const currentOrderSelector = state => state.order.currentOrder;
export const onlineOrderSelector = state => state.order.onlineOrders;
export const confirmOrderOnlineStatusSelector = state => state.order.statusConfirmOrderOnline;
// New selectors
export const shippingOrdersSelector = state => state.order.shippingOrders;
export const shippingOrdersStatusSelector = state => state.order.statusGetOrderShipping;
export const paidSuccessOrdersSelector = state => state.order.paidSuccessOrders;
export const paidSuccessOrdersStatusSelector = state => state.order.statusGetOrderPaidSuccess;
