import React, { useState, useEffect, useRef } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Text, TouchableOpacity, Platform, Image } from "react-native";
import { Table, Row } from "react-native-table-component";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import brandLogos from 'assets/brand_logos';
import AsyncStorage from 'store/async_storage/index'
import Toast from 'react-native-toast-message'
import OrderDetailDialog from './OrderDetailDialog';
import TableSelector from '../Home/TableSelector';
import printQueueService from '../../services/PrintQueueService';
import { TextNormal } from "common/Text/TextFont";
import { useDispatch, useSelector } from "react-redux";
import { callDriverBack, confirmOrderOnline, getEstimateAhamove, resetConfirmOrderOnline, resetEstimateAhamove } from "store/actions";
import { confirmOrderOnlineStatusSelector, getResultEsstimate, getStatusEstimateAhamove } from "store/selectors";
import Status from "common/Status/Status";
import CryptoJS from 'crypto-js';
import { PARTNER_ID, SECRET_KEY_TAX } from "assets/config";

const { width, height } = Dimensions.get("window");

const Badge = ({ text, colorText, colorBg, width }) => (
    <View style={[styles.badge, { backgroundColor: colorBg, width: width }]}>
        <Text style={[styles.badgeText, { color: colorText }]}>{text}</Text>
    </View>
);

const ServiceIcon = ({ service, shipping_provider, isFoodApp }) => {
    const getServiceConfig = () => {
        const serviceUpper = service?.toUpperCase() || '';
        // For GRAB orders
        if (serviceUpper.includes('GRAB')) {
            return {
                logo: brandLogos.GRAB,
                icon: 'motorbike',
                color: '#00B14F',
                label: 'GRAB'
            };
        }

        // For BE (Baemin) orders
        if (serviceUpper.includes('BE')) {
            return {
                logo: brandLogos.BE,
                icon: 'motorbike',
                color: '#3AC5C9',
                label: 'BE'
            };
        }

        // For Delivery orders
        if (serviceUpper.includes('DELIVERY')) {
            return {
                logo: brandLogos.DELIVERY,
                icon: 'truck-delivery',
                color: '#FF6B35',
                label: 'Delivery'
            };
        }

        // For Pick up orders
        if (serviceUpper.includes('PICK')) {
            return {
                logo: brandLogos.PICKUP || brandLogos['PICK UP'],
                icon: 'store',
                color: '#6C5CE7',
                label: 'Pick up'
            };
        }

        // Default
        return {
            logo: null,
            icon: 'food',
            color: '#666',
            label: service || 'N/A'
        };
    };

    const config = getServiceConfig();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
            {config.logo ? (
                // Display brand logo if available
                <Image
                    source={config.logo}
                    style={{ width: 32, height: 32, resizeMode: 'contain' }}
                />
            ) : (
                // Fallback to icon if no logo
                <MaterialCommunityIcons
                    name={config.icon}
                    size={24}
                    color={config.color}
                />
            )}
        </View>
    );
};

