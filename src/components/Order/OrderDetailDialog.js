import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OrderDetailDialog = ({
    visible,
    onClose,
    selectedOrder,
    printedLabels,
    onPrintTem,
    onPrintBill,
    loadingVisible
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "ORDER_CREATED": return "#2196F3";      // Blue
            case "ORDER_IN_PREPARE": return "#FF9800";   // Orange
            case "ORDER_READY": return "#4CAF50";        // Green
            case "ORDER_PICKED_UP": return "#9C27B0";    // Purple
            case "ORDER_DELIVERED": return "#069C2E";    // Dark Green
            case "ORDER_CANCELLED": return "#EF0000";    // Red
            case "ORDER_REJECTED": return "#F44336";     // Red
            case "ORDER_FAILED": return "#795548";       // Brown
            default: return "#9E9E9E";                   // Grey
        }
    };

    const getStatusColorBg = (status) => {
        switch (status) {
            case "ORDER_CREATED": return "#E3F2FD";      // Light Blue
            case "ORDER_IN_PREPARE": return "#FFF3E0";   // Light Orange
            case "ORDER_READY": return "#E8F5E9";        // Light Green
            case "ORDER_PICKED_UP": return "#F3E5F5";    // Light Purple
            case "ORDER_DELIVERED": return "#CDEED8";    // Light Dark Green
            case "ORDER_CANCELLED": return "#FED9DA";    // Light Red
            case "ORDER_REJECTED": return "#FFEBEE";     // Light Red
            case "ORDER_FAILED": return "#EFEBE9";       // Light Brown
            default: return "#F5F5F5";                   // Light Grey
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "ORDER_CREATED": return "Đơn hàng mới";
            case "ORDER_IN_PREPARE": return "Đang chuẩn bị";
            case "ORDER_READY": return "Sẵn sàng giao";
            case "ORDER_PICKED_UP": return "Đã nhận hàng";
            case "ORDER_DELIVERED": return "Đã giao hàng";
            case "ORDER_CANCELLED": return "Đã hủy";
            case "ORDER_REJECTED": return "Đã từ chối";
            case "ORDER_FAILED": return "Giao hàng thất bại";
            default: return "Không xác định";
        }
    };

    const getPreparationStatusText = (status) => {
        switch (status) {
            case "ACCEPTED": return "Đã nhận đơn";
            case "PREPARING": return "Đang chuẩn bị";
            case "READY": return "Sẵn sàng";
            case "COMPLETED": return "Hoàn thành";
            case "CANCELLED": return "Đã hủy";
            default: return "Không xác định";
        }
    };

    const getDeliveryStatusText = (status) => {
        switch (status) {
            case "DRIVER_AT_STORE": return "Tài xế đã đến cửa hàng";
            case "DRIVER_PICKED_UP": return "Tài xế đã nhận hàng";
            case "DRIVER_DELIVERING": return "Đang giao hàng";
            case "DRIVER_DELIVERED": return "Đã giao hàng";
            case "DRIVER_CANCELLED": return "Đã hủy giao hàng";
            default: return "Không xác định";
        }
    };

    if (!selectedOrder) return null;

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            useNativeDriver
            hideModalContentWhileAnimating
            style={styles.modal}
        >
            <Toast />
            <Spinner
                visible={loadingVisible}
                textContent={''} />
            <View style={styles.modalContent}>
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.modalScrollContent}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                        <Badge
                            text={getStatusText(selectedOrder.state)}
                            colorText={getStatusColor(selectedOrder.state)}
                            colorBg={getStatusColorBg(selectedOrder.state)}
                            width="auto"
                        />
                    </View>

                    <View style={styles.orderInfoSection}>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Mã đơn hàng:</Text>
                            <Text style={styles.value}>{selectedOrder.displayID}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Trạng thái đơn:</Text>
                            <Text style={styles.value}>{getStatusText(selectedOrder.state)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Trạng thái chuẩn bị:</Text>
                            <Text style={styles.value}>{getPreparationStatusText(selectedOrder.preparationTaskpoolStatus)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Trạng thái giao hàng:</Text>
                            <Text style={styles.value}>{getDeliveryStatusText(selectedOrder.deliveryTaskpoolStatus)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Trạng thái in:</Text>
                            <Badge
                                text={printedLabels.includes(selectedOrder.displayID) ? "Đã in" : "Chưa in"}
                                colorText={printedLabels.includes(selectedOrder.displayID) ? "#069C2E" : "#EF0000"}
                                colorBg={printedLabels.includes(selectedOrder.displayID) ? "#CDEED8" : "#FED9DA"}
                                width="auto"
                            />
                        </View>
                    </View>

                    <View style={styles.customerSection}>
                        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Tên khách hàng:</Text>
                            <Text style={styles.value}>{selectedOrder.eater?.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.label}>Số điện thoại:</Text>
                            <Text style={styles.value}>{selectedOrder.eater?.mobileNumber || 'N/A'}</Text>
                        </View>
                        {selectedOrder.eater?.address && (
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Địa chỉ:</Text>
                                <Text style={styles.value}>{selectedOrder.eater.address.address}</Text>
                            </View>
                        )}
                        {selectedOrder.eater?.comment && (
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Ghi chú:</Text>
                                <Text style={styles.value}>{selectedOrder.eater.comment}</Text>
                            </View>
                        )}
                    </View>

                    {selectedOrder.driver && (
                        <View style={styles.driverSection}>
                            <Text style={styles.sectionTitle}>Thông tin tài xế</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Tên tài xế:</Text>
                                <Text style={styles.value}>{selectedOrder.driver.name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Số điện thoại:</Text>
                                <Text style={styles.value}>{selectedOrder.driver.mobileNumber}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.itemsSection}>
                        <Text style={styles.sectionTitle}>Danh sách món</Text>
                        {selectedOrder?.itemInfoDetail?.items?.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    {item.comment && (
                                        <Text style={styles.itemNote}>Ghi chú: {item.comment}</Text>
                                    )}
                                    {item.modifierGroups?.map((group, gIdx) => (
                                        <View key={gIdx} style={styles.modifierGroup}>
                                            <Text style={styles.modifierGroupName}>{group.modifierGroupName}</Text>
                                            {group.modifiers?.map((modifier, mIdx) => (
                                                <Text key={mIdx} style={styles.modifierName}>
                                                    • {modifier.modifierName}
                                                </Text>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.itemQuantity}>
                                    <Text style={styles.quantityText}>x{item.quantity}</Text>
                                    <Text style={styles.itemPrice}>
                                        {item.fare?.priceDisplay}{item.fare?.currencySymbol}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng cộng:</Text>
                            <Text style={styles.summaryValue}>{selectedOrder.orderValue}₫</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <Pressable style={[styles.actionButton, styles.printButton]} onPress={() => onPrintTem(selectedOrder)}>
                            <Text style={styles.actionButtonText}>In Tem</Text>
                        </Pressable>
                        <Pressable style={[styles.actionButton, styles.printButton]} onPress={() => onPrintBill(selectedOrder)}>
                            <Text style={styles.actionButtonText}>In Hoá Đơn</Text>
                        </Pressable>
                        <Pressable style={[styles.actionButton, styles.closeButton]} onPress={onClose}>
                            <Text style={styles.actionButtonText}>Đóng</Text>
                        </Pressable>
                    </View>
                </ScrollView>
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
        width: "90%",
        maxWidth: 500,
        backgroundColor: "#fff",
        borderRadius: 10,
        maxHeight: "90%",
    },
    modalScrollContent: {
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    orderInfoSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    label: {
        fontWeight: "600",
        color: '#666',
    },
    value: {
        fontWeight: "500",
    },
    itemsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "500",
    },
    itemNote: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    itemQuantity: {
        alignItems: 'flex-end',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#666',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    summarySection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    summaryLabel: {
        fontWeight: "600",
        color: '#666',
    },
    summaryValue: {
        fontWeight: "bold",
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    printButton: {
        backgroundColor: "#FF9800",
    },
    closeButton: {
        backgroundColor: "#2196F3",
    },
    customerSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    driverSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    modifierGroup: {
        marginTop: 8,
        marginLeft: 8,
    },
    modifierGroupName: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    modifierName: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
        marginBottom: 2,
    },
    badge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignSelf: "center",
    },
    badgeText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default OrderDetailDialog; 