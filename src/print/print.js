import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Colors from 'theme/Colors';
import { SafeAreaView } from 'react-native';
import Toast from 'react-native-toast-message'
import PrinterSettingsModal from 'common/PrinterSettingsModal';
import { usePrinter } from '../services/PrinterService';

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
    const [showPrinterSettings, setShowPrinterSettings] = useState(false);

    // Use the PrinterService instead of managing printers directly
    const {
        // Bill printer status and functions
        billPrinter,
        billPrinterStatus,
        isBillConnecting,
        billPrinterSettings,
        connectBillPrinter,
        disconnectBillPrinter,
        testBillPrinter,

        // Label printer status and functions
        labelPrinter,
        labelPrinterStatus,
        isLabelConnecting,
        labelPrinterSettings,
        connectLabelPrinter,
        disconnectLabelPrinter,
        testLabelPrinter,

        // Utility functions
        getConnectionDetails,
        handleSettingsUpdate,
    } = usePrinter();

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
            await sendToPrinter(imageData);
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

        // Check if bill printer is connected
        if (billPrinterStatus !== 'connected') {
            Toast.show({
                type: 'error',
                text1: 'Bill printer not connected',
                text2: 'Please connect to bill printer first'
            });
            return;
        }

        try {
            // Get printer width based on paper size (default to 80mm)
            const printerWidth = getThermalPrinterWidth(billPrinterSettings?.billPaperSize || '80mm');

            // Print the bitmap using the service's bill printer
            await billPrinter.printBitmap(imageData, 1, printerWidth, 0);

            // Show success message with connection details
            const connectionDetails = getConnectionDetails(billPrinterSettings, 'bill');
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
        }
    };

    const handleSettingsSaved = async (newSettings) => {
        // Use the service's settings update handler
        await handleSettingsUpdate();

        Toast.show({
            type: 'success',
            text1: 'Settings Updated',
            text2: 'Printer settings have been updated and connections refreshed'
        });
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: Colors.bgInput,
                position: 'relative',
                zIndex: 1,
            }}>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                    padding: 20,
                }}
                showsVerticalScrollIndicator={false}>

                {/* Printer Settings Info */}
                <View style={{ backgroundColor: 'white', padding: 15, marginBottom: 20, borderRadius: 10, width: '100%', maxWidth: 400, elevation: 2 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>Printer Service Test Screen</Text>

                    {/* Bill Printer Status */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Bill Printer</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: billPrinterStatus === 'connected' ? '#34C759' :
                                    billPrinterStatus === 'connecting' ? '#FF9500' : '#FF3B30',
                                marginRight: 8
                            }} />
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: billPrinterStatus === 'connected' ? '#34C759' :
                                    billPrinterStatus === 'connecting' ? '#FF9500' : '#FF3B30'
                            }}>
                                {billPrinterStatus === 'connected' ? 'Connected' :
                                    billPrinterStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                            {getConnectionDetails(billPrinterSettings, 'bill')}
                        </Text>
                    </View>

                    {/* Label Printer Status */}
                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Label Printer</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: labelPrinterStatus === 'connected' ? '#34C759' :
                                    labelPrinterStatus === 'connecting' ? '#FF9500' : '#FF3B30',
                                marginRight: 8
                            }} />
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: labelPrinterStatus === 'connected' ? '#34C759' :
                                    labelPrinterStatus === 'connecting' ? '#FF9500' : '#FF3B30'
                            }}>
                                {labelPrinterStatus === 'connected' ? 'Connected' :
                                    labelPrinterStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                            {getConnectionDetails(labelPrinterSettings, 'label')}
                        </Text>
                    </View>
                </View>

                {/* Control Buttons */}
                <View style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}>
                    {/* First Row - Settings */}
                    <View style={{ marginBottom: 10 }}>
                        <TouchableOpacity
                            onPress={() => setShowPrinterSettings(true)}
                            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}>
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '500' }}>
                                Printer Settings
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Second Row - Bill Printer Controls */}
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Bill Printer Controls</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={billPrinterStatus === 'connected' ? disconnectBillPrinter : connectBillPrinter}
                                disabled={isBillConnecting}
                                style={{
                                    backgroundColor: billPrinterStatus === 'connected' ? '#FF3B30' : '#34C759',
                                    padding: 10,
                                    borderRadius: 8,
                                    flex: 1,
                                    opacity: isBillConnecting ? 0.7 : 1
                                }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 14, fontWeight: '500' }}>
                                    {isBillConnecting ? 'Connecting...' :
                                        billPrinterStatus === 'connected' ? 'Disconnect' : 'Connect'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={testBillPrinter}
                                disabled={isBillConnecting}
                                style={{
                                    backgroundColor: '#FF9500',
                                    padding: 10,
                                    borderRadius: 8,
                                    flex: 1,
                                    opacity: isBillConnecting ? 0.7 : 1
                                }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 14, fontWeight: '500' }}>
                                    Test Bill
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Third Row - Label Printer Controls */}
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Label Printer Controls</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={labelPrinterStatus === 'connected' ? disconnectLabelPrinter : connectLabelPrinter}
                                disabled={isLabelConnecting}
                                style={{
                                    backgroundColor: labelPrinterStatus === 'connected' ? '#FF3B30' : '#34C759',
                                    padding: 10,
                                    borderRadius: 8,
                                    flex: 1,
                                    opacity: isLabelConnecting ? 0.7 : 1
                                }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 14, fontWeight: '500' }}>
                                    {isLabelConnecting ? 'Connecting...' :
                                        labelPrinterStatus === 'connected' ? 'Disconnect' : 'Connect'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={testLabelPrinter}
                                disabled={isLabelConnecting}
                                style={{
                                    backgroundColor: '#FF9500',
                                    padding: 10,
                                    borderRadius: 8,
                                    flex: 1,
                                    opacity: isLabelConnecting ? 0.7 : 1
                                }}>
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 14, fontWeight: '500' }}>
                                    Test Label
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                    disabled={billPrinterStatus !== 'connected' || isBillConnecting}
                    style={{
                        backgroundColor: billPrinterStatus === 'connected' ? '#FF9500' : '#999999',
                        padding: 15,
                        borderRadius: 8,
                        width: 250,
                        marginTop: 20,
                        marginBottom: 20,
                        opacity: (billPrinterStatus !== 'connected' || isBillConnecting) ? 0.7 : 1
                    }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                        {billPrinterStatus === 'connected' ? 'Print Bill' : 'Connect Bill Printer to Print'}
                    </Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Printer Settings Modal */}
            <PrinterSettingsModal
                visible={showPrinterSettings}
                onClose={() => setShowPrinterSettings(false)}
                initialPrinterType="bill"
                onSettingsSaved={handleSettingsSaved}
            />

            {/* Toast component wrapper with high z-index */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                elevation: 9999,
                pointerEvents: 'none'
            }}>
                <Toast
                    position="top"
                    topOffset={50}
                    visibilityTime={4000}
                />
            </View>
        </SafeAreaView>
    );
};

export default XPrinterOrderExample;
