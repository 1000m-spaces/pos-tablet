import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from 'store/async_storage/index'
import { getOrderChannelsSelector } from 'store/selectors';

// Convert mm to pixels for actual label printer output
const mmToPixels = (mm, dpi = 72) => {
    const LABEL_PRINTER_DPI = dpi; // Configurable DPI for actual printing
    const pixelValue = Math.round((mm * LABEL_PRINTER_DPI) / 25.4);
    return pixelValue;
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
    width: mmToPixels(50, dpi), // 50mm
    height: mmToPixels(30, dpi), // 30mm
    fontSize: {
        storeName: calculateDynamicFontSize(12),
        orderNumber: calculateDynamicFontSize(12),
        tableInfo: calculateDynamicFontSize(10),
        dateTime: calculateDynamicFontSize(8),
        priceText: calculateDynamicFontSize(8),
        pageCounter: calculateDynamicFontSize(8),
        itemName: calculateDynamicFontSize(12),
        modifier: calculateDynamicFontSize(10),
        note: calculateDynamicFontSize(10),
        quantity: calculateDynamicFontSize(10),
        channelInfo: calculateDynamicFontSize(8)
    },
    padding: 5,
    margin: 2
});

const PrintTemplate = ({ orderPrint, settings = {} }) => {
    console.log("TemTemplate orderPrint:", orderPrint);
    console.log("TemTemplate decals:", orderPrint?.decals);
    console.log("TemTemplate itemInfo:", orderPrint?.itemInfo);
    console.log("TemTemplate table:", orderPrint?.table);
    const orderChannels = useSelector(state => getOrderChannelsSelector(state));
    const [printerSettings, setPrinterSettings] = useState(null);
    useEffect(() => {
        const loadPrinterSettings = async () => {
            try {
                const printerInfo = await AsyncStorage.getLabelPrinterInfo();
                if (printerInfo && printerInfo.sWidth && printerInfo.sHeight) {
                    const dpi = printerInfo.labelPrinterDPI || 72;
                    setPrinterSettings({
                        width: mmToPixels(Number(printerInfo.sWidth), dpi),
                        height: mmToPixels(Number(printerInfo.sHeight), dpi),
                        dpi: dpi,
                        fontSize: {
                            storeName: calculateDynamicFontSize(12),
                            orderNumber: calculateDynamicFontSize(12),
                            tableInfo: calculateDynamicFontSize(10),
                            dateTime: calculateDynamicFontSize(8),
                            priceText: calculateDynamicFontSize(8),
                            pageCounter: calculateDynamicFontSize(8),
                            itemName: calculateDynamicFontSize(12),
                            modifier: calculateDynamicFontSize(10),
                            note: calculateDynamicFontSize(10),
                            quantity: calculateDynamicFontSize(10),
                            channelInfo: calculateDynamicFontSize(8)
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
            ...item,
            item_name: item.name,
            stringName: item.modifierGroups?.flatMap(mg =>
                mg.modifiers?.map(m => m.modifierName) || []
            ).join(' / ') || '',
            extrastring: '',
            note_prod: item.comment || '',
        })) : []);

    console.log("TemTemplate itemsToRender:", itemsToRender);
    console.log("TemTemplate using decals?", !!orderPrint?.decals);
    console.log("TemTemplate itemsToRender[0]:", itemsToRender?.[0]);

    const getOrderTypeText = (order) => {
        // For online orders, prioritize service field
        const isOnlineOrder = order.source === 'app_order' || order.source === 'online_new';
        if (isOnlineOrder && order.service) {
            return order.service;
        }

        // For offline orders, use channel type lookup
        if (order.chanel_type_id) {
            var orderType = orderChannels.find(channel => channel.id === order.chanel_type_id) || { name_vn: 'Mang đi', name: 'Mang đi' }
            return orderType?.name_vn || orderType?.name || 'Mang đi';
        }

        // Fallback to service field
        return order.service || 'Mang đi';
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
                            ({item.itemIdx}/{item.totalItems})
                        </Text>
                    </View>

                    {/* Item Name */}
                    <View style={styles.itemNameSection}>
                        <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
                            {item.item_name}
                        </Text>
                    </View>

                    {/* Modifiers/Options/Notes */}
                    {(() => {
                        const allOptions = [];

                        // Add options from option array
                        if (item.option) {
                            console.log("TemTemplate item.option:", item.option);
                            if (Array.isArray(item.option)) {
                                // New format: array of objects
                                const optionNames = item.option
                                    .filter(opt => opt && opt.optdetailid && opt.optdetailname)
                                    .map(opt => opt.optdetailname);
                                allOptions.push(...optionNames);
                                console.log("TemTemplate optionNames:", optionNames, item.option
                                    .filter(opt => opt && opt.optdetailid && opt.optdetailname));
                            } else if (typeof item.option === 'string' && item.option.trim() !== '') {
                                // Old format: string
                                allOptions.push(item.option.trim());
                            }
                            console.log("TemTemplate allOptions:", allOptions);
                        }

                        // Add other option fields
                        if (item.stringName && item.stringName.trim() !== '') {
                            allOptions.push(item.stringName.trim());
                        }
                        if (item.extrastring && item.extrastring.trim() !== '') {
                            allOptions.push(item.extrastring.trim());
                        }
                        if (item.note_prod && item.note_prod.trim() !== '') {
                            allOptions.push(item.note_prod.trim());
                        }
                        if (orderPrint.note && orderPrint.note.trim() !== '') {
                            allOptions.push(orderPrint.note.trim());
                        }

                        // Remove duplicates
                        const uniqueOptions = [...new Set(allOptions)];

                        return uniqueOptions.length > 0 && (
                            <View style={styles.modifierSection}>
                                <Text style={styles.modifierText} numberOfLines={3} ellipsizeMode="tail">
                                    {uniqueOptions.join('/')}
                                </Text>
                            </View>
                        );
                    })()}

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
                                {(() => {
                                    // Calculate base price
                                    let basePrice = item.price || item.priceDisplay || item.fare?.priceDisplay || 0;

                                    // Convert formatted string prices to numbers if needed
                                    if (typeof basePrice === 'string') {
                                        const priceStr = basePrice.toString().replace(/[^\d]/g, '');
                                        basePrice = parseInt(priceStr) || 0;
                                    }

                                    // Calculate extra items price
                                    const extraPrice = item.extra_items ?
                                        item.extra_items.reduce((sum, extra) => sum + (extra.price || 0), 0) : 0;

                                    // Calculate modifier price from modifierGroups
                                    const modifierPrice = item.modifierGroups ?
                                        item.modifierGroups.reduce((sum, group) => {
                                            if (group.modifiers) {
                                                return sum + group.modifiers.reduce((modSum, mod) => modSum + (mod.price || 0), 0);
                                            }
                                            return sum;
                                        }, 0) : 0;

                                    // Total price including extras and modifiers
                                    const totalPrice = basePrice + extraPrice + modifierPrice;

                                    return formatPrice(totalPrice);
                                })()}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

export default PrintTemplate;
