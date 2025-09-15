import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = ({ text, color, backgroundColor, width = 'auto', style }) => (
    <View style={[styles.badge, { backgroundColor, width }, style]}>
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default Badge;
