// Online Order Status Constants
export const ONLINE_ORDER_STATUS = {
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_IN_PREPARE: 'ORDER_IN_PREPARE',
    ORDER_READY: 'ORDER_READY',
    ORDER_PICKED_UP: 'ORDER_PICKED_UP',
    ORDER_DELIVERED: 'ORDER_DELIVERED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    ORDER_REJECTED: 'ORDER_REJECTED',
    ORDER_FAILED: 'ORDER_FAILED',
};

// Offline Order Status Constants
export const OFFLINE_ORDER_STATUS = {
    WAITING_FOR_PAYMENT: 'WaitingForPayment',
    PAYMENTED: 'Paymented',
    WAITING_FOR_SERVE: 'WaitingForServe',
    COMPLETED: 'Completed',
    CANCELED: 'Canceled',
};

// Preparation Status Constants
export const PREPARATION_STATUS = {
    ACCEPTED: 'ACCEPTED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

// Online Order Status Configuration
export const ONLINE_ORDER_CONFIG = {
    [ONLINE_ORDER_STATUS.ORDER_CREATED]: {
        text: 'Đơn hàng mới',
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    [ONLINE_ORDER_STATUS.ORDER_IN_PREPARE]: {
        text: 'Đang chuẩn bị',
        color: '#FF9800',
        backgroundColor: '#FFF3E0',
    },
    [ONLINE_ORDER_STATUS.ORDER_READY]: {
        text: 'Sẵn sàng giao',
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    [ONLINE_ORDER_STATUS.ORDER_PICKED_UP]: {
        text: 'Đã nhận hàng',
        color: '#9C27B0',
        backgroundColor: '#F3E5F5',
    },
    [ONLINE_ORDER_STATUS.ORDER_DELIVERED]: {
        text: 'Đã giao hàng',
        color: '#069C2E',
        backgroundColor: '#CDEED8',
    },
    [ONLINE_ORDER_STATUS.ORDER_CANCELLED]: {
        text: 'Đã hủy',
        color: '#EF0000',
        backgroundColor: '#FED9DA',
    },
    [ONLINE_ORDER_STATUS.ORDER_REJECTED]: {
        text: 'Đã từ chối',
        color: '#F44336',
        backgroundColor: '#FFEBEE',
    },
    [ONLINE_ORDER_STATUS.ORDER_FAILED]: {
        text: 'Giao hàng thất bại',
        color: '#795548',
        backgroundColor: '#EFEBE9',
    },
};

// Offline Order Status Configuration
export const OFFLINE_ORDER_CONFIG = {
    [OFFLINE_ORDER_STATUS.WAITING_FOR_PAYMENT]: {
        text: 'Chờ thanh toán',
        color: '#FF5722',
        backgroundColor: '#FFCCBC',
    },
    [OFFLINE_ORDER_STATUS.PAYMENTED]: {
        text: 'Đã thanh toán',
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    [OFFLINE_ORDER_STATUS.WAITING_FOR_SERVE]: {
        text: 'Chờ phục vụ',
        color: '#FF9800',
        backgroundColor: '#FFF3E0',
    },
    [OFFLINE_ORDER_STATUS.COMPLETED]: {
        text: 'Hoàn thành',
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    [OFFLINE_ORDER_STATUS.CANCELED]: {
        text: 'Hủy',
        color: '#F44336',
        backgroundColor: '#FFEBEE',
    },
};

// Preparation Status Configuration
export const PREPARATION_CONFIG = {
    [PREPARATION_STATUS.ACCEPTED]: {
        text: 'Đã nhận đơn',
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    [PREPARATION_STATUS.PREPARING]: {
        text: 'Đang chuẩn bị',
        color: '#FF9800',
        backgroundColor: '#FFF3E0',
    },
    [PREPARATION_STATUS.READY]: {
        text: 'Sẵn sàng',
        color: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    [PREPARATION_STATUS.COMPLETED]: {
        text: 'Hoàn thành',
        color: '#069C2E',
        backgroundColor: '#CDEED8',
    },
    [PREPARATION_STATUS.CANCELLED]: {
        text: 'Đã hủy',
        color: '#F44336',
        backgroundColor: '#FFEBEE',
    },
};

// Status Flow for Offline Orders
export const OFFLINE_STATUS_FLOW = [
    OFFLINE_ORDER_STATUS.WAITING_FOR_PAYMENT,
    OFFLINE_ORDER_STATUS.PAYMENTED,
    OFFLINE_ORDER_STATUS.WAITING_FOR_SERVE,
    OFFLINE_ORDER_STATUS.COMPLETED,
];

// Print Status Configuration
export const PRINT_STATUS = {
    PRINTED: 'printed',
    NOT_PRINTED: 'not_printed',
};

export const PRINT_STATUS_CONFIG = {
    [PRINT_STATUS.PRINTED]: {
        text: 'Đã in',
        color: '#069C2E',
        backgroundColor: '#CDEED8',
    },
    [PRINT_STATUS.NOT_PRINTED]: {
        text: 'Chưa in',
        color: '#EF0000',
        backgroundColor: '#FED9DA',
    },
};

// Default fallback configuration
export const DEFAULT_STATUS_CONFIG = {
    text: 'Không xác định',
    color: '#9E9E9E',
    backgroundColor: '#F5F5F5',
};
