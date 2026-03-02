import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    Text,
    Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from 'theme/Colors';
import AsyncStorage from 'store/async_storage/index';
import orderController from 'store/order/orderController';
import { NAVIGATION_ORDER_DETAIL } from 'navigation/routes';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import PrinterSettingsModal from 'common/PrinterSettingsModal';
import { usePrinter } from '../../services/PrinterService';

const ORDER_FILTERS = [
    { id: 1, name: 'Đơn mới' },
    { id: 2, name: 'Lịch sử' },
];

const STATUS_CONFIG = {
    ORDER_CREATED: { label: 'Đơn mới', bg: '#E3F2FD', color: '#2196F3' },
    ORDER_IN_PREPARE: { label: 'Đang chuẩn bị', bg: '#FFF3E0', color: '#FF9800' },
    ORDER_READY: { label: 'Sẵn sàng', bg: '#E8F5E9', color: '#4CAF50' },
    ORDER_PICKED_UP: { label: 'Đang giao', bg: '#F3E5F5', color: '#9C27B0' },
    ORDER_DELIVERED: { label: 'Đã giao', bg: '#CDEED8', color: '#069C2E' },
    ORDER_CANCELLED: { label: 'Đã hủy', bg: '#FED9DA', color: '#EF0000' },
    ORDER_REJECTED: { label: 'Bị từ chối', bg: '#FFEBEE', color: '#F44336' },
    ASSIGNING: { label: 'Tìm tài xế', bg: '#FFF9C4', color: '#F57F17' },
    COMPLETED: { label: 'Hoàn thành', bg: '#CDEED8', color: '#069C2E' },
};

const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || { label: status || 'N/A', bg: '#F5F5F5', color: '#9E9E9E' };

const SERVICE_COLORS = {
    GRAB: '#00B14F',
    BE: '#3AC5C9',
    DELIVERY: '#FF6B35',
    PICKUP: '#6C5CE7',
};

const getServiceColor = (service = '') => {
    const upper = service.toUpperCase();
    if (upper.includes('GRAB')) return SERVICE_COLORS.GRAB;
    if (upper.includes('BE')) return SERVICE_COLORS.BE;
    if (upper.includes('DELIVERY')) return SERVICE_COLORS.DELIVERY;
    if (upper.includes('PICK')) return SERVICE_COLORS.PICKUP;
    return '#9E9E9E';
};

