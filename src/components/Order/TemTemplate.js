import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const PrintTemplate = ({ orderPrint }) => {
    return (
        <>
            {orderPrint.itemInfoDetail?.items?.map((item, index) => (
                <View key={index} style={styles.card}>
                    <Text style={styles.foodApp}>
                        <Text style={{ fontWeight: '700' }}>{"GRAB"} #</Text>
                        <Text style={{ fontSize: 28, fontWeight: '700' }}>{orderPrint.displayID}</Text>
                        <Text style={styles.page}>({index + 1}/{orderPrint.itemInfoDetail?.items?.length})</Text>
                    </Text>
                    <View style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    {
                        item.modifierGroups.map((v, idx) => {
                            return (
                                <Text key={idx} style={styles.optionText}> - {v.modifiers[0].modifierName}</Text>
                            )
                        })
                    }
                    {item.comment?.trim() !== '' && (
                        <Text style={styles.orderNote}>** {item.comment}</Text>
                    )}
                    <View style={styles.amountRow}>
                        <Text style={styles.amount}>{item.fare.priceDisplay}{item.fare.currencySymbol}</Text>
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
        padding: 20,
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
