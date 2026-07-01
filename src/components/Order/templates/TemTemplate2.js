/**
 * TemTemplate2.js — "Trắng sạch + QR Code" label template
 *
 * Layout analysis from reference image:
 * HEADER (white bg):
 *   - Row1: "GRABFOOD" small bold uppercase (left) | 1000M icon small (right)
 *   - Row2: "GF-123" very large bold, LEFT-aligned
 *   - Thin line separator
 *   - Row3: [SỐ THẺ label / THẺ 05 value] | divider | [LY label / 10/12 value] | [MANG VỀ pill]
 * THICK solid black line (3px) separates header from body
 * BODY (white):
 *   - Item name large bold + [L] outlined badge (border, white bg, black text)
 *   - Modifiers text
 * THICK solid black line separates body from footer
 * FOOTER (white):
 *   - Shop name bold (left) | Price bold (right)
 *   - Date/time small
 *   - Italic greeting text (left) | QR code (bottom-right)
 */
import React from 'react';
import { View, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
    Text,
    useTemTemplateData,
    prepareItemsToRender,
    getOrderId,
    getOrderSuffix,
    getChannelText,
    getOrderTypeBadge,
    formatPrice,
    formatTime,
    extractSize,
    getModifiers,
    calcPrice,
    getLabelDimensions,
} from './TemTemplateBase';

