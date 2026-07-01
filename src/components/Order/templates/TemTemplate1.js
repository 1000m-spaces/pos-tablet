/**
 * TemTemplate1.js — "Cổ điển (Đen-Trắng)" label template
 *
 * This is the original template, extracted from the monolithic TemTemplate.js.
 * Layout: Black header with order info → Body with item details → Footer with shop info & barcode
 */
import React from 'react';
import { View, Image, PixelRatio } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
    Text,
    mmToPixels,
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
    BarcodeView,
    getLabelDimensions,
} from './TemTemplateBase';

const TemTemplate1 = ({ orderPrint, settings = {}, onLayout }) => {
    console.log(`\n║ PRINT_TEM: TemTemplate1 rendered`);
    console.log(`║ PRINT_TEM: orderPrint.displayID: ${orderPrint?.displayID}`);

    const { printerSettings, shopInfo } = useTemTemplateData();
    const itemsToRender = prepareItemsToRender(orderPrint);

    // ─────── Render one label (portrait card, will be rotated) ───────
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
        const tableDisplay = table ? `THẺ ${table}`.toUpperCase() : '';
        const cupText = `${item.itemIdx || (index + 1)}/${item.totalItems || itemsToRender.length}`;
        const barcodeValue = `${orderId}-${cupText.replace('/', '')}`.replace('#', '');
        const qrValue = barcodeValue;

        // ═══ Font sizes — calibrated for full label canvas (DPI 70) ═══
        const fs = {
            channelName: Math.max(6, Math.round(W * 0.053)),   // ~7
            logo: Math.max(5, Math.round(W * 0.045)),          // ~6
            orderId: Math.max(12, Math.round(W * 0.115)),      // Reduced from 14 to 12
            metaLabel: Math.max(6, Math.round(W * 0.042)),     // ~6 (bold for thermal)
            metaValue: Math.max(8, Math.round(W * 0.072)),     // ~10 (slightly smaller)
            badge: Math.max(5, Math.round(W * 0.045)),         // ~6
            itemName: Math.max(8, Math.round(W * 0.07)),       // ~10 (reduced)
            sizeBadge: Math.max(6, Math.round(W * 0.053)),     // ~7
            modifier: Math.max(5, Math.round(W * 0.042)),      // ~6 (reduced)
            shopInfo: Math.max(5, Math.round(W * 0.045)),      // ~6 (increased for clarity)
            time: Math.max(5, Math.round(W * 0.042)),          // ~6 (was 4, too blurry)
            price: Math.max(9, Math.round(W * 0.082)),         // Reduced from 10 to 9
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
        // Chuẩn hóa độ dày đường kẻ theo PixelRatio để đồng bộ mọi thiết bị
        const thinLine = 1 / pixelRatio;
        const borderLine = 2 / pixelRatio;

        return (
            <View key={index} style={{ width: W, height: H, backgroundColor: '#fff', overflow: 'hidden', paddingTop: Math.round(H * 0.04) }}>
                {/* ══════ HEADER (Black) ══════ */}
                <View style={{
                    height: headerH,
                    backgroundColor: '#000',
                    paddingHorizontal: px,
                    paddingVertical: Math.round(headerH * 0.08), // Dynamic vertical padding instead of hardcoded
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    {/* Row 1: Channel name + Logo + 1000M */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Text style={{ color: '#fff', fontSize: fs.channelName, fontWeight: '900', fontStyle: 'italic' }}>
                            {channelText}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: Math.max(7, Math.round(W * 0.06)), fontWeight: '900', zIndex: 2 }}>
                                1000M
                            </Text>
                            <View style={{ width: Math.round(W * 0.12), height: Math.round(W * 0.08) }}>
                                <Image
                                    source={require('../../../assets/images/logo_1000m_white.png')}
                                    style={{
                                        position: 'absolute',
                                        top: -Math.round(W * 0.02),
                                        left: -5,
                                        width: Math.round(W * 0.22),
                                        height: Math.round(W * 0.22),
                                    }}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Row 2: Big order number */}
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
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

                    {/* Row 3: Table | Cup count | Badge */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderTopWidth: thinLine,
                        borderTopColor: '#fff',
                        paddingTop: Math.round(headerH * 0.03),
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
                            height: fs.metaValue + Math.round(headerH * 0.06),
                            backgroundColor: '#fff',
                            marginHorizontal: 4,
                        }} />

                        {/* LY */}
                        <View style={{ flex: 0.7 }}>
                            <Text style={{ color: '#fff', fontSize: fs.metaLabel, fontWeight: '900', lineHeight: fs.metaLabel }}>
                                LY
                            </Text>
                            <Text style={{ color: '#fff', fontSize: fs.metaValue, fontWeight: '900', lineHeight: fs.metaValue }}>
                                {cupText}
                            </Text>
                        </View>

                        {/* Badge */}
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <View style={{
                                borderWidth: borderLine,
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
                    paddingHorizontal: px,
                    paddingTop: 4,
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
                                fontWeight: '400',
                                color: '#000',
                                lineHeight: Math.round(fs.modifier * 1.1),
                            }} numberOfLines={4} ellipsizeMode="tail">
                                {modifiers.join(' • ')}
                            </Text>
                        )}
                    </View>

                    {/* ── Dashed separator ── */}
                    <View style={{
                        borderTopWidth: thinLine,
                        borderTopColor: '#000',
                        borderStyle: 'dashed',
                        marginTop: 3,
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
                        {/* 
                        <View style={{ marginLeft: 4 }}>
                            <QRCode value={qrValue || 'N/A'} size={qrSize} />
                        </View>
                        */}
                    </View>
                </View>
            </View>
        );
    };

    // ─────── Main render ───────
    // Render directly in portrait. Rotation is handled post-capture if needed.
    const { W: cardW, H: cardH } = getLabelDimensions(printerSettings);

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

export default TemTemplate1;
