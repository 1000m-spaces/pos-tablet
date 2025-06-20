import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
    FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import { vouchersSelector, statusGetVoucherSelector } from 'store/selectors';
import Status from 'common/Status/Status';

const VoucherModal = ({ onCloseModal, onApplyVoucher }) => {
    const vouchers = useSelector(vouchersSelector);
    const voucherStatus = useSelector(statusGetVoucherSelector);

    // Transform Redux voucher data to match component structure
    const transformVoucherData = (vouchers) => {
        if (!Array.isArray(vouchers)) return [];

        return vouchers.map((voucher, index) => ({
            id: voucher.id || index,
            title: voucher.title || voucher.name || `Voucher ${index + 1}`,
            expiryDate: voucher.expired_date || voucher.expiry_date || 'N/A',
            image: voucher.image || voucher.image_url || 'https://placehold.co/76x76',
            isAvailable: voucher.is_available !== false && voucherStatus === Status.SUCCESS,
            discount: voucher.discount_amount || voucher.value,
            conditions: voucher.conditions || voucher.description,
            // Pass through original voucher data for application
            originalData: voucher,
        }));
    };

    const voucherData = transformVoucherData(vouchers);

    const renderVoucherItem = ({ item, index }) => (
        <View key={item.id}>
            {/* Voucher Container */}
            <View style={[
                styles.voucherContainer,
                !item.isAvailable && styles.voucherDisabled
            ]}>
                {/* Voucher Content */}
                <View style={styles.voucherContent}>
                    <Image
                        source={{ uri: item.image }}
                        style={[
                            styles.voucherImage,
                            !item.isAvailable && styles.voucherImageDisabled
                        ]}
                    />
                    <View style={styles.voucherInfo}>
                        <TextNormal style={[
                            styles.voucherTitle,
                            !item.isAvailable && styles.voucherTextDisabled
                        ]}>
                            {item.title}
                        </TextNormal>
                        <TextNormal style={[
                            styles.voucherExpiry,
                            !item.isAvailable && styles.voucherTextDisabled
                        ]}>
                            HSD: {item.expiryDate}
                        </TextNormal>
                        <TouchableOpacity>
                            <TextNormal style={styles.voucherConditions}>
                                Điều kiện
                            </TextNormal>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                    style={[
                        styles.applyButton,
                        !item.isAvailable && styles.applyButtonDisabled
                    ]}
                    onPress={() => item.isAvailable && onApplyVoucher(item)}
                    disabled={!item.isAvailable}
                >
                    <TextNormal style={[
                        styles.applyButtonText,
                        !item.isAvailable && styles.applyButtonTextDisabled
                    ]}>
                        Áp dụng
                    </TextNormal>
                </TouchableOpacity>
            </View>

            {/* Separator Line */}
            {index < voucherData.length - 1 && (
                <View style={styles.voucherSeparator} />
            )}
        </View>
    );

    // Show loading or empty state
    if (voucherStatus === Status.LOADING) {
        return (
            <View style={styles.voucherModalContainer}>
                <View style={styles.voucherModalHeader}>
                    <TextNormal style={styles.voucherModalTitle}>Chọn voucher</TextNormal>
                    <TouchableOpacity onPress={onCloseModal}>
                        <Svg name={'icon_close'} size={24} color={Colors.blackColor} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <TextNormal style={styles.loadingText}>Đang tải voucher...</TextNormal>
                </View>
            </View>
        );
    }

    if (voucherData.length === 0) {
        return (
            <View style={styles.voucherModalContainer}>
                <View style={styles.voucherModalHeader}>
                    <TextNormal style={styles.voucherModalTitle}>Chọn voucher</TextNormal>
                    <TouchableOpacity onPress={onCloseModal}>
                        <Svg name={'icon_close'} size={24} color={Colors.blackColor} />
                    </TouchableOpacity>
                </View>
                <View style={styles.emptyContainer}>
                    <TextNormal style={styles.emptyText}>Không có voucher nào khả dụng</TextNormal>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.voucherModalContainer}>
            <View style={styles.voucherModalHeader}>
                <TextNormal style={styles.voucherModalTitle}>Chọn voucher</TextNormal>
                <TouchableOpacity onPress={onCloseModal}>
                    <Svg name={'icon_close'} size={24} color={Colors.blackColor} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={voucherData}
                renderItem={renderVoucherItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.voucherList}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default VoucherModal;

const styles = StyleSheet.create({
    voucherModalContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
    },
    voucherModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.line,
    },
    voucherModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.blackColor,
    },
    voucherList: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: Colors.placeholder,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Colors.placeholder,
        textAlign: 'center',
    },
    voucherContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#C8C8C8',
        padding: 16,
        marginBottom: 8,
    },
    voucherDisabled: {
        opacity: 0.5,
    },
    voucherContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    voucherImage: {
        width: 76,
        height: 76,
        borderRadius: 8,
        marginRight: 16,
    },
    voucherImageDisabled: {
        opacity: 0.5,
    },
    voucherInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    voucherTitle: {
        color: '#111111',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    voucherExpiry: {
        color: '#6D6D6D',
        fontSize: 16,
        marginBottom: 4,
    },
    voucherConditions: {
        color: '#0C80E6',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    voucherTextDisabled: {
        opacity: 0.5,
    },
    applyButton: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F2522E',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    applyButtonDisabled: {
        opacity: 0.5,
    },
    applyButtonText: {
        color: '#F2522E',
        fontSize: 16,
        fontWeight: '600',
    },
    applyButtonTextDisabled: {
        color: '#F2522E',
    },
    voucherSeparator: {
        height: 1,
        backgroundColor: '#DBDBDB',
        marginVertical: 8,
        transform: [{ rotate: '90deg' }],
        width: 107,
        alignSelf: 'center',
    },
}); 