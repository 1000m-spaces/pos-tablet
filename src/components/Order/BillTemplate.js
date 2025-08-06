import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from 'store/async_storage/index';

const BillTemplate = ({ selectedOrder }) => {
    const [fontSizes, setFontSizes] = useState({
        header: 24,
        content: 16,
        total: 18
    });

    useEffect(() => {
        const loadBillPrinterSettings = async () => {
            try {
                const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();
                if (billPrinterInfo) {
                    setFontSizes({
                        header: billPrinterInfo.billHeader || 24,
                        content: billPrinterInfo.billContent || 16,
                        total: billPrinterInfo.billTotal || 18
                    });
                }
            } catch (error) {
                console.error('Error loading bill printer settings:', error);
            }
        };

        loadBillPrinterSettings();
    }, []);

    return (
        <View style={{ backgroundColor: 'white', padding: 20 }}>
            <Text style={{ fontSize: fontSizes.header, fontWeight: 'bold', textAlign: 'center' }}>*** HÓA ĐƠN ***</Text>
            <Text style={{ fontSize: fontSizes.content }}>Mã đơn: {selectedOrder.displayID}</Text>
            <Text style={{ fontSize: fontSizes.content }}>--------------------------------</Text>
            {selectedOrder?.itemInfo?.items?.map((item, index) => (
                <Text key={index} style={{ fontSize: fontSizes.content }}>{item.name} x{item.quantity}  {item.price * item.quantity}đ</Text>
            ))}
            <Text style={{ fontSize: fontSizes.content }}>--------------------------------</Text>
            <Text style={{ fontSize: fontSizes.total, fontWeight: 'bold' }}>Tổng cộng: {selectedOrder.orderValue}đ</Text>
            <Text style={{ fontSize: fontSizes.content, textAlign: 'center' }}>Cảm ơn quý khách!</Text>
        </View>
    )
}

export default BillTemplate;
