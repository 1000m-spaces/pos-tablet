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

const { width, height } = Dimensions.get("window");

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OrderTable = ({ orders, showSettingPrinter }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printedLabels, setPrintedLabels] = useState([]);
    const [isAutoPrinting, setIsAutoPrinting] = useState(false);
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

            const uri = await viewTemShotRef.current.capture();
            const imageInfo = await Image.getSize(uri);
            const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
            await tsplPrintBitmap(
                Number(printerInfo.sWidth),
                2 * Number(printerInfo.sHeight),
                base64,
                imageInfo.width
            );

            // Update print status after successful print
            await AsyncStorage.setPrintedLabels(selectedOrder.displayID);
            setPrintedLabels(prev => [...prev, selectedOrder.displayID]);

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
            setSelectedOrder(order);

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
                            <>
                                <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                                <View style={styles.detailRow}><Text style={styles.label}>Mã đơn hàng:</Text><Text>{selectedOrder.displayID}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Tổng tiền:</Text><Text>{selectedOrder.orderValue}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Số món:</Text><Text>{selectedOrder?.itemInfoDetail?.count || 0}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Trạng thái:</Text><Badge text={selectedOrder.state} color={getStatusColor(selectedOrder.state)} /></View>
                                <Text style={styles.modalTitle}>Danh sách món</Text>
                                {selectedOrder?.itemInfoDetail?.items?.map((item, idx) => (
                                    <View key={idx} style={styles.itemRow}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                    </View>
                                ))}
                                <View style={{
                                    display: 'flex',
                                    width: 200,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}>
                                    <Pressable style={styles.printButton} onPress={() => printTem(selectedOrder)}>
                                        <Text style={styles.printButtonText}>Print Tem</Text>
                                    </Pressable>
                                    <Pressable style={styles.printButton} onPress={() => printBill(selectedOrder)}>
                                        <Text style={styles.printButtonText}>Print Bill</Text>
                                    </Pressable>
                                </View>
                                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Đóng</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <ViewShot
                ref={viewTemShotRef}
                options={{ format: "jpg", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    left: -400,
                    bottom: 0,
                    width: 400,
                    backgroundColor: 'white',
                }}>{selectedOrder && (<PrintTemplate orderPrint={selectedOrder} />)}</ViewShot>
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
                {
                    selectedOrder && (
                        <BillTemplate selectedOrder={selectedOrder} />
                    )
                }
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
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 5,
    },
    label: {
        fontWeight: "bold",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 5,
    },
    itemName: {
        fontSize: 16,
    },
    itemQuantity: {
        fontSize: 16,
        fontWeight: "bold",
    },
    printButton: {
        marginTop: 15,
        marginHorizontal: 5,
        backgroundColor: "#FF9800",
        padding: 10,
        borderRadius: 5,
    },
    printButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: "#2196F3",
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default OrderTable;