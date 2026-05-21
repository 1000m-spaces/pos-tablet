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
        orderNumber: calculateDynamicFontSize(13),
        tableInfo: calculateDynamicFontSize(10),
        dateTime: calculateDynamicFontSize(8),
        priceText: calculateDynamicFontSize(8),
        pageCounter: calculateDynamicFontSize(10),
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
                            orderNumber: calculateDynamicFontSize(13),
                            tableInfo: calculateDynamicFontSize(10),
                            dateTime: calculateDynamicFontSize(8),
                            priceText: calculateDynamicFontSize(8),
                            pageCounter: calculateDynamicFontSize(10),
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
            fontSize: config.fontSize.orderNumber,
            fontWeight: '900',
            color: '#000',
            marginLeft: 2,
        },
        pageCounter: {
            fontSize: config.fontSize.orderNumber,
            fontWeight: '900',
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
        addressText: {
            fontSize: config.fontSize.dateTime,
            fontWeight: '700',
            color: '#000',
            lineHeight: config.fontSize.dateTime + 2,
        },
    });

    // Use decals array if available, otherwise fall back to itemInfo structure
    let itemsToRender = [];
    console.log('TemTemplate orderPrint:', orderPrint);
    if (orderPrint?.decals) {
        // itemsToRender = orderPrint.decals;
        itemsToRender = orderPrint.decals.map((decal, idx) => {
            // lấy item gốc tương ứng để đọc modifierGroups
            const originalItem = orderPrint?.itemInfo?.items?.[idx];

            // tính tổng modifier price
            const modifierTotal =
                originalItem?.modifierGroups?.reduce((groupSum, group) => {

                    const modifierSum =
                        group.modifiers?.reduce((sum, modifier) => {
                            return sum + Number(modifier.modifierPrice || 0);
                        }, 0) || 0;

                    return groupSum + modifierSum;

                }, 0) || 0;

            // giá cuối
            const finalPrice = Number(decal.price || 0) + modifierTotal;

            return {
                ...decal,

                price: finalPrice,

                priceDisplay: finalPrice,
            };
        });
        console.log('TemTemplate using decals array, count:', itemsToRender.length);
    } else if (orderPrint?.itemInfo?.items) {
        console.log('TemTemplate using itemInfo.items, raw items count:', orderPrint.itemInfo.items.length);
        itemsToRender = orderPrint.itemInfo.items.map((item, idx) => {
            const mappedItem = {
                ...item,
                item_name: item.name,
                stringName: item.modifierGroups?.flatMap(mg =>
                    mg.modifiers?.map(m => m.modifierName) || []
                ).join(' / ') || '',
                extrastring: '',
                note_prod: item.comment || '',
            };
            console.log(`TemTemplate mapped item ${idx}:`, {
                raw: item,
                mapped: mappedItem,
            });
            return mappedItem;
        });
    } else {
        console.log('TemTemplate no decals and no itemInfo.items found');
    }

    console.log("TemTemplate itemsToRender:", itemsToRender);
    console.log("TemTemplate first rendered item:", itemsToRender?.[0]);

    // Helper function to get order ID for label header (without suffix)
    const getOrderId = (order) => {
        if (order.foodapp_order_id && order.foodapp_order_id.length > 0) {
            return order.foodapp_order_id;
        }
        const orderId = order.displayID || order.bill_id;
        console.log('TemTemplate getOrder - raw order:', order);

        // Check if this is a POS order (offline order)
        const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') || order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');

        if (isPOSOrder) {
            return orderId;
        }

        // Online/App orders use # prefix
        return '#' + orderId;
    };

    // Helper function to get order type suffix (O, T, D, AO, AT)
    const getOrderSuffix = (order) => {
        // Check if this is a 1000M app order (not FoodApp like GRAB/GoFood)
        console.log('TemTemplate getOrderSuffix - order:', order);
        const is1000MAppOrder = order.source === 'app_order' &&
            (order.service === 'Delivery' || order.service === 'Pick up' || order.is_delivery !== undefined);
        
        if (is1000MAppOrder && !order.orderType) {
            order.orderType = order.chanel_type_id;
        }

        // Check if this is a POS order (offline order)
        const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') || order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');

        const isStoreChannel = !order.chanel_type_id || order.chanel_type_id === "1" || order.chanel_type_id === 1;
        const isDineIn = isStoreChannel ? (order.orderType === "1" || order.orderType === 1 || order.orderType === undefined || order.orderType === null) : (order.orderType === "1" || order.orderType === 1);
        const isTakeaway = isStoreChannel ? (order.orderType === "2" || order.orderType === 2) : (order.orderType === "2" || order.orderType === 2);
       const isFoodAppPos = (order.chanel_type_id && order.chanel_type_id == 3) || (order.chanel_type_id && order.chanel_type_id == 2 && !is1000MAppOrder) || (order.chanel_type_id && order.chanel_type_id == 4);
        const isDelivery = order.is_delivery == '1';

        console.log('isDineIn:', isDineIn);
        console.log('isTakeaway:', isTakeaway);
        console.log('isFoodAppPos:', isFoodAppPos);

        // 1. Offline POS orders: O or T
        if (isPOSOrder) {
            if (isDineIn && !isFoodAppPos) {
                return 'O'; // O = On-site/Tại quán
            } else if (isTakeaway || isFoodAppPos) {
                return 'T'; // T = Take away
            }
            return ''; // No suffix if not explicitly set
        }

        // 2. 1000M App orders: D, AO, or AT
        if (is1000MAppOrder) {
            if (isDelivery) {
                return 'D'; // Delivery
            } else if (isDineIn) {
                return 'AO'; // App Order - dùng tại quán
            } else if (isTakeaway) {
                return 'AT'; // App Order - take away
            }
            return ''; // No suffix if not explicitly set
        }

        // 3. FoodApp orders (GRAB, GoFood, etc.): no suffix

        if (isFoodAppPos) {
            return 'T'; // No suffix for FoodApp POS orders
        }
        return '';
    };

    const getOrderTypeText = (order) => {
        // Check if this is a 1000M app order (not FoodApp like GRAB/GoFood)
        const is1000MAppOrder = order.source === 'app_order' &&
            (order.service === 'Delivery' || order.service === 'Pick up' || order.is_delivery !== undefined);

        // Check if this is a POS order (offline order)
        const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') || order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');
        const isStoreChannel = !order.chanel_type_id || order.chanel_type_id === "1" || order.chanel_type_id === 1;
        const isFoodAppPos = (order.chanel_type_id && order.chanel_type_id == 3) || (order.chanel_type_id && order.chanel_type_id == 2 && !is1000MAppOrder) || (order.chanel_type_id && order.chanel_type_id == 4);
        
        var channelInfo = 'SHOPEE';
        if (order.chanel_type_id === "2" || order.chanel_type_id === 2) {
            channelInfo = 'GRAB';
        } else if (order.chanel_type_id === "5" || order.chanel_type_id === 5) {
            channelInfo = 'BE';
        }

        const isDineIn = isStoreChannel ? (order.orderType === "1" || order.orderType === 1 || order.orderType === undefined || order.orderType === null) : (order.orderType === "1" || order.orderType === 1);
        const isTakeaway = isStoreChannel ? (order.orderType === "2" || order.orderType === 2) : (order.orderType === "2" || order.orderType === 2);
        const isDelivery = order.is_delivery == '1';

        console.log('TemTemplate getOrderTypeText - isFoodAppPos:', isFoodAppPos, 'chanel_type_id:', order.chanel_type_id);


        // 2. 1000M app orders: specific format
        if (is1000MAppOrder) {
            if (isDelivery) {
                return 'Đơn App Delivery';
            } else if (isDineIn) {
                return 'Đơn App Pick UP - dùng tại quán';
            } else {
                return 'Đơn App Pick UP - take away';
            }
        }

        // 1. Offline POS orders: "Đơn Offline - Dùng tại quán" or "Đơn Offline - Take away"

        if (isPOSOrder && !isFoodAppPos) {
            if (isDineIn) {
                return 'Đơn Offline - Dùng tại quán';
            } else if (isTakeaway) {
                return 'Đơn Offline - Take away';
            } else {
                return 'Đơn Offline';
            }
        }

        // 3. FoodApp orders (GRAB, GoFood, etc.): use service field
        const isOnlineOrder = order.source === 'app_order' || order.source === 'online_new';
        if (isOnlineOrder && order.service) {
            return order.service;
        }

        if (isFoodAppPos && !is1000MAppOrder && !isOnlineOrder) {
            return channelInfo;
        }

        // Final fallback
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
                            {getOrderId(orderPrint)}
                        </Text>
                        <View style={styles.spacerFlex} />
                        <Text style={styles.orderNumber}>
                            - {getOrderSuffix(orderPrint)}
                        </Text>
                        {
                            (orderPrint.table || orderPrint.shopTableName || orderPrint.shoptablename) && (
                                <Text style={styles.tableInfo}>
                                    - {orderPrint.table || orderPrint.shopTableName || orderPrint.shoptablename || 'Thẻ ——'}
                                </Text>
                            )
                        }
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
                        console.log('TemTemplate formatting options for item:', item);

                        // Add options from option array
                        if (item.option) {
                            console.log("TemTemplate item.option:", item.option);
                            if (Array.isArray(item.option)) {
                                // New format: array of objects
                                const optionNames = item.option
                                    .filter(opt => opt && opt.optdetailid && opt.optdetailname)
                                    .map(opt => opt.optdetailname);
                                console.log('TemTemplate extracted optionNames from item.option:', optionNames);
                                allOptions.push(...optionNames);
                            } else if (typeof item.option === 'string' && item.option !== '') {
                                console.log('TemTemplate extracted option string from item.option:', item.option);
                                allOptions.push(item.option);
                            }
                            console.log("TemTemplate allOptions after item.option:", allOptions);
                        }

                        // Add other option fields
                        if (item.stringName && item.stringName !== '') {
                            console.log('TemTemplate adding stringName:', item.stringName);
                            allOptions.push(item.stringName);
                        }
                        const optNameFields = ['opt_name1', 'opt_name2', 'opt_name3'];
                        optNameFields.forEach(fieldName => {
                            const fieldValue = item[fieldName];
                            if (fieldValue === undefined || fieldValue === null) {
                                console.log(`TemTemplate ${fieldName} is empty or missing`);
                                return;
                            }
                            console.log(`TemTemplate processing ${fieldName}:`, fieldValue);
                            if (Array.isArray(fieldValue)) {
                                const values = fieldValue
                                    .filter(opt => opt !== undefined && opt !== null)
                                    .map(opt => opt.toString());
                                console.log(`TemTemplate ${fieldName} array values:`, values);
                                allOptions.push(...values);
                            } else if (typeof fieldValue === 'string') {
                                if (fieldValue !== '') {
                                    allOptions.push(fieldValue);
                                }
                            } else {
                                allOptions.push(fieldValue.toString());
                            }
                            console.log(`TemTemplate allOptions after ${fieldName}:`, allOptions);
                        });
                        if (item.extrastring && item.extrastring !== '') {
                            console.log('TemTemplate adding extrastring:', item.extrastring);
                            allOptions.push(item.extrastring);
                        }
                        if (item.note_prod && item.note_prod !== '') {
                            console.log('TemTemplate adding note_prod:', item.note_prod);
                            allOptions.push(item.note_prod);
                        }
                        if (orderPrint.note && orderPrint.note !== '') {
                            console.log('TemTemplate adding orderPrint.note:', orderPrint.note);
                            allOptions.push(orderPrint.note);
                        }

                        console.log('TemTemplate allOptions before dedupe:', allOptions);
                        // Remove duplicates
                        const uniqueOptions = [...new Set(allOptions)];
                        console.log('TemTemplate uniqueOptions after dedupe:', uniqueOptions);

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
                        {/* Show address for 1000M app delivery orders only */}
                        {(() => {
                            const is1000MAppOrder = orderPrint.source === 'app_order' &&
                                (orderPrint.service === 'Delivery' || orderPrint.service === 'Pick up' || orderPrint.is_delivery !== undefined);
                            const isDelivery = orderPrint.is_delivery == '1' || orderPrint.chanel_type_id === "3" || orderPrint.chanel_type_id === 3;
                            return is1000MAppOrder && isDelivery && orderPrint.address && (
                                <View style={{ marginBottom: config.margin }}>
                                    <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
                                        {orderPrint.address}
                                    </Text>
                                </View>
                            );
                        })()}
                        <View style={styles.bottomRow}>
                            {/* Additional order identifier - always render for consistent layout */}
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
