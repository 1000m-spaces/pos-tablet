import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

const ActionButton = ({
    onPress,
    title,
    disabled = false,
    variant = 'default',
    statusIndicator = null,
    statusHint = null,
    style
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'print-label':
                return [styles.dockedButton, styles.printTemButton];
            case 'print-bill':
                return [styles.dockedButton, styles.printBillButton];
            case 'confirm':
                return [styles.dockedButton, styles.confirmButton];
            case 'close':
                return [styles.dockedButton, styles.closeButton];
            default:
                return [styles.dockedButton];
        }
    };

    return (
        <Pressable
            style={[
                ...getButtonStyle(),
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.buttonContent}>
                {statusIndicator && (
                    <View style={[
                        styles.printerStatusIndicator,
                        { backgroundColor: statusIndicator }
                    ]} />
                )}
                <Text style={styles.dockedButtonText}>{title}</Text>
            </View>
            {statusHint && (
                <Text style={styles.statusHint}>{statusHint}</Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    dockedButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: '#757575',
    },
    dockedButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
        textAlign: 'center',
    },
    printTemButton: {
        backgroundColor: "#FF9800",
    },
    printBillButton: {
        backgroundColor: "#4CAF50",
    },
    confirmButton: {
        backgroundColor: "#2E7D32",
    },
    closeButton: {
        backgroundColor: "#757575",
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    printerStatusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusHint: {
        fontSize: 10,
        color: '#CCCCCC',
        marginTop: 2,
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default ActionButton;
