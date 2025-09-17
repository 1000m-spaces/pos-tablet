import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import AsyncStorage from 'store/async_storage/index'

// Convert mm to pixels for actual label printer output
const mmToPixels = (mm) => {
    // For actual label printers, use a much lower and fixed DPI
    // Most thermal label printers work at 203 DPI (8 dots/mm) or similar
    // But for React Native printing, we need even lower values to prevent oversized labels

    // Use a conservative fixed DPI that works well with actual printers
    // This is roughly equivalent to 72-96 DPI but optimized for label printing
    const LABEL_PRINTER_DPI = 72; // Much more conservative DPI for actual printing

    const pixelValue = Math.round((mm * LABEL_PRINTER_DPI) / 25.4);
    console.log(`mmToPixels: ${mm}mm -> ${pixelValue}px (using fixed ${LABEL_PRINTER_DPI} DPI for label printer)`);

    return pixelValue;
};

// Convert px to dp
const pxToDp = (px) => {
    return px / PixelRatio.get();
};

// Calculate font size optimized for label printing
const calculateDynamicFontSize = (baseSize) => {
    // For label printing, use a much more conservative font scaling
    // Don't rely on screen pixel ratio as it makes labels too large
    const FONT_SCALE_FACTOR = 0.9; // Reduce font sizes by 40% for label printing

    return Math.max(Math.round(baseSize * FONT_SCALE_FACTOR), 8); // Minimum font size of 8
};

