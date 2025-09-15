/**
 * Utility functions for order management
 */

/**
 * Get the correct order identifier for printed labels tracking
 * @param {Object} order - The order object
 * @param {boolean} isOfflineOrder - Whether this is an offline order
 * @returns {string} - The order identifier to use for tracking
 */
export const getOrderIdentifierForPrinting = (order, isOfflineOrder = null) => {
    // Auto-detect if it's an offline order if not specified
    if (isOfflineOrder === null) {
        // Offline orders typically have a 'session' field starting with 'M-'
        // or have serviceType === 'offline'
        isOfflineOrder = (order.session && order.session.startsWith('M-')) ||
            order.serviceType === 'offline' ||
            (order.offlineOrderId && !order.displayID);
    }

    if (isOfflineOrder) {
        // For offline orders, prefer session (format: M-XXXXXX) 
        // Fall back to offlineOrderId if session not available
        return order.session || order.offlineOrderId || order.displayID;
    } else {
        // For online orders, use displayID
        return order.displayID || order.id;
    }
};

/**
 * Check if an order's labels have been printed
 * @param {string} orderIdentifier - The order identifier
 * @param {Array} printedLabels - Array of printed label IDs
 * @returns {boolean} - Whether the labels have been printed
 */
export const isOrderLabelsPrinted = (orderIdentifier, printedLabels) => {
    return printedLabels && printedLabels.includes(orderIdentifier);
};

/**
 * Get the display name for an order (for UI purposes)
 * @param {Object} order - The order object
 * @returns {string} - The display name
 */
export const getOrderDisplayName = (order) => {
    return order.offlineOrderId || order.displayID || order.session || order.id || 'Unknown';
};
