import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const PrintTemplate = ({ orderPrint }) => {
    return (
        <>
            {orderPrint.itemInfo.items.map((item, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.headerRow}>
                        <Text style={styles.billId}>#{orderPrint.bill_id || '1'}</Text>
                        <Text style={styles.table}>({orderPrint.table || '1'})</Text>
                        {/* <Text style={styles.date}>{formatShortTime(orderPrint.date || "")}</Text> */}
                        <Text style={styles.page}>({index + 1}/{orderPrint.itemInfo.items.length})</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    {/* <Text style={styles.optionText}> - {item.stringName + ' / ' + item.option + item.extrastring}</Text>
                    {orderPrint.note?.trim() !== '' && (
                        <Text style={styles.orderNote}>** {orderPrint.note}</Text>
                    )} */}
                    {orderPrint.displayID && orderPrint.displayID != "" ? (
                        <Text style={styles.foodApp}>
                            <Text style={{ fontWeight: '700' }}>{"GRAB"} #</Text>
                            <Text style={{ fontSize: 28, fontWeight: '700' }}>{orderPrint.displayID}</Text>
                        </Text>
                    ) : null}
                    <View style={styles.amountRow}>
                        <Text style={styles.amount}>{item.amount}</Text>
                    </View>
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 400,
        backgroundColor: 'white',
    },
    card: {
        padding: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    billId: {
        fontSize: 26,
        fontWeight: '900',
    },
    table: {
        fontSize: 24,
        fontWeight: '900',
    },
    date: {
        fontSize: 16,
    },
    page: {
        fontSize: 24,
        fontWeight: '700',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 24,
        fontWeight: '700',
    },
    optionText: {
        fontSize: 20,
    },
    noteText: {
        fontSize: 20,
        fontWeight: '700',
    },
    orderNote: {
        fontSize: 20,
        fontWeight: '700',
    },
    foodApp: {
        fontSize: 20,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
    },
});

export default PrintTemplate;
