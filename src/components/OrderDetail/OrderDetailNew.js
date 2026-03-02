import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Text,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import AsyncStorage from 'store/async_storage/index';
import printQueueService from '../../services/PrintQueueService';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    ORDER_CREATED: { label: 'Đơn hàng mới', bg: '#E3F2FD', color: '#2196F3' },
    ORDER_IN_PREPARE: { label: 'Đang chuẩn bị', bg: '#FFF3E0', color: '#FF9800' },
    ORDER_READY: { label: 'Sẵn sàng giao', bg: '#E8F5E9', color: '#4CAF50' },
    ORDER_PICKED_UP: { label: 'Đang giao', bg: '#F3E5F5', color: '#9C27B0' },
    ORDER_DELIVERED: { label: 'Đã giao', bg: '#CDEED8', color: '#069C2E' },
    ORDER_CANCELLED: { label: 'Đã hủy', bg: '#FED9DA', color: '#EF0000' },
    COMPLETED: { label: 'Hoàn thành', bg: '#CDEED8', color: '#069C2E' },
};

const getStatusCfg = (s) =>
    STATUS_CONFIG[s] || { label: s || 'N/A', bg: '#F5F5F5', color: '#9E9E9E' };

const parsePrice = (v) => {
    if (!v) return 0;
    return Number(String(v).replace(/\./g, '')) || 0;
};

const formatVND = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, count }) => (
    <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
            <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
            </View>
        )}
    </View>
);

const ItemRow = ({ item, index }) => {
    const qty = item.quantity || item.quanlity || 1;
    const name = item.product_name || item.name || '';
    const price = parsePrice(item.fare?.priceDisplay || item.price || 0);
    const totalPrice = parsePrice(item.total_price) || price * qty;
    const note = item.note || item.comment || '';

    // Options / modifiers
    const modifiers = [];
    (item.option || []).forEach((o) => {
        if (o.optdetailname) modifiers.push(o.optdetailname);
    });
    (item.modifierGroups || []).forEach((g) => {
        (g.modifiers || []).forEach((m) => {
            if (m.modifierName) modifiers.push(m.modifierName);
        });
    });

    return (
        <View style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
            {/* Qty bubble */}
            <View style={styles.qtyBubble}>
                <Text style={styles.qtyText}>{qty}</Text>
            </View>

            {/* Name + modifiers */}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{name}</Text>
                {modifiers.length > 0 && (
                    <Text style={styles.modifiers}>{modifiers.join(' · ')}</Text>
                )}
                {note ? (
                    <Text style={styles.itemNote}>📝 {note}</Text>
                ) : null}
            </View>

            {/* Price */}
            <View style={styles.itemPriceCol}>
                {price > 0 && (
                    <Text style={styles.itemUnitPrice}>{formatVND(price)}</Text>
                )}
                {totalPrice > 0 && qty > 1 && (
                    <Text style={styles.itemTotalPrice}>{formatVND(totalPrice)}</Text>
                )}
            </View>
        </View>
    );
};

const InfoRow = ({ label, value, valueStyle }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueStyle]}>{value || '—'}</Text>
    </View>
);

