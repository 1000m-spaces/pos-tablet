import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import iconv from 'iconv-lite';

// ESC/POS Commands Enum
const EscPosCommands = {
    ESC: '\x1B',
    NEW_LINE: '\n',
    RESET: '\x1B@',
    ALIGN_CENTER: '\x1Ba1',
    ALIGN_LEFT: '\x1Ba0',
    DOUBLE_SIZE: '\x1B!0x11',
    CUT_PAPER: '\x1Bd\x03',
    SET_ENCODING_CP1258: '\x1B\x74\x1E', // Vietnamese encoding
};

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

const formatOrderForPrint = (order) => {
    let bill = EscPosCommands.RESET + EscPosCommands.SET_ENCODING_CP1258;

    // Header
    bill +=
        EscPosCommands.ALIGN_CENTER +
        EscPosCommands.DOUBLE_SIZE +
        '*** HÓA ĐƠN ***' +
        EscPosCommands.NEW_LINE +
        EscPosCommands.NEW_LINE;

    bill +=
        EscPosCommands.ALIGN_LEFT +
        `Mã đơn: ${order.orderId}` +
        EscPosCommands.NEW_LINE +
        `Ngày: ${order.date}` +
        EscPosCommands.NEW_LINE +
        `Khách hàng: ${order.customerName}` +
        EscPosCommands.NEW_LINE +
        '--------------------------------' +
        EscPosCommands.NEW_LINE;

    // Items
    order.items.forEach((item) => {
        const totalItemPrice = item.price * item.quantity;
        bill += `${item.name} x${item.quantity}  ${totalItemPrice.toLocaleString()}đ` + EscPosCommands.NEW_LINE;
    });

    bill += '--------------------------------' + EscPosCommands.NEW_LINE;

    // Total
    bill +=
        EscPosCommands.ALIGN_LEFT +
        `Tổng cộng: ${order.total.toLocaleString()}đ` +
        EscPosCommands.NEW_LINE +
        EscPosCommands.NEW_LINE;

    // Footer
    bill +=
        EscPosCommands.ALIGN_CENTER +
        'Cảm ơn quý khách!' +
        EscPosCommands.NEW_LINE +
        EscPosCommands.NEW_LINE +
        EscPosCommands.CUT_PAPER;

    return iconv.encode(bill, 'windows-1258');
};

const XPrinterOrderExample = () => {
    const [printerIP, setPrinterIP] = useState('192.168.1.103'); // Change to your printer's IP
    const [printerPort, setPrinterPort] = useState('9100'); // Default ESC/POS port

    const printOrder = () => {
        const options = { host: printerIP, port: parseInt(printerPort, 10) };
        const client = TcpSocket.createConnection(options, () => {
            console.log('Connected to printer');

            // Convert order data to ESC/POS format
            const printData = formatOrderForPrint(orderData);

            client.write(printData, () => {
                console.log('Printed successfully');
                Alert.alert('Success', 'Printed successfully');
                client.destroy();
            });
        });

        client.on('error', (error) => {
            console.error('Printer error:', error);
            Alert.alert('Error', 'Failed to print');
            client.destroy();
        });
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18 }}>Print Order Bill</Text>
            <Button title="Print Order" onPress={printOrder} />
        </View>
    );
};

export default XPrinterOrderExample;
