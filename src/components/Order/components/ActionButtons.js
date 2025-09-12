import React from 'react';
import { View, StyleSheet } from 'react-native';
import ActionButton from './ActionButton';

const ActionButtons = ({
    onPrintTem,
    onPrintBill,
    onConfirm,
    onClose,
    selectedOrder,
    isOfflineOrder,
    labelPrinterStatus,
    billPrinterStatus,
}) => {
    const getPrinterStatusIndicator = (status) => {
        switch (status) {
            case 'connected': return '#4CAF50';
            case 'connecting': return '#FF9800';
            default: return '#F44336';
        }
    };

    const getPrinterStatusHint = (status) => {
        switch (status) {
            case 'connecting': return 'Đang kết nối...';
            case 'connected': return null;
            default: return 'Chưa kết nối';
        }
    };

    return (
        <View style={styles.dockedActions}>
            <ActionButton
                variant="print-label"
                title="🏷️ In Tem"
                onPress={() => onPrintTem(selectedOrder)}
                disabled={labelPrinterStatus === 'connecting'}
                statusIndicator={getPrinterStatusIndicator(labelPrinterStatus)}
                statusHint={getPrinterStatusHint(labelPrinterStatus)}
            />

            <ActionButton
                variant="print-bill"
                title="🧾 In HĐ"
                onPress={() => onPrintBill(selectedOrder)}
                disabled={billPrinterStatus === 'connecting'}
                statusIndicator={getPrinterStatusIndicator(billPrinterStatus)}
                statusHint={getPrinterStatusHint(billPrinterStatus)}
            />

            {!isOfflineOrder && typeof onConfirm === 'function' && (
                <ActionButton
                    variant="confirm"
                    title="✅ Xác nhận"
                    onPress={() => onConfirm(selectedOrder)}
                />
            )}

            <ActionButton
                variant="close"
                title="✕ Đóng"
                onPress={onClose}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dockedActions: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        flexShrink: 0,
        minHeight: 60,
    },
});

export default ActionButtons;
