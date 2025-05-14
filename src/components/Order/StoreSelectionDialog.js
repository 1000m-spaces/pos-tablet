import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Modal,
    FlatList,
} from 'react-native';
import { TextNormal } from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import AsyncStorage from 'store/async_storage/index';

const StoreSelectionDialog = ({ visible, onClose, onStoreSelect }) => {
    const [stores, setStores] = useState([
        { id: 1, name: 'Trà 1000M 45 Nguyễn Thị Định', branch_id: 246, brand_id: 110, merchant_id: 133 },
        { id: 2, name: 'Trà 1000M B14 Bồ Hỏa', branch_id: 247, brand_id: 110, merchant_id: 133 },
        { id: 2, name: 'Trà 1000M 33 Lê Đại Hành', branch_id: 248, brand_id: 110, merchant_id: 133 },
        { id: 2, name: 'Trà 1000M 130A Nguyễn Đình Chiểu', branch_id: 249, brand_id: 110, merchant_id: 133 },
        // Add more stores as needed
    ]);

    const [selectedStore, setSelectedStore] = useState(null);

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
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => { }}
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
                    <FlatList
                        data={stores}
                        renderItem={renderStoreItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.storeList}
                    />
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
    },
    selectedStoreText: {
        color: Colors.whiteColor,
    },
});

export default StoreSelectionDialog; 