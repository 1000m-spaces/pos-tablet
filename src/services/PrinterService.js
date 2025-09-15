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

    // Connection states (for UI display only - no persistent connections)
    const [billPrinterStatus, setBillPrinterStatus] = useState('unknown'); // 'unknown', 'connected', 'disconnected', 'testing'
    const [labelPrinterStatus, setLabelPrinterStatus] = useState('unknown');

    // Printer settings
    const [billPrinterSettings, setBillPrinterSettings] = useState(null);
    const [labelPrinterSettings, setLabelPrinterSettings] = useState(null);

    // Loading states
    const [isBillTesting, setIsBillTesting] = useState(false);
    const [isLabelTesting, setIsLabelTesting] = useState(false);

    // Initialize printer instances
    useEffect(() => {
        billPrinterRef.current = new XPrinter();
        labelPrinterRef.current = new XPrinter();

        // Load printer settings and test initial connections
        loadPrinterSettingsAndTest();

        return () => {
            // Cleanup printer instances
            if (billPrinterRef.current) {
                try {
                    billPrinterRef.current.dispose();
                } catch (error) {
                    console.warn('Error cleaning up bill printer:', error);
                }
                billPrinterRef.current = null;
            }
            if (labelPrinterRef.current) {
                try {
                    labelPrinterRef.current.dispose();
                } catch (error) {
                    console.warn('Error cleaning up label printer:', error);
                }
                labelPrinterRef.current = null;
            }
        };
    }, []);

    // Load printer settings from storage and test initial connections
    const loadPrinterSettingsAndTest = async () => {
        try {
            const [billSettings, labelSettings] = await Promise.all([
                AsyncStorage.getBillPrinterInfo(),
                AsyncStorage.getLabelPrinterInfo()
            ]);

            setBillPrinterSettings(billSettings);
            setLabelPrinterSettings(labelSettings);

            // Test connections to set initial status (no printing on startup)
            if (billSettings && isValidPrinterConfig(billSettings, 'bill')) {
                setTimeout(() => testBillPrinterConnectionOnly(billSettings), 1000);
            } else {
                setBillPrinterStatus('disconnected');
            }
            if (labelSettings && isValidPrinterConfig(labelSettings, 'label')) {
                setTimeout(() => testLabelPrinterConnectionOnly(labelSettings), 1500);
            } else {
                setLabelPrinterStatus('disconnected');
            }
        } catch (error) {
            console.error('Error loading printer settings:', error);
            setBillPrinterStatus('disconnected');
            setLabelPrinterStatus('disconnected');
        }
    };

    // Load printer settings from storage (for manual refresh)
    const loadPrinterSettings = async () => {
        try {
            const [billSettings, labelSettings] = await Promise.all([
                AsyncStorage.getBillPrinterInfo(),
                AsyncStorage.getLabelPrinterInfo()
            ]);

            setBillPrinterSettings(billSettings);
            setLabelPrinterSettings(labelSettings);
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
                        const billPort = printerConfig.billPort || 9100;
                        return await printerInstance.netConnect(printerConfig.billIP, billPort);
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

    // Test Bill Printer Connection Only (no printing - for startup/status checking)
    const testBillPrinterConnectionOnly = async (settings = billPrinterSettings, showToast = false) => {
        if (Platform.OS !== "android") {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Print function only supported on Android',
                    text2: 'This feature requires Android platform'
                });
            }
            setBillPrinterStatus('disconnected');
            return false;
        }

        // Prevent concurrent test attempts
        if (isBillTesting) {
            if (showToast) {
                Toast.show({
                    type: 'warning',
                    text1: 'Test in progress',
                    text2: 'Please wait for current test to complete'
                });
            }
            return false;
        }

        if (!settings || !isValidPrinterConfig(settings, 'bill')) {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Bill printer not configured',
                    text2: 'Please configure bill printer settings first'
                });
            }
            setBillPrinterStatus('disconnected');
            return false;
        }

        setIsBillTesting(true);
        setBillPrinterStatus('testing');

        const connectionDetails = getConnectionDetails(settings, 'bill');
        if (showToast) {
            Toast.show({
                type: 'info',
                text1: 'Testing bill printer...',
                text2: connectionDetails
            });
        }

        try {
            // Create a temporary printer instance for testing
            const testPrinter = new XPrinter();

            // Add timeout for connection
            const connectionPromise = connectToPrinter(testPrinter, settings, 'bill');
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
            });

            await Promise.race([connectionPromise, timeoutPromise]);

            // Just test connection - no printing
            // Connection successful if we reach this point

            // Close connection immediately
            testPrinter.closeConnection();
            testPrinter.dispose();

            setBillPrinterStatus('connected');
            if (showToast) {
                Toast.show({
                    type: 'success',
                    text1: 'Bill printer test successful',
                    text2: 'Printer is working correctly'
                });
            }
            return true;
        } catch (error) {
            console.error('Bill printer test failed:', error);
            setBillPrinterStatus('disconnected');

            if (showToast) {
                // Provide more specific error messages
                let errorMessage = 'Could not connect to bill printer';
                if (error.message.includes('timeout')) {
                    errorMessage = 'Connection timed out - check printer network settings';
                } else if (error.message.includes('IP address')) {
                    errorMessage = 'Invalid IP address or printer not reachable';
                } else if (error.message.includes('USB')) {
                    errorMessage = 'USB device not found or access denied';
                } else if (error.message.includes('Serial')) {
                    errorMessage = 'Serial port not available or already in use';
                }

                Toast.show({
                    type: 'error',
                    text1: 'Bill printer test failed',
                    text2: error.message || errorMessage
                });
            }
            return false;
        } finally {
            setIsBillTesting(false);
        }
    };

    // Test Label Printer Connection Only (no printing - for startup/status checking)
    const testLabelPrinterConnectionOnly = async (settings = labelPrinterSettings, showToast = false) => {
        if (Platform.OS !== "android") {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Print function only supported on Android',
                    text2: 'This feature requires Android platform'
                });
            }
            setLabelPrinterStatus('disconnected');
            return false;
        }

        // Prevent concurrent test attempts
        if (isLabelTesting) {
            if (showToast) {
                Toast.show({
                    type: 'warning',
                    text1: 'Test in progress',
                    text2: 'Please wait for current test to complete'
                });
            }
            return false;
        }

        if (!settings || !isValidPrinterConfig(settings, 'label')) {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Label printer not configured',
                    text2: 'Please configure label printer settings first'
                });
            }
            setLabelPrinterStatus('disconnected');
            return false;
        }

        setIsLabelTesting(true);
        setLabelPrinterStatus('testing');

        const connectionDetails = getConnectionDetails(settings, 'label');
        if (showToast) {
            Toast.show({
                type: 'info',
                text1: 'Testing label printer...',
                text2: connectionDetails
            });
        }

        try {
            // Create a temporary printer instance for testing
            const testPrinter = new XPrinter();

            // Add timeout for connection
            const connectionPromise = connectToPrinter(testPrinter, settings, 'label');
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
            });

            await Promise.race([connectionPromise, timeoutPromise]);

            // Just test connection - no printing
            // Connection successful if we reach this point

            // Close connection immediately
            testPrinter.closeConnection();
            testPrinter.dispose();

            setLabelPrinterStatus('connected');
            if (showToast) {
                Toast.show({
                    type: 'success',
                    text1: 'Label printer test successful',
                    text2: 'Printer is working correctly'
                });
            }
            return true;
        } catch (error) {
            console.error('Label printer test failed:', error);
            setLabelPrinterStatus('disconnected');

            if (showToast) {
                // Provide more specific error messages
                let errorMessage = 'Could not connect to label printer';
                if (error.message.includes('timeout')) {
                    errorMessage = 'Connection timed out - check printer network settings';
                } else if (error.message.includes('IP address')) {
                    errorMessage = 'Invalid IP address or printer not reachable';
                } else if (error.message.includes('USB')) {
                    errorMessage = 'USB device not found or access denied';
                } else if (error.message.includes('Serial')) {
                    errorMessage = 'Serial port not available or already in use';
                }

                Toast.show({
                    type: 'error',
                    text1: 'Label printer test failed',
                    text2: error.message || errorMessage
                });
            }
            return false;
        } finally {
            setIsLabelTesting(false);
        }
    };

    // Test Bill Printer Connection WITH printing (for UI test button)
    const testBillPrinterConnection = async (settings = billPrinterSettings, showToast = false) => {
        if (Platform.OS !== "android") {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Print function only supported on Android',
                    text2: 'This feature requires Android platform'
                });
            }
            setBillPrinterStatus('disconnected');
            return false;
        }

        // Prevent concurrent test attempts
        if (isBillTesting) {
            if (showToast) {
                Toast.show({
                    type: 'warning',
                    text1: 'Test in progress',
                    text2: 'Please wait for current test to complete'
                });
            }
            return false;
        }

        if (!settings || !isValidPrinterConfig(settings, 'bill')) {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Bill printer not configured',
                    text2: 'Please configure bill printer settings first'
                });
            }
            setBillPrinterStatus('disconnected');
            return false;
        }

        setIsBillTesting(true);
        setBillPrinterStatus('testing');

        const connectionDetails = getConnectionDetails(settings, 'bill');
        if (showToast) {
            Toast.show({
                type: 'info',
                text1: 'Testing bill printer...',
                text2: connectionDetails
            });
        }

        try {
            // Create a temporary printer instance for testing
            const testPrinter = new XPrinter();

            // Add timeout for connection
            const connectionPromise = connectToPrinter(testPrinter, settings, 'bill');
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
            });

            await Promise.race([connectionPromise, timeoutPromise]);

            // Test print with actual output
            await testPrinter.printText('Bill Printer Test\nConnection OK\n\n');

            // Close connection immediately
            testPrinter.closeConnection();
            testPrinter.dispose();

            setBillPrinterStatus('connected');
            if (showToast) {
                Toast.show({
                    type: 'success',
                    text1: 'Bill printer test successful',
                    text2: 'Printer is working correctly'
                });
            }
            return true;
        } catch (error) {
            console.error('Bill printer test failed:', error);
            setBillPrinterStatus('disconnected');

            if (showToast) {
                // Provide more specific error messages
                let errorMessage = 'Could not connect to bill printer';
                if (error.message.includes('timeout')) {
                    errorMessage = 'Connection timed out - check printer network settings';
                } else if (error.message.includes('IP address')) {
                    errorMessage = 'Invalid IP address or printer not reachable';
                } else if (error.message.includes('USB')) {
                    errorMessage = 'USB device not found or access denied';
                } else if (error.message.includes('Serial')) {
                    errorMessage = 'Serial port not available or already in use';
                }

                Toast.show({
                    type: 'error',
                    text1: 'Bill printer test failed',
                    text2: error.message || errorMessage
                });
            }
            return false;
        } finally {
            setIsBillTesting(false);
        }
    };

    // Test Label Printer Connection WITH printing (for UI test button)
    const testLabelPrinterConnection = async (settings = labelPrinterSettings, showToast = false) => {
        if (Platform.OS !== "android") {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Print function only supported on Android',
                    text2: 'This feature requires Android platform'
                });
            }
            setLabelPrinterStatus('disconnected');
            return false;
        }

        // Prevent concurrent test attempts
        if (isLabelTesting) {
            if (showToast) {
                Toast.show({
                    type: 'warning',
                    text1: 'Test in progress',
                    text2: 'Please wait for current test to complete'
                });
            }
            return false;
        }

        if (!settings || !isValidPrinterConfig(settings, 'label')) {
            if (showToast) {
                Toast.show({
                    type: 'error',
                    text1: 'Label printer not configured',
                    text2: 'Please configure label printer settings first'
                });
            }
            setLabelPrinterStatus('disconnected');
            return false;
        }

        setIsLabelTesting(true);
        setLabelPrinterStatus('testing');

        const connectionDetails = getConnectionDetails(settings, 'label');
        if (showToast) {
            Toast.show({
                type: 'info',
                text1: 'Testing label printer...',
                text2: connectionDetails
            });
        }

        try {
            // Create a temporary printer instance for testing
            const testPrinter = new XPrinter();

            // Add timeout for connection
            const connectionPromise = connectToPrinter(testPrinter, settings, 'label');
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
            });

            await Promise.race([connectionPromise, timeoutPromise]);

            // Test print using TSPL commands for label printer
            await testPrinter.tsplPrintTest();

            // Close connection immediately
            testPrinter.closeConnection();
            testPrinter.dispose();

            setLabelPrinterStatus('connected');
            if (showToast) {
                Toast.show({
                    type: 'success',
                    text1: 'Label printer test successful',
                    text2: 'Printer is working correctly'
                });
            }
            return true;
        } catch (error) {
            console.error('Label printer test failed:', error);
            setLabelPrinterStatus('disconnected');

            if (showToast) {
                // Provide more specific error messages
                let errorMessage = 'Could not connect to label printer';
                if (error.message.includes('timeout')) {
                    errorMessage = 'Connection timed out - check printer network settings';
                } else if (error.message.includes('IP address')) {
                    errorMessage = 'Invalid IP address or printer not reachable';
                } else if (error.message.includes('USB')) {
                    errorMessage = 'USB device not found or access denied';
                } else if (error.message.includes('Serial')) {
                    errorMessage = 'Serial port not available or already in use';
                }

                Toast.show({
                    type: 'error',
                    text1: 'Label printer test failed',
                    text2: error.message || errorMessage
                });
            }
            return false;
        } finally {
            setIsLabelTesting(false);
        }
    };

    // Test Bill Printer (wrapper for UI)
    const testBillPrinter = async () => {
        return await testBillPrinterConnection(billPrinterSettings, true);
    };

    // Test Label Printer (wrapper for UI)
    const testLabelPrinter = async () => {
        return await testLabelPrinterConnection(labelPrinterSettings, true);
    };

    // Connect and print with Bill Printer (for actual printing operations)
    const printWithBillPrinter = async (printContent, settings = billPrinterSettings) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Print function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return false;
        }

        if (!settings || !isValidPrinterConfig(settings, 'bill')) {
            Toast.show({
                type: 'error',
                text1: 'Bill printer not configured',
                text2: 'Please configure bill printer settings first'
            });
            return false;
        }

        try {
            setBillPrinterStatus('testing'); // Show as busy during print

            // Create a temporary printer instance for printing
            const printPrinter = new XPrinter();

            // Connect to printer
            await connectToPrinter(printPrinter, settings, 'bill');

            // Execute print commands (could be function or text content)
            if (typeof printContent === 'function') {
                await printContent(printPrinter);
            } else {
                await printPrinter.printText(printContent);
            }

            // Close connection immediately
            printPrinter.closeConnection();
            printPrinter.dispose();

            setBillPrinterStatus('connected');
            return true;
        } catch (error) {
            console.error('Bill printer print failed:', error);
            setBillPrinterStatus('disconnected');

            Toast.show({
                type: 'error',
                text1: 'Print failed',
                text2: error.message || 'Could not print to bill printer'
            });
            return false;
        }
    };

    // Connect and print with Label Printer (for actual printing operations)  
    const printWithLabelPrinter = async (printCommands, settings = labelPrinterSettings) => {
        if (Platform.OS !== "android") {
            Toast.show({
                type: 'error',
                text1: 'Print function only supported on Android',
                text2: 'This feature requires Android platform'
            });
            return false;
        }

        if (!settings || !isValidPrinterConfig(settings, 'label')) {
            Toast.show({
                type: 'error',
                text1: 'Label printer not configured',
                text2: 'Please configure label printer settings first'
            });
            return false;
        }

        try {
            setLabelPrinterStatus('testing'); // Show as busy during print

            // Create a temporary printer instance for printing
            const printPrinter = new XPrinter();

            // Connect to printer
            await connectToPrinter(printPrinter, settings, 'label');

            // Execute print commands (could be TSPL commands for labels)
            if (typeof printCommands === 'function') {
                await printCommands(printPrinter);
            } else {
                await printPrinter.printText(printCommands);
            }

            // Close connection immediately
            printPrinter.closeConnection();
            printPrinter.dispose();

            setLabelPrinterStatus('connected');
            return true;
        } catch (error) {
            console.error('Label printer print failed:', error);
            setLabelPrinterStatus('disconnected');

            Toast.show({
                type: 'error',
                text1: 'Print failed',
                text2: error.message || 'Could not print to label printer'
            });
            return false;
        }
    };

    // Refresh settings from storage
    const refreshPrinterSettings = async () => {
        await loadPrinterSettings();
    };

    // Handle settings update (test new connections)
    const handleSettingsUpdate = async () => {
        // Reload settings
        await refreshPrinterSettings();

        // Test connections with new settings (no printing when settings change)
        if (billPrinterSettings && isValidPrinterConfig(billPrinterSettings, 'bill')) {
            setTimeout(() => testBillPrinterConnectionOnly(billPrinterSettings), 500);
        } else {
            setBillPrinterStatus('disconnected');
        }
        if (labelPrinterSettings && isValidPrinterConfig(labelPrinterSettings, 'label')) {
            setTimeout(() => testLabelPrinterConnectionOnly(labelPrinterSettings), 1000);
        } else {
            setLabelPrinterStatus('disconnected');
        }
    };

    const contextValue = {
        // Printer instances
        billPrinter: billPrinterRef.current,
        labelPrinter: labelPrinterRef.current,

        // Connection status
        billPrinterStatus,
        labelPrinterStatus,
        isBillTesting,
        isLabelTesting,

        // Settings
        billPrinterSettings,
        labelPrinterSettings,

        // Test functions
        testBillPrinter,
        testLabelPrinter,
        testBillPrinterConnection,
        testLabelPrinterConnection,
        testBillPrinterConnectionOnly,
        testLabelPrinterConnectionOnly,

        // Print functions
        printWithBillPrinter,
        printWithLabelPrinter,

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
