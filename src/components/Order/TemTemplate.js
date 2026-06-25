import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import AsyncStorage from 'store/async_storage/index';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { encodeCode128B, generateBarSpecs, getBarcodeWidth } from 'utils/barcodeUtils';

// Convert mm to pixels for actual label printer output
const mmToPixels = (mm, dpi = 72) => {
    return Math.round((mm * dpi) / 25.4);
};

const PrintTemplate = ({ orderPrint, settings = {}, onLayout }) => {
    console.log(`\n║ PRINT_TEM: TemTemplate rendered`);
    console.log(`║ PRINT_TEM: orderPrint.displayID: ${orderPrint?.displayID}`);

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
                console.error('TemTemplate: Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);

    // ─────── Prepare items to render ───────
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

    // ─────── Helper functions ───────

    // Get order ID (display number)
    const getOrderId = (order) => {
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
    const getOrderSuffix = (order) => {
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
    const getChannelText = (order) => {
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
    const getOrderTypeBadge = (order) => {
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

    // Format price
    const formatPrice = (price) => {
        if (!price) return '0đ';
        const num = typeof price === 'number' ? price : parseInt(String(price).replace(/[^\d]/g, '')) || 0;
        return num.toLocaleString('vi-VN') + 'đ';
    };

    // Format date/time
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())} • ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    };

    // Extract size from options (L, M, S, etc.)
    const extractSize = (item) => {
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
    const getModifiers = (item) => {
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
    const calcPrice = (item) => {
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
    const BarcodeView = ({ value, moduleWidth = 0.7, barHeight = 18 }) => {
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

    // ─────── Render one label (portrait card, will be rotated) ───────
    const renderLabel = (item, index) => {
        const dpi = printerSettings?.dpi || 72;
        const labelW_mm = printerSettings?.sWidth || 70;
        const labelH_mm = printerSettings?.sHeight || 50;
        const margin_mm = 0; // No margin — fill entire label edge-to-edge

        // Portrait card: width = shorter side, height = longer side
        const W = mmToPixels(Math.min(labelW_mm, labelH_mm) - margin_mm, dpi);  // ~138px @70dpi
        const H = mmToPixels(Math.max(labelW_mm, labelH_mm) - margin_mm, dpi);  // ~193px @70dpi

        const orderId = getOrderId(orderPrint);
        const suffix = getOrderSuffix(orderPrint);
        const channelText = getChannelText(orderPrint);
        const typeBadge = getOrderTypeBadge(orderPrint);
        const size = extractSize(item);
        const modifiers = getModifiers(item);
        const price = calcPrice(item);
        const table = orderPrint.table || orderPrint.shopTableName || orderPrint.shoptablename || '';
        const tableDisplay = table ? `THẺ ${table}`.toUpperCase() : '';
        const cupText = `${item.itemIdx || (index + 1)}/${item.totalItems || itemsToRender.length}`;
        const barcodeValue = `${orderId}-${cupText.replace('/', '')}`.replace('#', '');
        const qrValue = barcodeValue;

        // ═══ Font sizes — calibrated for full label canvas (DPI 70) ═══
        const fs = {
            channelName: Math.max(6, Math.round(W * 0.053)),   // ~7
            logo: Math.max(5, Math.round(W * 0.045)),          // ~6
            orderId: Math.max(14, Math.round(W * 0.136)),      // ~19
            metaLabel: Math.max(6, Math.round(W * 0.042)),     // ~6 (bold for thermal)
            metaValue: Math.max(8, Math.round(W * 0.072)),     // ~10 (slightly smaller)
            badge: Math.max(5, Math.round(W * 0.045)),         // ~6
            itemName: Math.max(9, Math.round(W * 0.083)),      // ~11
            sizeBadge: Math.max(6, Math.round(W * 0.053)),     // ~7
            modifier: Math.max(6, Math.round(W * 0.053)),      // ~7
            shopInfo: Math.max(5, Math.round(W * 0.045)),      // ~6 (increased for clarity)
            time: Math.max(5, Math.round(W * 0.042)),          // ~6 (was 4, too blurry)
            price: Math.max(10, Math.round(W * 0.098)),        // ~14 (larger like mockup)
            greeting: Math.max(5, Math.round(W * 0.042)),      // ~6 (was 4, too blurry)
            barcodeText: Math.max(5, Math.round(W * 0.038)),   // ~5 (increased min)
        };

        // Padding (reduced to let content span wider)
        const px = Math.max(4, Math.round(W * 0.04));          // ~5

        // Section heights — reduced header/body to give footer more room (prevents bottom clipping)
        const headerH = Math.round(H * 0.38);   // ~81px @75mm
        const bodyH = Math.round(H * 0.21);      // ~45px @75mm
        // footer = remaining ~41% = ~87px @75mm

        // Barcode / QR sizing
        const barcodeModuleW = Math.max(0.4, W * 0.004);       // ~0.5
        const barcodeH = Math.max(10, Math.round(H * 0.065));  // ~12
        const qrSize = Math.max(16, Math.round(W * 0.15));  // ~20

        return (
            <View key={index} style={{ width: W, height: H, backgroundColor: '#fff', overflow: 'hidden' }}>
                {/* ══════ HEADER (Black) ══════ */}
                <View style={{
                    height: headerH,
                    backgroundColor: '#000',
                    paddingHorizontal: px,
                    paddingTop: 5,    // Safety margin to prevent POS/logo cut-off (increased to 5 to prevent printer clipping)
                    paddingBottom: 5,
                    justifyContent: 'space-between',
                }}>
                    {/* Row 1: Channel name + Logo + 1000M — absolute so it doesn't push layout below */}
                    <View style={{
                        position: 'absolute',
                        top: 8,
                        left: px,
                        right: px,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 1,
                    }}>
                        <Text style={{ color: '#fff', fontSize: fs.channelName, fontWeight: '900', fontStyle: 'italic' }}>
                            {channelText}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image
                                source={require('../../assets/images/logo_1000m_white.png')}
                                style={{
                                    width: Math.round(W * 0.15),
                                    height: Math.round(W * 0.15),
                                    marginRight: 3,
                                }}
                                resizeMode="contain"
                            />
                            <Text style={{ color: '#fff', fontSize: Math.max(7, Math.round(W * 0.06)), fontWeight: '900' }}>
                                1000M
                            </Text>
                        </View>
                    </View>

                    {/* Row 2: Big order number — absolute to stay in center of header */}
                    <View style={{
                        position: 'absolute',
                        top: 22,
                        left: px,
                        right: px,
                        zIndex: 1,
                    }}>
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.6}
                            style={{
                                color: '#fff',
                                fontSize: fs.orderId,
                                fontWeight: '900',
                                textAlign: 'center',
                            }}
                        >
                            {orderId}{suffix ? `-${suffix}` : ''}
                        </Text>
                    </View>

                    {/* Row 3: Table | Cup count | Badge — absolute at bottom of header */}
                    <View style={{
                        position: 'absolute',
                        bottom: 5,
                        left: px,
                        right: px,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderTopWidth: 1,
                        borderTopColor: '#fff',
                        paddingTop: 3,
                        zIndex: 1,
                    }}>
                        {/* Thẻ bàn */}
                        <View style={{ flex: 1.2 }}>
                            <Text style={{ color: '#fff', fontSize: fs.metaValue, fontWeight: '900' }}>
                                {tableDisplay || '——'}
                            </Text>
                        </View>

                        {/* Divider */}
                        <View style={{
                            width: 1,
                            height: fs.metaValue + 8,
                            backgroundColor: '#fff',
                            marginHorizontal: 4,
                        }} />

                        {/* LY */}
                        <View style={{ flex: 0.7 }}>
                            <Text style={{ color: '#fff', fontSize: fs.metaLabel, fontWeight: '900' }}>
                                LY
                            </Text>
                            <Text style={{ color: '#fff', fontSize: fs.metaValue, fontWeight: '900' }}>
                                {cupText}
                            </Text>
                        </View>

                        {/* Badge */}
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <View style={{
                                borderWidth: 1.5,
                                borderColor: '#fff',
                                borderRadius: 8,
                                paddingHorizontal: 5,
                                paddingVertical: 2,
                            }}>
                                <Text style={{ color: '#fff', fontSize: fs.badge, fontWeight: '900' }}>
                                    {typeBadge}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ══════ BODY (Item + Modifiers + Separator) ══════ */}
                <View style={{
                    height: bodyH,
                    paddingHorizontal: px,
                    paddingTop: 4,
                    justifyContent: 'space-between',
                }}>
                    {/* Item content */}
                    <View>
                        {/* Item name + Size badge */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 1 }}>
                            <Text style={{
                                flex: 1,
                                fontSize: fs.itemName,
                                fontWeight: '900',
                                color: '#000',
                                lineHeight: Math.round(fs.itemName * 1.15),
                            }} numberOfLines={2} ellipsizeMode="tail">
                                {item.item_name}
                            </Text>
                            {size && (
                                <View style={{
                                    backgroundColor: '#000',
                                    borderRadius: 2,
                                    paddingHorizontal: 3,
                                    paddingVertical: 1,
                                    marginLeft: 2,
                                    marginTop: 1,
                                }}>
                                    <Text style={{ color: '#fff', fontSize: fs.sizeBadge, fontWeight: '900' }}>
                                        {size}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Modifiers */}
                        {modifiers.length > 0 && (
                            <Text style={{
                                fontSize: fs.modifier,
                                fontWeight: '700',
                                color: '#000',
                                lineHeight: Math.round(fs.modifier * 1.1),
                            }} numberOfLines={2} ellipsizeMode="tail">
                                {modifiers.join(' • ')}
                            </Text>
                        )}
                    </View>

                    {/* ── Dashed separator at bottom of body ── */}
                    <View style={{
                        borderTopWidth: 1,
                        borderTopColor: '#000',
                        borderStyle: 'dashed',
                    }} />
                </View>

                {/* ══════ FOOTER ══════ */}
                <View style={{
                    flex: 1,
                    paddingHorizontal: px,
                    paddingTop: 2,
                    paddingBottom: 2,   // Reduced to pull content up — prevents printer clipping at bottom
                    justifyContent: 'flex-start',
                }}>
                    {/* Info section */}
                    <View>
                        {/* Shop info + Price */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                            <View style={{ flex: 1, marginRight: 2 }}>
                                <Text style={{ fontSize: fs.shopInfo, fontWeight: '800', color: '#000' }}
                                    numberOfLines={2} ellipsizeMode="tail">
                                    {shopInfo.name}{shopInfo.address ? ` · ${shopInfo.address}` : ''}
                                </Text>
                                <Text style={{ fontSize: fs.time, fontWeight: '500', color: '#000' }}>
                                    {formatTime(orderPrint.date)}
                                </Text>
                            </View>
                            <Text style={{ fontSize: fs.price, fontWeight: '900', color: '#000', marginRight: -2 }}>
                                {formatPrice(price)}
                            </Text>
                        </View>

                        {/* Greeting */}
                        <Text style={{ fontSize: fs.greeting, fontWeight: '600', fontStyle: 'italic', color: '#000' }}>
                            Dùng trong 2 giờ để giữ trọn vị ngon — Cảm ơn Quý khách!
                        </Text>
                    </View>

                    {/* Barcode + QR at bottom */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 3 }}>
                        <View style={{ alignItems: 'center', flex: 1 }}>
                            <BarcodeView value={barcodeValue} moduleWidth={barcodeModuleW} barHeight={barcodeH} />
                            <Text style={{ fontSize: fs.barcodeText, fontWeight: '600', color: '#000', marginTop: 1 }}>
                                {barcodeValue}
                            </Text>
                        </View>
                        <View style={{ marginLeft: 4 }}>
                            <QRCode value={qrValue || 'N/A'} size={qrSize} />
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // ─────── Main render ───────
    // Render directly in portrait. Rotation is handled post-capture if needed.
    const dpi = printerSettings?.dpi || 72;
    const labelW_mm = printerSettings?.sWidth || 70;
    const labelH_mm = printerSettings?.sHeight || 50;
    const margin_mm = 0; // No margin — fill entire label

    // Card dimensions (always portrait: width = min(W,H), height = max(W,H))
    const cardW = mmToPixels(Math.min(labelW_mm, labelH_mm) - margin_mm, dpi);
    const cardH = mmToPixels(Math.max(labelW_mm, labelH_mm) - margin_mm, dpi);

    return (
        <View style={{ backgroundColor: '#fff' }} onLayout={onLayout}>
            {itemsToRender.map((item, index) => (
                <View
                    key={index}
                    style={{
                        width: cardW,
                        height: cardH,
                    }}
                    collapsable={false}
                >
                    {renderLabel(item, index)}
                </View>
            ))}
        </View>
    );
};

export default PrintTemplate;
