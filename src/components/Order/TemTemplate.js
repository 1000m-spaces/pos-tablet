import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Convert mm to pixels using device's actual DPI, optimized for tablets
const mmToPixels = (mm) => {
    const { width, height } = Dimensions.get('window');
    const screenWidth = Math.max(width, height); // Use the larger dimension for tablets
    const screenHeight = Math.min(width, height);

    // Get physical dimensions in inches (assuming standard tablet sizes)
    // Most tablets are around 10-12 inches diagonally
    const diagonalInches = Math.sqrt(Math.pow(screenWidth / PixelRatio.get(), 2) + Math.pow(screenHeight / PixelRatio.get(), 2)) / 160;

    // Calculate actual DPI based on physical screen size
    const actualDpi = Math.sqrt(Math.pow(screenWidth, 2) + Math.pow(screenHeight, 2)) / diagonalInches;

    return Math.round((mm * actualDpi) / 25.4); // 25.4mm = 1 inch
};

// Convert px to dp
const pxToDp = (px) => {
    return px / PixelRatio.get();
};

// Calculate dynamic font size based on DPI using dp
const calculateDynamicFontSize = (baseSize) => {
    // Convert base size to dp and scale it
    const baseSizeDp = pxToDp(baseSize);
    // Scale based on device's pixel ratio
    return Math.round(baseSizeDp * PixelRatio.get());
};

// Default printer settings (50mm x 30mm at 96 DPI)
const DEFAULT_SETTINGS = {
    width: mmToPixels(50), // 50mm
    height: mmToPixels(30), // 30mm
    fontSize: {
        storeName: calculateDynamicFontSize(15),
        orderNumber: calculateDynamicFontSize(15),
        itemName: calculateDynamicFontSize(15),
        modifier: calculateDynamicFontSize(14),
        note: calculateDynamicFontSize(14)
    },
    padding: 4,
    margin: 1
};

const PrintTemplate = ({ orderPrint, settings = {} }) => {
    console.log("orderPrint", orderPrint);
    const [printerSettings, setPrinterSettings] = useState(null);
    useEffect(() => {
        const loadPrinterSettings = async () => {
            try {
                const printerInfo = await AsyncStorage.getLabelPrinterInfo();
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
            marginBottom: config.margin,
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
        tableInfo: {
            fontSize: config.fontSize.modifier,
            color: '#000',
            marginLeft: config.margin * 2,
        },
    });

    return (
        <View style={styles.container}>
            {orderPrint?.itemInfo?.items?.map((item, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.orderInfo}>
                            <Text style={styles.orderLabel}>{orderPrint.serviceType === 'offline' ? 'Tại quán' : 'GRAB'}</Text>
                            <Text style={styles.orderLabel}>#</Text>
                            <Text style={styles.orderNumber}>{orderPrint.displayID}</Text>
                            <Text style={styles.pageNumber}>({orderPrint.itemInfo?.itemIdx + 1}/{orderPrint.itemInfo?.totalItems})</Text>
                        </Text>
                        {orderPrint.serviceType === 'offline' && orderPrint.tableName && (
                            <Text style={styles.tableInfo}>Bàn: {orderPrint.tableName}</Text>
                        )}
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

                        {orderPrint.orderNote?.trim() !== '' && (
                            <View style={styles.noteContainer}>
                                <Text style={styles.noteText} numberOfLines={2}>{orderPrint.orderNote}</Text>
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
