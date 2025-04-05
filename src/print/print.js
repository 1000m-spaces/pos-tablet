import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import ViewShot from 'react-native-view-shot';
import TcpSocket from 'react-native-tcp-socket';
import { imageSize } from 'image-size';
import Colors from 'theme/Colors';
import { Buffer } from 'buffer'
import { SafeAreaView } from 'react-native';
import FileViewer from 'react-native-file-viewer';

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
            // Convert base64 to buffer
            const imageBuffer = Buffer.from(imageData, 'base64');
            // Get image size
            const { width, height } = imageSize(imageBuffer);

            // Convert image to ESC/POS raster format
            const escPosImage = generateEscPosImage(imageBuffer, width, height);

            // Send to printer
            sendToPrinter(escPosImage);
        } catch (error) {
            console.error('Error capturing/printing:', error);
        }
    };

    const generateEscPosImage = (imageBuffer, width, height) => {
        let escPosCommands = [];

        // ESC * (Raster Mode Image)
        escPosCommands.push(Buffer.from([0x1D, 0x76, 0x30, 0x00, width / 8, 0x00, height, 0x00]));
        escPosCommands.push(imageBuffer);

        // Add Feed & Cut
        escPosCommands.push(Buffer.from([0x1B, 0x64, 0x03])); // Feed 3 lines
        escPosCommands.push(Buffer.from([0x1D, 0x56, 0x01])); // Full Cut

        return Buffer.concat(escPosCommands);
    };

    const sendToPrinter = (data) => {
        const client = TcpSocket.createConnection({ host: XPRINTER_IP, port: XPRINTER_PORT }, () => {
            console.log('Connected to printer');
            client.write(data);
            client.destroy();
        });

        client.on('error', (error) => {
            console.error('Printer error:', error);
            client.destroy();
        });
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: Colors.bgInput,
                flexDirection: 'row',
            }}>
            <View>
                <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'base64' }}>
                    <View style={{ backgroundColor: 'white', padding: 20 }}>
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
                <Text onPress={captureAndPrint} style={{ backgroundColor: 'blue', color: 'white', padding: 10, textAlign: 'center' }}>
                    Print Bill
                </Text>
            </View>
        </SafeAreaView>
    );
};

export default XPrinterOrderExample;
