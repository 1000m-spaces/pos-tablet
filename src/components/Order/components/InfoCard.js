import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InfoCard = ({ title, children, style }) => (
    <View style={[styles.infoCard, style]}>
        <Text style={styles.cardTitle}>{title}</Text>
        {children}
    </View>
);

const DetailRow = ({ label, value, children }) => (
    <View style={styles.detailRow}>
        <Text style={styles.label}>{label}</Text>
        {children || <Text style={styles.value}>{value}</Text>}
    </View>
);

const styles = StyleSheet.create({
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#8B4513',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8',
    },
    label: {
        fontWeight: "600",
        color: '#666',
        fontSize: 14,
    },
    value: {
        fontWeight: "500",
        color: '#333',
        fontSize: 14,
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
});

InfoCard.DetailRow = DetailRow;

export default InfoCard;
