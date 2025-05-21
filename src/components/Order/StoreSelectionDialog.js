import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { TextNormal } from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import AsyncStorage from 'store/async_storage/index';
import storeController from 'store/store/storeController';

const StoreSelectionDialog = ({ visible, onClose, onStoreSelect }) => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                const response = await storeController.getListStore(110); // partnerID is 110
                console.log('response', response);
                if (response.success) {
                    // Map API response to our store format
                    const mappedStores = response.data.map(store => ({
                        id: store.restid,
                        name: store.restname,
                        address: store.restaddr,
                        phone: store.restphone,
                        branch_id: store.restid,
                        brand_id: store.partnerid,
                        merchant_id: 132, // Hardcoded as requested
                        latitude: store.latitude,
                        longitude: store.longitude,
                        image: store.img
                    }));
                    setStores(mappedStores);
                }
            } catch (error) {
                console.error('Error fetching stores:', error);
            } finally {
                setLoading(false);
            }
        };

        if (visible) {
            fetchStores();
        }
    }, [visible]);

    useEffect(() => {
        // Load previously selected store
        const loadSelectedStore = async () => {
            const storeInfo = await AsyncStorage.getSelectedStore();
            if (storeInfo) {
                setSelectedStore(storeInfo);
            }
        };
        loadSelectedStore();
    }, []);

    const handleStoreSelect = async (store) => {
        setSelectedStore(store);
        await AsyncStorage.setSelectedStore(store);
        onStoreSelect(store);
        onClose();
    };

    const renderStoreItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.storeItem,
                selectedStore?.id === item.id && styles.selectedStoreItem,
            ]}
            onPress={() => handleStoreSelect(item)}
        >
            <TextNormal
                style={[
                    styles.storeName,
                    selectedStore?.id === item.id && styles.selectedStoreText,
                ]}
            >
                {item.name}
            </TextNormal>
            <TextNormal
                style={[
                    styles.storeAddress,
                    selectedStore?.id === item.id && styles.selectedStoreText,
                ]}
            >
                {item.address}
            </TextNormal>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => { }} // Prevent back button from closing
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <TextNormal style={styles.modalTitle}>Select Store</TextNormal>
                        {onClose && (
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextNormal style={styles.description}>
                        Please select a store to continue
                    </TextNormal>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={stores}
                            renderItem={renderStoreItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.storeList}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
        width: '80%',
        maxHeight: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 15,
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: Colors.textSecondary,
    },
    storeList: {
        paddingVertical: 10,
    },
    storeItem: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: Colors.bgInput,
    },
    selectedStoreItem: {
        backgroundColor: Colors.primary,
    },
    storeName: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '500',
        marginBottom: 4,
    },
    storeAddress: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    selectedStoreText: {
        color: Colors.whiteColor,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default StoreSelectionDialog; 