const OrderTable = ({ orderType, orders, showSettingPrinter, onConfirmOrder, isFoodApp, historyDelivery, dataShippingSuccess, confirmedOrderId, setConfirmedOrderId, orderTableMapRef, shop }) => {
    const dispatch = useDispatch();
    const confirmOrderStatus = useSelector(confirmOrderOnlineStatusSelector);
    const isResultEsstimate = useSelector(getResultEsstimate);
    const isStatusEstimateAhamove = useSelector(getStatusEstimateAhamove);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [printedLabels, setPrintedLabelsState] = useState([]);
    const [isAutoPrinting, setIsAutoPrinting] = useState(false);
    const [currenData, setCurrentData] = useState([]);
    const [count, setCount] = useState(1);
    const confirmedOrderIdRef = useRef(null); // Use ref to store order ID immediately
    const autoPrintLockRef = useRef(false); // Synchronous lock to prevent concurrent auto-print execution for new orders
    const confirmPrintLockRef = useRef(false); // Synchronous lock to prevent concurrent auto-print after confirmation
    const [showTableSelector, setShowTableSelector] = useState(false);
    const [orderToConfirm, setOrderToConfirm] = useState(null);
    // orderTableMapRef is now passed as prop from parent to persist across unmounts
    // Fallback to local ref if not provided (for backward compatibility)
    const localOrderTableMapRef = useRef({});
    const tableMapRef = orderTableMapRef || localOrderTableMapRef;

    // Build table header based on order type
    const tableHead = ["Đối tác", "Mã đơn hàng", "Tem", "Trạng thái đơn", "Số món", "Số tiền"];
    if (!isFoodApp) {
        if (historyDelivery) {
            tableHead.push("Call");
        } else {
            tableHead.push("Xác nhận");
        }
    }
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

    // Load printed labels on mount for initial render state
    useEffect(() => {
        const loadPrintedLabels = async () => {
            const labels = await AsyncStorage.getPrintedLabels();
            setPrintedLabelsState(labels);
        };
        loadPrintedLabels();
    }, []);

    // Listen for print queue task completion to update UI in real-time
    useEffect(() => {
        const handlePrintQueueEvent = async (event, data) => {
            if (event === 'taskCompleted' && data?.queueType === 'label') {
                // Reload printed labels from storage when a label task completes
                const labels = await AsyncStorage.getPrintedLabels();
                setPrintedLabelsState(labels);
                console.log('OrderTable: Updated printed labels after task completion');
            }
        };

        const unsubscribe = printQueueService.addListener(handlePrintQueueEvent);
        return () => unsubscribe();
    }, []);

    // Sync ref with prop (lifted state from AppOrders)
    useEffect(() => {
        confirmedOrderIdRef.current = confirmedOrderId;
        console.log('confirmedOrderId prop changed to:', confirmedOrderId);
    }, [confirmedOrderId]);

    // Auto-print bill and label after successful order confirmation
    useEffect(() => {
        const autoPrintAfterConfirm = async () => {
            const orderId = confirmedOrderIdRef.current;
            console.log('Confirm status changed:', confirmOrderStatus, 'for order:', orderId);

            // Only proceed if we have a confirmed order ID
            if (!orderId) {
                return; // Nothing to process
            }

            if (confirmOrderStatus === Status.SUCCESS) {
                // Synchronous lock check - prevents race conditions
                if (confirmPrintLockRef.current) {
                    console.log('Confirm auto-print already running, skipping this execution');
                    return;
                }

                // Find the confirmed order
                const confirmedOrder = orders.find(order => order.displayID === orderId);
                if (!confirmedOrder) {
                    console.warn('Confirmed order not found in orders list:', orderId);
                    confirmedOrderIdRef.current = null;
                    setConfirmedOrderId(null);
                    // Clean up table info from map
                    if (orderId && tableMapRef.current[orderId]) {
                        delete tableMapRef.current[orderId];
                        console.log('Cleaned up table info for missing order:', orderId);
                    }
                    dispatch(resetConfirmOrderOnline());
                    return;
                }

                // Acquire synchronous lock BEFORE setting async state
                confirmPrintLockRef.current = true;
                setIsAutoPrinting(true);
                console.log('Starting auto-print for order:', orderId);

                Toast.show({
                    type: 'success',
                    text1: 'Đơn hàng đã xác nhận',
                    text2: 'Đang tự động in tem và hóa đơn...',
                    position: 'bottom',
                });

                try {
                    // Get table info from map using orderId
                    const orderKey = String(orderId); // Ensure consistent string comparison
                    const tableInfo = tableMapRef.current[orderKey];
                    // Merge table info into order before printing
                    let orderWithTableInfo;
                    if (tableInfo) {
                        orderWithTableInfo = {
                            ...confirmedOrder,
                            shopTableid: tableInfo.shoptableid || confirmedOrder.shopTableid || "0",
                            shopTableName: tableInfo.shoptablename || confirmedOrder.shopTableName || "",
                            shoptablename: tableInfo.shoptablename || confirmedOrder.shoptablename || "",
                            table: tableInfo.shoptablename || confirmedOrder.table || "",
                            tableName: tableInfo.shoptablename || confirmedOrder.tableName || ""
                        };
                    } else {
                        orderWithTableInfo = confirmedOrder;
                    }

                    // Auto-print label first
                    await printTem(orderWithTableInfo);

                    // Then auto-print bill
                    await printBill(orderWithTableInfo);

                    console.log('Auto-print completed for order:', orderId);
                } catch (error) {
                    console.error('Auto-print error:', error);
                } finally {
                    // Release lock in finally block to ensure it's always released
                    confirmPrintLockRef.current = false;
                    setIsAutoPrinting(false);
                    confirmedOrderIdRef.current = null;
                    setConfirmedOrderId(null);
                    // Clean up table info from map after printing
                    if (orderId && tableMapRef.current[orderId]) {
                        delete tableMapRef.current[orderId];
                        console.log('Cleaned up table info for order:', orderId);
                    }
                    // Reset confirm status
                    dispatch(resetConfirmOrderOnline());
                }
            } else if (confirmOrderStatus === Status.ERROR) {
                console.error('Order confirmation failed for:', orderId);
                Toast.show({
                    type: 'error',
                    text1: 'Xác nhận đơn hàng thất bại',
                    position: 'bottom',
                });
                // Release lock on error
                confirmPrintLockRef.current = false;
                confirmedOrderIdRef.current = null;
                setConfirmedOrderId(null);
                // Clean up table info from map on error
                if (orderId && tableMapRef.current[orderId]) {
                    delete tableMapRef.current[orderId];
                    console.log('Cleaned up table info for failed order:', orderId);
                }
                dispatch(resetConfirmOrderOnline());
            }
        };

        autoPrintAfterConfirm();
    }, [confirmOrderStatus]);


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
            case "ASSIGNING": return "Đang tìm tài xế";
            case "COMPLETED": return "Đã hoàn thành";
            case "IN PROCESS": return "Đơn đang giao";
            case "ACCEPTED": return "Tài xế đã nhận";
            case "CANCELLED": return "Không tìm thấy Tài Xế";
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

                Toast.show({
                    type: 'success',
                    text1: `Đã xếp hàng in ${labelTaskIds.length} tem`,
                    text2: 'Tem sẽ được in tự động'
                });
            } else {
                // Fallback to single label task
                const taskId = printQueueService.addPrintTask({
                    type: 'label',
                    order: targetOrder,
                    priority: 'high'
                });

                Toast.show({
                    type: 'success',
                    text1: 'Đã xếp hàng in tem',
                    text2: 'Tem sẽ được in tự động'
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
            // Use global.queueMultipleLabels for multiple products if available
            if (global.queueMultipleLabels && order.itemInfo?.items && order.itemInfo.items.length > 0) {
                const labelTaskIds = await global.queueMultipleLabels(order, labelPrinterInfo);
                Toast.show({
                    type: 'success',
                    text1: `Đã tự động xếp hàng in ${labelTaskIds.length} tem cho đơn ${order.displayID}`,
                    text2: 'Tem sẽ được in tự động'
                });
            } else {
                // Fallback to single label task
                const taskId = printQueueService.addPrintTask({
                    type: 'label',
                    order: order,
                    priority: 'high'
                });
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
            // Synchronous lock check - prevents race conditions
            if (autoPrintLockRef.current) {
                console.log("Auto-print already running, skipping this execution");
                return;
            }

            // Early return checks before any async operations
            if (isAutoPrinting || !orders.length) return;
            if (orderType != 1) return;

            // Check if auto-print is enabled in printer settings
            const labelPrinterInfo = await AsyncStorage.getLabelPrinterInfo();
            if (!labelPrinterInfo?.autoPrint) return;

            // Acquire synchronous lock BEFORE setting async state
            autoPrintLockRef.current = true;
            setIsAutoPrinting(true);

            try {
                // Get fresh printed labels from AsyncStorage (date-aware, returns today's labels only)
                const currentPrintedLabels = await AsyncStorage.getPrintedLabels();

                for (const order of orders) {
                    if (!order || !order.displayID) continue;
                    const orderIdentifier = order.displayID;
                    // Multiple checks to prevent duplicate printing:
                    // 1. Check if already printed (from AsyncStorage)
                    const isAlreadyPrinted = currentPrintedLabels.includes(orderIdentifier);
                    // 2. Check if already in print queue (any queue type)
                    const isInQueue = printQueueService.isOrderInAnyQueue(orderIdentifier);
                    // 3. Check against current component state for additional safety
                    const isInLocalState = printedLabels.includes(orderIdentifier);
                    if (!isAlreadyPrinted && !isInQueue && !isInLocalState) {
                        console.log("Auto print order:", orderIdentifier, {
                            printed: isAlreadyPrinted,
                            inQueue: isInQueue,
                            inLocalState: isInLocalState
                        });
                        await autoPrintOrder(order);
                        // Add a small delay between prints to prevent overwhelming the queue
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        console.log("Skipping auto print for order:", orderIdentifier, {
                            alreadyPrinted: isAlreadyPrinted,
                            inQueue: isInQueue,
                            inLocalState: isInLocalState
                        });
                    }
                }
            } finally {
                // Release lock in finally block to ensure it's always released
                autoPrintLockRef.current = false;
                setIsAutoPrinting(false);
            }
        };
        if (isFoodApp) {
            checkAndPrintNewOrders();
        }
    }, [orders, orderType, printedLabels]); // Added printedLabels to dependencies

    // confirm order - require table selection first
    const handleConfirmOrder = (orderId) => {
        console.log('handleConfirmOrder called with orderId:', orderId);
        // Find the order
        const order = orders.find(o => o.displayID === orderId);
        if (!order) {
            Toast.show({
                type: 'error',
                text1: 'Không tìm thấy đơn hàng',
                position: 'bottom',
            });
            return;
        }
        // Store order and show table selector
        setOrderToConfirm(order);
        setShowTableSelector(true);
    };

    // Handle table selection for order confirmation
    const onSelectTable = (table) => {
        setShowTableSelector(false);

        if (!orderToConfirm) {
            Toast.show({
                type: 'error',
                text1: 'Không có đơn hàng để xác nhận',
                position: 'bottom',
            });
            return;
        }
        // Store table info in map keyed by order ID - this persists across re-renders
        const tableInfo = {
            shoptableid: table.shoptableid,
            shoptablename: table.shoptablename
        };

        // Store with the EXACT order ID from the order object
        const orderKey = String(orderToConfirm.displayID); // Ensure it's a string
        tableMapRef.current[orderKey] = tableInfo;
        // Set ref immediately (synchronous) - survives re-renders
        confirmedOrderIdRef.current = orderToConfirm.displayID;
        // Set lifted state if available (from AppOrders)
        if (setConfirmedOrderId) {
            setConfirmedOrderId(orderToConfirm.displayID);
        }

        // Dispatch action with table info
        dispatch(confirmOrderOnline({
            order_id: orderToConfirm.displayID,
            shopTableid: table.shoptableid,
            shopTableName: table.shoptablename
        }));
        Toast.show({
            type: 'info',
            text1: `Đang xác nhận đơn hàng cho bàn ${table.shoptablename}...`,
            position: 'bottom',
        });
        // Clear order to confirm
        setOrderToConfirm(null);
    };

    // Close table selector modal
    const closeTableSelector = () => {
        setShowTableSelector(false);
        setOrderToConfirm(null);
    };

    const tableData = orders?.map((order, index) => {
        const row = [
            // Đối tác
            <ServiceIcon
                service={order.service}
                shipping_provider={order?.shipping_provider}
                isFoodApp={isFoodApp}
                key={order.displayID + "_service"}
            />,
            // Mã đơn hàng
            order.displayID,
            // Tem
            <Badge
                text={printedLabels.includes(order.displayID) ? "Đã in" : "Chưa in"}
                colorText={printedLabels.includes(order.displayID) ? "#069C2E" : "#EF0000"}
                colorBg={printedLabels.includes(order.displayID) ? "#CDEED8" : "#FED9DA"}
                width="60%"
                key={order.displayID + "_tem"}
            />,
            // Trạng thái đơn
            <Badge text={getStatusText(order.state)} colorText={getStatusColor(order.state)} colorBg={getStatusColorBg(order.state)} width="80%" key={order.displayID + "_status"} />,
            // Số món
            order.itemInfo?.items?.length,
            // Số tiền
            order.orderValue,
        ];

        // Add Call/Xác nhận button at the end if not a food app order
        if (!isFoodApp) {
            if (historyDelivery) {
                // Add "Call" button for delivery history
                row.push(
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', height: '80%', width: '60%', backgroundColor: '#19b400', borderRadius: 10 }}
                            onPress={() => checkShipFee(dataShippingSuccess[index])}>
                            <TextNormal>Gọi tài xế</TextNormal>
                        </TouchableOpacity>
                    </View>
                );
            } else {
                // Add "Xác nhận" button for new orders
                row.push(
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', height: '80%', width: '60%', backgroundColor: '#19b400', borderRadius: 10 }}
                            onPress={() => handleConfirmOrder(order.displayID)}>
                            <TextNormal>Xác nhận đơn</TextNormal>
                        </TouchableOpacity>
                    </View>
                );
            }
        }

        return row;
    });

    const checkShipFee = async (order) => {
        setCurrentData(order);
        const metadata = order.metadata ? JSON.parse(order.metadata) : {};
        console.log('checkShipFee order:', order, 'metadata:', metadata);
        console.log('checkShipFee shop:', shop);
        const body = {
            branch_id: Number(order.rest_id) || 249,
            brand_id: Number(PARTNER_ID) || 107,
            merchant_id: Number(order.shopowner_id) || 133,
            user_id: order?.cust_id || '0',
            drop_off: {
                address: metadata.deliver_address,
                lat: `${metadata.deliver_latitude}`,
                lng: `${metadata.deliver_longitude}`,
                short_address: metadata.deliver_address,
                mobile: order.userphone,
            },
            pick_up: {
                address: shop.addr,
                lat: shop.latitude,
                lng: shop.longitude,
                short_address: shop.addr,
            },
            quantity: order.products.length,
            requests: ['string'],
            service_id: 'string',
        };
        console.log('body ahamove estimate:', body);
        dispatch(getEstimateAhamove(body));
    };

    // Gọi tài xế Ahamove
    useEffect(() => {
        if (isStatusEstimateAhamove === Status.SUCCESS) {
            dispatch(resetEstimateAhamove());
            postCallDriverBack();
        }
    }, [isStatusEstimateAhamove]);

    const postCallDriverBack = () => {
        setCount(count + 1);
        // Parse metadata và request_products nếu có
        const metadata = currenData.metadata ? JSON.parse(currenData.metadata) : {};
        const requestProducts = currenData.request_products
            ? JSON.parse(currenData.request_products)
            : [];

        const dataPayload = {
            branch_id: Number(currenData.rest_id) || 0,
            brand_id: Number(currenData.partner_id) || 0, // ❓ cần xác nhận: brand_id có phải là partner_id không?
            brand_order_id: currenData.id + '-' + count || currenData.orderid + '-' + count || "",
            drop_off: {
                address: metadata.deliver_address || currenData.shipping_address || "",
                apt_number: metadata.deliver_detail_address || "",
                building: "", // ❓ chưa thấy thông tin building
                cod: Number(currenData.price_paid) || 0, // hoặc currenData.shipping_fee?
                lat: metadata.deliver_latitude || "",
                lng: metadata.deliver_longitude || "",
                mobile: metadata.deliver_phone || currenData.userphone || "",
                name: metadata.deliver_name || "",
                remarks: currenData.note_manager || "",
                require_pod: true, // mặc định true như mẫu
            },
            images: [], // ❓ không thấy thông tin hình ảnh
            items: (currenData.products || []).map((p) => ({
                _id: p.prod_id || "string",
                name: p.prodname || "",
                num: Number(p.quantity) || 0,
                price: Number(p.paid_price) || 0,
            })),
            merchant_id: Number(currenData.shopowner_id) || 0,
            note: currenData.description || "",
            partner_user_id: isResultEsstimate.partner_user_id || "",
            pick_up: {
                address: shop.addr, // ❓ không có thông tin pickup → có thể lấy từ cấu hình
                apt_number: "",
                building: "",
                cod: 0,
                lat: shop.latitude, // ❓ nếu có toạ độ cửa hàng
                lng: shop.longitude,
                mobile: shop.mobile, // ❓ số điện thoại cửa hàng
                name: currenData.tableName || "Store",
                remarks: "",
                require_pod: true,
            },
            promo_code: "", // ❓ không thấy mã giảm giá
            remarks: currenData.note_manager || "",
            requests: requestProducts.map((r) => ({
                _id: r.pid?.toString() || "",
                num: Number(r.quantity) || 0,
            })),
            total_price: Number(currenData.price_total) || 0,
            user_id: currenData.cust_id?.toString() || "",
        };

        const message =
            SECRET_KEY_TAX +
            '||' +
            currenData?.partner_id +
            '||' +
            currenData?.rest_id +
            '||' +
            currenData?.id + '-' + count;
        // Tạo HMAC-SHA256
        console.log('message:', message);
        const hmac = CryptoJS.HmacSHA256(message, SECRET_KEY_TAX);
        // Chuyển sang định dạng hex
        const hexString = hmac.toString(CryptoJS.enc.Hex);

        console.log('postCallDriverBack currenData:', dataPayload);
        console.log('postCallDriverBack checksum:', hexString);
        dispatch(callDriverBack(dataPayload, hexString));
    }


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

            <TableSelector
                isVisible={showTableSelector}
                close={closeTableSelector}
                currentOrder={{
                    orderType: "1", // Force table selection requirement
                    table: "",
                    tableId: ""
                }}
                onSelectTable={onSelectTable}
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