// Default printer settings (50mm x 30mm at 96 DPI)
const DEFAULT_SETTINGS = {
    width: mmToPixels(50 - 4), // 50mm
    height: mmToPixels(30 - 4), // 30mm
    fontSize: {
        storeName: calculateDynamicFontSize(16),
        orderNumber: calculateDynamicFontSize(18),
        tableInfo: calculateDynamicFontSize(16),
        dateTime: calculateDynamicFontSize(12),
        pageCounter: calculateDynamicFontSize(16),
        itemName: calculateDynamicFontSize(16),
        modifier: calculateDynamicFontSize(14),
        note: calculateDynamicFontSize(14),
        quantity: calculateDynamicFontSize(14),
        channelInfo: calculateDynamicFontSize(12)
    },
    padding: 6,
    margin: 2
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
                        width: mmToPixels(Number(printerInfo.sWidth) - 4),
                        height: mmToPixels(Number(printerInfo.sHeight) - 4),
                        fontSize: {
                            storeName: calculateDynamicFontSize(printerInfo.labelStoreName || 16),
                            orderNumber: calculateDynamicFontSize(printerInfo.labelOrderNumber || 18),
                            tableInfo: calculateDynamicFontSize(printerInfo.labelTableInfo || 16),
                            dateTime: calculateDynamicFontSize(printerInfo.labelDateTime || 12),
                            pageCounter: calculateDynamicFontSize(printerInfo.labelPageCounter || 16),
                            itemName: calculateDynamicFontSize(printerInfo.labelItemName || 16),
                            modifier: calculateDynamicFontSize(printerInfo.labelModifier || 14),
                            note: calculateDynamicFontSize(printerInfo.labelNote || 14),
                            quantity: calculateDynamicFontSize(printerInfo.labelQuantity || 14),
                            channelInfo: calculateDynamicFontSize(printerInfo.labelChannelInfo || 12)
                        }
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
            ...(settings.fontSize || {}),
            ...(printerSettings?.fontSize || {})
        }
    };



    const styles = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            maxWidth: config.width,
        },
        card: {
            padding: config.padding,
            height: config.height,
        },
        // Header line with order number, table, and page counter
        headerLine: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: config.margin * 2,
        },
        orderNumber: {
            fontSize: config.fontSize.orderNumber,
            fontWeight: '900',
            color: '#000',
        },
        tableInfo: {
            fontSize: config.fontSize.tableInfo,
            fontWeight: '900',
            color: '#000',
            marginLeft: 2,
        },
        pageCounter: {
            fontSize: config.fontSize.pageCounter,
            fontWeight: '700',
            color: '#000',
        },
        spacerFlex: {
            flex: 1,
        },
        // Item name section
        itemNameSection: {
            marginBottom: config.margin * 2,
        },
        itemName: {
            fontSize: config.fontSize.itemName,
            fontWeight: '700',
            color: '#000',
            lineHeight: config.fontSize.itemName + 2,
        },
        // Modifier section
        modifierSection: {
            marginBottom: config.margin,
        },
        modifierText: {
            fontSize: config.fontSize.modifier,
            color: '#000',
            lineHeight: config.fontSize.modifier + 2,
        },
        // Item note section
        itemNoteSection: {
            marginBottom: config.margin,
        },
        itemNoteText: {
            fontSize: config.fontSize.note,
            fontWeight: '700',
            color: '#000',
            lineHeight: config.fontSize.note + 2,
        },
        // Order note section
        orderNoteSection: {
            marginBottom: config.margin,
        },
        orderNoteText: {
            fontSize: config.fontSize.note,
            fontWeight: '700',
            color: '#000',
            lineHeight: config.fontSize.note + 2,
        },
        // Service type section
        serviceTypeSection: {
            marginBottom: config.margin * 2,
        },
        serviceTypeText: {
            fontSize: config.fontSize.modifier,
            fontWeight: '700',
            color: '#000',
        },
        // Bottom section
        bottomSection: {
            // marginBottom: 10,
        },
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        additionalOrderId: {
            fontSize: config.fontSize.channelInfo,
            fontWeight: '700',
            color: '#000',
        },
        dateTime: {
            fontSize: config.fontSize.dateTime,
            color: '#000',
            textAlign: 'center',
        },
        priceText: {
            fontSize: config.fontSize.quantity,
            fontWeight: '700',
            color: '#000',
        },
    });

    // Use decals array if available, otherwise fall back to itemInfo structure
    const itemsToRender = orderPrint?.decals || (orderPrint?.itemInfo?.items ?
        orderPrint.itemInfo.items.map((item, idx) => ({
            item_name: item.name,
            stringName: item.modifierGroups?.flatMap(mg =>
                mg.modifiers?.map(m => m.modifierName) || []
            ).join(' / ') || '',
            option: '',
            extrastring: '',
            note_prod: item.comment || '',
            amount: item.quantity || 1,
            itemIdx: idx,
            totalItems: orderPrint.itemInfo.items.length
        })) : []);

    // Helper function to get service type display text
    const getServiceTypeText = (order) => {
        if (order.serviceType === 'offline') return 'Mang đi';
        if (order.serviceType === 'delivery') return 'Giao hàng';
        if (order.serviceType === 'dine-in') return 'Tại chỗ';
        return 'Mang đi'; // Default
    };

    // Helper function to format price
    const formatPrice = (price) => {
        if (!price) return '';
        if (typeof price === 'number') {
            return price.toLocaleString('vi-VN') + 'đ';
        }
        return price.toString() + 'đ';
    };

    return (
        <View style={styles.container}>
            {itemsToRender.map((item, index) => (
                <View key={index} style={styles.card}>
                    {/* Header with order number, table info, and page counter in one line */}
                    <View style={styles.headerLine}>
                        <Text style={styles.orderNumber}>
                            #{orderPrint.bill_id || orderPrint.displayID}
                        </Text>
                        <Text style={styles.tableInfo}>
                            /{orderPrint.table || '——'}
                        </Text>
                        <View style={styles.spacerFlex} />
                        <Text style={styles.pageCounter}>
                            ({index + 1}/{itemsToRender.length})
                        </Text>
                    </View>

                    {/* Item Name */}
                    <View style={styles.itemNameSection}>
                        <Text style={styles.itemName} numberOfLines={3}>
                            {item.item_name}
                        </Text>
                    </View>

                    {/* Modifiers/Options */}
                    {(item.stringName || item.option || item.extrastring) && (
                        <View style={styles.modifierSection}>
                            <Text style={styles.modifierText} numberOfLines={3}>
                                {[item.stringName, item.option, item.extrastring]
                                    .filter(text => text && text.trim() !== '')
                                    .join(' / ')}
                            </Text>
                        </View>
                    )}

                    {/* Item Note */}
                    {item.note_prod && item.note_prod.trim() !== '' && (
                        <View style={styles.itemNoteSection}>
                            <Text style={styles.itemNoteText} numberOfLines={2}>
                                * {item.note_prod}
                            </Text>
                        </View>
                    )}

                    {/* Order Note */}
                    {orderPrint.note && orderPrint.note.trim() !== '' && (
                        <View style={styles.orderNoteSection}>
                            <Text style={styles.orderNoteText} numberOfLines={2}>
                                ** {orderPrint.note}
                            </Text>
                        </View>
                    )}

                    {/* Service Type */}
                    <View style={styles.serviceTypeSection}>
                        <Text style={styles.serviceTypeText}>
                            {getServiceTypeText(orderPrint)}
                        </Text>
                    </View>

                    {/* Bottom section with additional order info, date/time, and price */}
                    <View style={styles.bottomSection}>
                        <View style={styles.bottomRow}>
                            {/* Additional order identifier (like GF-248) */}
                            {orderPrint.foodapp_order_id && orderPrint.foodapp_order_id !== orderPrint.displayID && (
                                <Text style={styles.additionalOrderId}>
                                    {orderPrint.foodapp_order_id}
                                </Text>
                            )}
                            <View style={styles.spacerFlex} />
                            <Text style={styles.dateTime}>
                                {orderPrint.date ? new Date(orderPrint.date).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : ''}
                            </Text>
                            <View style={styles.spacerFlex} />
                            <Text style={styles.priceText}>
                                {formatPrice(item.price || item.priceDisplay)}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default PrintTemplate;
