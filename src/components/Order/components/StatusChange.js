import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import InfoCard from './InfoCard';
import {
    getAvailableOfflineStatusOptions,
    getOfflineOrderStatusConfig
} from '../utils/orderUtils';

const StatusChange = ({
    offlineOrderData,
    showStatusOptions,
    setShowStatusOptions,
    onStatusChange
}) => {
    const { currentStatus, nextStatus, isInFinalState } = offlineOrderData;
    const currentStatusConfig = getOfflineOrderStatusConfig(currentStatus);
    const availableOptions = getAvailableOfflineStatusOptions(currentStatus);

    if (isInFinalState) {
        return (
            <InfoCard title="Thay đổi trạng thái">
                <View style={styles.finalStatusContainer}>
                    <Text style={styles.finalStatusText}>
                        Đơn hàng đã hoàn tất
                    </Text>
                </View>
            </InfoCard>
        );
    }

    return (
        <InfoCard title="Thay đổi trạng thái">
            <View style={styles.statusControlContainer}>
                <Pressable
                    style={styles.currentStatusButton}
                    onPress={() => setShowStatusOptions(!showStatusOptions)}
                >
                    <Text style={styles.currentStatusText}>
                        {currentStatusConfig.text}
                    </Text>
                    <Text style={styles.dropdownArrow}>
                        {showStatusOptions ? '▲' : '▼'}
                    </Text>
                </Pressable>

                {showStatusOptions && (
                    <View style={styles.statusOptions}>
                        {availableOptions.map(status => {
                            const statusConfig = getOfflineOrderStatusConfig(status);
                            return (
                                <Pressable
                                    key={status}
                                    style={[
                                        styles.statusOption,
                                        { borderLeftColor: statusConfig.color }
                                    ]}
                                    onPress={() => onStatusChange(status)}
                                >
                                    <Text style={[
                                        styles.statusOptionText,
                                        { color: statusConfig.color }
                                    ]}>
                                        {statusConfig.text}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {nextStatus && (
                    <Pressable
                        style={[
                            styles.quickStatusButton,
                            { backgroundColor: getOfflineOrderStatusConfig(nextStatus).backgroundColor }
                        ]}
                        onPress={() => onStatusChange(nextStatus)}
                    >
                        <Text style={[
                            styles.quickStatusButtonText,
                            { color: getOfflineOrderStatusConfig(nextStatus).color }
                        ]}>
                            ➤ {getOfflineOrderStatusConfig(nextStatus).text}
                        </Text>
                    </Pressable>
                )}
            </View>
        </InfoCard>
    );
};

const styles = StyleSheet.create({
    statusControlContainer: {
        marginTop: 8,
    },
    currentStatusButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    currentStatusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#8B4513',
    },
    statusOptions: {
        marginTop: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    statusOption: {
        padding: 12,
        borderLeftWidth: 4,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    statusOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    quickStatusButton: {
        marginTop: 8,
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    quickStatusButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    finalStatusContainer: {
        padding: 12,
        backgroundColor: '#F0F8F0',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#4CAF50',
        marginTop: 8,
    },
    finalStatusText: {
        fontSize: 14,
        color: '#2E7D32',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default StatusChange;
