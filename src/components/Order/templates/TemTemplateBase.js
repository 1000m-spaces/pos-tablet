/**
 * TemTemplateBase.js — Shared utilities for all label templates
 *
 * Contains helper functions, hooks, and components reused across
 * all template variants (TemTemplate1, TemTemplate2, etc.)
 */
import React, { useEffect, useState } from 'react';
import { Text as RNText, PixelRatio } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import AsyncStorage from 'store/async_storage/index';
import { encodeCode128B, generateBarSpecs, getBarcodeWidth } from 'utils/barcodeUtils';

// ─────── Non-scaling Text wrapper ───────
export const Text = (props) => (
    <RNText {...props} allowFontScaling={false}>
        {props.children}
    </RNText>
);

// ─────── Convert mm to pixels ───────
export const mmToPixels = (mm, dpi = 72) => {
    return Math.round((mm * dpi) / 25.4);
};

// ─────── Custom Hook: Load printer settings + shop info ───────
export const useTemTemplateData = () => {
    const [printerSettings, setPrinterSettings] = useState(null);
    const [shopInfo, setShopInfo] = useState({ name: '', address: '' });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Load printer settings
                const printerInfo = await AsyncStorage.getLabelPrinterInfo();
                if (printerInfo) {
                    setPrinterSettings({
                        sWidth: Number(printerInfo.sWidth) || 70,
                        sHeight: Number(printerInfo.sHeight) || 50,
                        dpi: Number(printerInfo.labelPrinterDPI) || 72,
                    });
                }

                // Load shop info (following BillTemplate.js pattern)
                const user = await AsyncStorage.getUser();
                if (user && user.shops) {
                    setShopInfo({
                        name: user.shops.name_vn || user.shops.name || '1000M',
                        address: user.shops.addr || user.shops.address || '',
                    });
                } else {
                    const shopData = await AsyncStorage.getShopInfo?.() || {};
                    setShopInfo({
                        name: shopData.name || '1000M',
                        address: shopData.address || '',
                    });
                }
            } catch (error) {
                console.error('TemTemplateBase: Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);

    return { printerSettings, shopInfo };
};

// ─────── Prepare items to render from orderPrint ───────
export const prepareItemsToRender = (orderPrint) => {
    let itemsToRender = [];
    if (orderPrint?.decals) {
        itemsToRender = orderPrint.decals.map((decal, idx) => {
            const originalItem = orderPrint?.itemInfo?.items?.[idx];
            const modifierTotal =
                originalItem?.modifierGroups?.reduce((groupSum, group) => {
                    const modifierSum =
                        group.modifiers?.reduce((sum, modifier) => {
                            return sum + Number(modifier.modifierPrice || 0);
                        }, 0) || 0;
                    return groupSum + modifierSum;
                }, 0) || 0;
            const finalPrice = Number(decal.price || 0) + modifierTotal;
            return { ...decal, price: finalPrice, priceDisplay: finalPrice };
        });
    } else if (orderPrint?.itemInfo?.items) {
        itemsToRender = orderPrint.itemInfo.items.map((item) => ({
            ...item,
            item_name: item.name,
            stringName: item.modifierGroups?.flatMap(mg =>
                mg.modifiers?.map(m => m.modifierName) || []
            ).join(' / ') || '',
            extrastring: '',
            note_prod: item.comment || '',
        }));
    }
    return itemsToRender;
};

// ─────── Order Helper Functions ───────

// Get order ID (display number)
export const getOrderId = (order) => {
    if (order.foodapp_order_id && order.foodapp_order_id.length > 0) {
        return order.foodapp_order_id;
    }
    const orderId = order.displayID || order.bill_id;
    const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') ||
        order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');
    if (isPOSOrder) return orderId;
    return '#' + orderId;
};

// Get order suffix (O, T, D, AO, AT)
export const getOrderSuffix = (order) => {
    const is1000MAppOrder = order.source === 'app_order' &&
        (order.service === 'Delivery' || order.service === 'Pick up' || order.is_delivery !== undefined);
    if (is1000MAppOrder && !order.orderType) {
        order.orderType = order.chanel_type_id;
    }
    const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') ||
        order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');
    const isStoreChannel = !order.chanel_type_id || order.chanel_type_id === "1" || order.chanel_type_id === 1;
    const isDineIn = isStoreChannel
        ? (order.orderType === "1" || order.orderType === 1 || order.orderType === undefined || order.orderType === null)
        : (order.orderType === "1" || order.orderType === 1);
    const isTakeaway = order.orderType === "2" || order.orderType === 2;
    const isFoodAppPos = (order.chanel_type_id && order.chanel_type_id == 3) ||
        (order.chanel_type_id && order.chanel_type_id == 2 && !is1000MAppOrder) ||
        (order.chanel_type_id && order.chanel_type_id == 4);
    const isDelivery = order.is_delivery == '1';

    if (isPOSOrder) {
        if (isDineIn && !isFoodAppPos) return 'O';
        if (isTakeaway || isFoodAppPos) return 'T';
        return '';
    }
    if (is1000MAppOrder) {
        if (isDelivery) return 'D';
        if (isDineIn) return 'AO';
        if (isTakeaway) return 'AT';
        return '';
    }
    if (isFoodAppPos) return 'T';
    return '';
};

// Get channel display text (for header)
export const getChannelText = (order) => {
    const is1000MAppOrder = order.source === 'app_order' &&
        (order.service === 'Delivery' || order.service === 'Pick up' || order.is_delivery !== undefined);
    const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') ||
        order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');

    if (isPOSOrder) {
        const isFoodAppPos = (order.chanel_type_id && order.chanel_type_id == 3) ||
            (order.chanel_type_id && order.chanel_type_id == 2 && !is1000MAppOrder) ||
            (order.chanel_type_id && order.chanel_type_id == 4);
        if (isFoodAppPos) {
            if (order.chanel_type_id == 2) return 'Grabfood';
            if (order.chanel_type_id == 3) return 'ShopeeFood';
            if (order.chanel_type_id == 4) return 'GoFood';
            if (order.chanel_type_id == 5) return 'Be';
            return 'FoodApp';
        }
        return 'POS';
    }
    if (is1000MAppOrder) return '1000M App';
    // Online FoodApp orders
    if (order.chanel_type_id == 2) return 'Grabfood';
    if (order.chanel_type_id == 3) return 'ShopeeFood';
    if (order.chanel_type_id == 4) return 'GoFood';
    if (order.chanel_type_id == 5) return 'Be';
    return order.service || 'Đơn hàng';
};

// Get order type badge text
export const getOrderTypeBadge = (order) => {
    // FoodApp orders (Grab, Shopee, etc.) are always MANG VỀ
    if (order.chanel_type_id && String(order.chanel_type_id) !== '1') {
        return 'MANG VỀ';
    }

    const is1000MAppOrder = order.source === 'app_order' &&
        (order.service === 'Delivery' || order.service === 'Pick up' || order.is_delivery !== undefined);
    const isPOSOrder = order.offline_code || order.session?.startsWith('POS-') ||
        order.displayID?.startsWith('M-') || order.displayID?.startsWith('SF-');
    const isStoreChannel = !order.chanel_type_id || order.chanel_type_id === "1" || order.chanel_type_id === 1;
    const isDineIn = isStoreChannel
        ? (order.orderType === "1" || order.orderType === 1 || order.orderType === undefined || order.orderType === null)
        : (order.orderType === "1" || order.orderType === 1);
    const isTakeaway = order.orderType === "2" || order.orderType === 2;
    const isDelivery = order.is_delivery == '1';

    if (isDelivery) return 'DELIVERY';
    if (isTakeaway) return 'MANG VỀ';
    if (isDineIn) return 'TẠI QUÁN';
    return 'MANG VỀ';
};

// ─────── Formatting Functions ───────

// Format price
export const formatPrice = (price) => {
    if (!price) return '0đ';
    const num = typeof price === 'number' ? price : parseInt(String(price).replace(/[^\d]/g, '')) || 0;
    return num.toLocaleString('vi-VN') + 'đ';
};

// Format date/time
export const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())} • ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// ─────── Item Detail Functions ───────

