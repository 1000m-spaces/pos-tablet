import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InfoCard from './InfoCard';
import { formatPrice } from '../utils/orderUtils';

const OrderItemRow = ({ item, isOfflineOrder }) => (
    <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.note && (
                <Text style={styles.itemNote}>📝 {item.note}</Text>
            )}
            {isOfflineOrder ? (
                // Offline order extras
                item.extras?.map((extra, idx) => (
                    <View key={idx} style={styles.modifierGroup}>
                        <Text style={styles.modifierName}>
                            + {extra.name} {extra.price ? `(+${formatPrice(extra.price)})` : ''}
                        </Text>
                    </View>
                ))
            ) : (
                // Online order modifier groups
                item.modifierGroups?.map((group, gIdx) => (
                    <View key={gIdx} style={styles.modifierGroup}>
                        {group.modifiers?.map((modifier, mIdx) => (
                            <Text key={mIdx} style={styles.modifierName}>
                                + {modifier.modifierName}
                            </Text>
                        ))}
                    </View>
                ))
            )}
        </View>
        <View style={styles.itemQuantity}>
            <Text style={styles.quantityText}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>
                {formatPrice(item.price)}
            </Text>
        </View>
    </View>
);

const OrderItems = ({ orderData, isOfflineOrder }) => {
    const { items, formattedTotal } = orderData;

    return (
        <InfoCard title="Danh sách món">
            {items.map((item) => (
                <OrderItemRow
                    key={item.id}
                    item={item}
                    isOfflineOrder={isOfflineOrder}
                />
            ))}

            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TỔNG CỘNG:</Text>
                <Text style={styles.summaryValue}>{formattedTotal}</Text>
            </View>
        </InfoCard>
    );
};

const styles = StyleSheet.create({
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "600",
        color: '#333',
        marginBottom: 4,
    },
    itemNote: {
        fontSize: 13,
        color: '#8B4513',
        fontStyle: 'italic',
        marginTop: 4,
        backgroundColor: '#FFF8F0',
        padding: 4,
        borderRadius: 4,
    },
    itemQuantity: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 80,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#8B4513',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderTopWidth: 2,
        borderTopColor: '#8B4513',
        marginTop: 12,
    },
    summaryLabel: {
        fontWeight: "bold",
        color: '#8B4513',
        fontSize: 16,
    },
    summaryValue: {
        fontWeight: "bold",
        color: '#8B4513',
        fontSize: 18,
    },
    modifierGroup: {
        marginTop: 4,
        marginLeft: 8,
    },
    modifierName: {
        fontSize: 12,
        color: '#8B4513',
        marginBottom: 2,
        backgroundColor: '#FFF8F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        alignSelf: 'flex-start',
    },
});

export default OrderItems;
