import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from 'store/async_storage/index'
import { getOrderChannelsSelector } from 'store/selectors';

// Convert mm to pixels for actual label printer output
const mmToPixels = (mm, dpi = 72) => {
    // For actual label printers, use a configurable DPI
    // Most thermal label printers work at 203 DPI (8 dots/mm) or similar
    // But for React Native printing, we can adjust based on user preferences

    // Use configurable DPI from printer settings
    const LABEL_PRINTER_DPI = dpi; // Configurable DPI for actual printing

    const pixelValue = Math.round((mm * LABEL_PRINTER_DPI) / 25.4);
    console.log(`mmToPixels: ${mm}mm -> ${pixelValue}px (using ${LABEL_PRINTER_DPI} DPI for label printer)`);

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
    const FONT_SCALE_FACTOR = 1; // Reduce font sizes by 40% for label printing

    return Math.max(Math.round(baseSize * FONT_SCALE_FACTOR), 5); // Minimum font size of 8
};

// Default printer settings (50mm x 30mm at default DPI)
const getDefaultSettings = (dpi = 72) => ({
    width: mmToPixels(50 - 4, dpi), // 50mm
    height: mmToPixels(30 - 4, dpi), // 30mm
    fontSize: {
        storeName: calculateDynamicFontSize(16),
        orderNumber: calculateDynamicFontSize(16),
        tableInfo: calculateDynamicFontSize(14),
        dateTime: calculateDynamicFontSize(8),
        priceText: calculateDynamicFontSize(8),
        pageCounter: calculateDynamicFontSize(14),
        itemName: calculateDynamicFontSize(16),
        modifier: calculateDynamicFontSize(14),
        note: calculateDynamicFontSize(14),
        quantity: calculateDynamicFontSize(14),
        channelInfo: calculateDynamicFontSize(8)
    },
    padding: 6,
    margin: 2
});

const PrintTemplate = ({ orderPrint, settings = {} }) => {
    console.log("orderPrint", orderPrint);
    const orderChannels = useSelector(state => getOrderChannelsSelector(state));
    const [printerSettings, setPrinterSettings] = useState(null);
    useEffect(() => {
        const loadPrinterSettings = async () => {
            try {
                const printerInfo = await AsyncStorage.getLabelPrinterInfo();
                if (printerInfo && printerInfo.sWidth && printerInfo.sHeight) {
                    const dpi = printerInfo.labelPrinterDPI || 72;
                    setPrinterSettings({
                        width: mmToPixels(Number(printerInfo.sWidth) - 4, dpi),
                        height: mmToPixels(Number(printerInfo.sHeight) - 4, dpi),
                        dpi: dpi,
                        fontSize: {
                            storeName: calculateDynamicFontSize(printerInfo.labelStoreName || 16),
                            orderNumber: calculateDynamicFontSize(printerInfo.labelOrderNumber || 16),
                            tableInfo: calculateDynamicFontSize(10),
                            dateTime: calculateDynamicFontSize(printerInfo.labelDateTime || 8),
                            priceText: calculateDynamicFontSize(printerInfo.labelPriceText || 8),
                            pageCounter: calculateDynamicFontSize(printerInfo.labelPageCounter || 10),
                            itemName: calculateDynamicFontSize(printerInfo.labelItemName || 16),
                            modifier: calculateDynamicFontSize(printerInfo.labelModifier || 14),
                            note: calculateDynamicFontSize(printerInfo.labelNote || 14),
                            quantity: calculateDynamicFontSize(printerInfo.labelQuantity || 14),
                            channelInfo: calculateDynamicFontSize(printerInfo.labelChannelInfo || 8)
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading printer settings:', error);
            }
        };

        loadPrinterSettings();
    }, []);

    // Get default settings with appropriate DPI
    const DEFAULT_SETTINGS = getDefaultSettings(printerSettings?.dpi || 72);

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
            marginLeft: 4,
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
            maxWidth: config.width,
        },
        additionalOrderId: {
            flex: 1,
            fontSize: config.fontSize.channelInfo,
            fontWeight: '700',
            color: '#000',
            textAlign: 'left',
        },
        dateTime: {
            flex: 1.5,
            fontSize: config.fontSize.dateTime,
            color: '#000',
            textAlign: 'center',
        },
        priceText: {
            flex: 1,
            fontSize: config.fontSize.priceText,
            fontWeight: '700',
            color: '#000',
            textAlign: 'right',
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

    const getOrderTypeText = (order) => {
        var orderType = orderChannels.find(channel => channel.id === order.chanel_type_id) || { name_vn: 'Mang đi', name: 'Mang đi' }
        return orderType?.name_vn || orderType?.name || 'Mang đi';
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
                        <View style={styles.spacerFlex} />
                        <Text style={styles.tableInfo}>
                            /{orderPrint.table || '——'}
                        </Text>
                        <Text style={styles.pageCounter}>
                            ({index + 1}/{itemsToRender.length})
                        </Text>
                    </View>

                    {/* Item Name */}
                    <View style={styles.itemNameSection}>
                        <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                            {item.item_name}
                        </Text>
                    </View>

                    {/* Modifiers/Options/Notes */}
                    {(item.stringName || item.option || item.extrastring || item.note_prod || orderPrint.note) && (
                        <View style={styles.modifierSection}>
                            <Text style={styles.modifierText} numberOfLines={2} ellipsizeMode="tail">
                                {[
                                    item.stringName,
                                    item.option,
                                    item.extrastring,
                                    item.note_prod && item.note_prod.trim() !== '' ? `* ${item.note_prod}` : null,
                                    orderPrint.note && orderPrint.note.trim() !== '' ? `** ${orderPrint.note}` : null
                                ]
                                    .filter(text => text && text.trim() !== '')
                                    .join(' / ')}
                            </Text>
                        </View>
                    )}

                    {/* Bottom section with additional order info, date/time, and price */}
                    <View style={styles.bottomSection}>
                        <View style={styles.bottomRow}>
                            {/* Additional order identifier (like GF-248) - always render for consistent layout */}
                            <Text style={styles.additionalOrderId}>
                                {getOrderTypeText(orderPrint)}
                            </Text>
                            <Text style={styles.dateTime}>
                                {orderPrint.date ? new Date(orderPrint.date).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : ''}
                            </Text>
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