// Extract size from options (L, M, S, etc.)
export const extractSize = (item) => {
    const sizePatterns = ['L', 'M', 'S', 'XL', 'Lớn', 'Nhỏ', 'Vừa'];
    // Check options array
    if (Array.isArray(item.option)) {
        for (const opt of item.option) {
            const name = opt?.optdetailname || '';
            for (const s of sizePatterns) {
                if (name.toUpperCase() === s.toUpperCase() || name.toUpperCase().includes(`SIZE ${s.toUpperCase()}`)) {
                    return s.charAt(0).toUpperCase();
                }
            }
        }
    }
    // Check modifierGroups
    if (Array.isArray(item.modifierGroups)) {
        for (const group of item.modifierGroups) {
            const gName = (group.modifierGroupName || '').toLowerCase();
            if (gName.includes('size') || gName.includes('kích thước') || gName.includes('cỡ')) {
                if (Array.isArray(group.modifiers) && group.modifiers.length > 0) {
                    const modName = group.modifiers[0].modifierName || '';
                    for (const s of sizePatterns) {
                        if (modName.toUpperCase().includes(s.toUpperCase())) {
                            return s.charAt(0).toUpperCase();
                        }
                    }
                }
            }
        }
    }
    return null;
};

// Collect modifier text (with • separator, excluding size)
export const getModifiers = (item, orderPrint) => {
    const allOptions = [];
    const sizePatterns = ['L', 'M', 'S', 'XL', 'Lớn', 'Nhỏ', 'Vừa'];

    const isSizeOption = (name) => {
        if (!name) return false;
        const upper = name.toUpperCase();
        return sizePatterns.some(s =>
            upper === s.toUpperCase() || upper.includes(`SIZE ${s.toUpperCase()}`)
        );
    };

    // From option array
    if (Array.isArray(item.option)) {
        item.option
            .filter(opt => opt?.optdetailname && !isSizeOption(opt.optdetailname))
            .forEach(opt => allOptions.push(opt.optdetailname));
    } else if (typeof item.option === 'string' && item.option !== '') {
        if (!isSizeOption(item.option)) allOptions.push(item.option);
    }

    // From stringName
    if (item.stringName && item.stringName !== '') {
        const parts = item.stringName.split(/[\/,]/).map(s => s.trim()).filter(Boolean);
        parts.filter(p => !isSizeOption(p)).forEach(p => allOptions.push(p));
    }

    // From opt_name1/2/3
    ['opt_name1', 'opt_name2', 'opt_name3'].forEach(field => {
        const val = item[field];
        if (!val) return;
        if (Array.isArray(val)) {
            val.filter(v => v != null && !isSizeOption(v.toString())).forEach(v => allOptions.push(v.toString()));
        } else if (typeof val === 'string' && val !== '' && !isSizeOption(val)) {
            allOptions.push(val);
        }
    });

    // From extrastring
    if (item.extrastring && item.extrastring !== '') allOptions.push(item.extrastring);

    // From note_prod
    if (item.note_prod && item.note_prod !== '') allOptions.push(item.note_prod);

    // From orderPrint.note
    if (orderPrint.note && orderPrint.note !== '') allOptions.push(orderPrint.note);

    // Deduplicate
    return [...new Set(allOptions)];
};

