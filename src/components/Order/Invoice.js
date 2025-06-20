import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import AsyncStorage from 'store/async_storage/index';
import OfflineOrderTable from './OfflineOrderTable';
import StoreSelectionDialog from './StoreSelectionDialog';
import Colors from 'theme/Colors';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import { syncPendingOrdersAction } from 'store/sync/syncAction';
import { getPendingSyncLoadingSelector, getPendingSyncErrorSelector } from 'store/sync/syncSelector';

const Invoice = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [storeDialogVisible, setStoreDialogVisible] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [printedLabels, setPrintedLabels] = useState([]);

    // Redux selectors
    const pendingSyncLoading = useSelector(getPendingSyncLoadingSelector);
    const pendingSyncError = useSelector(getPendingSyncErrorSelector);

    const fetchOfflineOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const pendingOrders = await AsyncStorage.getPendingOrders();
            const printedLabelsData = await AsyncStorage.getPrintedLabels();

            setPrintedLabels(printedLabelsData);

            // Enhance orders with sync and print status
            const enhancedOrders = pendingOrders.map(order => ({
                ...order,
                syncStatus: 'pending', // All offline orders are pending by default
                printStatus: printedLabelsData.includes(order.session) ? 'printed' : 'not_printed',
                created_at: order.created_at || new Date().toISOString(),
                // Ensure we have the required fields from the API format
                session: order.session,
                total_amount: order.total_amount || order.subPrice || 0,
                products: order.products || [],
                shopTableName: order.shopTableName || 'N/A',
            }));

            setData(enhancedOrders);
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
    }, []);

    const loadSelectedStore = async () => {
        const storeInfo = await AsyncStorage.getSelectedStore();
        if (storeInfo) {
            setSelectedStore(storeInfo);
        } else {
            setStoreDialogVisible(true);
        }
    };

    useEffect(() => {
        loadSelectedStore();
    }, []);

    useEffect(() => {
        // Initial fetch when component mounts
        fetchOfflineOrders();
    }, [fetchOfflineOrders]);

    const handleStoreSelect = (store) => {
        setSelectedStore(store);
        setStoreDialogVisible(false);
    };

    const handleSyncOfflineOrders = () => {
        dispatch(syncPendingOrdersAction());
        Toast.show({
            type: 'info',
            text1: 'Đang đồng bộ đơn offline...',
            position: 'bottom',
        });
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
                                <TouchableOpacity
                                    style={[styles.actionButton, { opacity: isLoading ? 0.5 : 1 }]}
                                    onPress={() => !isLoading && setStoreDialogVisible(true)}
                                    disabled={isLoading}
                                >
                                    <TextNormal style={styles.actionText}>
                                        {selectedStore ? selectedStore.name : 'Chọn cửa hàng'}
                                    </TextNormal>
                                </TouchableOpacity>
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

            <StoreSelectionDialog
                visible={storeDialogVisible}
                onClose={() => setStoreDialogVisible(false)}
                onStoreSelect={handleStoreSelect}
            />
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
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
    },
    actionText: {
        fontSize: 14,
        color: Colors.textPrimary,
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
    },
});

export default Invoice; 