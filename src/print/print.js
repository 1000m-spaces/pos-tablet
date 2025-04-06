import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Colors from 'theme/Colors';
import { SafeAreaView } from 'react-native';
import { netConnect, printBitmap } from 'rn-xprinter';
import Toast from 'react-native-toast-message'


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

    const captureAndPrint = async () => {
        try {
            const imageData = await viewShotRef.current.capture();
            // Send to printer
            sendToPrinter(imageData);
        } catch (error) {
            console.error('Error capturing/printing:', error);
        }
    };

    const sendToPrinter = (imageData) => {
        netConnect(XPRINTER_IP).then(() => {
            printBitmap(imageData, 1, 200, 0)
            Toast.show({
                type: 'success',
                text1: 'Print success'
            });
        }).catch(err => {
            Toast.show({
                type: 'error',
                text1: 'Print error'
            });
        })
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: Colors.bgInput,
                flexDirection: 'column',
                alignContent: 'center',
            }}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'base64' }}>
                <View style={{ backgroundColor: 'white', padding: 20, width: 250 }}>
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
            <Text onPress={captureAndPrint} style={{ backgroundColor: 'blue', color: 'white', padding: 10, width: 250, textAlign: 'center' }}>
                Print Bill
            </Text>
            <Toast />
        </SafeAreaView>
    );
};

export default XPrinterOrderExample;
