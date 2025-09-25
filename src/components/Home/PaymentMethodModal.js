import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Colors from 'theme/Colors';
import { heightDevice, widthDevice } from 'assets/constans';

const PaymentMethodModal = ({ paymentMethods, loading = false, onCloseModal, onSelectPayment, currentOrder, selectedPaymentMethod }) => {
    const [selectedMethod, setSelectedMethod] = useState(selectedPaymentMethod || null);

    // Use payment methods if available
    const methods = paymentMethods || [];

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
    };

    const handleConfirm = () => {
        if (selectedMethod) {
            onSelectPayment(selectedMethod);
        }
        onCloseModal();
    };

    const renderPaymentMethod = ({ item }) => {
        console.log('Rendering payment method:', item)
        if (item?.chanel_type_id == '22243' && currentOrder?.orderType != '1') {
            onSelectPayment(item);
            onCloseModal();
        }
        return (
            <TouchableOpacity
                style={[
                    styles.methodItem,
                    selectedMethod?.id === item.id && styles.selectedMethod,
                    { opacity: currentOrder?.orderType == '1' && item?.chanel_type_id == '22243' ? 0.3 : 1 }
                ]}
                disabled={currentOrder?.orderType == '1' && item?.chanel_type_id == '22243'} // Disable if chanel_type_id is '22243' ví food app
                onPress={() => handleSelectMethod(item)}
            >
                <View style={styles.methodInfo}>
                    <TextNormal style={styles.methodName}>{item.name}</TextNormal>
                </View>
            </TouchableOpacity>)
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextNormal style={styles.title}>Phương thức thanh toán</TextNormal>
                <TouchableOpacity onPress={onCloseModal} style={styles.closeButton}>
                    <Svg name="icon_close" size={24} color={Colors.blackColor} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <TextNormal style={styles.loadingText}>Đang tải phương thức thanh toán...</TextNormal>
                    </View>
                ) : methods.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <TextNormal style={styles.loadingText}>Không có phương thức thanh toán nào khả dụng</TextNormal>
                    </View>
                ) : (
                    <FlatList
                        data={methods}
                        renderItem={renderPaymentMethod}
                        keyExtractor={(item) => item.id?.toString() || item.name}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (!selectedMethod || loading || methods.length === 0) && styles.disabledButton
                    ]}
                    onPress={handleConfirm}
                    disabled={!selectedMethod || loading || methods.length === 0}
                >
                    <TextNormal style={[
                        styles.confirmButtonText,
                        (!selectedMethod || loading || methods.length === 0) && styles.disabledButtonText
                    ]}>
                        {loading ? 'Đang tải...' : methods.length === 0 ? 'Không có phương thức' : 'Xác nhận'}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.placeholder,
        textAlign: 'center',
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