// Calculate total price for one item
export const calcPrice = (item) => {
    let basePrice = item.price || item.priceDisplay || item.fare?.priceDisplay || 0;
    if (typeof basePrice === 'string') {
        basePrice = parseInt(basePrice.replace(/[^\d]/g, '')) || 0;
    }
    const extraPrice = item.extra_items
        ? item.extra_items.reduce((sum, ex) => sum + (ex.price || 0), 0) : 0;
    const modPrice = item.modifierGroups
        ? item.modifierGroups.reduce((sum, g) => {
            return sum + (g.modifiers?.reduce((ms, m) => ms + (m.price || 0), 0) || 0);
        }, 0) : 0;
    return basePrice + extraPrice + modPrice;
};

// ─────── SVG Barcode Component ───────
export const BarcodeView = ({ value, moduleWidth = 0.7, barHeight = 18 }) => {
    const binary = encodeCode128B(value);
    const bars = generateBarSpecs(binary, moduleWidth, barHeight);
    const totalWidth = getBarcodeWidth(binary, moduleWidth);
    if (!binary) return null;
    return (
        <Svg width={totalWidth} height={barHeight}>
            {bars.map((bar, i) => (
                <Rect key={i} x={bar.x} y={0} width={bar.w} height={bar.h} fill="#000" />
            ))}
        </Svg>
    );
};

// ─────── Dimension Helpers ───────

// Calculate label dimensions in portrait orientation
export const getLabelDimensions = (printerSettings) => {
    const dpi = Math.max(203, printerSettings?.dpi || 72);
    const labelW_mm = printerSettings?.sWidth || 70;
    const labelH_mm = printerSettings?.sHeight || 50;
    const margin_mm = 0;
    const pixelRatio = PixelRatio.get();
    const W = mmToPixels(Math.min(labelW_mm, labelH_mm) - margin_mm, dpi) / pixelRatio;
    const H = mmToPixels(Math.max(labelW_mm, labelH_mm) - margin_mm, dpi) / pixelRatio;
    return { W, H, dpi, labelW_mm, labelH_mm, margin_mm, pixelRatio };
};
