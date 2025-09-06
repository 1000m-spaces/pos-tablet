import React, { useState, useEffect } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Platform, Image, PixelRatio } from "react-native";
import { Table, Row } from "react-native-table-component";
import ViewShot from "react-native-view-shot";
import PrintTemplate from "./TemTemplate";
import { useRef } from "react";
import AsyncStorage from 'store/async_storage/index'
import BillTemplate from "./BillTemplate";
import Toast from 'react-native-toast-message'
import XPrinter from 'rn-xprinter';
import RNFS from 'react-native-fs';
import OrderDetailDialog from './OrderDetailDialog';

const { width, height } = Dimensions.get("window");

// Convert mm to pixels using device's actual DPI, optimized for tablets
const mmToPixels = (mm) => {
    const { width, height } = Dimensions.get('window');
    const screenWidth = Math.max(width, height); // Use the larger dimension for tablets
    const screenHeight = Math.min(width, height);

    // Get physical dimensions in inches (assuming standard tablet sizes)
    // Most tablets are around 10-12 inches diagonally
    const diagonalInches = Math.sqrt(Math.pow(screenWidth / PixelRatio.get(), 2) + Math.pow(screenHeight / PixelRatio.get(), 2)) / 160;

    // Calculate actual DPI based on physical screen size
    const actualDpi = Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)) / diagonalInches;

    return Math.round((mm * actualDpi) / 25.4); // 25.4mm = 1 inch
};

