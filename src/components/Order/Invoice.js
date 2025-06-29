import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import AsyncStorage from 'store/async_storage/index';
import OfflineOrderTable from './OfflineOrderTable';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import { syncPendingOrdersAction } from 'store/sync/syncAction';
import { getPendingSyncLoadingSelector, getPendingSyncErrorSelector } from 'store/sync/syncSelector';

const Invoice = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [userShop, setUserShop] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [printedLabels, setPrintedLabels] = useState([]);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [blockedTables, setBlockedTables] = useState({});

    // Redux selectors
    const pendingSyncLoading = useSelector(getPendingSyncLoadingSelector);
    const pendingSyncError = useSelector(getPendingSyncErrorSelector);

    const fetchOfflineOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const pendingOrders = await AsyncStorage.getPendingOrders();
            const printedLabelsData = await AsyncStorage.getPrintedLabels();
            const blockedTablesData = await AsyncStorage.getBlockedTables();

            setPrintedLabels(printedLabelsData);
            setBlockedTables(blockedTablesData);

            // Enhance orders with sync, print, and order status
            const enhancedOrders = pendingOrders.map(order => ({
                ...order,
                syncStatus: 'pending', // All offline orders are pending by default
                printStatus: printedLabelsData.includes(order.session) ? 'printed' : 'not_printed',
                orderStatus: order.orderStatus || 'Paymented', // Default order status for cash payments
                created_at: order.created_at || new Date().toISOString(),
                updated_at: order.updated_at || order.created_at || new Date().toISOString(),
                // Ensure we have the required fields from the API format
                session: order.session,
                total_amount: order.total_amount || order.subPrice || 0,
                products: order.products || [],
                shopTableName: order.shopTableName || 'N/A',
                tableId: order.tableId || null,
            }));

            // Filter by status if a filter is selected
            let filteredOrders = enhancedOrders;
            if (selectedStatusFilter !== 'all') {
                filteredOrders = enhancedOrders.filter(order => order.orderStatus === selectedStatusFilter);
            }

            setData(filteredOrders);
        } catch (error) {
            console.error('Error fetching offline orders:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi khi tải đơn offline',
                position: 'bottom',
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedStatusFilter]);

    const loadUserShop = async () => {
        const user = await AsyncStorage.getUser();
        if (user && user.shops) {
            setUserShop(user.shops);
        }
    };

    useEffect(() => {
        loadUserShop();
    }, []);

    useEffect(() => {
        // Initial fetch when component mounts
        fetchOfflineOrders();
    }, [fetchOfflineOrders]);

    const handleSyncOfflineOrders = () => {
        dispatch(syncPendingOrdersAction());
        Toast.show({
            type: 'info',
            text1: 'Đang đồng bộ đơn offline...',
            position: 'bottom',
        });
    };

    const getStatusDisplayText = (status) => {
        switch (status) {
            case "WaitingForPayment": return "Chờ thanh toán";
            case "Paymented": return "Đã thanh toán";
            case "WaitingForServe": return "Chờ phục vụ";
            case "Completed": return "Hoàn thành";
            case "Canceled": return "Hủy";
            default: return "Không xác định";
        }
    };

    // Listen to sync results
    useEffect(() => {
        if (!pendingSyncLoading) {
            if (pendingSyncError) {
                Toast.show({
                    type: 'error',
                    text1: 'Đồng bộ thất bại',
                    text2: pendingSyncError,
                    position: 'bottom',
                });
            } else {
                // Refresh offline orders after sync attempt
                fetchOfflineOrders();
            }
        }
    }, [pendingSyncLoading, pendingSyncError, fetchOfflineOrders]);

    return (
        <>
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerRow}>
                            <TextNormal style={styles.headerTitle}>Hóa Đơn Offline</TextNormal>
                            <View style={styles.headerActions}>
                                <View style={styles.actionButton}>
                                    <TextNormal style={styles.actionText}>
                                        {userShop ? userShop.name_vn : 'Loading...'}
                                    </TextNormal>
                                </View>
                                <TouchableOpacity
                                    style={[styles.actionButton, { opacity: (isLoading || pendingSyncLoading) ? 0.5 : 1 }]}
                                    onPress={() => !(isLoading || pendingSyncLoading) && handleSyncOfflineOrders()}
                                    disabled={isLoading || pendingSyncLoading}
                                >
                                    <Svg name={'settings'} size={24} color={Colors.primary} />
                                    <TextNormal style={[styles.actionText, { color: Colors.primary, fontWeight: '600' }]}>
                                        {pendingSyncLoading ? 'Đang đồng bộ...' : 'Đồng bộ'}
                                    </TextNormal>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Status Filter Row */}
                        <View style={styles.filterRow}>
                            <View style={styles.statusFilters}>
                                {['all', 'WaitingForPayment', 'Paymented', 'WaitingForServe', 'Completed', 'Canceled'].map(status => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.filterButton,
                                            selectedStatusFilter === status && styles.filterButtonActive
                                        ]}
                                        onPress={() => setSelectedStatusFilter(status)}
                                    >
                                        <TextNormal style={[
                                            styles.filterButtonText,
                                            selectedStatusFilter === status && styles.filterButtonTextActive
                                        ]}>
                                            {status === 'all' ? 'Tất cả' : getStatusDisplayText(status)}
                                        </TextNormal>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Blocked Tables Info */}
                            <View style={styles.tableInfo}>
                                <TextNormal style={styles.tableInfoText}>
                                    Bàn đang phục vụ: {Object.keys(blockedTables).length}
                                </TextNormal>
                            </View>
                        </View>
                    </View>

                    {/* Content */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <TextNormal style={styles.loadingText}>Đang tải đơn offline...</TextNormal>
                        </View>
                    ) : (
                        <OfflineOrderTable orders={data} onRefresh={fetchOfflineOrders} />
                    )}
                </View>
            </SafeAreaView>
            <Toast />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgInput,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    header: {
        marginBottom: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        flexWrap: 'wrap',
        gap: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        flex: 1,
        minWidth: 200,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.whiteColor,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        gap: 8,
        minWidth: 100,
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 14,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: 10,
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        flexWrap: 'wrap',
        gap: 10,
    },
    statusFilters: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        flex: 1,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.whiteColor,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        minWidth: 80,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterButtonText: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: Colors.whiteColor,
        fontWeight: '600',
    },
    tableInfo: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: Colors.bgInput,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.borderColor,
    },
    tableInfoText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
});

export default Invoice; 