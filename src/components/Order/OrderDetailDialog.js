import React, { useState } from 'react';
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
    onStatusChange,
    loadingVisible,
    isOfflineOrder = false
}) => {
    const [showStatusOptions, setShowStatusOptions] = useState(false);

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

    // Offline order status management
    const getOfflineOrderStatusColor = (status) => {
        switch (status) {
            case "WaitingForPayment": return "#FF5722";    // Deep Orange
            case "Paymented": return "#2196F3";           // Blue
            case "WaitingForServe": return "#FF9800";     // Orange
            case "Completed": return "#4CAF50";           // Green
            case "Canceled": return "#F44336";            // Red
            default: return "#9E9E9E";                    // Grey
        }
    };

    const getOfflineOrderStatusColorBg = (status) => {
        switch (status) {
            case "WaitingForPayment": return "#FFCCBC";   // Light Deep Orange
            case "Paymented": return "#E3F2FD";          // Light Blue
            case "WaitingForServe": return "#FFF3E0";     // Light Orange
            case "Completed": return "#E8F5E9";          // Light Green
            case "Canceled": return "#FFEBEE";           // Light Red
            default: return "#F5F5F5";                   // Light Grey
        }
    };

    const getOfflineOrderStatusText = (status) => {
        switch (status) {
            case "WaitingForPayment": return "Chờ thanh toán";
            case "Paymented": return "Đã thanh toán";
            case "WaitingForServe": return "Chờ phục vụ";
            case "Completed": return "Hoàn thành";
            case "Canceled": return "Hủy";
            default: return "Mới tạo";
        }
    };

    const handleOfflineStatusChange = (newStatus) => {
        if (onStatusChange && selectedOrder) {
            onStatusChange(selectedOrder, newStatus);
            setShowStatusOptions(false);
            onClose();
        }
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = ['WaitingForPayment', 'Paymented', 'WaitingForServe', 'Completed'];
        const currentIndex = statusFlow.indexOf(currentStatus);
        return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
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
            <Toast
                config={{
                    error: ({ text1, text2, props }) => (
                        <View style={styles.toastContainer}>
                            <View style={styles.toastError}>
                                <Text style={styles.toastTitle}>{text1}</Text>
                                {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
                            </View>
                        </View>
                    ),
                    success: ({ text1, text2, props }) => (
                        <View style={styles.toastContainer}>
                            <View style={styles.toastSuccess}>
                                <Text style={styles.toastTitle}>{text1}</Text>
                                {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
                            </View>
                        </View>
                    ),
                    info: ({ text1, text2, props }) => (
                        <View style={styles.toastContainer}>
                            <View style={styles.toastInfo}>
                                <Text style={styles.toastTitle}>{text1}</Text>
                                {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
                            </View>
                        </View>
                    ),
                }}
                visibilityTime={4000}
                autoHide={true}
                topOffset={30}
                bottomOffset={40}
                position="top"
            />
            <Spinner
                visible={loadingVisible}
                textContent={''} />
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                    <Badge
                        text={isOfflineOrder ? "Đơn offline" : getStatusText(selectedOrder.state)}
                        colorText={isOfflineOrder ? "#FF9800" : getStatusColor(selectedOrder.state)}
                        colorBg={isOfflineOrder ? "#FFF3E0" : getStatusColorBg(selectedOrder.state)}
                        width="auto"
                    />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.modalScrollContent}
                    style={styles.scrollView}
                >
                    <View style={styles.orderInfoSection}>
                        <View style={styles.infoCard}>
                            <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Mã đơn:</Text>
                                <Text style={styles.value}>{isOfflineOrder ? selectedOrder.session : selectedOrder.displayID}</Text>
                            </View>
                            {isOfflineOrder && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Bàn/Khách:</Text>
                                    <Text style={styles.value}>{selectedOrder.shopTableName || 'Mang về'}</Text>
                                </View>
                            )}
                            {isOfflineOrder && selectedOrder.orderNote && selectedOrder.orderNote.trim() !== '' && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Ghi chú đơn:</Text>
                                    <Text style={[styles.value]}>{selectedOrder.orderNote}</Text>
                                </View>
                            )}
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Trạng thái:</Text>
                                <Badge
                                    text={isOfflineOrder ? getOfflineOrderStatusText(selectedOrder.orderStatus || 'Paymented') : getStatusText(selectedOrder.state)}
                                    colorText={isOfflineOrder ? getOfflineOrderStatusColor(selectedOrder.orderStatus || 'Paymented') : getStatusColor(selectedOrder.state)}
                                    colorBg={isOfflineOrder ? getOfflineOrderStatusColorBg(selectedOrder.orderStatus || 'Paymented') : getStatusColorBg(selectedOrder.state)}
                                    width="auto"
                                />
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.label}>Trạng thái in:</Text>
                                <Badge
                                    text={printedLabels.includes(isOfflineOrder ? selectedOrder.session : selectedOrder.displayID) ? "Đã in" : "Chưa in"}
                                    colorText={printedLabels.includes(isOfflineOrder ? selectedOrder.session : selectedOrder.displayID) ? "#069C2E" : "#EF0000"}
                                    colorBg={printedLabels.includes(isOfflineOrder ? selectedOrder.session : selectedOrder.displayID) ? "#CDEED8" : "#FED9DA"}
                                    width="auto"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Status Change Section for Offline Orders - Simplified */}
                    {isOfflineOrder && onStatusChange && (
                        <View style={styles.statusChangeSection}>
                            <View style={styles.infoCard}>
                                <Text style={styles.cardTitle}>Thay đổi trạng thái</Text>
                                {(selectedOrder.orderStatus === 'Completed' || selectedOrder.orderStatus === 'Canceled') ? (
                                    <View style={styles.finalStatusContainer}>
                                        <Text style={styles.finalStatusText}>
                                            Đơn hàng đã hoàn tất
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.statusControlContainer}>
                                        <Pressable
                                            style={styles.currentStatusButton}
                                            onPress={() => setShowStatusOptions(!showStatusOptions)}
                                        >
                                            <Text style={styles.currentStatusText}>
                                                {getOfflineOrderStatusText(selectedOrder.orderStatus || 'Paymented')}
                                            </Text>
                                            <Text style={styles.dropdownArrow}>{showStatusOptions ? '▲' : '▼'}</Text>
                                        </Pressable>

                                        {showStatusOptions && (
                                            <View style={styles.statusOptions}>
                                                {['WaitingForPayment', 'Paymented', 'WaitingForServe', 'Completed', 'Canceled'].map(status => (
                                                    selectedOrder.orderStatus !== status && (
                                                        <Pressable
                                                            key={status}
                                                            style={[styles.statusOption, { borderLeftColor: getOfflineOrderStatusColor(status) }]}
                                                            onPress={() => handleOfflineStatusChange(status)}
                                                        >
                                                            <Text style={[styles.statusOptionText, { color: getOfflineOrderStatusColor(status) }]}>
                                                                {getOfflineOrderStatusText(status)}
                                                            </Text>
                                                        </Pressable>
                                                    )
                                                ))}
                                            </View>
                                        )}

                                        {/* Quick next status button */}
                                        {getNextStatus(selectedOrder.orderStatus || 'Paymented') && (
                                            <Pressable
                                                style={[styles.quickStatusButton, { backgroundColor: getOfflineOrderStatusColorBg(getNextStatus(selectedOrder.orderStatus || 'Paymented')) }]}
                                                onPress={() => handleOfflineStatusChange(getNextStatus(selectedOrder.orderStatus || 'Paymented'))}
                                            >
                                                <Text style={[styles.quickStatusButtonText, { color: getOfflineOrderStatusColor(getNextStatus(selectedOrder.orderStatus || 'Paymented')) }]}>
                                                    ➤ {getOfflineOrderStatusText(getNextStatus(selectedOrder.orderStatus || 'Paymented'))}
                                                </Text>
                                            </Pressable>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    <View style={styles.itemsSection}>
                        <View style={styles.infoCard}>
                            <Text style={styles.cardTitle}>Danh sách món</Text>
                            {isOfflineOrder ? (
                                // Handle offline order structure
                                selectedOrder?.products?.map((product, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{product.name}</Text>
                                            {product.note && (
                                                <Text style={styles.itemNote}>📝 {product.note}</Text>
                                            )}
                                            {product.extras?.map((extra, eIdx) => (
                                                <View key={eIdx} style={styles.modifierGroup}>
                                                    <Text style={styles.modifierName}>
                                                        + {extra.name} {extra.price ? `(+${extra.price.toLocaleString('vi-VN')}₫)` : ''}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                        <View style={styles.itemQuantity}>
                                            <Text style={styles.quantityText}>x{product.quanlity || 1}</Text>
                                            <Text style={styles.itemPrice}>
                                                {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                // Handle online order structure
                                selectedOrder?.itemInfo?.items?.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            {item.comment && (
                                                <Text style={styles.itemNote}>📝 {item.comment}</Text>
                                            )}
                                            {item.modifierGroups?.map((group, gIdx) => (
                                                <View key={gIdx} style={styles.modifierGroup}>
                                                    {group.modifiers?.map((modifier, mIdx) => (
                                                        <Text key={mIdx} style={styles.modifierName}>
                                                            + {modifier.modifierName}
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
                                ))
                            )}

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
                                <Text style={styles.summaryValue}>
                                    {isOfflineOrder ?
                                        `${(selectedOrder.total_amount || 0).toLocaleString('vi-VN')}₫` :
                                        `${selectedOrder.orderValue}₫`
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>

                    {!isOfflineOrder && (
                        <View style={styles.customerSection}>
                            <View style={styles.infoCard}>
                                <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Tên:</Text>
                                    <Text style={styles.value}>{selectedOrder.eater?.name || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>SĐT:</Text>
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
                        </View>
                    )}

                    {!isOfflineOrder && selectedOrder.driver && (
                        <View style={styles.driverSection}>
                            <View style={styles.infoCard}>
                                <Text style={styles.cardTitle}>Thông tin tài xế</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Tên:</Text>
                                    <Text style={styles.value}>{selectedOrder.driver.name}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>SĐT:</Text>
                                    <Text style={styles.value}>{selectedOrder.driver.mobileNumber}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Add spacing for docked buttons */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Docked Action Buttons */}
                <View style={styles.dockedActions}>
                    <Pressable
                        style={[styles.dockedButton, styles.printTemButton]}
                        onPress={() => onPrintTem(selectedOrder)}
                    >
                        <Text style={styles.dockedButtonText}>🏷️ In Tem</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.dockedButton, styles.printBillButton]}
                        onPress={() => onPrintBill(selectedOrder)}
                    >
                        <Text style={styles.dockedButtonText}>🧾 In HĐ</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.dockedButton, styles.closeButton]}
                        onPress={onClose}
                    >
                        <Text style={styles.dockedButtonText}>✕ Đóng</Text>
                    </Pressable>
                </View>
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
        height: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: 'hidden',
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
        flex: 1,
    },
    modalScrollContent: {
        padding: 16,
    },
    bottomSpacer: {
        height: 80, // Space for docked buttons
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#8B4513',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingBottom: 8,
    },
    orderInfoSection: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8',
    },
    label: {
        fontWeight: "600",
        color: '#666',
        fontSize: 14,
    },
    value: {
        fontWeight: "500",
        color: '#333',
        fontSize: 14,
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    orderNoteText: {
        fontStyle: 'italic',
        color: '#8B4513',
        backgroundColor: '#FFF8F0',
        padding: 8,
        borderRadius: 4,
        textAlign: 'left',
    },
    itemsSection: {
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "600",
        color: '#333',
        marginBottom: 4,
    },
    itemNote: {
        fontSize: 13,
        color: '#8B4513',
        fontStyle: 'italic',
        marginTop: 4,
        backgroundColor: '#FFF8F0',
        padding: 4,
        borderRadius: 4,
    },
    itemQuantity: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 80,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#8B4513',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderTopWidth: 2,
        borderTopColor: '#8B4513',
        marginTop: 12,
    },
    summaryLabel: {
        fontWeight: "bold",
        color: '#8B4513',
        fontSize: 16,
    },
    summaryValue: {
        fontWeight: "bold",
        color: '#8B4513',
        fontSize: 18,
    },
    customerSection: {
        marginBottom: 12,
    },
    driverSection: {
        marginBottom: 12,
    },
    modifierGroup: {
        marginTop: 4,
        marginLeft: 8,
    },
    modifierName: {
        fontSize: 12,
        color: '#8B4513',
        marginBottom: 2,
        backgroundColor: '#FFF8F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        alignSelf: 'flex-start',
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
    },
    statusChangeSection: {
        marginBottom: 12,
    },
    statusControlContainer: {
        marginTop: 8,
    },
    currentStatusButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    currentStatusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#8B4513',
    },
    statusOptions: {
        marginTop: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    statusOption: {
        padding: 12,
        borderLeftWidth: 4,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statusOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    quickStatusButton: {
        marginTop: 8,
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    quickStatusButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    finalStatusContainer: {
        padding: 12,
        backgroundColor: '#F0F8F0',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#4CAF50',
        marginTop: 8,
    },
    finalStatusText: {
        fontSize: 14,
        color: '#2E7D32',
        textAlign: 'center',
        fontWeight: '500',
    },
    dockedActions: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    dockedButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    dockedButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
        textAlign: 'center',
    },
    printTemButton: {
        backgroundColor: "#FF9800",
    },
    printBillButton: {
        backgroundColor: "#4CAF50",
    },
    closeButton: {
        backgroundColor: "#757575",
    },
    // Toast styles
    toastContainer: {
        width: '90%',
        paddingHorizontal: 16,
    },
    toastError: {
        backgroundColor: '#F44336',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    toastSuccess: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#388E3C',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    toastInfo: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#1976D2',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    toastTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    toastMessage: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 18,
    },
});

export default OrderDetailDialog; 