const Divider = () => <View style={styles.divider} />;

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
const OrderDetailNew = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const order = route.params?.order || {};
    const [loadingPrint, setLoadingPrint] = useState(false);

    const statusCfg = getStatusCfg(order.state);
    const items = order.itemInfo?.items || [];
    const itemCount = items.length;

    // Payment summary
    const subtotal = items.reduce((sum, item) => {
        const p = parsePrice(item.fare?.priceDisplay || item.price || 0);
        const q = item.quantity || item.quanlity || 1;
        const t = parsePrice(item.total_price);
        return sum + (t || p * q);
    }, 0);
    const orderValue = parsePrice(order.orderValue) || parsePrice(order.totalPrice) || subtotal;
    const discount = parsePrice(order.discount);
    const total = discount ? orderValue - discount : orderValue;

    // Customer info
    const customer =
        order.customerInfo ||
        (order.eater
            ? {
                name: order.eater.name || '',
                phone: order.eater.mobileNumber || '',
                address: order.eater.address?.address || order.eater.address || '',
                comment: order.eater.comment || '',
            }
            : null);

    // Print label
    const handlePrintLabel = async () => {
        if (Platform.OS !== 'android') {
            Toast.show({ type: 'error', text1: 'Chỉ hỗ trợ trên Android' });
            return;
        }
        setLoadingPrint(true);
        try {
            const labelPrinterInfo = await AsyncStorage.getLabelPrinterInfo();
            if (!labelPrinterInfo?.sWidth || !labelPrinterInfo?.sHeight) {
                throw new Error('Chưa cấu hình máy in');
            }
            if (
                global.queueMultipleLabels &&
                items.length > 0
            ) {
                await global.queueMultipleLabels(order, labelPrinterInfo);
                Toast.show({ type: 'success', text1: 'Đã xếp hàng in tem' });
            } else {
                printQueueService.addPrintTask({ type: 'label', order, priority: 'high' });
                Toast.show({ type: 'success', text1: 'Đã xếp hàng in tem' });
            }
        } catch (e) {
            Toast.show({ type: 'error', text1: e.message || 'Lỗi in tem' });
        } finally {
            setLoadingPrint(false);
        }
    };

    // Print bill
    const handlePrintBill = async () => {
        if (Platform.OS !== 'android') {
            Toast.show({ type: 'error', text1: 'Chỉ hỗ trợ trên Android' });
            return;
        }
        setLoadingPrint(true);
        try {
            const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();
            if (!billPrinterInfo) throw new Error('Chưa cấu hình máy in bill');
            printQueueService.addPrintTask({ type: 'bill', order, priority: 'high' });
            Toast.show({ type: 'success', text1: 'Đã xếp hàng in hóa đơn' });
        } catch (e) {
            Toast.show({ type: 'error', text1: e.message || 'Lỗi in hóa đơn' });
        } finally {
            setLoadingPrint(false);
        }
    };

    return (
        <>
            <View style={styles.screen}>
                {/* ── Top bar ── */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.topBarCenter}>
                        <Text style={styles.topBarTitle}>Chi tiết đơn hàng</Text>
                        {order.displayID ? (
                            <Text style={styles.topBarSubtitle}>#{order.displayID}</Text>
                        ) : null}
                    </View>

                    {/* Status badge */}
                    <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                        <Text style={[styles.statusPillText, { color: statusCfg.color }]}>
                            {statusCfg.label}
                        </Text>
                    </View>
                </View>

                {/* ── Scrollable content ── */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ─ Order meta card ─ */}
                    <View style={styles.card}>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Đối tác</Text>
                                <Text style={styles.metaValue}>{order.service || '—'}</Text>
                            </View>
                            <View style={styles.metaDivider} />
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Mã đơn</Text>
                                <Text style={styles.metaValue} numberOfLines={1}>
                                    {order.displayID || order.deliveryId || '—'}
                                </Text>
                            </View>
                            {order.discountInfo && (
                                <>
                                    <View style={styles.metaDivider} />
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>Khuyến mãi</Text>
                                        <Text style={[styles.metaValue, { color: Colors.success }]}>
                                            {order.discountInfo}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* ─ Items card ─ */}
                    <View style={styles.card}>
                        <SectionHeader icon="shopping-outline" title="Danh sách món" count={itemCount} />
                        <Divider />
                        {items.length === 0 ? (
                            <Text style={styles.emptyItems}>Không có sản phẩm</Text>
                        ) : (
                            items.map((item, i) => <ItemRow key={i} item={item} index={i} />)
                        )}
                    </View>

                    {/* ─ Customer note ─ */}
                    {customer?.comment ? (
                        <View style={styles.noteCard}>
                            <View style={styles.noteHeader}>
                                <MaterialCommunityIcons name="note-text-outline" size={16} color={Colors.warning} />
                                <Text style={styles.noteTitle}>Ghi chú từ khách hàng</Text>
                            </View>
                            <Text style={styles.noteText}>"{customer.comment}"</Text>
                        </View>
                    ) : null}

                    {/* ─ Customer info ─ */}
                    {customer && (customer.name || customer.phone || customer.address) ? (
                        <View style={styles.card}>
                            <SectionHeader icon="account-outline" title="Thông tin khách hàng" />
                            <Divider />
                            {customer.name ? <InfoRow label="Tên" value={customer.name} /> : null}
                            {customer.phone ? <InfoRow label="SĐT" value={customer.phone} /> : null}
                            {customer.address ? <InfoRow label="Địa chỉ" value={customer.address} /> : null}
                        </View>
                    ) : null}

                    {/* ─ Payment ─ */}
                    <View style={styles.card}>
                        <SectionHeader icon="receipt-text-outline" title="Chi tiết thanh toán" />
                        <Divider />
                        <InfoRow label="Tạm tính" value={formatVND(subtotal || orderValue)} />
                        {discount > 0 && (
                            <InfoRow
                                label="Giảm giá"
                                value={`- ${formatVND(discount)}`}
                                valueStyle={{ color: Colors.success }}
                            />
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tổng cộng</Text>
                            <Text style={styles.totalValue}>{formatVND(total || orderValue)}</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* ── Bottom action bar ── */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.bottomBtn, styles.bottomBtnOutline]}
                        onPress={handlePrintLabel}
                        disabled={loadingPrint}
                        activeOpacity={0.75}
                    >
                        <Svg name="icon_print" size={20} />
                        <Text style={[styles.bottomBtnText, { color: Colors.primary }]}>In tem</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bottomBtn, styles.bottomBtnOutline]}
                        onPress={handlePrintBill}
                        disabled={loadingPrint}
                        activeOpacity={0.75}
                    >
                        <MaterialCommunityIcons name="printer-outline" size={20} color={Colors.primary} />
                        <Text style={[styles.bottomBtnText, { color: Colors.primary }]}>In bill</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bottomBtn, styles.bottomBtnClose]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.bottomBtnText, { color: Colors.white }]}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Toast position="top" topOffset={50} visibilityTime={3000} />
        </>
    );
};

