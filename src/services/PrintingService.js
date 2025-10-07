import { Platform, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import XPrinter from 'rn-xprinter';
import RNFS from 'react-native-fs';
import AsyncStorage from 'store/async_storage';
import { getOrderIdentifierForPrinting } from '../utils/orderUtils';

class PrintingService {
    constructor() {
        this.labelPrinter = null;
        this.billPrinter = null;
        this.isInitialized = false;
    }

    // Initialize printer instances
    initialize() {
        if (!this.isInitialized) {
            this.labelPrinter = new XPrinter();
            this.billPrinter = new XPrinter();
            this.isInitialized = true;
        }
    }

    // Cleanup printer instances
    dispose() {
        if (this.labelPrinter) {
            this.labelPrinter.dispose();
            this.labelPrinter = null;
        }
        if (this.billPrinter) {
            this.billPrinter.dispose();
            this.billPrinter = null;
        }
        this.isInitialized = false;
    }

    // Helper function to connect to printer based on connection type
    async connectToPrinter(printerInstance, printerConfig) {
        try {
            switch (printerConfig.connectionType || printerConfig.billConnectionType) {
                case 'network':
                    const ip = printerConfig.IP || printerConfig.billIP;
                    if (!ip) throw new Error('IP address not configured');
                    return await printerInstance.netConnect(ip);

                case 'usb':
                    const usbDevice = printerConfig.usbDevice || printerConfig.billUsbDevice;
                    if (!usbDevice) throw new Error('USB device not selected');
                    return await printerInstance.usbConnect(usbDevice);

                case 'serial':
                    const serialPort = printerConfig.serialPort || printerConfig.billSerialPort;
                    if (!serialPort) throw new Error('Serial port not selected');
                    return await printerInstance.serialConnect(serialPort);

                default:
                    throw new Error('Unknown connection type');
            }
        } catch (error) {
            console.error('Printer connection error:', error);
            throw error;
        }
    }

    // Calculate thermal printer width based on paper size
    getThermalPrinterWidth(paperSize) {
        switch (paperSize) {
            case '58mm':
                return 384; // 58mm ≈ 384 pixels at 203 DPI
            case '80mm':
                return 576; // 80mm ≈ 576 pixels at 203 DPI
            default:
                return 576; // Default to 80mm if not specified
        }
    }

    // Transform order data from PaymentCart format to printing format
    transformOrderForPrinting(orderData) {
        return {
            displayID: orderData.offlineOrderId || orderData.session,
            session: orderData.session,
            created_at: orderData.created_at || new Date().toISOString(),
            shoptablename: orderData.shoptablename || 'Mang về',
            tableName: orderData.shoptablename || 'Mang về', // For TemTemplate compatibility
            total_amount: orderData.total_amount,
            serviceType: 'offline', // Default service type
            orderNote: orderData.note || '', // Order-level note
            itemInfo: {
                items: orderData.products.map((product, index) => ({
                    name: product.name,
                    quantity: product.quanlity || product.quantity,
                    amount: product.amount,
                    note: product.note || '',
                    comment: product.note || '', // For TemTemplate compatibility
                    extras: product.extras || [],
                    option: product.option || [],
                    modifierGroups: this.transformExtrasToModifierGroups(product.extras),
                    separate: false, // Set to true if you want separate labels for extras
                    itemIdx: index,
                    totalItems: orderData.products.length,
                    // Add fare property for TemTemplate compatibility
                    fare: {
                        priceDisplay: this.formatPrice(product.amount || 0),
                        currencySymbol: 'đ'
                    }
                }))
            }
        };
    }

    // Format price for display
    formatPrice(amount) {
        if (!amount) return '0';
        return Math.round(amount).toLocaleString('vi-VN');
    }

    // Transform extras to modifier groups format
    transformExtrasToModifierGroups(extras) {
        if (!extras || extras.length === 0) return [];

        return extras.map(extra => ({
            modifierGroupName: extra.name || extra.group_extra_name,
            modifiers: [{
                name: extra.name,
                modifierName: extra.name, // For TemTemplate compatibility
                price: extra.price || 0
            }]
        }));
    }

    // Print labels with ViewShot capture
    async printLabels(orderData, viewShotRef, showSettingPrinter = null) {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            });
            return false;
        }

        try {
            this.initialize();

            const labelPrinterInfo = await AsyncStorage.getLabelPrinterInfo();

            // Validate printer configuration
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

            // Connect to printer
            try {
                await this.connectToPrinter(this.labelPrinter, labelPrinterInfo);
            } catch (connectError) {
                console.error('Printer connection error:', connectError);
                throw new Error('Printer settings not configured');
            }

            // Transform order data to printing format
            const transformedOrder = this.transformOrderForPrinting(orderData);
            console.log('Transformed Order:', transformedOrder, viewShotRef);

            // Print each item
            for (let i = 0; i < transformedOrder.itemInfo.items.length; i++) {
                const item = transformedOrder.itemInfo.items[i];

                // Create temporary order for this item
                const tempOrder = {
                    ...transformedOrder,
                    itemInfo: {
                        ...transformedOrder.itemInfo,
                        itemIdx: i, // TemTemplate expects this at itemInfo level
                        totalItems: transformedOrder.itemInfo.items.length, // TemTemplate expects this at itemInfo level
                        items: [{
                            ...item,
                            itemIdx: i,
                            totalItems: transformedOrder.itemInfo.items.length,
                        }],
                    }
                };

                // Set printing order (this should be handled by the component using this service)
                if (viewShotRef && viewShotRef.setPrintingOrder) {
                    viewShotRef.setPrintingOrder(tempOrder);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // Capture and print
                if (viewShotRef && viewShotRef.current) {
                    const uri = await viewShotRef.current.capture();
                    const imageInfo = await Image.getSize(uri);
                    const base64 = await RNFS.readFile(uri.replace('file://', ''), 'base64');

                    await this.labelPrinter.tsplPrintBitmap(
                        Number(labelPrinterInfo.sWidth),
                        Number(labelPrinterInfo.sHeight),
                        base64,
                        imageInfo.width
                    );

                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Update print status using consistent order identifier
            const orderIdentifier = getOrderIdentifierForPrinting(orderData, true); // true for offline orders
            await AsyncStorage.setPrintedLabels(orderIdentifier);
            await this.printerInstance.closeConnection()
            Toast.show({
                type: 'success',
                text1: 'In tem thành công'
            });

            return true;
        } catch (error) {
            console.error('Label print error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi in tem: ' + error.message
            });

            if (error.message === 'Printer settings not configured' && showSettingPrinter) {
                showSettingPrinter();
            }
            return false;
        }
    }

    // Print bill with ViewShot capture
    async printBill(orderData, viewShotRef, showSettingPrinter = null) {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Chức năng chỉ hỗ trợ trên hệ điều hành android'
            });
            return false;
        }

        try {
            this.initialize();

            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();

            // Validate bill printer configuration
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

            // Transform order data to printing format
            const transformedOrder = this.transformOrderForPrinting(orderData);

            // Set printing order (this should be handled by the component using this service)
            if (viewShotRef && viewShotRef.setPrintingOrder) {
                viewShotRef.setPrintingOrder(transformedOrder);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Connect to printer
            try {
                const billConfig = {
                    connectionType: billPrinterInfo.billConnectionType || 'network',
                    IP: billPrinterInfo.billIP,
                    usbDevice: billPrinterInfo.billUsbDevice,
                    serialPort: billPrinterInfo.billSerialPort
                };
                await this.connectToPrinter(this.billPrinter, billConfig);
            } catch (connectError) {
                console.error('Printer connection error:', connectError);
                throw new Error('Printer settings not configured');
            }

            // Capture and print
            if (viewShotRef && viewShotRef.current) {
                const imageData = await viewShotRef.current.capture();
                const printerWidth = this.getThermalPrinterWidth(billPrinterInfo.billPaperSize);
                await this.billPrinter.printBitmap(imageData, 1, printerWidth, 0);
            }

            await this.billPrinter.closeConnection()
            Toast.show({
                type: 'success',
                text1: 'In hoá đơn thành công'
            });

            return true;
        } catch (error) {
            console.error('Bill print error:', error);
            Toast.show({
                type: 'error',
                text1: error.message === 'Printer settings not configured' ?
                    'Vui lòng thiết lập máy in' :
                    'Lỗi in hoá đơn: ' + error.message
            });

            if (error.message === 'Printer settings not configured' && showSettingPrinter) {
                showSettingPrinter();
            }
            return false;
        }
    }


    // Check if labels have already been printed for an order
    async isOrderLabelsPrinted(orderData) {
        try {
            const orderIdentifier = getOrderIdentifierForPrinting(orderData, true); // true for offline orders
            const printedLabels = await AsyncStorage.getPrintedLabels();
            return printedLabels.includes(orderIdentifier);
        } catch (error) {
            console.error('Error checking printed labels status:', error);
            return false;
        }
    }

    // Auto print with duplicate check and status callback
    async autoPrintOrderWithCheck(orderData, labelViewShotRef, billViewShotRef, showSettingPrinter = null, forcePrint = false, onStatusUpdate = null) {
        // Check if labels already printed (unless forcing)
        if (!forcePrint) {
            const alreadyPrinted = await this.isOrderLabelsPrinted(orderData);
            if (alreadyPrinted) {
                console.log(`Labels already printed for order: ${orderData.offlineOrderId}`);
                if (onStatusUpdate) onStatusUpdate('Tem đã được in trước đó');

                Toast.show({
                    type: 'info',
                    text1: `Đơn hàng ${orderData.offlineOrderId}`,
                    text2: 'Tem đã được in trước đó'
                });
                return true; // Consider it successful since labels were already printed
            }
        }

        // Proceed with normal auto print
        return await this.autoPrintOrder(orderData, labelViewShotRef, billViewShotRef, showSettingPrinter, onStatusUpdate);
    }

    // Enhanced auto print with status callback
    async autoPrintOrder(orderData, labelViewShotRef, billViewShotRef, showSettingPrinter = null, onStatusUpdate = null) {
        if (Platform.OS !== "android") {
            console.log('Auto print skipped: not Android platform');
            return false;
        }

        console.log('Starting auto print for order:', orderData.offlineOrderId);
        let success = true;
        let labelsPrinted = false;
        let billPrinted = false;

        // Transform order data to get the display ID for status tracking
        const transformedOrder = this.transformOrderForPrinting(orderData);

        // Print labels
        try {
            const labelSuccess = await this.printLabels(orderData, labelViewShotRef, showSettingPrinter);
            if (labelSuccess) {
                labelsPrinted = true;
                console.log(`Labels printed successfully for order: ${transformedOrder.displayID}`);
                // Ensure printed labels status is updated (redundant but explicit)
                const orderIdentifier = getOrderIdentifierForPrinting(orderData, true); // true for offline orders
                await AsyncStorage.setPrintedLabels(orderIdentifier);
            } else {
                success = false;
            }
        } catch (error) {
            console.error('Auto print labels failed:', error);
            success = false;
        }

        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Print bill
        try {
            const billSuccess = await this.printBill(orderData, billViewShotRef, showSettingPrinter);
            if (billSuccess) {
                billPrinted = true;
                console.log(`Bill printed successfully for order: ${transformedOrder.displayID}`);
            } else {
                success = false;
            }
        } catch (error) {
            console.error('Auto print bill failed:', error);
            success = false;
        }

        // Log final status
        console.log(`Auto print completed for order ${transformedOrder.displayID}:`, {
            labelsPrinted,
            billPrinted,
            overallSuccess: success
        });

        if (success) {
            Toast.show({
                type: 'success',
                text1: `Đã tự động in đơn hàng ${orderData.offlineOrderId}`,
                text2: 'In tem và hoá đơn thành công'
            });
        } else {
            // Show partial success message if only one type failed
            if (labelsPrinted && !billPrinted) {
                Toast.show({
                    type: 'info',
                    text1: `Đơn hàng ${orderData.offlineOrderId}`,
                    text2: 'In tem thành công, in hoá đơn thất bại'
                });
            } else if (!labelsPrinted && billPrinted) {
                Toast.show({
                    type: 'info',
                    text1: `Đơn hàng ${orderData.offlineOrderId}`,
                    text2: 'In hoá đơn thành công, in tem thất bại'
                });
            } else {
            }
        }

        return success;
    }

    // Print label using captured image URI (for PrintQueueService)
    async printLabel(imageUri, printerInfo) {
        if (Platform.OS !== "android") {
            throw new Error('Label printing only supported on Android');
        }

        try {
            this.initialize();

            if (!printerInfo) {
                throw new Error('Printer configuration not provided');
            }

            // Connect to printer
            await this.connectToPrinter(this.labelPrinter, printerInfo);

            // Get image info and convert to base64
            const imageInfo = await Image.getSize(imageUri);
            const base64 = await RNFS.readFile(imageUri.replace('file://', ''), 'base64');

            // Print the label
            await this.labelPrinter.tsplPrintBitmap(
                Number(printerInfo.sWidth),
                Number(printerInfo.sHeight),
                base64,
                imageInfo.width
            );

            console.log(`Label printed successfully using image URI: ${imageUri}`);
            await this.labelPrinter.closeConnection()
            return true;

        } catch (error) {
            console.error('PrintLabel error:', error);
            throw error;
        }
    }

    // Print bill using base64 image data (for PrintQueueService)
    async printBill(base64ImageData) {
        if (Platform.OS !== "android") {
            throw new Error('Bill printing only supported on Android');
        }

        try {
            this.initialize();

            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();

            if (!billPrinterInfo) {
                throw new Error('Bill printer not configured');
            }

            // Connect to bill printer
            const billConfig = {
                connectionType: billPrinterInfo.billConnectionType || 'network',
                IP: billPrinterInfo.billIP,
                usbDevice: billPrinterInfo.billUsbDevice,
                serialPort: billPrinterInfo.billSerialPort
            };
            await this.connectToPrinter(this.billPrinter, billConfig);

            // Print the bill
            const printerWidth = this.getThermalPrinterWidth(billPrinterInfo.billPaperSize);
            await this.billPrinter.printBitmap(base64ImageData, 1, printerWidth, 0);

            console.log('Bill printed successfully using base64 data');
            await this.billPrinter.closeConnection()
            return true;

        } catch (error) {
            console.error('PrintBill error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const printingService = new PrintingService();

export default printingService;
