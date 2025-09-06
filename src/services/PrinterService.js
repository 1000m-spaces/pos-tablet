import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import XPrinter from 'rn-xprinter';
import Toast from 'react-native-toast-message';
import AsyncStorage from 'store/async_storage/index';

// Printer Service Context
const PrinterContext = createContext();

export const usePrinter = () => {
    const context = useContext(PrinterContext);
    if (!context) {
        throw new Error('usePrinter must be used within a PrinterProvider');
    }
    return context;
};

export const PrinterProvider = ({ children }) => {
    // Printer instances
    const billPrinterRef = useRef(null);
    const labelPrinterRef = useRef(null);

    // Connection states
    const [billPrinterStatus, setBillPrinterStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
    const [labelPrinterStatus, setLabelPrinterStatus] = useState('disconnected');

    // Printer settings
    const [billPrinterSettings, setBillPrinterSettings] = useState(null);
    const [labelPrinterSettings, setLabelPrinterSettings] = useState(null);

    // Loading states
    const [isBillConnecting, setIsBillConnecting] = useState(false);
    const [isLabelConnecting, setIsLabelConnecting] = useState(false);

    // Initialize printer instances
    useEffect(() => {
        billPrinterRef.current = new XPrinter();
        labelPrinterRef.current = new XPrinter();

        // Load printer settings on initialization
        loadPrinterSettings();

        return () => {
            // Cleanup printer instances
            if (billPrinterRef.current) {
                try {
                    billPrinterRef.current.closeConnection();
                    billPrinterRef.current.dispose();
                } catch (error) {
                    console.warn('Error cleaning up bill printer:', error);
                }
                billPrinterRef.current = null;
            }
            if (labelPrinterRef.current) {
                try {
                    labelPrinterRef.current.closeConnection();
                    labelPrinterRef.current.dispose();
                } catch (error) {
                    console.warn('Error cleaning up label printer:', error);
                }
                labelPrinterRef.current = null;
            }
        };
    }, []);

    // Load printer settings from storage
    const loadPrinterSettings = async () => {
        try {
            const [billSettings, labelSettings] = await Promise.all([
                AsyncStorage.getBillPrinterInfo(),
                AsyncStorage.getLabelPrinterInfo()
            ]);

            setBillPrinterSettings(billSettings);
            setLabelPrinterSettings(labelSettings);

            // Auto-connect if settings are available
            if (billSettings && isValidPrinterConfig(billSettings, 'bill')) {
                setTimeout(() => connectBillPrinter(billSettings), 1000);
            }
            if (labelSettings && isValidPrinterConfig(labelSettings, 'label')) {
                setTimeout(() => connectLabelPrinter(labelSettings), 1500);
            }
        } catch (error) {
            console.error('Error loading printer settings:', error);
        }
    };

    // Validate printer configuration
    const isValidPrinterConfig = (settings, printerType) => {
        if (!settings) return false;

        if (printerType === 'bill') {
            const connectionType = settings.billConnectionType;
            switch (connectionType) {
                case 'network':
                    return !!settings.billIP;
                case 'usb':
                    return !!settings.billUsbDevice;
                case 'serial':
                    return !!settings.billSerialPort;
                default:
                    return false;
            }
        } else { // label printer
            const connectionType = settings.connectionType;
            switch (connectionType) {
                case 'network':
                    return !!settings.IP;
                case 'usb':
                    return !!settings.usbDevice;
                case 'serial':
                    return !!settings.serialPort;
                default:
                    return false;
            }
        }
    };

    // Helper function to connect to printer based on connection type
    const connectToPrinter = async (printerInstance, printerConfig, printerType) => {
        try {
            if (printerType === 'bill') {
                const connectionType = printerConfig.billConnectionType || 'network';
                switch (connectionType) {
                    case 'network':
                        if (!printerConfig.billIP) {
                            throw new Error('IP address not configured for bill printer');
                        }
                        return await printerInstance.netConnect(printerConfig.billIP);
                    case 'usb':
                        if (!printerConfig.billUsbDevice) {
                            throw new Error('USB device not selected for bill printer');
                        }
                        return await printerInstance.usbConnect(printerConfig.billUsbDevice);
                    case 'serial':
                        if (!printerConfig.billSerialPort) {
                            throw new Error('Serial port not selected for bill printer');
                        }
                        return await printerInstance.serialConnect(printerConfig.billSerialPort);
                    default:
                        throw new Error('Unknown connection type for bill printer');
                }
            } else { // label printer
                const connectionType = printerConfig.connectionType || 'network';
                switch (connectionType) {
                    case 'network':
                        if (!printerConfig.IP) {
                            throw new Error('IP address not configured for label printer');
                        }
                        return await printerInstance.netConnect(printerConfig.IP);
                    case 'usb':
                        if (!printerConfig.usbDevice) {
                            throw new Error('USB device not selected for label printer');
                        }
                        return await printerInstance.usbConnect(printerConfig.usbDevice);
                    case 'serial':
                        if (!printerConfig.serialPort) {
                            throw new Error('Serial port not selected for label printer');
                        }
                        return await printerInstance.serialConnect(printerConfig.serialPort);
                    default:
                        throw new Error('Unknown connection type for label printer');
                }
            }
        } catch (error) {
            console.error(`${printerType} printer connection error:`, error);
            throw error;
        }
    };

    // Get connection details for display
    const getConnectionDetails = (settings, printerType) => {
        if (!settings) return 'Not configured';

        if (printerType === 'bill') {
            switch (settings.billConnectionType) {
                case 'network':
                    return `Network (${settings.billIP}:${settings.billPort || 9100})`;
                case 'usb':
                    return `USB (${settings.billUsbDevice || 'Unknown device'})`;
                case 'serial':
                    return `Serial (${settings.billSerialPort || 'Unknown port'})`;
                default:
                    return 'Unknown connection';
            }
        } else {
            switch (settings.connectionType) {
                case 'network':
                    return `Network (${settings.IP})`;
                case 'usb':
                    return `USB (${settings.usbDevice || 'Unknown device'})`;
                case 'serial':
                    return `Serial (${settings.serialPort || 'Unknown port'})`;
                default:
                    return 'Unknown connection';
            }
        }
    };

    // Connect Bill Printer
    const connectBillPrinter = async (settings = billPrinterSettings) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Print function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return false;
        }

        if (billPrinterStatus === 'connected' || isBillConnecting) {
            return billPrinterStatus === 'connected';
        }

        if (!settings || !isValidPrinterConfig(settings, 'bill')) {
            Toast.show({
                type: 'error',
                text1: 'Bill printer not configured',
                text2: 'Please configure bill printer settings first'
            });
            return false;
        }

        setIsBillConnecting(true);
        setBillPrinterStatus('connecting');

        const connectionDetails = getConnectionDetails(settings, 'bill');
        Toast.show({
            type: 'info',
            text1: 'Connecting bill printer...',
            text2: connectionDetails
        });

        try {
            await connectToPrinter(billPrinterRef.current, settings, 'bill');
            setBillPrinterStatus('connected');
            Toast.show({
                type: 'success',
                text1: 'Bill printer connected',
                text2: connectionDetails
            });
            return true;
        } catch (error) {
            console.error('Bill printer connection failed:', error);
            setBillPrinterStatus('disconnected');
            Toast.show({
                type: 'error',
                text1: 'Bill printer connection failed',
                text2: error.message || 'Could not connect to bill printer'
            });
            return false;
        } finally {
            setIsBillConnecting(false);
        }
    };

    // Connect Label Printer
    const connectLabelPrinter = async (settings = labelPrinterSettings) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Print function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return false;
        }

        if (labelPrinterStatus === 'connected' || isLabelConnecting) {
            return labelPrinterStatus === 'connected';
        }

        if (!settings || !isValidPrinterConfig(settings, 'label')) {
            Toast.show({
                type: 'error',
                text1: 'Label printer not configured',
                text2: 'Please configure label printer settings first'
            });
            return false;
        }

        setIsLabelConnecting(true);
        setLabelPrinterStatus('connecting');

        const connectionDetails = getConnectionDetails(settings, 'label');
        Toast.show({
            type: 'info',
            text1: 'Connecting label printer...',
            text2: connectionDetails
        });

        try {
            await connectToPrinter(labelPrinterRef.current, settings, 'label');
            setLabelPrinterStatus('connected');
            Toast.show({
                type: 'success',
                text1: 'Label printer connected',
                text2: connectionDetails
            });
            return true;
        } catch (error) {
            console.error('Label printer connection failed:', error);
            setLabelPrinterStatus('disconnected');
            Toast.show({
                type: 'error',
                text1: 'Label printer connection failed',
                text2: error.message || 'Could not connect to label printer'
            });
            return false;
        } finally {
            setIsLabelConnecting(false);
        }
    };

    // Disconnect Bill Printer
    const disconnectBillPrinter = async () => {
        if (billPrinterStatus === 'disconnected') {
            return true;
        }

        try {
            if (billPrinterRef.current) {
                billPrinterRef.current.closeConnection();
            }
            setBillPrinterStatus('disconnected');
            Toast.show({
                type: 'success',
                text1: 'Bill printer disconnected',
                text2: 'Connection closed successfully'
            });
            return true;
        } catch (error) {
            console.warn('Error disconnecting bill printer:', error);
            setBillPrinterStatus('disconnected');
            Toast.show({
                type: 'warning',
                text1: 'Bill printer disconnected',
                text2: 'Connection closed (with warning)'
            });
            return true;
        }
    };

    // Disconnect Label Printer
    const disconnectLabelPrinter = async () => {
        if (labelPrinterStatus === 'disconnected') {
            return true;
        }

        try {
            if (labelPrinterRef.current) {
                labelPrinterRef.current.closeConnection();
            }
            setLabelPrinterStatus('disconnected');
            Toast.show({
                type: 'success',
                text1: 'Label printer disconnected',
                text2: 'Connection closed successfully'
            });
            return true;
        } catch (error) {
            console.warn('Error disconnecting label printer:', error);
            setLabelPrinterStatus('disconnected');
            Toast.show({
                type: 'warning',
                text1: 'Label printer disconnected',
                text2: 'Connection closed (with warning)'
            });
            return true;
        }
    };

    // Test Bill Printer
    const testBillPrinter = async () => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Test function only supported on Android'
            });
            return false;
        }

        try {
            // Connect if not connected
            if (billPrinterStatus !== 'connected') {
                const connected = await connectBillPrinter();
                if (!connected) return false;
                // Wait a bit for connection to stabilize
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            Toast.show({
                type: 'info',
                text1: 'Testing bill printer...',
                text2: 'Sending test print'
            });

            await billPrinterRef.current.printText('Bill Printer Test\nConnection OK\n\n');

            Toast.show({
                type: 'success',
                text1: 'Bill printer test successful',
                text2: 'Printer is working correctly'
            });
            return true;
        } catch (error) {
            console.error('Bill printer test failed:', error);
            setBillPrinterStatus('disconnected');
            Toast.show({
                type: 'error',
                text1: 'Bill printer test failed',
                text2: error.message || 'Could not test bill printer'
            });
            return false;
        }
    };

    // Test Label Printer
    const testLabelPrinter = async () => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Test function only supported on Android'
            });
            return false;
        }

        try {
            // Connect if not connected
            if (labelPrinterStatus !== 'connected') {
                const connected = await connectLabelPrinter();
                if (!connected) return false;
                // Wait a bit for connection to stabilize
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            Toast.show({
                type: 'info',
                text1: 'Testing label printer...',
                text2: 'Sending test print'
            });

            // Use TSPL commands for label printer test
            if (labelPrinterSettings && labelPrinterSettings.sWidth && labelPrinterSettings.sHeight) {
                await labelPrinterRef.current.tsplPrintText(
                    Math.round(labelPrinterSettings.sWidth * 0.1),
                    Math.round(labelPrinterSettings.sHeight * 0.1),
                    'Label Test OK',
                    1,
                    1,
                    0,
                    0,
                    false
                );
            } else {
                await labelPrinterRef.current.printText('Label Printer Test\nConnection OK\n\n');
            }

            Toast.show({
                type: 'success',
                text1: 'Label printer test successful',
                text2: 'Printer is working correctly'
            });
            return true;
        } catch (error) {
            console.error('Label printer test failed:', error);
            setLabelPrinterStatus('disconnected');
            Toast.show({
                type: 'error',
                text1: 'Label printer test failed',
                text2: error.message || 'Could not test label printer'
            });
            return false;
        }
    };

    // Refresh settings from storage
    const refreshPrinterSettings = async () => {
        await loadPrinterSettings();
    };

    // Handle settings update (disconnect and reconnect)
    const handleSettingsUpdate = async () => {
        // Disconnect both printers
        await Promise.all([
            disconnectBillPrinter(),
            disconnectLabelPrinter()
        ]);

        // Reload settings
        await refreshPrinterSettings();
    };

    const contextValue = {
        // Printer instances
        billPrinter: billPrinterRef.current,
        labelPrinter: labelPrinterRef.current,

        // Connection status
        billPrinterStatus,
        labelPrinterStatus,
        isBillConnecting,
        isLabelConnecting,

        // Settings
        billPrinterSettings,
        labelPrinterSettings,

        // Connection functions
        connectBillPrinter,
        connectLabelPrinter,
        disconnectBillPrinter,
        disconnectLabelPrinter,

        // Test functions
        testBillPrinter,
        testLabelPrinter,

        // Utility functions
        getConnectionDetails,
        refreshPrinterSettings,
        handleSettingsUpdate,
        isValidPrinterConfig,
    };

    return (
        <PrinterContext.Provider value={contextValue}>
            {children}
        </PrinterContext.Provider>
    );
};

export default PrinterProvider;
