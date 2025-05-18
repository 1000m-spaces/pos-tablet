import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const BillTemplate = ({ selectedOrder }) => {
    return (
        <View style={{ backgroundColor: 'white', padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>*** HÓA ĐƠN ***</Text>
            <Text>Mã đơn: {selectedOrder.displayID}</Text>
            <Text>--------------------------------</Text>
            {selectedOrder?.itemInfo?.items?.map((item, index) => (
                <Text key={index}>{item.name} x{item.quantity}  {item.price * item.quantity}đ</Text>
            ))}
            <Text>--------------------------------</Text>
            <Text style={{ fontWeight: 'bold' }}>Tổng cộng: {selectedOrder.orderValue}đ</Text>
            <Text style={{ textAlign: 'center' }}>Cảm ơn quý khách!</Text>
        </View>
    )
}

export default BillTemplate;
