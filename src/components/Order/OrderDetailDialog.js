import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import { usePrinter } from '../../services/PrinterService';

// Import our new components and utilities
import Badge from './components/Badge';
import OrderInfo from './components/OrderInfo';
import OrderItems from './components/OrderItems';
import StatusChange from './components/StatusChange';
import CustomerInfo from './components/CustomerInfo';
import DriverInfo from './components/DriverInfo';
import ActionButtons from './components/ActionButtons';
import { toastConfig } from './components/ToastConfig';
import { useOrderModal, useOrderStatusChange } from './hooks/useOrderModal';

const OrderDetailDialog = ({
    visible,
    onClose,
    selectedOrder,
    printedLabels,
    onPrintTem,
    onPrintBill,
    onStatusChange,
    loadingVisible,
    isOfflineOrder = false,
    onConfirm,
}) => {
    // Use global printer service for status display
    const {
        labelPrinterStatus,
        billPrinterStatus,
    } = usePrinter();

    // Use our custom hooks
    const {
        orderData,
        printStatusConfig,
        offlineOrderData,
        showStatusOptions,
        setShowStatusOptions,
    } = useOrderModal(selectedOrder, isOfflineOrder, printedLabels);

    const { handleStatusChange } = useOrderStatusChange(
        onStatusChange,
        onClose,
        setShowStatusOptions
    );

    if (!selectedOrder || !orderData) return null;

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            useNativeDriver
            hideModalContentWhileAnimating
            style={styles.modal}
        >
            <Toast
                config={toastConfig}
                visibilityTime={4000}
                autoHide={true}
                topOffset={30}
                bottomOffset={40}
                position="top"
            />
            <Spinner
                visible={loadingVisible}
                textContent={''}
            />
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                    <Badge
                        text={isOfflineOrder ? "Đơn offline" : orderData.statusDisplay.text}
                        color={isOfflineOrder ? "#FF9800" : orderData.statusDisplay.color}
                        backgroundColor={isOfflineOrder ? "#FFF3E0" : orderData.statusDisplay.backgroundColor}
                        width="auto"
                    />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.modalScrollContent}
                    style={styles.scrollView}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                >
                    <OrderInfo
                        orderData={orderData}
                        printStatusConfig={printStatusConfig}
                        isOfflineOrder={isOfflineOrder}
                    />

                    {isOfflineOrder && onStatusChange && offlineOrderData && (
                        <StatusChange
                            offlineOrderData={offlineOrderData}
                            showStatusOptions={showStatusOptions}
                            setShowStatusOptions={setShowStatusOptions}
                            onStatusChange={(newStatus) => handleStatusChange(selectedOrder, newStatus)}
                        />
                    )}

                    <OrderItems
                        orderData={orderData}
                        isOfflineOrder={isOfflineOrder}
                    />

                    <CustomerInfo customerInfo={orderData.customerInfo} />

                    <DriverInfo driverInfo={orderData.driverInfo} />

                    <View style={styles.bottomSpacer} />
                </ScrollView>

                <ActionButtons
                    onPrintTem={onPrintTem}
                    onPrintBill={onPrintBill}
                    onConfirm={onConfirm}
                    onClose={onClose}
                    selectedOrder={selectedOrder}
                    isOfflineOrder={isOfflineOrder}
                    labelPrinterStatus={labelPrinterStatus}
                    billPrinterStatus={billPrinterStatus}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: "95%",
        maxWidth: 520,
        maxHeight: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'column',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#8B4513',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: '#fff',
    },
    scrollView: {
        maxHeight: 500, // Set a reasonable max height to leave space for ActionButtons
        backgroundColor: 'transparent',
    },
    modalScrollContent: {
        padding: 16,
        paddingBottom: 20, // Reduced padding since ActionButtons are now properly positioned
    },
    bottomSpacer: {
        height: 20, // Reduced spacing since we use paddingBottom now
    },
});

export default OrderDetailDialog; 