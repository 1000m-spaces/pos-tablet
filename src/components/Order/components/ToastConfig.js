import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const toastConfig = {
    error: ({ text1, text2 }) => (
        <View style={styles.toastContainer}>
            <View style={styles.toastError}>
                <Text style={styles.toastTitle}>{text1}</Text>
                {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
            </View>
        </View>
    ),
    success: ({ text1, text2 }) => (
        <View style={styles.toastContainer}>
            <View style={styles.toastSuccess}>
                <Text style={styles.toastTitle}>{text1}</Text>
                {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
            </View>
        </View>
    ),
    info: ({ text1, text2 }) => (
        <View style={styles.toastContainer}>
            <View style={styles.toastInfo}>
                <Text style={styles.toastTitle}>{text1}</Text>
                {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
            </View>
        </View>
    ),
};

const styles = StyleSheet.create({
    toastContainer: {
        width: '90%',
        paddingHorizontal: 16,
    },
    toastError: {
        backgroundColor: '#F44336',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    toastSuccess: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#388E3C',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    toastInfo: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#1976D2',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    toastTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    toastMessage: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 18,
    },
});