const TemTemplate2 = ({ orderPrint, settings = {}, onLayout }) => {
    console.log(`\n║ PRINT_TEM: TemTemplate2 rendered`);
    console.log(`║ PRINT_TEM: orderPrint.displayID: ${orderPrint?.displayID}`);

    const { printerSettings, shopInfo } = useTemTemplateData();
    const itemsToRender = prepareItemsToRender(orderPrint);

    const renderLabel = (item, index) => {
        const { W, H, pixelRatio } = getLabelDimensions(printerSettings);

        const orderId = getOrderId(orderPrint);
        const suffix = getOrderSuffix(orderPrint);
        const channelText = getChannelText(orderPrint);
        const typeBadge = getOrderTypeBadge(orderPrint);
        const size = extractSize(item);
        const modifiers = getModifiers(item, orderPrint);
        const price = calcPrice(item);
        const table = orderPrint.table || orderPrint.shopTableName || orderPrint.shoptablename || '';
        const tableDisplay = table ? `THẺ ${table}`.toUpperCase() : '——';
        const cupText = `${item.itemIdx || (index + 1)}/${item.totalItems || itemsToRender.length}`;
        const qrValue = `${orderId}-${cupText.replace('/', '')}`.replace('#', '');

        // ═══ Font sizes ═══
        const fs = {
            channelName: Math.max(5, Math.round(W * 0.042)),    // small caps "GRABFOOD"
            orderId: Math.max(12, Math.round(W * 0.115)),     // big order number (slightly smaller)
            metaLabel: Math.max(5, Math.round(W * 0.038)),     // "SỐ THẺ", "LY" small label
            tableValue: Math.max(6, Math.round(W * 0.056)),    // "THẺ 05" (nhỏ hơn một chút)
            metaValue: Math.max(7, Math.round(W * 0.068)),     // "10/12" big value (slightly smaller)
            badge: Math.max(4.5, Math.round(W * 0.04)),     // "MANG VỀ" (nhỏ lại một chút)
            itemName: Math.max(8, Math.round(W * 0.075)),     // item name (slightly smaller)
            sizeBadge: Math.max(6, Math.round(W * 0.053)),     // [L]
            modifier: Math.max(5, Math.round(W * 0.042)),     // modifiers (slightly smaller)
            shopInfo: Math.max(6, Math.round(W * 0.048)),     // shop name bold
            time: Math.max(5, Math.round(W * 0.040)),     // date/time
            price: Math.max(9, Math.round(W * 0.082)),     // price
            greeting: Math.max(5, Math.round(W * 0.040)),     // italic greeting
        };

        const px = Math.max(5, Math.round(W * 0.045));

        // Heights
        const logoSize = Math.max(16, Math.round(W * 0.14));
        const qrSize = Math.max(22, Math.round(W * 0.22));
        // Chuẩn hóa độ dày đường kẻ theo PixelRatio để đồng bộ mọi thiết bị
        const thick = 2 / pixelRatio;       // đường kẻ đậm (header↔body, body↔footer)
        const thinLine = 1 / pixelRatio;    // đường kẻ mảnh (dưới order ID)
        const borderLine = 2 / pixelRatio;  // viền badge (MANG VỀ, size [L])

        // Header: channel+logo row + orderId row + thin line + meta row
        // We do NOT fix a headerH — let content size naturally so order ID left-aligns properly
        const metaRowH = Math.max(18, Math.round(H * 0.085));
        const dividerH = metaRowH + Math.round(H * 0.008);

        return (
            <View style={{ width: W, height: H, backgroundColor: '#fff', overflow: 'hidden' }}>

                {/* ══════ HEADER ══════ */}
                <View style={{ position: 'relative', paddingHorizontal: px, paddingTop: Math.round(H * 0.125) }}>

                    {/* Row 1: channel name (left) | 1000M icon (right) - SỬ DỤNG POSITION ABSOLUTE ĐỂ GIỮ NGUYÊN VỊ TRÍ */}
                    <View style={{
                        position: 'absolute',
                        left: px,
                        right: px,
                        top: Math.round(H * 0.10),
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        zIndex: 10,
                    }}>
                        <Text style={{
                            color: '#000',
                            fontSize: fs.channelName,
                            fontWeight: '900',
                            letterSpacing: 1.5,
                        }}>
                            {channelText.toUpperCase()}
                        </Text>
                        {/* 1000M icon — small, top-right only */}
                        <View style={{ alignItems: 'center' }}>
                            <Image
                                source={require('../../../assets/images/logo_1000m_bold.png')}
                                style={{ width: logoSize, height: logoSize, borderRadius: 2 }}
                                resizeMode="contain"
                            />
                            <Text style={{ color: '#000', fontSize: Math.max(4, Math.round(W * 0.033)), fontWeight: '800', letterSpacing: 0.5, marginTop: -5 }}>
                                1000M
                            </Text>
                        </View>
                    </View>

                    {/* Row 2: Big order ID — LEFT aligned */}
                    <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.5}
                        style={{
                            color: '#000',
                            fontSize: fs.orderId,
                            fontWeight: '900',
                            textAlign: 'left',
                            marginBottom: Math.round(H * 0.003),
                        }}
                    >
                        {orderId}{suffix ? `-${suffix}` : ''}
                    </Text>

                    {/* Thin separator line (below order ID) */}
                    <View style={{ borderTopWidth: thinLine, borderTopColor: '#000', marginBottom: Math.round(H * 0.005) }} />

                    {/* Row 3: SỐ THẺ / LY / Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Math.round(H * 0.008) }}>

                        {/* SỐ THẺ column — giống Template1: không placeholder, không lineHeight cứng */}
                        <View style={{ flex: 1.4 }}>
                            <Text style={{ color: '#000', fontSize: fs.metaValue, fontWeight: '900' }}>
                                {tableDisplay}
                            </Text>
                        </View>

                        {/* Vertical divider */}
                        <View style={{ width: thinLine, height: dividerH, backgroundColor: '#000', marginHorizontal: Math.round(W * 0.02) }} />

                        {/* LY column */}
                        <View style={{ flex: 0.8 }}>
                            <Text style={{ color: '#555', fontSize: fs.metaLabel, fontWeight: '900', letterSpacing: 0.5 }}>
                                LY
                            </Text>
                            <Text style={{ color: '#000', fontSize: fs.metaValue, fontWeight: '900', lineHeight: fs.metaValue + 2 }}>
                                {cupText}
                            </Text>
                        </View>

                        {/* MANG VỀ pill badge */}
                        <View style={{ flex: 1.6, alignItems: 'flex-end' }}>
                            <View style={{
                                borderWidth: borderLine,
                                borderColor: '#000',
                                borderRadius: 8,               // Giống template1
                                paddingHorizontal: 4,           // Padding nhỏ hơn để tránh vỡ dòng
                                paddingVertical: 1,
                            }}>
                                <Text style={{ color: '#000', fontSize: fs.badge, fontWeight: '900' }}>
                                    {typeBadge}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ══════ THICK LINE: header → body ══════ */}
                <View style={{ borderTopWidth: thick, borderTopColor: '#000' }} />

                {/* ══════ BODY ══════ */}
                {/* Giảm paddingTop của body xuống để dịch chuyển toàn bộ phần thân tem lên sát đường kẻ */}
                <View style={{ paddingHorizontal: px, paddingTop: Math.round(H * 0.01), flex: 1 }}>

                    {/* Item name + [L] outlined badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: Math.round(H * 0.01) }}>
                        <Text style={{
                            fontSize: fs.itemName,
                            fontWeight: '900',
                            color: '#000',
                            lineHeight: Math.round(fs.itemName * 1.15),
                            flexShrink: 1,
                        }} numberOfLines={2} ellipsizeMode="tail">
                            {item.item_name}
                        </Text>
                        {/* Size badge — outlined (border, white bg, black text) */}
                        {size && (
                            <View style={{
                                borderWidth: borderLine,
                                borderColor: '#000',
                                borderRadius: 3,
                                paddingHorizontal: 4,
                                paddingVertical: 1,
                                marginLeft: 4,
                                marginTop: 2,
                                backgroundColor: '#fff',
                            }}>
                                <Text style={{ color: '#000', fontSize: fs.sizeBadge, fontWeight: '900' }}>
                                    {size}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Modifiers */}
                    {modifiers.length > 0 && (
                        <Text style={{
                            fontSize: fs.modifier,
                            fontWeight: '600',
                            color: '#000',
                            lineHeight: Math.round(fs.modifier * 1.25),
                        }} numberOfLines={4} ellipsizeMode="tail">
                            {modifiers.join(' • ')}
                        </Text>
                    )}
                </View>

                {/* ══════ THICK LINE: body → footer ══════ */}
                <View style={{ borderTopWidth: thick, borderTopColor: '#000' }} />

                {/* ══════ FOOTER ══════ */}
                <View style={{
                    paddingHorizontal: px,
                    paddingTop: Math.round(H * 0.018),
                    paddingBottom: Math.round(H * 0.015),
                }}>
                    {/* Shop name + Price */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: Math.round(H * 0.006) }}>
                        <View style={{ flex: 1, marginRight: 4 }}>
                            <Text style={{ fontSize: fs.shopInfo, fontWeight: '800', color: '#000' }}
                                numberOfLines={2} ellipsizeMode="tail">
                                {shopInfo.name}{shopInfo.address ? ` · ${shopInfo.address}` : ''}
                            </Text>
                            <Text style={{ fontSize: fs.time, fontWeight: '500', color: '#000', marginTop: 1 }}>
                                {formatTime(orderPrint.date)}
                            </Text>
                        </View>
                        <Text style={{ fontSize: fs.price, fontWeight: '900', color: '#000' }}>
                            {formatPrice(price)}
                        </Text>
                    </View>

                    {/* Greeting text (left) + QR code (right, bottom-aligned) */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: Math.round(H * 0.008) }}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={{
                                fontSize: fs.greeting,
                                fontWeight: '600',
                                fontStyle: 'italic',
                                color: '#000',
                                lineHeight: Math.round(fs.greeting * 1.35),
                            }}>
                                Dùng trong 2 giờ để giữ trọn vị ngon • Quét mã QR để nhận hóa đơn điện tử • 1000M nâng niu nông sản Việt!
                            </Text>
                        </View>
                        <QRCode value={qrValue || 'N/A'} size={qrSize} />
                    </View>
                </View>

            </View>
        );
    };

    const { W: cardW, H: cardH } = getLabelDimensions(printerSettings);

    return (
        <View style={{ backgroundColor: '#fff' }} onLayout={onLayout}>
            {itemsToRender.map((item, index) => (
                <View key={index} style={{ width: cardW, height: cardH }} collapsable={false}>
                    {renderLabel(item, index)}
                </View>
            ))}
        </View>
    );
};

export default TemTemplate2;
