import { useState } from 'react';
import {
    getOrderStatusDisplay,
    getOrderIdentifier,
    isOrderPrinted,
    getFormattedOrderTotal,
    getOrderTableInfo,
    getCustomerInfo,
    getDriverInfo,
    getOrderItems,
    getNextOfflineOrderStatus,
    isOfflineOrderInFinalState,
    getPrintStatusConfig,
} from '../utils/orderUtils';

/**
 * Custom hook for managing order modal state and data
 */
export const useOrderModal = (selectedOrder, isOfflineOrder, printedLabels) => {
    const [showStatusOptions, setShowStatusOptions] = useState(false);

    // Get processed order data
    const orderData = selectedOrder ? {
        identifier: getOrderIdentifier(selectedOrder, isOfflineOrder),
        statusDisplay: getOrderStatusDisplay(selectedOrder, isOfflineOrder),
        formattedTotal: getFormattedOrderTotal(selectedOrder, isOfflineOrder),
        tableInfo: getOrderTableInfo(selectedOrder, isOfflineOrder),
        customerInfo: isOfflineOrder ? null : getCustomerInfo(selectedOrder),
        driverInfo: isOfflineOrder ? null : getDriverInfo(selectedOrder),
        items: getOrderItems(selectedOrder, isOfflineOrder),
        orderNote: isOfflineOrder ? selectedOrder.orderNote : null,
        isPrinted: isOrderPrinted(getOrderIdentifier(selectedOrder, isOfflineOrder), printedLabels),
    } : null;

    // Print status configuration
    const printStatusConfig = orderData ?
        getPrintStatusConfig(orderData.isPrinted) : null;

    // Offline order specific data
    const offlineOrderData = isOfflineOrder && selectedOrder ? {
        currentStatus: selectedOrder.orderStatus || 'Paymented',
        nextStatus: getNextOfflineOrderStatus(selectedOrder.orderStatus || 'Paymented'),
        isInFinalState: isOfflineOrderInFinalState(selectedOrder.orderStatus),
    } : null;

    return {
        orderData,
        printStatusConfig,
        offlineOrderData,
        showStatusOptions,
        setShowStatusOptions,
    };
};

/**
 * Custom hook for handling order status changes
 */
export const useOrderStatusChange = (onStatusChange, onClose, setShowStatusOptions) => {
    const handleStatusChange = (order, newStatus) => {
        if (onStatusChange && order) {
            onStatusChange(order, newStatus);
            setShowStatusOptions(false);
            onClose();
        }
    };

    return {
        handleStatusChange,
    };
};