export default OrderDetailNew;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },

    // ── Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 12 : 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.line,
        gap: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBarCenter: {
        flex: 1,
    },
    topBarTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    topBarSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // ── Scroll
    scroll: { flex: 1 },
    scrollContent: {
        padding: 12,
        gap: 10,
        paddingBottom: 20,
    },

    // ── Card
    card: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        gap: 0,
    },

    // ── Meta row (inside card)
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flex: 1,
        alignItems: 'center',
    },
    metaDivider: {
        width: 1,
        height: 32,
        backgroundColor: Colors.line,
    },
    metaLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },

    // ── Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 1,
    },
    countBadge: {
        backgroundColor: Colors.primaryLight,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '700',
    },

    // ── Divider
    divider: {
        height: 1,
        backgroundColor: Colors.line,
        marginBottom: 10,
    },

    // ── Item row
    itemRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        gap: 10,
        alignItems: 'flex-start',
    },
    itemRowBorder: {
        borderTopWidth: 1,
        borderTopColor: Colors.line,
    },
    qtyBubble: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    qtyText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    itemInfo: {
        flex: 1,
        gap: 2,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    modifiers: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    itemNote: {
        fontSize: 11,
        color: Colors.warning,
        fontStyle: 'italic',
    },
    itemPriceCol: {
        alignItems: 'flex-end',
        gap: 2,
        flexShrink: 0,
    },
    itemUnitPrice: {
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    itemTotalPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    emptyItems: {
        textAlign: 'center',
        color: Colors.textSecondary,
        paddingVertical: 20,
    },

    // ── Note card
    noteCard: {
        backgroundColor: '#FFFBF0',
        borderRadius: 14,
        padding: 14,
        borderLeftWidth: 3,
        borderLeftColor: Colors.warning,
        gap: 6,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noteTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.warning,
    },
    noteText: {
        fontSize: 13,
        color: Colors.grayText,
        fontStyle: 'italic',
        lineHeight: 20,
    },

    // ── Info row
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    infoValue: {
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '500',
        maxWidth: '60%',
        textAlign: 'right',
    },

    // ── Total row
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 10,
        borderTopWidth: 1.5,
        borderTopColor: Colors.line,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.primary,
    },

    // ── Bottom bar
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.line,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 6,
    },
    bottomBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        borderRadius: 10,
        gap: 6,
    },
    bottomBtnOutline: {
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    bottomBtnClose: {
        backgroundColor: Colors.primary,
    },
    bottomBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
