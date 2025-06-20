import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    FlatList,
} from 'react-native';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Colors from 'theme/Colors';
import { heightDevice, widthDevice } from 'assets/constans';

const PaymentMethodModal = ({ paymentMethods, onCloseModal, onSelectPayment }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);

    // Default payment method if none available
    const defaultMethod = { id: 'cash', name: 'Tiền mặt', icon: 'cash' };

    // Use payment methods or default if empty
    const methods = paymentMethods && paymentMethods.length > 0
        ? paymentMethods
        : [defaultMethod];

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
    };

    const handleConfirm = () => {
        if (selectedMethod) {
            onSelectPayment(selectedMethod);
        }
        onCloseModal();
    };

    const renderPaymentMethod = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.methodItem,
                selectedMethod?.id === item.id && styles.selectedMethod
            ]}
            onPress={() => handleSelectMethod(item)}
        >
            <View style={styles.methodInfo}>
                {/* <View style={styles.methodIcon}>
                    <Svg name={item.icon || 'cash'} size={24} color={Colors.primary} />
                </View> */}
                <TextNormal style={styles.methodName}>{item.name}</TextNormal>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextNormal style={styles.title}>Phương thức thanh toán</TextNormal>
                <TouchableOpacity onPress={onCloseModal} style={styles.closeButton}>
                    <Svg name="icon_close" size={24} color={Colors.blackColor} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={methods}
                    renderItem={renderPaymentMethod}
                    keyExtractor={(item) => item.id?.toString() || item.name}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        !selectedMethod && styles.disabledButton
                    ]}
                    onPress={handleConfirm}
                    disabled={!selectedMethod}
                >
                    <TextNormal style={[
                        styles.confirmButtonText,
                        !selectedMethod && styles.disabledButtonText
                    ]}>
                        Xác nhận
                    </TextNormal>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
        borderRadius: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.line,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.blackColor,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    methodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.line,
    },
    selectedMethod: {
        borderColor: Colors.primary,
        borderWidth: 2,
        backgroundColor: Colors.primary + '10',
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodIcon: {
        marginRight: 12,
    },
    methodName: {
        fontSize: 16,
        color: Colors.blackColor,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.line,
    },
    confirmButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: Colors.placeholder,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.whiteColor,
    },
    disabledButtonText: {
        color: Colors.whiteColor + '80',
    },
});

export default PaymentMethodModal; 