const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return Number(String(priceStr).replace(/\./g, '')) || 0;
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatToUTC7 = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}Z`;
};

const transformOrderData = (order, service = 'GRAB') => ({
    displayID: order.display_id || '',
    deliveryId: order.delivery_id || '',
    service,
    state: order.state || 'ORDER_CREATED',
    orderValue: order.price_paid || order.total_price || '0',
    totalPrice: order.total_price || '0',
    discount: order.discount || '0',
    discountInfo: order.discount_info || null,
    itemInfo: {
        items: (order.items || []).map((item) => ({
            product_name: item.product_name || '',
            name: item.product_name || '',
            quantity: item.quantity || 1,
            quanlity: item.quantity || 1,
            price: (parsePrice(item.price_product) || parsePrice(item.price_paid) || 0).toString(),
            total_price: item.total_price || '0',
            note: item.note || '',
            comment: item.note || '',
            fare: {
                priceDisplay: (parsePrice(item.price_product) || parsePrice(item.price_paid) || 0).toString(),
                currencySymbol: '₫',
            },
            option: (item.option || []).map((opt) => ({
                optdetailid: opt.product_name || '',
                optdetailname: opt.product_name || '',
                product_name: opt.product_name || '',
                quantity: opt.quantity || 1,
            })),
            modifierGroups: (item.extra || []).map((ext) => ({
                modifiers: [{ modifierName: ext.product_name || '', quantity: ext.quantity || 1 }],
            })),
            extra: item.extra || null,
        })),
    },
    eater: order.eater || null,
    driver: order.driver || null,
    source: 'app_order',
    customerInfo: order.eater
        ? {
            name: order.eater.name || '',
            phone: order.eater.mobileNumber || '',
            comment: order.eater.comment || '',
            address: order.eater.address?.address || order.eater.address || '',
        }
        : null,
    driverInfo: order.driver
        ? { name: order.driver.name || '', phone: order.driver.mobileNumber || '' }
        : null,
    rawData: order,
});

// ─────────────────────────────────────────────────────────────
// OrderCard component
// ─────────────────────────────────────────────────────────────
const OrderCard = ({ order, onPress }) => {
    const status = getStatusConfig(order.state);
    const serviceColor = getServiceColor(order.service);
    const itemCount = order.itemInfo?.items?.length || 0;
    const customerName = order.customerInfo?.name || order.eater?.name || '';
    const itemNames = (order.itemInfo?.items || [])
        .slice(0, 2)
        .map((i) => `${i.quantity || i.quanlity || 1}x ${i.product_name || i.name}`)
        .join(', ');

    return (
        <TouchableOpacity style={styles.orderCard} onPress={() => onPress(order)} activeOpacity={0.7}>
            {/* Left accent bar */}
            <View style={[styles.cardAccent, { backgroundColor: serviceColor }]} />

            <View style={styles.cardBody}>
                {/* Row 1: Service + ID + Status */}
                <View style={styles.cardRow}>
                    <View style={styles.cardLeft}>
                        <View style={[styles.serviceBadge, { borderColor: serviceColor }]}>
                            <Text style={[styles.serviceText, { color: serviceColor }]}>
                                {order.service || 'N/A'}
                            </Text>
                        </View>
                        <Text style={styles.orderId} numberOfLines={1}>
                            #{order.displayID || order.deliveryId || '—'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                {/* Row 2: Customer / Items */}
                {customerName ? (
                    <Text style={styles.customerName} numberOfLines={1}>{customerName}</Text>
                ) : null}
                <Text style={styles.itemNames} numberOfLines={1}>
                    {itemNames || `${itemCount} sản phẩm`}
                </Text>

                {/* Row 3: Price + Item count */}
                <View style={styles.cardFooter}>
                    <View style={styles.itemCountBadge}>
                        <MaterialCommunityIcons name="shopping-outline" size={14} color={Colors.primary} />
                        <Text style={styles.itemCountText}>{itemCount} món</Text>
                    </View>
                    <Text style={styles.orderPrice}>
                        {parsePrice(order.orderValue)
                            ? formatCurrency(parsePrice(order.orderValue))
                            : order.orderValue || '0đ'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────
const OrderNew = () => {
    const navigation = useNavigation();
    const [orderType, setOrderType] = useState(1);
    const [userShop, setUserShop] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [printerModalVisible, setPrinterModalVisible] = useState(false);
    const [printerType, setPrinterType] = useState('label');

    const { labelPrinterStatus, billPrinterStatus } = usePrinter();

    // Load user shop
    const loadUserShop = async () => {
        const user = await AsyncStorage.getUser();
        if (user?.shops) setUserShop(user.shops);
    };

    useEffect(() => { loadUserShop(); }, []);

    // ── React Query: new orders ──────────────────────────────
    const newOrdersQuery = useQuery({
        queryKey: ['orders', 'new', userShop?.id],
        queryFn: async () => {
            if (!userShop) throw new Error('No shop');
            const user = await AsyncStorage.getUser();
            const res = await orderController.fetchOrder({
                branch_id: Number(userShop.id),
                brand_id: Number(userShop.partnerid),
                partner_id: Number(user.shopownerid),
            });
            if (!res.success) throw new Error('Failed to fetch orders');
            return (res?.data?.orders || []).map((o) => transformOrderData(o, o.service || 'GRAB'));
        },
        enabled: orderType === 1 && !!userShop,
        refetchInterval: 15000,
    });

    // ── React Query: history orders ──────────────────────────
    const historyOrdersQuery = useQuery({
        queryKey: ['orders', 'history', userShop?.id, selectedDate.toISOString()],
        queryFn: async () => {
            if (!userShop) throw new Error('No shop');
            const user = await AsyncStorage.getUser();
            const startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 0);
            const res = await orderController.fetchOrderHistory({
                branch_id: Number(userShop.id),
                brand_id: Number(userShop.partnerid),
                partner_id: Number(user.shopownerid),
                from_at: formatToUTC7(startDate),
                to_at: formatToUTC7(endDate),
                page: 1,
                size: 1000,
            });
            if (!res.success) throw new Error('Failed to fetch order history');
            const totalRevenue = res.data?.total_revenue || 0;
            const statements = res.data?.orders || [];
            const detailResults = await Promise.all(
                statements.map((s) =>
                    orderController.getOrderDetail({
                        order_id: s.ID,
                        branch_id: userShop.id,
                        brand_id: userShop.partnerid,
                        service: s.service,
                        partner_id: Number(user.shopownerid),
                    })
                )
            );
            const rawOrders = detailResults.map((r, i) => ({ ...r?.data?.order, ...statements[i] }));
            const transformed = rawOrders.map((o) => transformOrderData(o, o.service));
            const sorted = transformed.sort((a, b) => {
                const ta = a.rawData?.updated_at || a.rawData?.created_at || 0;
                const tb = b.rawData?.updated_at || b.rawData?.created_at || 0;
                return new Date(tb) - new Date(ta);
            });
            return { orders: sorted, totalRevenue };
        },
        enabled: orderType === 2 && !!userShop,
    });

    // Auto-refetch on focus
    useFocusEffect(
        useCallback(() => {
            if (!userShop) return;
            if (orderType === 1) newOrdersQuery.refetch();
            else historyOrdersQuery.refetch();
        }, [orderType, userShop])
    );

    const currentData =
        orderType === 1
            ? newOrdersQuery.data || []
            : historyOrdersQuery.data?.orders || [];
    const isLoading =
        orderType === 1 ? newOrdersQuery.isLoading : historyOrdersQuery.isLoading;
    const apiTotalRevenue = historyOrdersQuery.data?.totalRevenue || 0;

    // Filter
    const filteredOrders = React.useMemo(() => {
        if (orderType === 2 && searchText.trim()) {
            return currentData.filter((o) => {
                const id = o.displayID || '';
                const did = o.deliveryId || '';
                return (
                    id.includes(searchText) ||
                    did.includes(searchText) ||
                    id.slice(-3).includes(searchText) ||
                    did.slice(-3).includes(searchText)
                );
            });
        }
        return currentData;
    }, [currentData, searchText, orderType]);

    const handleOrderPress = (order) => {
        navigation.navigate(NAVIGATION_ORDER_DETAIL, { order });
    };

    // ── Render ───────────────────────────────────────────────
    return (
        <>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* ─── Header ─── */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            {/* Filter tabs */}
                            <View style={styles.tabsRow}>
                                {ORDER_FILTERS.map((f) => (
                                    <TouchableOpacity
                                        key={f.id}
                                        style={[styles.tab, orderType === f.id && styles.tabActive]}
                                        onPress={() => !isLoading && setOrderType(f.id)}
                                        disabled={isLoading}
                                    >
                                        <Text style={[styles.tabText, orderType === f.id && styles.tabTextActive]}>
                                            {f.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Action row */}
                            <View style={styles.actions}>
                                {/* Shop name */}
                                <View style={styles.shopTag}>
                                    <MaterialCommunityIcons name="store-outline" size={16} color={Colors.primary} />
                                    <Text style={styles.shopName} numberOfLines={1}>
                                        {userShop ? userShop.name_vn : 'Đang tải...'}
                                    </Text>
                                </View>

                                {/* Refresh (new orders) */}
                                {orderType === 1 && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
                                        onPress={() => !isLoading && newOrdersQuery.refetch()}
                                        disabled={isLoading}
                                    >
                                        <Svg name="refresh" size={20} />
                                        <Text style={styles.actionBtnText}>Làm mới</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Printer buttons */}
                                <TouchableOpacity
                                    style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
                                    onPress={() => { if (!isLoading) { setPrinterType('label'); setPrinterModalVisible(true); } }}
                                    disabled={isLoading}
                                >
                                    <Svg name={labelPrinterStatus === 'connected' ? 'icon_print' : 'icon_print_warning'} size={20} />
                                    <Text style={styles.actionBtnText}>In tem</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
                                    onPress={() => { if (!isLoading) { setPrinterType('bill'); setPrinterModalVisible(true); } }}
                                    disabled={isLoading}
                                >
                                    <Svg name={billPrinterStatus === 'connected' ? 'icon_print' : 'icon_print_warning'} size={20} />
                                    <Text style={styles.actionBtnText}>In bill</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Search / date row (history only) */}
                        {orderType === 2 && (
                            <View style={styles.searchRow}>
                                <TouchableOpacity
                                    style={styles.dateBtn}
                                    onPress={() => !isLoading && setShowDatePicker(true)}
                                    disabled={isLoading}
                                >
                                    <MaterialCommunityIcons name="calendar-outline" size={18} color={Colors.grayText} />
                                    <Text style={styles.dateBtnText}>
                                        {selectedDate.toLocaleDateString('en-GB')}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.searchInput}>
                                    <MaterialCommunityIcons name="magnify" size={18} color={Colors.grayText} />
                                    <TextInput
                                        style={styles.searchText}
                                        placeholder="Tìm theo mã đơn hàng..."
                                        placeholderTextColor={Colors.placeholder}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        editable={!isLoading}
                                    />
                                </View>

                                <View style={styles.revenueBadge}>
                                    <Text style={styles.revenueLabel}>Tổng doanh thu:</Text>
                                    <Text style={styles.revenueValue}>{formatCurrency(apiTotalRevenue)}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ─── Content ─── */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <TextNormal style={styles.loadingText}>
                                {orderType === 1 ? 'Đang tải đơn hàng mới...' : 'Đang tải lịch sử đơn hàng...'}
                            </TextNormal>
                        </View>
                    ) : filteredOrders.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="receipt-text-outline" size={64} color={Colors.line} />
                            <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
                            <Text style={styles.emptySubtitle}>
                                {orderType === 1
                                    ? 'Chưa có đơn hàng mới nào.'
                                    : 'Không tìm thấy đơn hàng trong ngày này.'}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredOrders}
                            keyExtractor={(item, idx) => item.displayID || String(idx)}
                            renderItem={({ item }) => (
                                <OrderCard order={item} onPress={handleOrderPress} />
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    )}
                </View>
            </SafeAreaView>

            {/* Date picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, d) => { setShowDatePicker(false); if (d) setSelectedDate(d); }}
                    maximumDate={new Date()}
                />
            )}

            {/* Printer modal */}
            <PrinterSettingsModal
                visible={printerModalVisible}
                onClose={() => setPrinterModalVisible(false)}
                initialPrinterType={printerType}
                onSettingsSaved={() => { }}
            />

            <Toast position="top" topOffset={50} visibilityTime={4000} />
        </>
    );
};

export default OrderNew;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    container: {
        flex: 1,
        padding: 12,
    },

    // ── Header
    header: {
        marginBottom: 12,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.line,
    },
    tabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabText: {
        fontSize: 13,
        color: Colors.inactiveText,
        fontWeight: '400',
    },
    tabTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    shopTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        maxWidth: 160,
    },
    shopName: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
        flexShrink: 1,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    actionBtnDisabled: { opacity: 0.5 },
    actionBtnText: {
        fontSize: 12,
        color: Colors.grayText,
        fontWeight: '500',
    },

    // ── Search / date row
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        flexWrap: 'wrap',
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    dateBtnText: {
        fontSize: 13,
        color: Colors.grayText,
    },
    searchInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
        minWidth: 120,
    },
    searchText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textPrimary,
        padding: 0,
        outlineWidth: 0,
    },
    revenueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    revenueLabel: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: '500',
    },
    revenueValue: {
        fontSize: 13,
        color: Colors.white,
        fontWeight: '700',
    },

    // ── List
    listContent: {
        paddingBottom: 20,
    },
    separator: {
        height: 8,
    },

    // ── Card
    orderCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cardAccent: {
        width: 4,
    },
    cardBody: {
        flex: 1,
        padding: 12,
        gap: 4,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    serviceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1.5,
    },
    serviceText: {
        fontSize: 11,
        fontWeight: '700',
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        flexShrink: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    customerName: {
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    itemNames: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    itemCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemCountText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '500',
    },
    orderPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.primary,
    },

    // ── Empty
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    emptySubtitle: {
        fontSize: 13,
        color: Colors.inactiveText,
        textAlign: 'center',
    },

    // ── Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        gap: 12,
    },
    loadingText: {
        color: Colors.textSecondary,
    },
});
