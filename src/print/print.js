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
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
    const [isConnecting, setIsConnecting] = useState(false);

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

    // Auto-connect when settings change
    useEffect(() => {
        if (printerSettings.billConnectionType && connectionStatus === 'disconnected') {
            // Auto connect only if we have valid settings
            if ((printerSettings.billConnectionType === 'network' && printerSettings.billIP) ||
                (printerSettings.billConnectionType === 'usb' && printerSettings.billUsbDevice) ||
                (printerSettings.billConnectionType === 'serial' && printerSettings.billSerialPort)) {
                handleConnect();
            }
        }
    }, [printerSettings]);

    // Cleanup connection on unmount
    useEffect(() => {
        return () => {
            if (connectionStatus === 'connected' && printerRef.current) {
                try {
                    printerRef.current.closeConnection();
                } catch (error) {
                    console.warn('Error closing printer connection on unmount:', error);
                }
            }
        };
    }, [connectionStatus]);

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
            switch (printerConfig.billConnectionType) {
                case 'network':
                    if (!printerConfig.billIP && !printerConfig.IP) {
                        throw new Error('IP address not configured');
                    }
                    const ip = printerConfig.billIP || printerConfig.IP;
                    return await printerInstance.netConnect(ip);

                case 'usb':
                    const usbDevice = printerConfig.billUsbDevice;
                    if (!usbDevice) {
                        throw new Error('USB device not selected');
                    }
                    return await printerInstance.usbConnect(usbDevice);

                case 'serial':
                    const serialPort = printerConfig.billSerialPort;
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

    // Connect to printer and maintain connection
    const handleConnect = async () => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Print function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return;
        }

        if (connectionStatus === 'connected' || isConnecting) {
            return; // Already connected or connecting
        }

        setIsConnecting(true);
        setConnectionStatus('connecting');

        const connectionDetails = getConnectionDetails(printerSettings);
        Toast.show({
            type: 'info',
            text1: 'Connecting...',
            text2: connectionDetails
        });

        try {
            // Validate printer settings
            if (!printerSettings.billConnectionType) {
                throw new Error('Printer connection type not configured');
            }

            // Connect to printer based on connection type
            await connectToPrinter(printerRef.current, printerSettings);

            setConnectionStatus('connected');
            Toast.show({
                type: 'success',
                text1: 'Connected successfully',
                text2: connectionDetails
            });

        } catch (error) {
            console.error('Connection failed:', error);
            setConnectionStatus('disconnected');

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
            setIsConnecting(false);
        }
    };

    // Disconnect from printer
    const handleDisconnect = async () => {
        if (connectionStatus === 'disconnected') {
            return; // Already disconnected
        }

        try {
            if (printerRef.current) {
                printerRef.current.closeConnection();
            }
            setConnectionStatus('disconnected');
            Toast.show({
                type: 'success',
                text1: 'Disconnected',
                text2: 'Printer disconnected successfully'
            });
        } catch (error) {
            console.warn('Error disconnecting printer:', error);
            setConnectionStatus('disconnected');
            Toast.show({
                type: 'warning',
                text1: 'Disconnected',
                text2: 'Connection closed (with warning)'
            });
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

        // Check if printer is connected
        if (connectionStatus !== 'connected') {
            Toast.show({
                type: 'error',
                text1: 'Printer not connected',
                text2: 'Please connect to printer first'
            });
            return;
        }

        try {
            // Get printer width based on paper size (default to 80mm)
            const printerWidth = getThermalPrinterWidth(printerSettings.billPaperSize || '80mm');

            // Print the bitmap using existing connection
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

            // If error suggests connection issue, update status
            if (err.message && (err.message.includes('connection') || err.message.includes('disconnect'))) {
                setConnectionStatus('disconnected');
                Toast.show({
                    type: 'error',
                    text1: 'Connection lost',
                    text2: 'Please reconnect to printer'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Print error',
                    text2: err.message || 'Failed to print document'
                });
            }
        }
    };

    const handleSettingsSaved = async (newSettings) => {
        // Disconnect existing connection first
        if (connectionStatus === 'connected') {
            await handleDisconnect();
        }

        // Reload settings after save
        await loadPrinterSettings();

        Toast.show({
            type: 'success',
            text1: 'Settings Updated',
            text2: 'Printer settings have been updated. Reconnecting...'
        });

        // Auto-reconnect with new settings
        setTimeout(() => {
            handleConnect();
        }, 1000);
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

        try {
            // If not connected, try to connect first
            if (connectionStatus !== 'connected') {
                Toast.show({
                    type: 'info',
                    text1: 'Connecting for test...',
                    text2: connectionDetails
                });
                await handleConnect();

                // Wait a bit for connection to establish
                await new Promise(resolve => setTimeout(resolve, 500));

                if (connectionStatus !== 'connected') {
                    throw new Error('Failed to establish connection');
                }
            }

            // Test the existing connection by printing a test message
            Toast.show({
                type: 'info',
                text1: 'Testing connection...',
                text2: 'Sending test print'
            });

            await printerRef.current.printText('Printer Test - Connection OK\n');

            Toast.show({
                type: 'success',
                text1: 'Test successful',
                text2: `Connection working via ${connectionDetails}`
            });

        } catch (error) {
            console.error('Connection test failed:', error);

            // Update connection status if test failed
            setConnectionStatus('disconnected');

            const errorMessage = error.message === 'IP address not configured' ||
                error.message === 'USB device not selected' ||
                error.message === 'Serial port not selected' ?
                'Please configure printer settings first' :
                error.message || 'Could not connect to printer';

            Toast.show({
                type: 'error',
                text1: 'Test failed',
                text2: errorMessage
            });
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

                {/* Connection Status */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <View style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: connectionStatus === 'connected' ? '#34C759' :
                            connectionStatus === 'connecting' ? '#FF9500' : '#FF3B30',
                        marginRight: 8
                    }} />
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: connectionStatus === 'connected' ? '#34C759' :
                            connectionStatus === 'connecting' ? '#FF9500' : '#FF3B30'
                    }}>
                        {connectionStatus === 'connected' ? 'Connected' :
                            connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                    </Text>
                </View>

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
            <View style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}>
                {/* First Row - Settings and Connection */}
                <View style={{ flexDirection: 'row', marginBottom: 10, gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => setShowPrinterSettings(true)}
                        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, flex: 1 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
                            Settings
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={connectionStatus === 'connected' ? handleDisconnect : handleConnect}
                        disabled={isConnecting}
                        style={{
                            backgroundColor: connectionStatus === 'connected' ? '#FF3B30' : '#34C759',
                            padding: 12,
                            borderRadius: 8,
                            flex: 1,
                            opacity: isConnecting ? 0.7 : 1
                        }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
                            {isConnecting ? 'Connecting...' :
                                connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Second Row - Test Connection */}
                <TouchableOpacity
                    onPress={testPrinterConnection}
                    disabled={isConnecting}
                    style={{
                        backgroundColor: '#FF9500',
                        padding: 12,
                        borderRadius: 8,
                        width: '100%',
                        opacity: isConnecting ? 0.7 : 1
                    }}>
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
                disabled={connectionStatus !== 'connected' || isConnecting}
                style={{
                    backgroundColor: connectionStatus === 'connected' ? '#FF9500' : '#999999',
                    padding: 15,
                    borderRadius: 8,
                    width: 250,
                    marginTop: 20,
                    opacity: (connectionStatus !== 'connected' || isConnecting) ? 0.7 : 1
                }}>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                    {connectionStatus === 'connected' ? 'Print Bill' : 'Connect to Print'}
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
