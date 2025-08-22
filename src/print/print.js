import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Colors from 'theme/Colors';
import { SafeAreaView } from 'react-native';
import XPrinter from 'rn-xprinter';
import Toast from 'react-native-toast-message'
import PrinterSettingsModal from 'common/PrinterSettingsModal';
import AsyncStorage from 'store/async_storage/index';


const XPRINTER_IP = '192.168.1.103'; // Replace with your printer's IP
const XPRINTER_PORT = 9100; // Default ESC/POS port

const orderData = {
    orderId: 'ORD-12345',
    date: new Date().toLocaleString(),
    items: [
        { name: 'Cà phê sữa', price: 30000, quantity: 2 },
        { name: 'Bánh mì thịt', price: 25000, quantity: 1 },
    ],
    total: 85000,
    customerName: 'Nguyễn Văn A',
};

const XPrinterOrderExample = () => {
    const viewShotRef = useRef();
    const printerRef = useRef(null);
    const [showPrinterSettings, setShowPrinterSettings] = useState(false);
    const [printerSettings, setPrinterSettings] = useState({
        billIP: XPRINTER_IP,
        billPort: XPRINTER_PORT,
        billConnectionType: 'network'
    });

    // Initialize printer instance
    useEffect(() => {
        printerRef.current = new XPrinter();

        return () => {
            // Cleanup printer instance
            if (printerRef.current) {
                printerRef.current.dispose();
                printerRef.current = null;
            }
        };
    }, []);

    // Load printer settings when component mounts
    useEffect(() => {
        loadPrinterSettings();
    }, []);

    const loadPrinterSettings = async () => {
        try {
            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();
            if (billPrinterInfo) {
                setPrinterSettings({
                    billIP: billPrinterInfo.billIP || XPRINTER_IP,
                    billPort: billPrinterInfo.billPort || XPRINTER_PORT,
                    billConnectionType: billPrinterInfo.billConnectionType || 'network',
                    billUsbDevice: billPrinterInfo.billUsbDevice || '',
                    billSerialPort: billPrinterInfo.billSerialPort || ''
                });
            }
        } catch (error) {
            console.error('Error loading printer settings:', error);
        }
    };

    // Helper function to connect to printer based on connection type
    const connectToPrinter = async (printerInstance, printerConfig) => {
        try {
            switch (printerConfig.billConnectionType || printerConfig.connectionType) {
                case 'network':
                    if (!printerConfig.billIP && !printerConfig.IP) {
                        throw new Error('IP address not configured');
                    }
                    const ip = printerConfig.billIP || printerConfig.IP;
                    return await printerInstance.netConnect(ip);

                case 'usb':
                    const usbDevice = printerConfig.billUsbDevice || printerConfig.usbDevice;
                    if (!usbDevice) {
                        throw new Error('USB device not selected');
                    }
                    return await printerInstance.usbConnect(usbDevice);

                case 'serial':
                    const serialPort = printerConfig.billSerialPort || printerConfig.serialPort;
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

    // Calculate thermal printer width based on paper size
    const getThermalPrinterWidth = (paperSize) => {
        switch (paperSize) {
            case '58mm':
                return 384; // 58mm ≈ 384 pixels at 203 DPI
            case '80mm':
                return 576; // 80mm ≈ 576 pixels at 203 DPI
            default:
                return 576; // Default to 80mm if not specified
        }
    };

    const captureAndPrint = async () => {
        try {
            const imageData = await viewShotRef.current.capture();
            // Send to printer
            sendToPrinter(imageData);
        } catch (error) {
            console.error('Error capturing/printing:', error);
            Toast.show({
                type: 'error',
                text1: 'Capture error',
                text2: error.message
            });
        }
    };

    const sendToPrinter = async (imageData) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Print function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return;
        }

        try {
            // Validate printer settings
            if (!printerSettings.billConnectionType) {
                throw new Error('Printer connection type not configured');
            }

            // Connect to printer based on connection type
            await connectToPrinter(printerRef.current, printerSettings);

            // Get printer width based on paper size (default to 80mm)
            const printerWidth = getThermalPrinterWidth(printerSettings.billPaperSize || '80mm');

            // Print the bitmap
            await printerRef.current.printBitmap(imageData, 1, printerWidth, 0);

            // Show success message with connection details
            const connectionDetails = getConnectionDetails(printerSettings);
            Toast.show({
                type: 'success',
                text1: 'Print success',
                text2: `Printed via ${connectionDetails}`
            });

        } catch (err) {
            console.error('Print error:', err);
            Toast.show({
                type: 'error',
                text1: 'Print error',
                text2: err.message || 'Failed to print document'
            });
        } finally {
            // Always close connection after printing
            if (printerRef.current) {
                try {
                    printerRef.current.closeConnection();
                } catch (closeError) {
                    console.warn('Error closing printer connection:', closeError);
                }
            }
        }
    };

    const handleSettingsSaved = (newSettings) => {
        loadPrinterSettings(); // Reload settings after save
        Toast.show({
            type: 'success',
            text1: 'Settings Updated',
            text2: 'Printer settings have been updated'
        });
    };

    // Helper function to get connection details for display
    const getConnectionDetails = (settings) => {
        switch (settings.billConnectionType) {
            case 'network':
                return `Network (${settings.billIP}:${settings.billPort})`;
            case 'usb':
                return `USB (${settings.billUsbDevice || 'Unknown device'})`;
            case 'serial':
                return `Serial (${settings.billSerialPort || 'Unknown port'})`;
            default:
                return 'Unknown connection';
        }
    };

    const testPrinterConnection = async () => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Test function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return;
        }

        const connectionDetails = getConnectionDetails(printerSettings);
        Toast.show({
            type: 'info',
            text1: 'Testing connection...',
            text2: connectionDetails
        });

        try {
            // Validate configuration before attempting connection
            if (!printerSettings.billConnectionType) {
                throw new Error('Printer connection type not configured');
            }

            // Test connection using the helper function
            await connectToPrinter(printerRef.current, printerSettings);
            await printerRef.current.printText('Hello World');
            await printerRef.current.printPageModelData();

            Toast.show({
                type: 'success',
                text1: 'Connection successful',
                text2: connectionDetails
            });

        } catch (error) {
            console.error('Connection test failed:', error);
            const errorMessage = error.message === 'IP address not configured' ||
                error.message === 'USB device not selected' ||
                error.message === 'Serial port not selected' ?
                'Please configure printer settings first' :
                error.message || 'Could not connect to printer';

            Toast.show({
                type: 'error',
                text1: 'Connection failed',
                text2: errorMessage
            });
        } finally {
            // Close connection after test
            if (printerRef.current) {
                try {
                    printerRef.current.closeConnection();
                } catch (closeError) {
                    console.warn('Error closing test connection:', closeError);
                }
            }
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: Colors.bgInput,
                flexDirection: 'column',
                alignItems: 'center',
                padding: 20,
            }}>

            {/* Printer Settings Info */}
            <View style={{ backgroundColor: 'white', padding: 15, marginBottom: 20, borderRadius: 10, width: '100%', maxWidth: 400, elevation: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Printer Test Screen</Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Current Settings:</Text>
                <Text style={{ fontSize: 13, color: '#333', marginBottom: 3 }}>
                    <Text style={{ fontWeight: 'bold' }}>Connection:</Text> {printerSettings.billConnectionType || 'Not configured'}
                </Text>
                {printerSettings.billConnectionType === 'network' && (
                    <>
                        <Text style={{ fontSize: 13, color: '#333', marginBottom: 3 }}>
                            <Text style={{ fontWeight: 'bold' }}>IP:</Text> {printerSettings.billIP || 'Not set'}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#333', marginBottom: 3 }}>
                            <Text style={{ fontWeight: 'bold' }}>Port:</Text> {printerSettings.billPort || 'Not set'}
                        </Text>
                    </>
                )}
                {printerSettings.billConnectionType === 'usb' && (
                    <Text style={{ fontSize: 13, color: '#333', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>USB Device:</Text> {printerSettings.billUsbDevice || 'Not selected'}
                    </Text>
                )}
                {printerSettings.billConnectionType === 'serial' && (
                    <Text style={{ fontSize: 13, color: '#333', marginBottom: 3 }}>
                        <Text style={{ fontWeight: 'bold' }}>Serial Port:</Text> {printerSettings.billSerialPort || 'Not selected'}
                    </Text>
                )}
                <Text style={{ fontSize: 13, color: '#333' }}>
                    <Text style={{ fontWeight: 'bold' }}>Paper Size:</Text> {printerSettings.billPaperSize || '80mm (default)'}
                </Text>
            </View>

            {/* Control Buttons */}
            <View style={{ flexDirection: 'row', marginBottom: 20, gap: 10 }}>
                <TouchableOpacity
                    onPress={() => setShowPrinterSettings(true)}
                    style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, flex: 1 }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
                        Printer Settings
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={testPrinterConnection}
                    style={{ backgroundColor: '#34C759', padding: 12, borderRadius: 8, flex: 1 }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
                        Test Connection
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bill Preview */}
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'base64' }}>
                <View style={{ backgroundColor: 'white', padding: 20, width: 250, borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>*** HÓA ĐƠN ***</Text>
                    <Text>Mã đơn: {orderData.orderId}</Text>
                    <Text>Ngày: {orderData.date}</Text>
                    <Text>Khách hàng: {orderData.customerName}</Text>
                    <Text>--------------------------------</Text>
                    {orderData.items.map((item, index) => (
                        <Text key={index}>{item.name} x{item.quantity}  {item.price * item.quantity}đ</Text>
                    ))}
                    <Text>--------------------------------</Text>
                    <Text style={{ fontWeight: 'bold' }}>Tổng cộng: {orderData.total}đ</Text>
                    <Text style={{ textAlign: 'center' }}>Cảm ơn quý khách!</Text>
                </View>
            </ViewShot>

            {/* Print Button */}
            <TouchableOpacity
                onPress={captureAndPrint}
                style={{ backgroundColor: '#FF9500', padding: 15, borderRadius: 8, width: 250, marginTop: 20 }}>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                    Print Bill
                </Text>
            </TouchableOpacity>

            {/* Printer Settings Modal */}
            <PrinterSettingsModal
                visible={showPrinterSettings}
                onClose={() => setShowPrinterSettings(false)}
                initialPrinterType="bill"
                onSettingsSaved={handleSettingsSaved}
            />

            <Toast />
        </SafeAreaView>
    );
};

export default XPrinterOrderExample;
