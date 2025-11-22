import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { Table, Row } from "react-native-table-component";
import AsyncStorage from 'store/async_storage/index'
import Toast from 'react-native-toast-message'
import OrderDetailDialog from './OrderDetailDialog';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import { useDispatch } from 'react-redux';
import printQueueService from '../../services/PrintQueueService';
import { getOrderIdentifierForPrinting } from '../../utils/orderUtils';

const { width, height } = Dimensions.get("window");

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OfflineOrderTable = ({ orders, onRefresh, selectedDate, showSettingPrinter }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printedLabels, setPrintedLabelsState] = useState([]);
    const dispatch = useDispatch();

    const tableHead = ["Mã đơn hàng", "Thẻ/Khách", "Tổng tiền", "Số món", "Trạng thái", "Tem", "Bill", "Đồng bộ", "Thời gian"];
    const numColumns = tableHead.length;

    const [widthArr, setWidthArr] = useState([]);

    const filteredOrders = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        return orders.filter(order => {
            try {
                const createdAt = new Date(order.created_at);
                return (
                    createdAt.getFullYear() === selectedDate.getFullYear() &&
                    createdAt.getMonth() === selectedDate.getMonth() &&
                    createdAt.getDate() === selectedDate.getDate()
                );
            } catch (e) {
                // If parsing fails, include the order to avoid accidental exclusion
                return true;
            }
        });
    }, [orders, selectedDate]);

    useEffect(() => {
        // Background job: sync offline orders every 1 minute
        const intervalId = setInterval(() => {
            if (onRefresh) {
                onRefresh();
            }
        }, 120000); // 60,000 ms = 1 minute

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [dispatch, onRefresh]);

    useEffect(() => {
        const { width, height } = Dimensions.get("window");
        const calculatedTableWidth = width - width * 0.09;
        const columnWidth = calculatedTableWidth / numColumns;
        setWidthArr(Array(numColumns).fill(columnWidth));
    }, [])

    useEffect(() => {
        const loadPrintedLabels = async () => {
            const labels = await AsyncStorage.getPrintedLabels();
            setPrintedLabelsState(labels);
        };
        loadPrintedLabels();
    }, []);

    useEffect(() => {
        const handlePrintQueueEvent = async (event, data) => {
            if (event === 'taskCompleted' && data?.queueType === 'label') {
                // Reload printed labels from storage when a label task completes
                const labels = await AsyncStorage.getPrintedLabels();
                setPrintedLabelsState(labels);
                console.log('OfflineOrderTable: Updated printed labels after task completion');
            }
        };

        const unsubscribe = printQueueService.addListener(handlePrintQueueEvent);
        return () => unsubscribe();
    }, []);

    const getSyncStatusColor = (status) => {
        switch (status) {
            case "pending": return "#FF9800";      // Orange
            case "synced": return "#4CAF50";       // Green
            case "failed": return "#F44336";       // Red
            default: return "#9E9E9E";             // Grey
        }
    };

    const getSyncStatusColorBg = (status) => {
        switch (status) {
            case "pending": return "#FFF3E0";      // Light Orange
            case "synced": return "#E8F5E9";       // Light Green
            case "failed": return "#FFEBEE";       // Light Red
            default: return "#F5F5F5";             // Light Grey
        }
    };

    const getSyncStatusText = (status) => {
        switch (status) {
            case "pending": return "Chờ đồng bộ";
            case "synced": return "Đã đồng bộ";
            case "failed": return "Lỗi đồng bộ";
            default: return "Chưa đồng bộ";
        }
    };

    const getPrintStatusColor = (status) => {
        switch (status) {
            case "printed": return "#4CAF50";      // Green
            case "not_printed": return "#FF9800";  // Orange
            default: return "#9E9E9E";             // Grey
        }
    };

    const getPrintStatusColorBg = (status) => {
        switch (status) {
            case "printed": return "#E8F5E9";      // Light Green
            case "not_printed": return "#FFF3E0";  // Light Orange
            default: return "#F5F5F5";             // Light Grey
        }
    };

    const getPrintStatusText = (status, is_print) => {
        if (is_print) {
            switch (is_print) {
                case "1": return "Đã in";
                case "0": return "Chưa in";
                default: return "Không xác định";
            }
        } else {
            switch (status) {
                case "printed": return "Đã in";
                case "not_printed": return "Chưa in";
                default: return "Không xác định";
            }
        }
    };

    // Order Status Management
    const getOrderStatusColor = (status) => {
        switch (status) {
            case "WaitingForPayment": return "#FF5722";    // Deep Orange
            case "Paymented": return "#4CAF50";           // Blue
            case "WaitingForServe": return "#FF9800";     // Orange
            case "Completed": return "#4CAF50";           // Green
            case "Canceled": return "#F44336";            // Red
            default: return "#9E9E9E";                    // Grey
        }
    };

    const getOrderStatusColorBg = (status) => {
        switch (status) {
            case "WaitingForPayment": return "#FFCCBC";   // Light Deep Orange
            case "Paymented": return "#E8F5E9";          // Light Blue
            case "WaitingForServe": return "#FFF3E0";     // Light Orange
            case "Completed": return "#E8F5E9";          // Light Green
            case "Canceled": return "#FFEBEE";           // Light Red
            default: return "#F5F5F5";                   // Light Grey
        }
    };

    const getOrderStatusText = (status) => {
        switch (status) {
            case "WaitingForPayment": return "Chờ thanh toán";
            case "Paymented": return "Đã thanh toán";
            case "WaitingForServe": return "Chờ phục vụ";
            case "Completed": return "Hoàn thành";
            case "Canceled": return "Hủy";
            default: return "Mới tạo";
        }
    };

    const handleStatusChange = async (order, newStatus) => {
        try {
            await AsyncStorage.updateOrderStatus(order.session, newStatus);
            Toast.show({
                type: 'success',
                text1: `Đã cập nhật trạng thái đơn ${order.session}`,
                text2: getOrderStatusText(newStatus),
                position: 'bottom',
            });
            // Refresh data after status update
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi cập nhật trạng thái',
                text2: error.message,
                position: 'bottom',
            });
        }
    };

    const handleRowPress = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const printTem = async (order = selectedOrder) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            });
            return;
        }

        setLoadingVisible(true);
        try {
            const labelPrinterInfo = await AsyncStorage.getLabelPrinterInfo();

            // Validate printer configuration based on connection type
            if (!labelPrinterInfo || !labelPrinterInfo.sWidth || !labelPrinterInfo.sHeight) {
                throw new Error('Printer settings not configured');
            }

            if (labelPrinterInfo.connectionType === 'network' && !labelPrinterInfo.IP) {
                throw new Error('Printer settings not configured');
            } else if (labelPrinterInfo.connectionType === 'usb' && !labelPrinterInfo.usbDevice) {
                throw new Error('Printer settings not configured');
            } else if (labelPrinterInfo.connectionType === 'serial' && !labelPrinterInfo.serialPort) {
                throw new Error('Printer settings not configured');
            }

            const orderToUse = order || selectedOrder;

            // Check if order has multiple products or quantities > 1
            let totalLabels = 0;
            if (orderToUse.products) {
                orderToUse.products.forEach(product => {
                    totalLabels += (product.quanlity || 1);
                });
            }

            let taskIds;
            // Use queueMultipleLabels for orders with multiple products/quantities
            taskIds = await global.queueMultipleLabels(orderToUse, labelPrinterInfo);
            console.log(`Queued ${taskIds.length} label tasks:`, taskIds);

            Toast.show({
                type: 'success',
                text1: `Đã xếp hàng in ${totalLabels} tem`,
                text2: 'Tem sẽ được in tự động',
                position: 'top'
            });

        } catch (error) {
            console.error('Print queue error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi xếp hàng in: ' + error.message
            });
            if (error.message === 'Printer settings not configured' && showSettingPrinter) {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
        }
    };

    const printBill = async (order = selectedOrder) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            });
            return;
        }

        setLoadingVisible(true);
        try {
            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();

            // Validate bill printer configuration based on connection type
            if (!billPrinterInfo) {
                throw new Error('Printer settings not configured');
            }

            if (billPrinterInfo.billConnectionType === 'network' && !billPrinterInfo.billIP) {
                throw new Error('Printer settings not configured');
            } else if (billPrinterInfo.billConnectionType === 'usb' && !billPrinterInfo.billUsbDevice) {
                throw new Error('Printer settings not configured');
            } else if (billPrinterInfo.billConnectionType === 'serial' && !billPrinterInfo.billSerialPort) {
                throw new Error('Printer settings not configured');
            }

            const orderToUse = order || selectedOrder;

            // Add bill printing task to queue
            const taskId = printQueueService.addPrintTask({
                type: 'bill',
                order: orderToUse,
                priority: 'normal'
            });

            console.log('Queued bill task:', taskId);

            Toast.show({
                type: 'success',
                text1: 'Đã xếp hàng in hoá đơn',
                text2: 'Hoá đơn sẽ được in tự động',
                position: 'top'
            });
        } catch (error) {
            console.error('Print queue error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi xếp hàng in: ' + error.message
            });
            if (error.message === 'Printer settings not configured' && showSettingPrinter) {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
        }
    };

    const formatDateTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        } catch (error) {
            return amount + ' VND';
        }
    };

    const getItemCount = (order) => {
        if (!order.products) return 0;
        return order.products.reduce((total, product) => total + (product.quanlity || 1), 0);
    };

    const renderStatusSelector = (order) => {
        const currentStatus = order.orderStatus || 'Paymented';

        return (
            <View style={styles.statusSelector}>
                <View style={[styles.statusButton, { backgroundColor: getOrderStatusColorBg(currentStatus) }]}>
                    <TextNormal style={[styles.statusText, { color: getOrderStatusColor(currentStatus) }]}>
                        {getOrderStatusText(currentStatus)}
                    </TextNormal>
                </View>
            </View>
        );
    };

    const tableData = filteredOrders.map((order, index) => [
        order.session || order.offline_code || `M-${index + 1}`,
        order.shoptablename || 'N/A',
        formatCurrency(order.total_amount || 0),
        getItemCount(order).toString(),
        renderStatusSelector(order),
        <TouchableOpacity
            key={`print-${order.session}`}
            onPress={() => printTem(order)}
            style={styles.actionButton}
        >
            <Badge
                text={getPrintStatusText(order.printStatus, order.is_print)}
                colorText={getPrintStatusColor(order.printStatus)}
                colorBg={getPrintStatusColorBg(order.printStatus)}
                width={80}
            />
        </TouchableOpacity>,
        <TouchableOpacity
            key={`print-${order.session}`}
            onPress={() => printBill(order)}
            style={styles.actionButton}
        >
            <Badge
                text={getPrintStatusText(order.printStatus, order.is_print)}
                colorText={getPrintStatusColor(order.printStatus)}
                colorBg={getPrintStatusColorBg(order.printStatus)}
                width={80}
            />
        </TouchableOpacity>,
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Badge
                key={`sync-${order.session}`}
                text={getSyncStatusText(order.syncStatus)}
                colorText={getSyncStatusColor(order.syncStatus)}
                colorBg={getSyncStatusColorBg(order.syncStatus)}
                width={90}
            />
        </View >,
        formatDateTime(order.created_at)
    ]);

    return (
        <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <Table borderStyle={{ borderWidth: 1, borderColor: Colors.borderColor }}>
                        <Row
                            data={tableHead}
                            style={styles.head}
                            textStyle={styles.headText}
                            widthArr={widthArr}
                        />
                    </Table>
                    <ScrollView style={styles.dataWrapper}>
                        <Table borderStyle={{ borderWidth: 1, borderColor: Colors.borderColor }}>
                            {tableData.map((rowData, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleRowPress(filteredOrders[index])}
                                    style={[styles.row, index % 2 === 1 && styles.alternateRow]}
                                >
                                    <Row
                                        data={rowData}
                                        textStyle={styles.text}
                                        widthArr={widthArr}
                                        style={styles.rowContainer}
                                    />
                                </TouchableOpacity>
                            ))}
                        </Table>
                    </ScrollView>
                </View>
            </ScrollView>
            <OrderDetailDialog
                visible={modalVisible}
                selectedOrder={selectedOrder}
                printedLabels={printedLabels}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedOrder(null);
                }}
                onPrintTem={printTem}
                onPrintBill={printBill}
                onStatusChange={handleStatusChange}
                loadingVisible={loadingVisible}
                isOfflineOrder={true}
            />

            {/* Loading Modal */}
            {loadingVisible && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <TextNormal style={styles.loadingText}>Đang xếp hàng...</TextNormal>
                    </View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
    },
    head: {
        height: 50,
        backgroundColor: Colors.primary,
    },
    headText: {
        margin: 6,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
    },
    text: {
        margin: 6,
        textAlign: 'center',
        fontSize: 12,
        color: Colors.textPrimary,
    },
    dataWrapper: {
        marginTop: -1,
        maxHeight: height * 0.6,
    },
    row: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderColor,
    },
    alternateRow: {
        backgroundColor: '#f9f9f9',
    },
    rowContainer: {
        height: 60,
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    hiddenPrintView: {
        position: 'absolute',
        left: -10000,
        top: -10000,
        opacity: 0,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    statusSelector: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    statusButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    }
});

export default OfflineOrderTable; 