import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import {
    TextNormal,
    TextSemiBold,
} from 'common/Text/TextFont';
import AsyncStorage from 'store/async_storage/index';
import Colors from 'theme/Colors';
import syncController from 'store/sync/syncController';
import Toast from 'react-native-toast-message';
import logService, { LOG_CATEGORIES } from '../../services/LogService';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }); // Mặc định xem Hôm nay (tránh trùng mã M-0001 giữa các ngày)
    const [syncingOrders, setSyncingOrders] = useState({});
    const [expandedSession, setExpandedSession] = useState(null);

    // Password control states
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [pendingStatusChange, setPendingStatusChange] = useState(null); // { session, status }

    const fetchHistory = useCallback(async () => {
        try {
            const history = await AsyncStorage.getOrderHistory();
            let filtered = history;

            if (selectedFilter === 'unsynced') {
                filtered = history.filter(order => order.syncStatus !== 'synced');
            } else {
                // Filter theo ngày YYYY-MM-DD
                filtered = history.filter(order => {
                    const orderDate = new Date(order.history_created_at || order.created_at);
                    const year = orderDate.getFullYear();
                    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
                    const day = String(orderDate.getDate()).padStart(2, '0');
                    const orderDateStr = `${year}-${month}-${day}`;
                    return orderDateStr === selectedFilter;
                });
            }

            setOrders(filtered);
        } catch (error) {
            console.error('Error fetching order history:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [selectedFilter]);

    const handleManualSync = async (order) => {
        const session = order.session;
        if (syncingOrders[session]) return;

        setSyncingOrders(prev => ({ ...prev, [session]: true }));
        try {
            logService.info(LOG_CATEGORIES.SYNC, `Bắt đầu đồng bộ thủ công đơn ${session}`);

            // Chuẩn bị dữ liệu theo cấu trúc API (expand sản phẩm theo số lượng)
            const expandedProducts = order.products.flatMap(item =>
                Array(item.quanlity || item.quantity || 1).fill(item)
            );
            const syncPayload = {
                orders: [{ ...order, products: expandedProducts }]
            };

            const response = await syncController.syncOrders(syncPayload);

            if (response.success) {
                const ordersSyncedServer = response.result?.data || [];
                const serverResult = ordersSyncedServer.find(o => o.offline_code === session);

                if (serverResult && serverResult.match === true) {
                    // Thành công: Cập nhật storage
                    await AsyncStorage.updateOrderSyncStatus(session, 'synced');
                    logService.info(LOG_CATEGORIES.SYNC, `Đồng bộ thủ công thành công đơn ${session}`);
                    Toast.show({
                        type: 'success',
                        text1: 'Đồng bộ thành công',
                        text2: `Đơn ${order.displayID || session} đã được đồng bộ lên server.`,
                        position: 'top',
                    });
                    fetchHistory();
                } else {
                    // Server từ chối
                    const errMsg = serverResult ? (serverResult.message || 'Server từ chối đơn hàng') : 'Thông tin đối soát không khớp';
                    logService.warn(LOG_CATEGORIES.SYNC, `Đồng bộ thủ công bị server từ chối đơn ${session}: ${errMsg}`, {
                        order,
                        serverResult
                    });
                    Alert.alert('Đồng bộ thất bại', `Server từ chối đơn hàng này.\nChi tiết: ${errMsg}`);
                }
            } else {
                // Lỗi API / kết nối
                const errMsg = response.message || 'Lỗi mạng hoặc server không phản hồi';
                logService.error(LOG_CATEGORIES.SYNC, `Đồng bộ thủ công lỗi mạng/API đơn ${session}: ${errMsg}`, {
                    order
                });
                Alert.alert('Đồng bộ thất bại', `Không thể kết nối đến server để đồng bộ.\nChi tiết: ${errMsg}`);
            }
        } catch (err) {
            console.error('Manual sync error:', err);
            logService.error(LOG_CATEGORIES.SYNC, `Lỗi exception khi đồng bộ thủ công đơn ${session}: ${err.message}`);
            Alert.alert('Lỗi', `Có lỗi xảy ra trong quá trình đồng bộ: ${err.message}`);
        } finally {
            setSyncingOrders(prev => ({ ...prev, [session]: false }));
        }
    };

    const handleLocalStatusChange = async (session, status) => {
        try {
            await AsyncStorage.updateOrderSyncStatus(session, status);
            Toast.show({
                type: 'success',
                text1: 'Đã cập nhật trạng thái',
                text2: `Trạng thái local đã chuyển thành: ${status === 'synced' ? 'Đã sync' : status === 'failed' ? 'Thất bại' : 'Chờ sync'}`,
                position: 'top',
            });
            fetchHistory();
        } catch (error) {
            console.error('Error changing local status:', error);
            Alert.alert('Lỗi', `Không thể cập nhật trạng thái: ${error.message}`);
        }
    };

    const handleStatusChangePress = (session, status) => {
        setPendingStatusChange({ session, status });
        setPasswordInput('');
        setPasswordModalVisible(true);
    };

    const handleConfirmPassword = () => {
        if (passwordInput === '123456') {
            setPasswordModalVisible(false);
            if (pendingStatusChange) {
                handleLocalStatusChange(pendingStatusChange.session, pendingStatusChange.status);
            }
        } else {
            Alert.alert('Sai mật mã', 'Mật mã xác nhận không chính xác, vui lòng thử lại.');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Reload dữ liệu mỗi khi màn hình Profile được focus (quay lại từ Hóa Đơn, Menu...)
    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchHistory();
    };

    const formatCurrency = (amount) => {
        try {
            let num = amount;
            if (typeof amount === 'string') {
                num = parseInt(amount.replace(/\./g, ''), 10);
            }
            return new Intl.NumberFormat('vi-VN').format(num || 0) + 'đ';
        } catch {
            return '0đ';
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '--';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '--';
        }
    };

    const getProductCount = (order) => {
        if (!order.products || !Array.isArray(order.products)) return 0;
        return order.products.reduce((sum, p) => sum + (p.quanlity || p.quantity || 1), 0);
    };

    const getSyncBadge = (status) => {
        switch (status) {
            case 'synced': return { text: 'Đã sync', color: '#2ECC71', bg: '#E8F8F0' };
            case 'failed': return { text: 'Thất bại', color: '#E74C3C', bg: '#FDEDEC' };
            default: return { text: 'Chờ sync', color: '#F39C12', bg: '#FEF9E7' };
        }
    };

    const renderOrder = ({ item, index }) => {
        const badge = getSyncBadge(item.syncStatus);
        const isSyncing = syncingOrders[item.session];
        const isExpanded = expandedSession === item.session;
        return (
            <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.9}
                onPress={() => setExpandedSession(isExpanded ? null : item.session)}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdSection}>
                        <TextSemiBold style={styles.orderId}>
                            {item.displayID || item.session || `#${index + 1}`}
                        </TextSemiBold>
                        <TextNormal style={styles.orderTime}>
                            {formatTime(item.history_created_at || item.created_at)}
                        </TextNormal>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={[styles.syncBadge, { backgroundColor: badge.bg, marginRight: item.syncStatus !== 'synced' ? 8 : 0 }]}>
                            <TextNormal style={[styles.syncText, { color: badge.color }]}>
                                {badge.text}
                            </TextNormal>
                        </View>
                        {item.syncStatus !== 'synced' && (
                            <TouchableOpacity
                                style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
                                onPress={() => handleManualSync(item)}
                                disabled={isSyncing}
                            >
                                {isSyncing ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <TextNormal style={styles.syncBtnText}>Đồng bộ</TextNormal>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.orderBody}>
                    <View style={styles.infoRow}>
                        <TextNormal style={styles.infoLabel}>Bàn:</TextNormal>
                        <TextNormal style={styles.infoValue}>
                            {item.shoptablename || item.shopTableName || 'Mang đi'}
                        </TextNormal>
                    </View>
                    <View style={styles.infoRow}>
                        <TextNormal style={styles.infoLabel}>Sản phẩm:</TextNormal>
                        <TextNormal style={styles.infoValue}>
                            {getProductCount(item)} món
                        </TextNormal>
                    </View>
                    <View style={styles.infoRow}>
                        <TextNormal style={styles.infoLabel}>Tổng tiền:</TextNormal>
                        <TextSemiBold style={styles.totalAmount}>
                            {formatCurrency(item.total_amount || item.price_paid)}
                        </TextSemiBold>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        <TextSemiBold style={styles.sectionTitle}>Chi tiết món ăn:</TextSemiBold>
                        {item.products && item.products.map((prod, pIdx) => {
                            const qty = prod.quanlity || prod.quantity || 1;

                            // Giá: total_price đã bao gồm topping, nếu không có thì dùng prodprice
                            const unitPrice = prod.total_price || prod.prodprice || prod.price || 0;
                            const lineTotal = unitPrice * qty;

                            // Size/Option: từ option_item hoặc option array
                            const optionItem = prod.option_item;
                            const hasOption = optionItem && optionItem.id && optionItem.id !== -1;

                            // Topping/Extras: từ extra_items (đã chọn) hoặc extras
                            const selectedExtras = (prod.extra_items && prod.extra_items.length > 0)
                                ? prod.extra_items
                                : (prod.extras && Array.isArray(prod.extras) && prod.extras.length > 0 && !Array.isArray(prod.extras[0]))
                                    ? prod.extras
                                    : null;

                            // Options array (đường, đá...): prod.option
                            const optionDetails = prod.option && Array.isArray(prod.option)
                                ? prod.option.filter(opt => opt && (opt.optdetailname || opt.name))
                                : null;

                            return (
                                <View key={pIdx} style={styles.productRow}>
                                    <View style={styles.productInfo}>
                                        <TextSemiBold style={styles.productName}>
                                            {prod.name || prod.prodname || prod.productName || 'Sản phẩm'} x {qty}
                                        </TextSemiBold>
                                        {hasOption ? (
                                            <TextNormal style={styles.productOption}>
                                                ▸ {optionItem.name || optionItem.option_name}
                                            </TextNormal>
                                        ) : null}
                                        {optionDetails && optionDetails.length > 0 ? optionDetails.map((opt, oIdx) => (
                                            <TextNormal key={oIdx} style={styles.productOption}>
                                                ▸ {opt.optdetailname || opt.name}
                                            </TextNormal>
                                        )) : null}
                                        {selectedExtras ? selectedExtras.map((ext, eIdx) => {
                                            const extPrice = ext.def_price || ext.price || 0;
                                            return (
                                                <TextNormal key={eIdx} style={styles.productTopping}>
                                                    + {ext.name || ext.group_extra_name || 'Topping'}
                                                    {extPrice > 0 ? ` (+${formatCurrency(extPrice)})` : ''}
                                                </TextNormal>
                                            );
                                        }) : null}
                                        {prod.note ? (
                                            <TextNormal style={styles.productNote}>
                                                📝 {prod.note}
                                            </TextNormal>
                                        ) : null}
                                    </View>
                                    <TextNormal style={styles.productPrice}>
                                        {formatCurrency(lineTotal)}
                                    </TextNormal>
                                </View>
                            );
                        })}

                        {/* Tổng kết đơn hàng */}
                        <View style={styles.orderSummary}>
                            {item.payment_method_name ? (
                                <View style={styles.summaryRow}>
                                    <TextNormal style={styles.summaryLabel}>Thanh toán:</TextNormal>
                                    <TextNormal style={styles.summaryValue}>{item.payment_method_name}</TextNormal>
                                </View>
                            ) : null}
                            {item.channel_name ? (
                                <View style={styles.summaryRow}>
                                    <TextNormal style={styles.summaryLabel}>Kênh đặt:</TextNormal>
                                    <TextNormal style={styles.summaryValue}>{item.channel_name}</TextNormal>
                                </View>
                            ) : null}
                            {item.discount_amount > 0 ? (
                                <View style={styles.summaryRow}>
                                    <TextNormal style={styles.summaryLabel}>Giảm giá:</TextNormal>
                                    <TextNormal style={[styles.summaryValue, { color: '#E74C3C' }]}>-{formatCurrency(item.discount_amount)}</TextNormal>
                                </View>
                            ) : null}
                            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                                <TextSemiBold style={styles.summaryTotalLabel}>Tổng cộng:</TextSemiBold>
                                <TextSemiBold style={styles.summaryTotalValue}>{formatCurrency(item.total_amount || item.price_paid)}</TextSemiBold>
                            </View>
                        </View>

                        <View style={styles.divider} />
                        <TextSemiBold style={styles.sectionTitle}>Thao tác đơn hàng:</TextSemiBold>

                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.btnSync, isSyncing && styles.syncBtnDisabled]}
                                onPress={() => handleManualSync(item)}
                                disabled={isSyncing}
                            >
                                {isSyncing ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <TextNormal style={styles.actionBtnText}>Gửi đồng bộ lên Server</TextNormal>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TextNormal style={styles.changeStatusLabel}>Đổi trạng thái local (tại máy):</TextNormal>
                        <View style={styles.statusButtonsRow}>
                            <TouchableOpacity
                                style={[styles.statusBtn, { backgroundColor: '#E8F8F0', borderColor: '#2ECC71' }]}
                                onPress={() => handleStatusChangePress(item.session, 'synced')}
                            >
                                <TextNormal style={{ color: '#2ECC71', fontSize: 11, fontWeight: '600' }}>Đã sync</TextNormal>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusBtn, { backgroundColor: '#FEF9E7', borderColor: '#F39C12' }]}
                                onPress={() => handleStatusChangePress(item.session, 'pending')}
                            >
                                <TextNormal style={{ color: '#F39C12', fontSize: 11, fontWeight: '600' }}>Chờ sync</TextNormal>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.statusBtn, { backgroundColor: '#FDEDEC', borderColor: '#E74C3C' }]}
                                onPress={() => handleStatusChangePress(item.session, 'failed')}
                            >
                                <TextNormal style={{ color: '#E74C3C', fontSize: 11, fontWeight: '600' }}>Thất bại</TextNormal>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const filters = useMemo(() => {
        const list = [
            { key: 'unsynced', label: 'Chưa đồng bộ' }
        ];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            let label = `${day}/${month}`;
            if (i === 0) label = 'Hôm nay';
            if (i === 1) label = 'Hôm qua';
            list.push({ key: dateStr, label });
        }
        return list;
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <TextNormal style={styles.loadingText}>Đang tải lịch sử...</TextNormal>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Filter bar */}
            <View style={styles.filterBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {filters.map(f => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterButton,
                                selectedFilter === f.key && styles.filterButtonActive,
                            ]}
                            onPress={() => setSelectedFilter(f.key)}
                        >
                            <TextNormal
                                style={[
                                    styles.filterText,
                                    selectedFilter === f.key && styles.filterTextActive,
                                ]}
                            >
                                {f.label}
                            </TextNormal>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={styles.countBadge}>
                    <TextSemiBold style={styles.countText}>{orders.length}</TextSemiBold>
                </View>
            </View>

            {/* Order list */}
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item, index) => item.session || `order-${index}`}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <TextNormal style={styles.emptyText}>
                            Chưa có đơn nào trong lịch sử
                        </TextNormal>
                    </View>
                }
            />

            {/* Modal Nhập Mật Mã Xác Nhận */}
            <Modal
                visible={passwordModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TextSemiBold style={styles.modalTitle}>Nhập mật mã quản lý</TextSemiBold>
                        <TextNormal style={styles.modalMessage}>Vui lòng nhập mật mã để xác nhận thay đổi trạng thái đơn hàng:</TextNormal>
                        <TextInput
                            style={styles.modalInput}
                            secureTextEntry={true}
                            placeholder="Mật mã"
                            keyboardType="number-pad"
                            value={passwordInput}
                            onChangeText={setPasswordInput}
                            autoFocus={true}
                            onSubmitEditing={handleConfirmPassword}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.modalBtnCancel]} 
                                onPress={() => setPasswordModalVisible(false)}
                            >
                                <TextNormal style={styles.modalBtnCancelText}>Hủy</TextNormal>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalBtn, styles.modalBtnOk]} 
                                onPress={handleConfirmPassword}
                            >
                                <TextNormal style={styles.modalBtnOkText}>Đồng ý</TextNormal>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#888',
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        alignItems: 'center',
    },
    filterScroll: {
        alignItems: 'center',
        paddingRight: 10,
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        fontSize: 13,
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    countBadge: {
        marginLeft: 'auto',
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        fontSize: 13,
        color: Colors.primary,
    },
    listContent: {
        padding: 12,
        paddingBottom: 40,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 8,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    orderIdSection: {
        flex: 1,
    },
    orderId: {
        fontSize: 15,
        color: '#333',
    },
    orderTime: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    syncBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    syncText: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderBody: {},
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    infoLabel: {
        fontSize: 13,
        color: '#888',
    },
    infoValue: {
        fontSize: 13,
        color: '#333',
    },
    totalAmount: {
        fontSize: 14,
        color: Colors.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
        height: 28,
    },
    syncBtnDisabled: {
        backgroundColor: Colors.placeholder,
        opacity: 0.7,
    },
    syncBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    expandedContent: {
        marginTop: 10,
        paddingTop: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 13,
        color: '#333',
        marginBottom: 8,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 4,
    },
    productInfo: {
        flex: 1,
        marginRight: 10,
    },
    productName: {
        fontSize: 13,
        color: '#555',
    },
    productNote: {
        fontSize: 11,
        color: '#E74C3C',
        marginTop: 2,
        fontStyle: 'italic',
    },
    productOption: {
        fontSize: 11,
        color: '#3498DB',
        marginTop: 2,
    },
    productTopping: {
        fontSize: 11,
        color: '#727272',
        marginTop: 1,
        marginLeft: 8,
    },
    productOptions: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    productPrice: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
    orderSummary: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#999',
    },
    summaryValue: {
        fontSize: 12,
        color: '#555',
    },
    summaryTotalRow: {
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    summaryTotalLabel: {
        fontSize: 14,
        color: '#333',
    },
    summaryTotalValue: {
        fontSize: 14,
        color: Colors.primary,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        marginTop: 4,
        marginBottom: 10,
    },
    actionBtn: {
        flex: 1,
        height: 36,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnSync: {
        backgroundColor: Colors.primary,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    changeStatusLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
        marginTop: 4,
    },
    statusButtonsRow: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    statusBtn: {
        flex: 1,
        height: 32,
        borderRadius: 6,
        borderWidth: 1,
        marginHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        width: 320,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 8,
        color: '#333',
    },
    modalMessage: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        width: '100%',
        height: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        color: '#333',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    modalBtnCancel: {
        backgroundColor: '#f0f0f0',
    },
    modalBtnCancelText: {
        color: '#666',
        fontWeight: '600',
    },
    modalBtnOk: {
        backgroundColor: Colors.primary,
    },
    modalBtnOkText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default OrderHistory;
