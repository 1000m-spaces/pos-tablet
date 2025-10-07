import React, { useState, useEffect } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { Table, Row } from "react-native-table-component";
import AsyncStorage from 'store/async_storage/index'
import Toast from 'react-native-toast-message'
import OrderDetailDialog from './OrderDetailDialog';
import { getOrderIdentifierForPrinting } from '../../utils/orderUtils';
import printQueueService from '../../services/PrintQueueService';
import { TextNormal } from "common/Text/TextFont";
import { useDispatch } from "react-redux";
import { confirmOrderOnline } from "store/actions";

const { width, height } = Dimensions.get("window");

// Convert mm to pixels for ViewShot width calculation
const mmToPixels = (mm, dpi = 203) => {
    return Math.round((mm * dpi) / 25.4); // 25.4mm = 1 inch
};

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OrderTable = ({ orderType, orders, showSettingPrinter, onConfirmOrder }) => {
    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printedLabels, setPrintedLabelsState] = useState([]);
    const [isAutoPrinting, setIsAutoPrinting] = useState(false);

    const tableHead = ["Xác nhận", "Đối tác", "Mã đơn hàng", "Tổng tiền", "Số món", "Tem", "Trạng thái đơn"];
    const numColumns = tableHead.length;

    const [tableWidth, setTableWidth] = useState([])
    const [widthArr, setWidthArr] = useState([]);

    useEffect(() => {
        const { width, height } = Dimensions.get("window");
        const calculatedTableWidth = width - width * 0.09 - 20;
        setTableWidth(calculatedTableWidth);
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

            const targetOrder = order || selectedOrder;
            console.log('Queueing label print for order:', targetOrder.displayID);

            // Use global.queueMultipleLabels for multiple products if available
            if (global.queueMultipleLabels && targetOrder.itemInfo?.items && targetOrder.itemInfo.items.length > 0) {
                const labelTaskIds = await global.queueMultipleLabels(targetOrder, labelPrinterInfo);
                console.log(`Queued ${labelTaskIds.length} label tasks:`, labelTaskIds);

                // Update print status
                await AsyncStorage.setPrintedLabels(targetOrder.displayID);
                setPrintedLabelsState(prev => [...prev, targetOrder.displayID]);

                Toast.show({
                    type: 'success',
                    text1: `Đã xếp hàng in ${labelTaskIds.length} tem`
                });
            } else {
                // Fallback to single label task
                const taskId = printQueueService.addPrintTask({
                    type: 'label',
                    order: targetOrder,
                    priority: 'high'
                });

                // Update print status
                await AsyncStorage.setPrintedLabels(targetOrder.displayID);
                setPrintedLabelsState(prev => [...prev, targetOrder.displayID]);

                Toast.show({
                    type: 'success',
                    text1: 'Đã xếp hàng in tem'
                });
                console.log('Label print task queued with ID:', taskId);
            }
        } catch (error) {
            console.error('Print queue error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi xếp hàng in tem: ' + error.message
            });
            if (error.message === 'Printer settings not configured') {
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

            const targetOrder = order || selectedOrder;
            console.log('Queueing bill print for order:', targetOrder.displayID);

            // Add bill printing task to queue
            const taskId = printQueueService.addPrintTask({
                type: 'bill',
                order: targetOrder,
                priority: 'high'
            });

            Toast.show({
                type: 'success',
                text1: 'Đã xếp hàng in hoá đơn'
            });
            console.log('Bill print task queued with ID:', taskId);
        } catch (error) {
            console.error('Print queue error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi xếp hàng in hoá đơn: ' + error.message
            });
            if (error.message === 'Printer settings not configured') {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
        }
    };

    const autoPrintOrder = async (order) => {
        if (Platform.OS !== "android") {
            return;
        }

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

            console.log('Auto-queueing label print for order:', order.displayID);

            // Use global.queueMultipleLabels for multiple products if available
            if (global.queueMultipleLabels && order.itemInfo?.items && order.itemInfo.items.length > 0) {
                const labelTaskIds = await global.queueMultipleLabels(order, labelPrinterInfo);
                console.log(`Auto-queued ${labelTaskIds.length} label tasks:`, labelTaskIds);

                // Update print status
                await AsyncStorage.setPrintedLabels(order.displayID);
                setPrintedLabelsState(prev => [...prev, order.displayID]);

                Toast.show({
                    type: 'success',
                    text1: `Đã tự động xếp hàng in ${labelTaskIds.length} tem cho đơn ${order.displayID}`
                });
            } else {
                // Fallback to single label task
                const taskId = printQueueService.addPrintTask({
                    type: 'label',
                    order: order,
                    priority: 'high'
                });

                // Update print status
                await AsyncStorage.setPrintedLabels(order.displayID);
                setPrintedLabelsState(prev => [...prev, order.displayID]);

                Toast.show({
                    type: 'success',
                    text1: `Đã tự động xếp hàng in tem cho đơn ${order.displayID}`
                });
                console.log('Auto-queued label print task with ID:', taskId);
            }
        } catch (error) {
            console.error('Auto print queue error:', error);
            if (error.message === 'Printer settings not configured') {
                showSettingPrinter();
            }
        }
    };

    // Monitor orders for new unprinted items
    useEffect(() => {
        const checkAndPrintNewOrders = async () => {
            const labels = await AsyncStorage.getPrintedLabels();
            if (isAutoPrinting || !orders.length) return;

            if (orderType != 1) {
                return;
            }
            // Check if auto-print is enabled in printer settings
            const labelPrinterInfo = await AsyncStorage.getLabelPrinterInfo();
            if (!labelPrinterInfo?.autoPrint) return;

            setIsAutoPrinting(true);
            try {
                for (const order of orders) {
                    if (order && !labels.includes(order.displayID)) {
                        console.log("Auto print order:", order.displayID);
                        await autoPrintOrder(order);
                        // Add a small delay between prints
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } finally {
                setIsAutoPrinting(false);
            }
        };

        checkAndPrintNewOrders();
    }, [orders, orderType]);

    const tableData = orders?.map(order => [
        <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', height: '80%', width: '60%', backgroundColor: '#19b400', borderRadius: 10 }}
                onPress={() => { handleConfirmOrder(order.displayID) }}>
                <TextNormal>Xác nhận đơn</TextNormal>
            </TouchableOpacity>
        </View>,
        order.service || "GRAB",
        order.displayID,
        order.orderValue,
        order.itemInfo?.items?.length,
        <Badge
            text={printedLabels.includes(order.displayID) ? "Đã in" : "Chưa in"}
            colorText={printedLabels.includes(order.displayID) ? "#069C2E" : "#EF0000"}
            colorBg={printedLabels.includes(order.displayID) ? "#CDEED8" : "#FED9DA"}
            width="60%"
            key={order.displayID + "_tem"}
        />,
        <Badge text={getStatusText(order.state)} colorText={getStatusColor(order.state)} colorBg={getStatusColorBg(order.state)} width="80%" key={order.displayID + "_status"} />
    ]);

    // confirm order
    const handleConfirmOrder = (orderId) => {
        dispatch(confirmOrderOnline({ order_id: orderId }));
        Toast.show({
            type: 'info',
            text1: 'Đang xác nhận đơn hàng...',
            position: 'bottom',
        });
    };


    return (
        <>
            <ScrollView horizontal>
                <ScrollView style={{ maxHeight: height * 0.6 }}>
                    <View style={{ flex: 1, width: tableWidth }}>
                        <Table borderStyle={styles.border}>
                            <Row data={tableHead} widthArr={widthArr} style={styles.head} textStyle={styles.textHead} />
                            {orders && orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <TouchableOpacity key={index} onPress={() => handleRowPress(order)}>
                                        <Row data={tableData[index]} widthArr={widthArr} style={styles.row} textStyle={styles.text} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Row
                                    data={[<Text style={styles.emptyText}>Không tồn tại đơn hàng nào</Text>]}
                                    widthArr={[tableWidth]}
                                    style={styles.row}
                                />
                            )}
                        </Table>
                    </View>
                </ScrollView>
            </ScrollView>

            <OrderDetailDialog
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedOrder={selectedOrder}
                printedLabels={printedLabels}
                onPrintTem={printTem}
                onPrintBill={printBill}
                onConfirm={onConfirmOrder ? () => onConfirmOrder(selectedOrder) : undefined}
                loadingVisible={loadingVisible}
            />
            <Toast
                position="top"
                topOffset={50}
                visibilityTime={4000}
            />
        </>
    );
};

const styles = StyleSheet.create({
    border: {
        borderWidth: 1,
        borderColor: "#ddd",
    },
    head: {
        height: 40,
        backgroundColor: "#f0f0f0",
    },
    row: {
        height: 50,
    },
    textHead: {
        textAlign: "center",
        fontWeight: "bold",
    },
    text: {
        textAlign: "center",
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
    emptyText: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
    },
});

export default OrderTable;