import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from 'store/async_storage/index';
import { syncOrdersAction, resetSyncOrdersAction } from 'store/sync/syncAction';
import { syncOrdersStatusSelector } from 'store/selectors';
import {
    TextNormal,
    TextSemiBold,
    TextHighLightBold,
} from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Colors from 'theme/Colors';
import Toast from 'react-native-toast-message';
import styles from './orderBackupDialogStyles';

const OrderBackupDialog = ({ visible, onClose }) => {
    const dispatch = useDispatch();
    const [backupOrders, setBackupOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [metadata, setMetadata] = useState(null);
    const syncStatus = useSelector(state => syncOrdersStatusSelector(state));

    useEffect(() => {
        if (visible) {
            loadBackupOrders();
            // Reset sync status when opening dialog
            dispatch(resetSyncOrdersAction());
        }
    }, [visible, loadBackupOrders, dispatch]);

    useEffect(() => {
        if (syncStatus?.isSuccess) {
            Toast.show({
                type: 'success',
                text1: 'Đồng bộ thành công',
                text2: `Đã đồng bộ ${selectedOrders.length} đơn hàng`,
                position: 'top',
            });
            setSelectedOrders([]);
            loadBackupOrders();
            // Reset sync status after handling to prevent re-trigger
            dispatch(resetSyncOrdersAction());
        } else if (syncStatus?.isError) {
            Toast.show({
                type: 'error',
                text1: 'Đồng bộ thất bại',
                text2: 'Vui lòng thử lại sau',
                position: 'top',
            });
            // Reset sync status after handling
            dispatch(resetSyncOrdersAction());
        }
    }, [syncStatus, selectedOrders.length, loadBackupOrders, dispatch]);

    const normalizeToISO = useCallback((dateString) => {
        if (!dateString) return new Date().toISOString();
        // dateString format "YYYY-MM-DD HH:mm:ss"
        const [datePart, timePart] = dateString.split(" ");
        if (!datePart || !timePart) return new Date().toISOString();
        return `${datePart}T${timePart}+07:00`; // Vietnam timezone
    }, []);

    const loadBackupOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const orders = await AsyncStorage.getBackupOrders();
            const meta = await AsyncStorage.getBackupOrdersMetadata();
            console.log('Loaded backup orders:', orders.length, 'orders');
            console.log('Backup metadata:', meta);

            if (orders.length > 0) {
                console.log('Sample raw backup order:', orders[0]);
                console.log('Raw backup order keys:', Object.keys(orders[0]));
                console.log('Amount fields check:', {
                    totalAmount: orders[0].totalAmount,
                    total_amount: orders[0].total_amount,
                    price_paid: orders[0].price_paid,
                    total: orders[0].total,
                    subPrice: orders[0].subPrice,
                    orderValue: orders[0].orderValue,
                    amount: orders[0].amount,
                });
            }

            // Enhance orders with proper field mapping (same as Invoice.js)
            const enhancedOrders = orders.map(order => ({
                ...order,
                syncStatus: order.syncStatus || 'pending',
                orderStatus: order.orderStatus || 'Paymented',
                created_at: order.created_at || (order.ordertime && normalizeToISO(order.ordertime)) || new Date().toISOString(),
                updated_at: order.updated_at || order.created_at || new Date().toISOString(),
                // Map different field name variations to consistent names
                session: order.session,
                displayID: order.displayID || order.session,
                totalAmount: order.totalAmount || order.total_amount || order.price_paid || order.total || order.subPrice || order.orderValue || order.amount || 0,
                products: order.products || [],
                customerName: order.customerName || order.customer_name || order.guest_name || '',
                shoptablename: order.shoptablename || order.shopTableName || 'N/A',
                tableId: order.tableId || order.shoptableid || null,
            }));

            if (enhancedOrders.length > 0) {
                console.log('Sample enhanced backup order:', {
                    displayID: enhancedOrders[0].displayID,
                    totalAmount: enhancedOrders[0].totalAmount,
                    products: enhancedOrders[0].products?.length,
                    customerName: enhancedOrders[0].customerName,
                    created_at: enhancedOrders[0].created_at,
                    shoptablename: enhancedOrders[0].shoptablename,
                });
            }

            // Sort orders by created_at in descending order (newest first)
            const sortedOrders = enhancedOrders.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB - dateA; // Descending order
            });

            setBackupOrders(sortedOrders);
            setMetadata(meta);
        } catch (error) {
            console.error('Error loading backup orders:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể tải danh sách đơn hàng',
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    }, [normalizeToISO]);

    const handleManualBackup = async () => {
        try {
            setIsLoading(true);
            const pendingOrders = await AsyncStorage.getPendingOrders();
            console.log('Pending orders to backup:', pendingOrders.length);

            if (pendingOrders.length === 0) {
                Toast.show({
                    type: 'info',
                    text1: 'Không có đơn hàng',
                    text2: 'Không có đơn hàng nào cần backup',
                    position: 'top',
                });
                return;
            }

            await AsyncStorage.setBackupOrders(pendingOrders);
            Toast.show({
                type: 'success',
                text1: 'Backup thành công',
                text2: `Đã backup ${pendingOrders.length} đơn hàng`,
                position: 'top',
            });
            loadBackupOrders();
        } catch (error) {
            console.error('Error creating manual backup:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể tạo backup',
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectOrder = (session) => {
        setSelectedOrders(prev => {
            if (prev.includes(session)) {
                return prev.filter(s => s !== session);
            } else {
                return [...prev, session];
            }
        });
    };

    const selectAll = () => {
        if (selectedOrders.length === backupOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(backupOrders.map(o => o.session));
        }
    };

    const handleSyncSelected = () => {
        if (selectedOrders.length === 0) {
            Toast.show({
                type: 'warning',
                text1: 'Chưa chọn đơn hàng',
                text2: 'Vui lòng chọn ít nhất một đơn hàng để đồng bộ',
                position: 'top',
            });
            return;
        }

        Alert.alert(
            'Xác nhận đồng bộ',
            `Bạn có chắc chắn muốn đồng bộ ${selectedOrders.length} đơn hàng?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng bộ',
                    onPress: () => syncSelectedOrders(),
                },
            ]
        );
    };

    const syncSelectedOrders = () => {
        const ordersToSync = backupOrders.filter(o => selectedOrders.includes(o.session));

        // Prepare orders for sync in the format expected by the API
        const expandedOrders = ordersToSync.map(order => {
            const expandedProducts = order.products.flatMap(item =>
                Array(item.quanlity || 1).fill(item)
            );
            return {
                ...order,
                products: expandedProducts
            };
        });

        const syncPayload = {
            orders: expandedOrders
        };

        dispatch(syncOrdersAction(syncPayload));
    };

    const handleClearBackup = () => {
        Alert.alert(
            'Xóa backup',
            'Bạn có chắc chắn muốn xóa toàn bộ backup? Hành động này không thể hoàn tác.',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clearBackupOrders();
                        Toast.show({
                            type: 'success',
                            text1: 'Đã xóa backup',
                            position: 'top',
                        });
                        loadBackupOrders();
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const getSyncStatusColor = (status) => {
        switch (status) {
            case 'synced':
                return Colors.success;
            case 'failed':
                return Colors.error;
            case 'pending':
            default:
                return Colors.warning;
        }
    };

    const getSyncStatusText = (order) => {
        if (order.syncStatus === 'synced') return 'Đã đồng bộ';
        if (order.syncStatus === 'failed') return 'Thất bại';
        if (order.retry_count > 0) return `Thử lại ${order.retry_count}/5`;
        return 'Chờ đồng bộ';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <TextSemiBold style={styles.title}>
                                Backup Đơn Hàng
                            </TextSemiBold>
                            {metadata && (
                                <TextNormal style={styles.subtitle}>
                                    {metadata.count} đơn • {formatDate(metadata.lastBackup)}
                                </TextNormal>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Svg name={'icon_close'} size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionBar}>
                        {backupOrders.length > 0 ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.selectAllButton]}
                                    onPress={selectAll}
                                >
                                    <Svg
                                        name={selectedOrders.length === backupOrders.length ? 'selected_circle' : 'circle'}
                                        size={20}
                                        color={Colors.primary}
                                    />
                                    <TextNormal style={styles.actionButtonText}>
                                        {selectedOrders.length === backupOrders.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    </TextNormal>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.syncButton]}
                                    onPress={handleSyncSelected}
                                    disabled={selectedOrders.length === 0}
                                >
                                    <Svg name={'refresh'} size={20} color={Colors.white} />
                                    <TextNormal style={styles.syncButtonText}>
                                        Đồng bộ ({selectedOrders.length})
                                    </TextNormal>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.clearButton]}
                                    onPress={handleClearBackup}
                                >
                                    <Svg name={'icon_close'} size={20} color={Colors.error} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.backupButton]}
                                onPress={handleManualBackup}
                            >
                                <Svg name={'refresh'} size={20} color={Colors.white} />
                                <TextNormal style={styles.syncButtonText}>
                                    Tạo Backup Từ Đơn Hiện Tại
                                </TextNormal>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Order List */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <TextNormal style={styles.loadingText}>Đang tải...</TextNormal>
                        </View>
                    ) : backupOrders.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <TextSemiBold style={styles.emptyIcon}>📦</TextSemiBold>
                            <TextNormal style={styles.emptyText}>
                                Không có đơn hàng backup
                            </TextNormal>
                            <TextNormal style={styles.emptySubtext}>
                                Nhấn nút "Tạo Backup" ở trên để backup đơn hàng hiện tại
                            </TextNormal>
                            <TextNormal style={styles.emptySubtext}>
                                hoặc backup sẽ tự động tạo khi đồng bộ đơn hàng
                            </TextNormal>
                        </View>
                    ) : (
                        <ScrollView style={styles.orderList}>
                            {backupOrders.map((order) => (
                                <TouchableOpacity
                                    key={order.session}
                                    style={[
                                        styles.orderItem,
                                        selectedOrders.includes(order.session) && styles.orderItemSelected
                                    ]}
                                    onPress={() => toggleSelectOrder(order.session)}
                                >
                                    <View style={styles.orderCheckbox}>
                                        <Svg
                                            name={selectedOrders.includes(order.session) ? 'selected_circle' : 'circle'}
                                            size={24}
                                            color={selectedOrders.includes(order.session) ? Colors.primary : Colors.textSecondary}
                                        />
                                    </View>

                                    <View style={styles.orderContent}>
                                        <View style={styles.orderHeader}>
                                            <TextSemiBold style={styles.orderSession}>
                                                #{order.displayID || order.session}
                                            </TextSemiBold>
                                            <View
                                                style={[
                                                    styles.syncStatusBadge,
                                                    { backgroundColor: getSyncStatusColor(order.syncStatus) }
                                                ]}
                                            >
                                                <TextNormal style={styles.syncStatusText}>
                                                    {getSyncStatusText(order)}
                                                </TextNormal>
                                            </View>
                                        </View>

                                        <View style={styles.orderInfo}>
                                            <TextNormal style={styles.orderInfoText}>
                                                {order.products?.length || 0} món • {formatCurrency(order.totalAmount || 0)}
                                            </TextNormal>
                                            <TextNormal style={styles.orderInfoText}>
                                                {formatDate(order.created_at)}
                                            </TextNormal>
                                        </View>

                                        {order.shoptablename && order.shoptablename !== 'N/A' && (
                                            <TextNormal style={styles.tableInfo}>
                                                Bàn: {order.shoptablename}
                                            </TextNormal>
                                        )}

                                        {order.customerName && (
                                            <TextNormal style={styles.customerName}>
                                                KH: {order.customerName}
                                            </TextNormal>
                                        )}

                                        {order.last_retry_at && (
                                            <TextNormal style={styles.retryInfo}>
                                                Thử lại cuối: {formatDate(order.last_retry_at)}
                                            </TextNormal>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default OrderBackupDialog;
