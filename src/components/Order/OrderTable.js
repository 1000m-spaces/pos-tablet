import React, { useState, useEffect } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Modal, Pressable, Platform, Image } from "react-native";
import { Table, Row } from "react-native-table-component";
import ViewShot from "react-native-view-shot";
import PrintTemplate from "./TemTemplate";
import { useRef } from "react";
import AsyncStorage from 'store/async_storage/index'
import BillTemplate from "./BillTemplate";
import Toast from 'react-native-toast-message'
import Spinner from 'react-native-loading-spinner-overlay';
import { netConnect, printBitmap, closeConnection, tsplPrintBitmap } from 'rn-xprinter';
import RNFS from 'react-native-fs';
import ImageManipulator from 'react-native-photo-manipulator';

const { width, height } = Dimensions.get("window");

// Convert mm to pixels (96 DPI)
const mmToPixels = (mm) => {
    return Math.round((mm * 96) / 25.4); // 25.4mm = 1 inch
};

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OrderTable = ({ orders, showSettingPrinter }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printingOrder, setPrintingOrder] = useState(null);
    const [printedLabels, setPrintedLabels] = useState([]);
    const [isAutoPrinting, setIsAutoPrinting] = useState(false);
    const [printerInfo, setPrinterInfo] = useState(null);
    const viewTemShotRef = useRef();
    const viewBillShotRef = useRef();

    const tableHead = ["Đối tác", "Mã đơn hàng", "Tổng tiền", "Số món", "Tem", "Trạng thái đơn"];
    const numColumns = tableHead.length;

    const [tableWidth, setTableWidth] = useState([])
    const [widthArr, setWidthArr] = useState([]);

    useEffect(() => {
        const { width, height } = Dimensions.get("window");
        const calculatedTableWidth = width * 0.96;
        setTableWidth(calculatedTableWidth);
        const columnWidth = calculatedTableWidth / numColumns;
        setWidthArr(Array(numColumns).fill(columnWidth));
    }, [])

    useEffect(() => {
        const loadPrintedLabels = async () => {
            const labels = await AsyncStorage.getPrintedLabels();
            setPrintedLabels(labels);
        };
        loadPrintedLabels();
    }, []);

    useEffect(() => {
        const loadPrinterInfo = async () => {
            const info = await AsyncStorage.getPrinterInfo();
            setPrinterInfo(info);
        };
        loadPrinterInfo();
    }, []);

    useEffect(() => {
        return () => {
            closeConnection();
        }
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

    const handleRowPress = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const printTem = async () => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            });
            return;
        }

        setLoadingVisible(true);
        try {
            const printerInfo = await AsyncStorage.getPrinterInfo();
            if (!printerInfo || !printerInfo.IP || !printerInfo.sWidth || !printerInfo.sHeight) {
                throw new Error('Printer settings not configured');
            }

            // Attempt to connect to printer before printing
            try {
                await netConnect(printerInfo.IP);
            } catch (connectError) {
                console.error('Printer connection error:', connectError);
                throw new Error('Printer settings not configured');
            }

            // Store the original order
            const originalOrder = selectedOrder;
            setPrintingOrder(originalOrder);

            // Print each item separately
            for (let i = 0; i < originalOrder.itemInfoDetail.items.length; i++) {
                // Create a temporary order with just this item
                const tempOrder = {
                    ...originalOrder,
                    itemInfoDetail: {
                        ...originalOrder.itemInfoDetail,
                        items: [originalOrder.itemInfoDetail.items[i]],
                        itemIdx: i,
                        totalItems: originalOrder.itemInfoDetail.items.length,
                    }
                };

                // Update the ViewShot with the temporary order
                setPrintingOrder(tempOrder);

                // Wait for the ViewShot to be ready
                await new Promise(resolve => setTimeout(resolve, 500));

                // Capture and print the label
                const uri = await viewTemShotRef.current.capture();
                const imageInfo = await Image.getSize(uri);
                const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
                await tsplPrintBitmap(
                    Number(printerInfo.sWidth),
                    Number(printerInfo.sHeight),
                    base64,
                    imageInfo.width
                );

                // Add a small delay between prints
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Restore the original order
            setPrintingOrder(null);

            // Update print status after successful print
            await AsyncStorage.setPrintedLabels(originalOrder.displayID);
            setPrintedLabels(prev => [...prev, originalOrder.displayID]);

            Toast.show({
                type: 'success',
                text1: 'In tem thành công'
            });
        } catch (error) {
            console.error('Print error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi in tem: ' + error.message
            });
            if (error.message === 'Printer settings not configured') {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
            setPrintingOrder(null);
        }
    };

    const printBill = async () => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            });
            return;
        }

        setLoadingVisible(true);
        try {
            const printerInfo = await AsyncStorage.getPrinterInfo();
            if (!printerInfo || !printerInfo.IP) {
                throw new Error('Printer settings not configured');
            }

            // Set the order for printing
            setPrintingOrder(selectedOrder);

            // Wait for the ViewShot to be ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Attempt to connect to printer before printing
            try {
                await netConnect(printerInfo.IP);
            } catch (connectError) {
                console.error('Printer connection error:', connectError);
                throw new Error('Printer settings not configured');
            }

            const imageData = await viewBillShotRef.current.capture();
            await printBitmap(imageData, 1, 554, 0);

            Toast.show({
                type: 'success',
                text1: 'In hoá đơn thành công'
            });
        } catch (error) {
            console.error('Print error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi in hoá đơn: ' + error.message
            });
            if (error.message === 'Printer settings not configured') {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
            setPrintingOrder(null);
        }
    };

    const autoPrintOrder = async (order) => {
        if (Platform.OS !== "android") {
            return;
        }

        try {
            const printerInfo = await AsyncStorage.getPrinterInfo();
            if (!printerInfo || !printerInfo.IP || !printerInfo.sWidth || !printerInfo.sHeight) {
                throw new Error('Printer settings not configured');
            }

            // Set the order for printing
            setPrintingOrder(order);

            // Wait for the ViewShot to be ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Connect to printer
            await netConnect(printerInfo.IP);

            // Print the label
            const uri = await viewTemShotRef.current.capture();
            const imageInfo = await Image.getSize(uri);
            const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
            await tsplPrintBitmap(
                Number(printerInfo.sWidth),
                2 * Number(printerInfo.sHeight),
                base64,
                imageInfo.width
            );

            // Update print status
            await AsyncStorage.setPrintedLabels(order.displayID);
            setPrintedLabels(prev => [...prev, order.displayID]);

            Toast.show({
                type: 'success',
                text1: `Đã tự động in tem cho đơn ${order.displayID}`
            });
        } catch (error) {
            console.error('Auto print error:', error);
            if (error.message === 'Printer settings not configured') {
                showSettingPrinter();
            }
        } finally {
            setPrintingOrder(null);
        }
    };

    // Monitor orders for new unprinted items
    useEffect(() => {
        const checkAndPrintNewOrders = async () => {
            if (isAutoPrinting || !orders.length) return;

            setIsAutoPrinting(true);
            try {
                for (const order of orders) {
                    if (!printedLabels.includes(order.displayID)) {
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
    }, [orders, printedLabels]);

    const tableData = orders.map(order => [
        "GRAB",
        order.displayID,
        order.orderValue,
        order.itemInfoDetail?.count,
        <Badge
            text={printedLabels.includes(order.displayID) ? "Đã in" : "Chưa in"}
            colorText={printedLabels.includes(order.displayID) ? "#069C2E" : "#EF0000"}
            colorBg={printedLabels.includes(order.displayID) ? "#CDEED8" : "#FED9DA"}
            width="60%"
            key={order.displayID + "_tem"}
        />,
        <Badge text={getStatusText(order.state)} colorText={getStatusColor(order.state)} colorBg={getStatusColorBg(order.state)} width="80%" key={order.displayID + "_status"} />
    ]);

    return (
        <>
            <ScrollView horizontal>
                <ScrollView style={{ maxHeight: height * 0.6 }}>
                    <View style={{ flex: 1, width: tableWidth }}>
                        <Table borderStyle={styles.border}>
                            <Row data={tableHead} widthArr={widthArr} style={styles.head} textStyle={styles.textHead} />
                            {orders.map((order, index) => (
                                <TouchableOpacity key={index} onPress={() => handleRowPress(order)}>
                                    <Row data={tableData[index]} widthArr={widthArr} style={styles.row} textStyle={styles.text} />
                                </TouchableOpacity>
                            ))}
                        </Table>
                    </View>
                </ScrollView>
            </ScrollView>
            <Modal supportedOrientations={['portrait', 'landscape']} visible={modalVisible} transparent animationType="slide">
                <Toast />
                <Spinner
                    visible={loadingVisible}
                    textContent={''} />
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedOrder && (
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
                                    <Pressable style={[styles.actionButton, styles.printButton]} onPress={() => printTem(selectedOrder)}>
                                        <Text style={styles.actionButtonText}>In Tem</Text>
                                    </Pressable>
                                    <Pressable style={[styles.actionButton, styles.printButton]} onPress={() => printBill(selectedOrder)}>
                                        <Text style={styles.actionButtonText}>In Hoá Đơn</Text>
                                    </Pressable>
                                    <Pressable style={[styles.actionButton, styles.closeButton]} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.actionButtonText}>Đóng</Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
            <ViewShot
                ref={viewTemShotRef}
                options={{ format: "jpg", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    left: printerInfo ? -mmToPixels(Number(printerInfo.sWidth)) : -mmToPixels(50),
                    bottom: 0,
                    width: printerInfo ? mmToPixels(Number(printerInfo.sWidth)) : mmToPixels(50),
                    backgroundColor: 'white',
                }}>{printingOrder && (<PrintTemplate orderPrint={printingOrder} />)}</ViewShot>
            <ViewShot
                ref={viewBillShotRef}
                options={{ format: 'jpg', quality: 1.0, result: 'base64' }}
                style={{
                    position: 'absolute',
                    left: -400,
                    bottom: 0,
                    width: 400,
                    backgroundColor: 'white',
                }}
            >
                {printingOrder && (
                    <BillTemplate selectedOrder={printingOrder} />
                )}
            </ViewShot>
            <Toast />
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
        // padding: 10,
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "90%",
        maxWidth: 500,
        backgroundColor: "#fff",
        borderRadius: 10,
        maxHeight: "90%",
    },
    modalScrollView: {
        flex: 1,
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
});

export default OrderTable;