// Calculate thermal printer width based on paper size
const getThermalPrinterWidth = (paperSize) => {
    // Standard thermal printer widths at 203 DPI
    switch (paperSize) {
        case '58mm':
            return 384; // 58mm ≈ 384 pixels at 203 DPI
        case '80mm':
            return 576; // 80mm ≈ 576 pixels at 203 DPI
        default:
            return 576; // Default to 80mm if not specified
    }
};

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OrderTable = ({ orderType, orders, showSettingPrinter, onConfirmOrder }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printingOrder, setPrintingOrder] = useState(null);
    const [printedLabels, setPrintedLabels] = useState([]);
    const [isAutoPrinting, setIsAutoPrinting] = useState(false);
    const [printerInfo, setPrinterInfo] = useState(null);
    const viewTemShotRef = useRef();
    const viewBillShotRef = useRef();

    // Create printer instances
    const labelPrinterRef = useRef(null);
    const billPrinterRef = useRef(null);

    // Initialize printer instances
    useEffect(() => {
        labelPrinterRef.current = new XPrinter();
        billPrinterRef.current = new XPrinter();

        return () => {
            // Cleanup printer instances
            if (labelPrinterRef.current) {
                labelPrinterRef.current.dispose();
                labelPrinterRef.current = null;
            }
            if (billPrinterRef.current) {
                billPrinterRef.current.dispose();
                billPrinterRef.current = null;
            }
        };
    }, []);

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
            const info = await AsyncStorage.getLabelPrinterInfo();
            setPrinterInfo(info);
        };
        loadPrinterInfo();
    }, []);

    // Helper function to connect to printer based on connection type
    const connectToPrinter = async (printerInstance, printerConfig) => {
        try {
            switch (printerConfig.connectionType) {
                case 'network':
                    if (!printerConfig.IP) {
                        throw new Error('IP address not configured');
                    }
                    return await printerInstance.netConnect(printerConfig.IP);

                case 'usb':
                    if (!printerConfig.usbDevice) {
                        throw new Error('USB device not selected');
                    }
                    return await printerInstance.usbConnect(printerConfig.usbDevice);

                case 'serial':
                    if (!printerConfig.serialPort) {
                        throw new Error('Serial port not selected');
                    }
                    return await printerInstance.serialConnect(printerConfig.serialPort);

                default:
                    throw new Error('Unknown connection type');
            }
        } catch (error) {
            console.error('Printer connection error:', error);
            throw error;
        }
    };



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

            // Attempt to connect to printer before printing
            try {
                await connectToPrinter(labelPrinterRef.current, labelPrinterInfo);
            } catch (connectError) {
                console.error('Printer connection error:', connectError);
                throw new Error('Printer settings not configured');
            }

            // Store the original order
            const originalOrder = selectedOrder;
            setPrintingOrder(originalOrder);

            // Calculate total number of labels to be printed
            let totalLabels = 0;
            originalOrder.itemInfo.items.forEach(item => {
                if (item.separate && item.modifierGroups && item.modifierGroups.length > 0) {
                    totalLabels += item.modifierGroups.length;
                } else {
                    totalLabels += 1;
                }
            });

            let currentLabelIndex = 0;

            // Print each item separately
            for (let i = 0; i < originalOrder.itemInfo.items.length; i++) {
                const item = originalOrder.itemInfo.items[i];

                if (item.separate && item.modifierGroups && item.modifierGroups.length > 0) {
                    // If item has separate flag and modifier groups, print each modifier group
                    for (let j = 0; j < item.modifierGroups.length; j++) {
                        const modifierGroup = item.modifierGroups[j];

                        // Create a temporary order with just this modifier group
                        const tempOrder = {
                            ...originalOrder,
                            itemInfo: {
                                ...originalOrder.itemInfo,
                                items: [{
                                    ...item,
                                    // name: `${item.name} - ${modifierGroup.modifierGroupName}`,
                                    name: `${modifierGroup.modifierGroupName}`,
                                    modifierGroups: [modifierGroup],
                                    itemIdx: currentLabelIndex,
                                    totalItems: totalLabels,
                                }],
                                itemIdx: currentLabelIndex,
                                totalItems: totalLabels,
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
                        await labelPrinterRef.current.tsplPrintBitmap(
                            Number(labelPrinterInfo.sWidth),
                            Number(labelPrinterInfo.sHeight),
                            base64,
                            imageInfo.width
                        );

                        // Add a small delay between prints
                        await new Promise(resolve => setTimeout(resolve, 500));
                        currentLabelIndex++;
                    }
                } else {
                    // Original behavior for non-separate items
                    const tempOrder = {
                        ...originalOrder,
                        itemInfo: {
                            ...originalOrder.itemInfo,
                            items: [{
                                ...item,
                                itemIdx: currentLabelIndex,
                                totalItems: totalLabels,
                            }],
                            itemIdx: currentLabelIndex,
                            totalItems: totalLabels,
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
                    await labelPrinterRef.current.tsplPrintBitmap(
                        Number(labelPrinterInfo.sWidth),
                        Number(labelPrinterInfo.sHeight),
                        base64,
                        imageInfo.width
                    );

                    // Add a small delay between prints
                    await new Promise(resolve => setTimeout(resolve, 500));
                    currentLabelIndex++;
                }
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

            // Set the order for printing
            setPrintingOrder(selectedOrder);

            // Wait for the ViewShot to be ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Attempt to connect to printer before printing
            try {
                const billConfig = {
                    connectionType: billPrinterInfo.billConnectionType || 'network',
                    IP: billPrinterInfo.billIP,
                    usbDevice: billPrinterInfo.billUsbDevice,
                    serialPort: billPrinterInfo.billSerialPort
                };
                await connectToPrinter(billPrinterRef.current, billConfig);
            } catch (connectError) {
                console.error('Printer connection error:', connectError);
                throw new Error('Printer settings not configured');
            }

            const imageData = await viewBillShotRef.current.capture();
            const printerWidth = getThermalPrinterWidth(billPrinterInfo.billPaperSize);
            await billPrinterRef.current.printBitmap(imageData, 1, printerWidth, 0);

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

            // Store the original order
            const originalOrder = order;
            setPrintingOrder(originalOrder);

            // Connect to printer
            await connectToPrinter(labelPrinterRef.current, labelPrinterInfo);

            // Print each item separately
            for (let i = 0; i < originalOrder.itemInfo.items.length; i++) {
                // Create a temporary order with just this item
                const tempOrder = {
                    ...originalOrder,
                    itemInfo: {
                        ...originalOrder.itemInfo,
                        items: [originalOrder.itemInfo.items[i]],
                        itemIdx: i,
                        totalItems: originalOrder.itemInfo.items.length,
                    }
                };

                // Update the ViewShot with the temporary order
                setPrintingOrder(tempOrder);

                // Wait for the ViewShot to be ready
                await new Promise(resolve => setTimeout(resolve, 500));

                // Print the label
                const uri = await viewTemShotRef.current.capture();
                const imageInfo = await Image.getSize(uri);
                const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
                await labelPrinterRef.current.tsplPrintBitmap(
                    Number(labelPrinterInfo.sWidth),
                    Number(labelPrinterInfo.sHeight),
                    base64,
                    imageInfo.width
                );

                // Add a small delay between prints
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Restore the original order
            setPrintingOrder(null);

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
            // Close printer connection after auto printing
            if (labelPrinterRef.current) {
                labelPrinterRef.current.closeConnection();
            }
        }
    };

    // Monitor orders for new unprinted items
    useEffect(() => {
        const checkAndPrintNewOrders = async () => {
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
                    if (order && !printedLabels.includes(order.displayID)) {
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
    }, [orders, printedLabels, orderType]);

    const tableData = orders?.map(order => [
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