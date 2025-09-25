import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Platform, ActivityIndicator, PixelRatio, Image } from "react-native";
import { Table, Row } from "react-native-table-component";
import ViewShot from "react-native-view-shot";
import PrintTemplate from "./TemTemplate";
import { useRef } from "react";
import AsyncStorage from 'store/async_storage/index'
import Toast from 'react-native-toast-message'
import OrderDetailDialog from './OrderDetailDialog';
import BillTemplate from "./BillTemplate";
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import RNFS from 'react-native-fs';
import { useDispatch } from 'react-redux';
import XPrinter from 'rn-xprinter';
import { getOrderIdentifierForPrinting } from '../../utils/orderUtils';

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

const OfflineOrderTable = ({ orders, onRefresh, selectedDate, showSettingPrinter }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printingOrder, setPrintingOrder] = useState(null);
    const [printedLabels, setPrintedLabelsState] = useState([]);
    const [printerInfo, setPrinterInfo] = useState(null);
    const viewTemShotRef = useRef();
    const viewBillShotRef = useRef();
    const dispatch = useDispatch();

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

    const tableHead = ["Mã đơn hàng", "Bàn/Khách", "Tổng tiền", "Số món", "Trạng thái", "Tem", "Bill", "Đồng bộ", "Thời gian"];
    const numColumns = tableHead.length;

    const [tableWidth, setTableWidth] = useState([])
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
            // dispatch(syncPendingOrdersAction());
            // Optionally refresh local data after dispatching sync action
            if (onRefresh) {
                onRefresh();
            }
        }, 30000); // 60,000 ms = 1 minute

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [dispatch, onRefresh]);

    useEffect(() => {
        const { width, height } = Dimensions.get("window");
        const calculatedTableWidth = width - width * 0.09;
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
            const connectionType = printerConfig.connectionType || printerConfig.billConnectionType;
            switch (connectionType) {
                case 'network':
                    const ipAddress = printerConfig.IP || printerConfig.billIP;
                    if (!ipAddress) {
                        throw new Error('IP address not configured');
                    }
                    return await printerInstance.netConnect(ipAddress);

                case 'usb':
                    const usbDevice = printerConfig.usbDevice || printerConfig.billUsbDevice;
                    if (!usbDevice) {
                        throw new Error('USB device not selected');
                    }
                    return await printerInstance.usbConnect(usbDevice);

                case 'serial':
                    const serialPort = printerConfig.serialPort || printerConfig.billSerialPort;
                    if (!serialPort) {
                        throw new Error('Serial port not selected');
                    }
                    return await printerInstance.serialConnect(serialPort);

                default:
                    throw new Error('Unknown connection type');
            }
        } catch (error) {
            console.error('Printer connection error:', error);
            throw error;
        }
    };





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
            const originalOrder = order || selectedOrder;
            setPrintingOrder(originalOrder);

            // Calculate total number of labels to be printed
            let totalLabels = 0;
            if (originalOrder.products) {
                originalOrder.products.forEach(product => {
                    // For offline orders, each product gets one label per quantity
                    totalLabels += (product.quanlity || 1);
                });
            }

            let currentLabelIndex = 0;

            // Print each product separately
            if (originalOrder.products) {
                for (let i = 0; i < originalOrder.products.length; i++) {
                    const product = originalOrder.products[i];
                    const quantity = product.quanlity || 1;

                    // Print one label for each quantity of the product
                    for (let q = 0; q < quantity; q++) {
                        const tempOrder = {
                            ...originalOrder,
                            // Basic order identification
                            displayID: originalOrder.session,
                            bill_id: originalOrder.session,
                            session: originalOrder.session,

                            // Service and location information
                            serviceType: 'offline',
                            tableName: originalOrder.shoptablename,
                            table: originalOrder.shoptablename,
                            shoptablename: originalOrder.shoptablename,
                            shopTableid: originalOrder.shopTableid || "0",

                            // Timing information
                            date: originalOrder.created_at || originalOrder.timestamp || new Date().toISOString(),
                            created_at: originalOrder.created_at || originalOrder.timestamp || new Date().toISOString(),
                            timestamp: originalOrder.created_at || originalOrder.timestamp || new Date().toISOString(),

                            // Order notes and metadata
                            note: originalOrder.orderNote || originalOrder.note || '',
                            orderNote: originalOrder.orderNote || originalOrder.note || '',

                            // Shop and user information
                            shopid: originalOrder.shopid || "246",
                            userid: originalOrder.userid || "1752",
                            roleid: originalOrder.roleid || "4",

                            // Payment and pricing information
                            price_paid: originalOrder.price_paid || originalOrder.total_amount || 0,
                            total_amount: originalOrder.total_amount || 0,
                            orderValue: originalOrder.total_amount || 0,
                            transType: originalOrder.transType || "41",
                            chanel_type_id: originalOrder.chanel_type_id || "1",

                            // Channel information (for delivery apps)
                            chanel_name: originalOrder.chanel_name || 'POS',
                            foodapp_order_id: originalOrder.foodapp_order_id || '',
                            package_id: originalOrder.package_id || 0,

                            // Status information
                            status: originalOrder.status || "pending",
                            orderStatus: originalOrder.orderStatus || "Paymented",
                            syncStatus: originalOrder.syncStatus || "pending",

                            // Enhanced item information structure
                            itemInfo: {
                                items: [{
                                    name: product.name,
                                    item_name: product.name,
                                    quantity: 1, // Each label represents 1 item
                                    amount: 1,
                                    fare: {
                                        priceDisplay: product.price ? product.price.toLocaleString('vi-VN') : '0',
                                        currencySymbol: '₫',
                                        price: product.price || 0
                                    },
                                    price: product.price || 0,
                                    comment: product.note || '',
                                    note_prod: product.note || '',
                                    product_id: product.product_id || product.id,

                                    // Enhanced modifier information
                                    modifierGroups: product.extras ? product.extras.map(extra => ({
                                        modifierGroupName: extra.group_extra_name || 'Extras',
                                        groupName: extra.group_extra_name || 'Extras',
                                        modifiers: [{
                                            modifierName: extra.name,
                                            name: extra.name,
                                            price: extra.price || 0,
                                            priceDisplay: extra.price ? extra.price.toLocaleString('vi-VN') : '0'
                                        }]
                                    })) : [],

                                    // Flattened modifier strings for easier template access
                                    stringName: product.extras ? product.extras.map(extra => extra.name).join(' / ') : '',
                                    option: product.extras ? product.extras.filter(extra => extra.type === 'option').map(extra => extra.name).join(' / ') : '',
                                    extrastring: product.extras ? product.extras.filter(extra => extra.type !== 'option').map(extra => extra.name).join(' / ') : '',
                                }],
                                itemIdx: currentLabelIndex + 1, // Use 1-based indexing for display
                                totalItems: totalLabels,
                            },

                            // Direct decals format for immediate template compatibility
                            decals: [{
                                item_name: product.name,
                                amount: 1,
                                note_prod: product.note || '',
                                stringName: product.extras ? product.extras.map(extra => extra.name).join(' / ') : '',
                                option: product.extras ? product.extras.filter(extra => extra.type === 'option').map(extra => extra.name).join(' / ') : '',
                                extrastring: product.extras ? product.extras.filter(extra => extra.type !== 'option').map(extra => extra.name).join(' / ') : '',
                                itemIdx: currentLabelIndex + 1, // Use 1-based indexing for display
                                totalItems: totalLabels,
                                price: product.price || 0,
                                priceDisplay: product.price ? product.price.toLocaleString('vi-VN') : '0₫',
                                product_id: product.product_id || product.id,
                            }],

                            // Customer and service information
                            customerInfo: {
                                name: originalOrder.shoptablename || 'Khách hàng',
                                table: originalOrder.shoptablename,
                                phone: originalOrder.customerPhone || '',
                                address: originalOrder.customerAddress || '',
                            },

                            // Additional metadata for comprehensive printing
                            products: originalOrder.products, // Keep full product array for reference
                            offline_code: originalOrder.offline_code || originalOrder.session,
                            offlineOrderId: originalOrder.offlineOrderId || originalOrder.session,

                            // Fees and discounts
                            svFee: originalOrder.svFee || "0",
                            svFee_amount: originalOrder.svFee_amount || 0,
                            phuthu: originalOrder.phuthu || 0,
                            fix_discount: originalOrder.fix_discount || 0,
                            perDiscount: originalOrder.perDiscount || 0,

                            // Print tracking
                            printStatus: originalOrder.printStatus || "not_printed",
                            currentItemIndex: currentLabelIndex + 1,
                            isPartialPrint: true, // Indicates this is one item from a multi-item order
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
            }

            // Restore the original order
            setPrintingOrder(null);

            // Update print status after successful print
            const orderIdentifier = getOrderIdentifierForPrinting(originalOrder, true); // true for offline orders
            await AsyncStorage.setPrintedLabels(orderIdentifier);
            setPrintedLabelsState(prev => [...prev, orderIdentifier]);

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
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi in tem: ' + error.message
            });
            if (error.message === 'Printer settings not configured' && showSettingPrinter) {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
            setPrintingOrder(null);
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

            Toast.show({
                type: 'info',
                text1: 'Đang in bill...',
                text2: 'Vui lòng đợi'
            });

            // Convert offline order to format compatible with BillTemplate
            const billOrder = {
                ...order,
                displayID: order.session,
                orderValue: order.total_amount,
                itemInfo: {
                    items: order.products ? order.products.map(product => ({
                        name: product.name,
                        quantity: product.quanlity || 1,
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
                    })) : []
                },
                customerInfo: {
                    name: order.shoptablename || 'Khách hàng',
                },
                serviceType: 'offline',
                tableName: order.shoptablename,
            };
            // Set the order for printing
            setPrintingOrder(billOrder);

            // Wait for the ViewShot to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Attempt to connect to printer before printing
            try {
                await connectToPrinter(billPrinterRef.current, billPrinterInfo);
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
            if (error.message === 'Printer settings not configured' && showSettingPrinter) {
                showSettingPrinter();
            }
        } finally {
            setLoadingVisible(false);
            setPrintingOrder(null);
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

            <ViewShot
                ref={viewTemShotRef}
                options={{ format: "jpg", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    left: -9999,
                    top: -9999,
                    width: printerInfo ? mmToPixels(Number(printerInfo.sWidth) - 2) : mmToPixels(50 - 2),
                    backgroundColor: 'white',
                    opacity: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                }}>{printingOrder && (<PrintTemplate orderPrint={printingOrder} />)}</ViewShot>

            <ViewShot
                ref={viewBillShotRef}
                options={{ format: 'jpg', quality: 1.0, result: 'base64' }}
                style={{
                    position: 'absolute',
                    left: -9999,
                    top: -9999,
                    width: 400,
                    backgroundColor: 'white',
                    opacity: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
            >
                {printingOrder && (
                    <BillTemplate selectedOrder={printingOrder} />
                )}
            </ViewShot>

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
    }
});

export default OfflineOrderTable; 