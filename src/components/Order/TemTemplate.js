import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Convert mm to pixels (96 DPI)
const mmToPixels = (mm) => {
    return Math.round((mm * 96) / 25.4); // 25.4mm = 1 inch
};

// Default printer settings (50mm x 30mm at 96 DPI)
const DEFAULT_SETTINGS = {
    width: mmToPixels(50), // 50mm
    height: mmToPixels(30), // 30mm
    fontSize: {
        storeName: 12,
        orderNumber: 12,
        itemName: 11,
        modifier: 10,
        note: 10
    },
    padding: 4,
    margin: 2
};

const PrintTemplate = ({ orderPrint, settings = {} }) => {
    const [printerSettings, setPrinterSettings] = useState(null);
    useEffect(() => {
        const loadPrinterSettings = async () => {
            try {
                const printerInfo = await AsyncStorage.getPrinterInfo();
                if (printerInfo && printerInfo.sWidth && printerInfo.sHeight) {
                    setPrinterSettings({
                        width: mmToPixels(Number(printerInfo.sWidth)),
                        height: mmToPixels(Number(printerInfo.sHeight))
                    });
                }
            } catch (error) {
                console.error('Error loading printer settings:', error);
            }
        };

        loadPrinterSettings();
    }, []);

    // Merge default settings with provided settings and printer settings
    const config = {
        ...DEFAULT_SETTINGS,
        ...settings,
        ...(printerSettings || {}),
        fontSize: {
            ...DEFAULT_SETTINGS.fontSize,
            ...(settings.fontSize || {})
        }
    };



    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            width: config.width,
        },
        card: {
            padding: config.padding,
            height: config.height,
        },
        header: {
            marginBottom: config.margin * 2,
            borderBottomWidth: 1,
            borderBottomColor: '#000',
            paddingBottom: config.padding,
        },
        storeName: {
            fontSize: config.fontSize.storeName,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: config.margin,
        },
        orderInfo: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        orderLabel: {
            fontSize: config.fontSize.modifier,
            fontWeight: '600',
        },
        orderNumber: {
            fontSize: config.fontSize.orderNumber,
            fontWeight: 'bold',
            marginLeft: config.margin,
        },
        pageNumber: {
            fontSize: config.fontSize.modifier,
            marginLeft: config.margin * 2,
            color: '#000',
        },
        itemContainer: {
            marginTop: config.padding,
        },
        itemRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: config.margin,
        },
        itemName: {
            fontSize: config.fontSize.itemName,
            fontWeight: '600',
            flex: 1,
            marginRight: config.padding,
        },
        itemPrice: {
            fontSize: config.fontSize.itemName,
            fontWeight: '600',
        },
        modifiersContainer: {
            marginLeft: config.padding * 2,
            marginTop: config.margin,
        },
        modifierText: {
            fontSize: config.fontSize.modifier,
            color: '#000',
            marginBottom: config.margin / 2,
        },
        noteContainer: {
            marginTop: config.padding,
            padding: config.margin,
            backgroundColor: '#F5F5F5',
        },
        noteText: {
            fontSize: config.fontSize.note,
            color: '#000',
        },
    });

    return (
        <View style={styles.container}>
            {orderPrint.itemInfoDetail?.items?.map((item, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.orderInfo}>
                            <Text style={styles.orderLabel}>GRAB</Text>
                            <Text style={styles.orderLabel}>#</Text>
                            <Text style={styles.orderNumber}>{orderPrint.displayID}</Text>
                            <Text style={styles.pageNumber}>({orderPrint.itemInfoDetail?.itemIdx + 1}/{orderPrint.itemInfoDetail?.totalItems})</Text>
                        </Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <View style={styles.itemRow}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{item.fare.priceDisplay}{item.fare.currencySymbol}</Text>
                        </View>
                        {
                            item.modifierGroups?.length > 0 && (
                                <View style={styles.modifiersContainer}>
                                    {item.modifierGroups?.map((modifierGroup, idx) => (
                                        modifierGroup.modifiers.map((modifier, idx) => (
                                            <Text key={idx} style={styles.modifierText} numberOfLines={1}>• {modifier.modifierName}</Text>
                                        ))
                                    ))}
                                </View>
                            )}

                        {item.comment?.trim() !== '' && (
                            <View style={styles.noteContainer}>
                                <Text style={styles.noteText} numberOfLines={2}>{item.comment}</Text>
                            </View>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};

export default PrintTemplate;
