import {
    ONLINE_ORDER_CONFIG,
    OFFLINE_ORDER_CONFIG,
    PREPARATION_CONFIG,
    PRINT_STATUS_CONFIG,
    OFFLINE_STATUS_FLOW,
    DEFAULT_STATUS_CONFIG,
    PRINT_STATUS,
} from '../constants/orderStatus';

/**
 * Get status configuration for online orders
 */
export const getOnlineOrderStatusConfig = (status) => {
    return ONLINE_ORDER_CONFIG[status] || DEFAULT_STATUS_CONFIG;
};

/**
 * Get status configuration for offline orders
 */
export const getOfflineOrderStatusConfig = (status) => {
    return OFFLINE_ORDER_CONFIG[status] || DEFAULT_STATUS_CONFIG;
};

/**
 * Get status configuration for preparation status
 */
export const getPreparationStatusConfig = (status) => {
    return PREPARATION_CONFIG[status] || DEFAULT_STATUS_CONFIG;
};

/**
 * Get print status configuration
 */
export const getPrintStatusConfig = (isPrinted) => {
    const status = isPrinted ? PRINT_STATUS.PRINTED : PRINT_STATUS.NOT_PRINTED;
    return PRINT_STATUS_CONFIG[status];
};

/**
 * Get next status in the offline order flow
 */
export const getNextOfflineOrderStatus = (currentStatus) => {
    const currentIndex = OFFLINE_STATUS_FLOW.indexOf(currentStatus);
    return currentIndex < OFFLINE_STATUS_FLOW.length - 1
        ? OFFLINE_STATUS_FLOW[currentIndex + 1]
        : null;
};

/**
 * Check if offline order is in final state
 */
export const isOfflineOrderInFinalState = (status) => {
    return status === 'Completed' || status === 'Canceled';
};

/**
 * Check if order is printed
 */
export const isOrderPrinted = (orderIdentifier, printedLabels) => {
    return printedLabels && printedLabels.includes(orderIdentifier);
};

/**
 * Get order identifier (displayID for online, session for offline)
 */
export const getOrderIdentifier = (order, isOfflineOrder) => {
    return isOfflineOrder ? order.session : order.displayID;
};

/**
 * Get order total amount formatted
 */
export const getFormattedOrderTotal = (order, isOfflineOrder) => {
    if (isOfflineOrder) {
        return `${(order.total_amount || 0).toLocaleString('vi-VN')}₫`;
    }
    return `${order.orderValue}₫`;
};

/**
 * Get order table/customer info
 */
export const getOrderTableInfo = (order, isOfflineOrder) => {
    if (isOfflineOrder) {
        return order.shoptablename || 'Mang về';
    }
    return null; // Online orders don't have table info in the same way
};

/**
 * Get order status text and colors
 */
export const getOrderStatusDisplay = (order, isOfflineOrder) => {
    if (isOfflineOrder) {
        const status = order.orderStatus || 'Paymented';
        const config = getOfflineOrderStatusConfig(status);
        return {
            text: config.text,
            color: config.color,
            backgroundColor: config.backgroundColor,
        };
    } else {
        const config = getOnlineOrderStatusConfig(order.state);
        return {
            text: config.text,
            color: config.color,
            backgroundColor: config.backgroundColor,
        };
    }
};

/**
 * Format price with Vietnamese currency
 */
export const formatPrice = (price) => {
    // Handle null, undefined, empty string, and non-numeric values
    if (price === null || price === undefined || price === '' || isNaN(price)) {
        return '0₫';
    }

    // Convert to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Handle invalid numeric conversions
    if (isNaN(numericPrice)) {
        return '0₫';
    }

    // Format with Vietnamese locale
    return `${Math.round(numericPrice).toLocaleString('vi-VN')}₫`;
};

/**
 * Get available status options for offline orders
 */
export const getAvailableOfflineStatusOptions = (currentStatus) => {
    return OFFLINE_STATUS_FLOW.filter(status => status !== currentStatus);
};

/**
 * Extract order items for display
 */
export const getOrderItems = (order, isOfflineOrder) => {
    if (isOfflineOrder) {
        return order?.products?.map((product, index) => ({
            id: index,
            name: product.name || product.prodname,
            quantity: product.quanlity || product.quantity || 1,
            price: product.price || product.amount || 0, // Handle different price field names
            note: product.note,
            extras: product.extras || [],
            option: product.option || [],
        })) || [];
    } else {
        return order?.itemInfo?.items?.map((item, index) => {
            // For online orders, extract numeric price from formatted string if needed
            let numericPrice = 0;
            if (item.fare?.priceDisplay) {
                // If priceDisplay is a formatted string like "25,000", extract the number
                const priceStr = item.fare.priceDisplay.toString().replace(/[^\d]/g, '');
                numericPrice = parseInt(priceStr) || 0;
            } else if (item.price) {
                numericPrice = typeof item.price === 'number' ? item.price : parseInt(item.price) || 0;
            }

            return {
                id: index,
                name: item.name,
                quantity: item.quantity || 1,
                price: numericPrice, // Always store as numeric value
                currencySymbol: item.fare?.currencySymbol || '₫',
                note: item.comment,
                modifierGroups: item.modifierGroups || [],
                option: item.option || [],
            };
        }) || [];
    }
};

/**
 * Get customer information for display
 */
export const getCustomerInfo = (order) => {
    const eater = order.eater;
    if (!eater) return null;

    return {
        name: eater.name || 'N/A',
        phone: eater.mobileNumber || 'N/A',
        address: eater.address?.address || null,
        comment: eater.comment || null,
    };
};

/**
 * Get driver information for display
 */
export const getDriverInfo = (order) => {
    const driver = order.driver;
    if (!driver) return null;

    return {
        name: driver.name || 'N/A',
        phone: driver.mobileNumber || 'N/A',
    };
};
