import React, { useState, useEffect } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Platform, ActivityIndicator, PixelRatio, Image } from "react-native";
import { Table, Row } from "react-native-table-component";
import ViewShot from "react-native-view-shot";
import PrintTemplate from "./TemTemplate";
import { useRef } from "react";
import AsyncStorage from 'store/async_storage/index'
import Toast from 'react-native-toast-message'
import { netConnect, closeConnection, tsplPrintBitmap } from 'rn-xprinter';
import OrderDetailDialog from './OrderDetailDialog';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get("window");

// Convert mm to pixels using device's actual DPI, optimized for tablets
const mmToPixels = (mm) => {
    const { width, height } = Dimensions.get('window');
    const screenWidth = Math.max(width, height);
    const screenHeight = Math.min(width, height);
    const diagonalInches = Math.sqrt(Math.pow(screenWidth / PixelRatio.get(), 2) + Math.pow(screenHeight / PixelRatio.get(), 2)) / 160;
    const actualDpi = Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)) / diagonalInches;
    return Math.round((mm * actualDpi) / 25.4); // 25.4mm = 1 inch
};

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const OfflineOrderTable = ({ orders, onRefresh }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printingOrder, setPrintingOrder] = useState(null);
    const [printedLabels, setPrintedLabels] = useState([]);
    const [printerInfo, setPrinterInfo] = useState(null);
    const viewTemShotRef = useRef();

    const tableHead = ["Mã đơn hàng", "Bàn/Khách", "Tổng tiền", "Số món", "Trạng thái", "Tem", "Đồng bộ", "Thời gian"];
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
            case "failed": return "Thất bại";
            default: return "Không xác định";
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

    const getPrintStatusText = (status) => {
        switch (status) {
            case "printed": return "Đã in";
            case "not_printed": return "Chưa in";
            default: return "Không xác định";
        }
    };

    // Order Status Management
    const getOrderStatusColor = (status) => {
        switch (status) {
            case "WaitingForPayment": return "#FF5722";    // Deep Orange
            case "Paymented": return "#2196F3";           // Blue
            case "WaitingForServe": return "#FF9800";     // Orange
            case "Completed": return "#4CAF50";           // Green
            case "Canceled": return "#F44336";            // Red
            default: return "#9E9E9E";                    // Grey
        }
    };

    const getOrderStatusColorBg = (status) => {
        switch (status) {
            case "WaitingForPayment": return "#FFCCBC";   // Light Deep Orange
            case "Paymented": return "#E3F2FD";          // Light Blue
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

            setPrintingOrder(order);

            // Calculate total number of labels to be printed
            let totalLabels = 0;
            if (order.products) {
                order.products.forEach(product => {
                    // For offline orders, each product gets one label per quantity
                    totalLabels += (product.quanlity || 1);
                });
            }

            let currentLabelIndex = 0;

            // Print each product separately
            if (order.products) {
                for (let i = 0; i < order.products.length; i++) {
                    const product = order.products[i];
                    const quantity = product.quanlity || 1;

                    // Print one label for each quantity of the product
                    for (let q = 0; q < quantity; q++) {
                        // Create a temporary order with just this product
                        const tempOrder = {
                            ...order,
                            // Convert offline order format to print template format
                            displayID: order.session, // Use session as display ID for offline orders
                            serviceType: 'offline', // Mark as offline order
                            tableName: order.shopTableName, // Include table name
                            orderNote: order.orderNote || '', // Include order note for printing
                            itemInfo: {
                                items: [{
                                    name: product.name,
                                    quantity: 1, // Each label represents 1 item
                                    fare: {
                                        priceDisplay: product.price ? product.price.toLocaleString('vi-VN') : '0',
                                        currencySymbol: '₫'
                                    },
                                    comment: product.note || '',
                                    modifierGroups: product.extras ? product.extras.map(extra => ({
                                        modifierGroupName: extra.group_extra_name || 'Extras',
                                        modifiers: [{
                                            modifierName: extra.name,
                                            price: extra.price || 0
                                        }]
                                    })) : [],
                                }],
                                itemIdx: currentLabelIndex,
                                totalItems: totalLabels,
                            },
                            // Add additional info for the template
                            customerInfo: {
                                name: order.shopTableName || 'Khách hàng',
                            }
                        };

                        setPrintingOrder(tempOrder);
                        // Wait for state update to complete
                        await new Promise(resolve => setTimeout(resolve, 200));

                        const uri = await viewTemShotRef.current.capture();
                        const imageInfo = await Image.getSize(uri);
                        const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');
                        await tsplPrintBitmap(
                            Number(printerInfo.sWidth),
                            Number(printerInfo.sHeight),
                            base64,
                            imageInfo.width
                        );
                        await new Promise(resolve => setTimeout(resolve, 500));
                        currentLabelIndex++;
                    }
                }
            }

            // Mark as printed
            await AsyncStorage.setPrintedLabels(order.session);

            Toast.show({
                type: 'success',
                text1: 'In tem thành công'
            });

            // Refresh the data
            if (onRefresh) {
                onRefresh();
            }

        } catch (error) {
            console.error('Print error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi khi in tem',
                text2: error.message === 'Printer settings not configured' ?
                    'Vui lòng cấu hình máy in trước' : error.message
            });
        } finally {
            setLoadingVisible(false);
            await closeConnection();
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

    const tableData = orders.map((order, index) => [
        order.session || `OFF-${index + 1}`,
        order.shopTableName || 'N/A',
        formatCurrency(order.total_amount || 0),
        getItemCount(order).toString(),
        renderStatusSelector(order),
        <TouchableOpacity
            key={`print-${order.session}`}
            onPress={() => printTem(order)}
            style={styles.actionButton}
        >
            <Badge
                text={getPrintStatusText(order.printStatus)}
                colorText={getPrintStatusColor(order.printStatus)}
                colorBg={getPrintStatusColorBg(order.printStatus)}
                width={80}
            />
        </TouchableOpacity>,
        <Badge
            key={`sync-${order.session}`}
            text={getSyncStatusText(order.syncStatus)}
            colorText={getSyncStatusColor(order.syncStatus)}
            colorBg={getSyncStatusColorBg(order.syncStatus)}
            width={90}
        />,
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
                                    onPress={() => handleRowPress(orders[index])}
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

            <OrderDetailDialog
                visible={modalVisible}
                selectedOrder={selectedOrder}
                printedLabels={printedLabels}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedOrder(null);
                }}
                onPrintTem={() => printTem(selectedOrder)}
                onPrintBill={() => {
                    // For offline orders, we might not have bill printing functionality
                    Toast.show({
                        type: 'info',
                        text1: 'Chức năng in hóa đơn chưa hỗ trợ cho đơn offline'
                    });
                }}
                onStatusChange={handleStatusChange}
                loadingVisible={loadingVisible}
                isOfflineOrder={true}
            />

            {/* Loading Modal */}
            {loadingVisible && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <TextNormal style={styles.loadingText}>Đang in tem...</TextNormal>
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
    },
});

export default OfflineOrderTable; 