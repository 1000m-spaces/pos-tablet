import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from 'store/async_storage/index';
import QRCode from 'react-native-qrcode-svg';

const BillTemplate = ({ selectedOrder }) => {
    const [fontSizes, setFontSizes] = useState({
        header: 24,
        content: 16,
        total: 18
    });

    const [shopInfo, setShopInfo] = useState({
        name: '',
        address: '',
        phone: '',
        wifi_name: '',
        wifi_pass: '',
        id: ''
    });

    const [userInfos, setUserInfos] = useState({
        partnerid: '',
        shopid: ''
    });

    useEffect(() => {
        const loadBillPrinterSettings = async () => {
            try {
                const billPrinterInfo = await AsyncStorage.getBillPrinterInfo();
                if (billPrinterInfo) {
                    setFontSizes({
                        header: billPrinterInfo.billHeader || 24,
                        content: billPrinterInfo.billContent || 16,
                        total: billPrinterInfo.billTotal || 18
                    });
                }
            } catch (error) {
                console.error('Error loading bill printer settings:', error);
            }
        };

        const loadUserInfo = async () => {
            try {
                const user = await AsyncStorage.getUser();
                if (user && user.shops) {
                    setUserInfos({
                        partnerid: user.partnerid || user.shops.partnerid || '',
                        shopid: user.shopid || user.shops.id || ''
                    });
                    // Update shopInfo with user's shop data - following same pattern as Orders.js
                    const shopData = await AsyncStorage.getShopInfo?.() || {};
                    setShopInfo({
                        name: user.shops.name_vn || shopData.name || 'NEOCAFE',
                        address: user.shops.addr || shopData.address || '',
                        phone: user.shops.mobile || shopData.phone || '',
                        wifi_name: shopData.wifi_name || 'NEOCAFE_WIFI',
                        wifi_pass: shopData.wifi_pass || '12345678',
                        id: user.shops.id || user.shopid || ''
                    });
                    console.log('BillTemplate: User shop loaded:', user.shops);
                } else {
                    console.log('BillTemplate: No user shop data found');
                    // Fallback if no user data
                    const shopData = await AsyncStorage.getShopInfo?.() || {};
                    setShopInfo({
                        name: shopData.name || 'NEOCAFE',
                        address: shopData.address || '',
                        phone: shopData.phone || '',
                        wifi_name: shopData.wifi_name || 'NEOCAFE_WIFI',
                        wifi_pass: shopData.wifi_pass || '12345678',
                        id: shopData.id || ''
                    });
                }
            } catch (error) {
                console.error('Error loading user/shop info:', error);
                setShopInfo({
                    name: 'NEOCAFE',
                    address: '',
                    phone: '',
                    wifi_name: 'NEOCAFE_WIFI',
                    wifi_pass: '12345678',
                    id: ''
                });
            }
        };

        loadBillPrinterSettings();
        loadUserInfo();
    }, []);

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('vi-VN').format(amount);
        } catch (error) {
            return amount?.toString() || '0';
        }
    };

    const formatDateTime = () => {
        try {
            const now = new Date();
            return now.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return new Date().toLocaleString();
        }
    };

    const generateQRUrl = () => {
        try {
            // Get order data
            const orderId = selectedOrder?.displayID || selectedOrder?.session || selectedOrder?.id || 'unknown';

            // Get dataOrderTime (try various possible order time fields)
            const dataOrderTime = selectedOrder?.createdAt ||
                selectedOrder?.created_at ||
                selectedOrder?.updatedAt ||
                selectedOrder?.updated_at ||
                selectedOrder?.orderTime ||
                new Date().toISOString();

            // Calculate timestamp as per user requirements
            const timeString = dataOrderTime;
            // Chuyển sang định dạng ISO hợp lệ
            const isoString = timeString.replace(' ', 'T');
            // Tạo đối tượng Date
            const date = new Date(isoString);
            // Lấy giá trị số (timestamp)
            const timestamp = date.getTime();

            // Ensure we have required data
            const shopId = shopInfo.id || 'unknown';
            const partnerId = userInfos.partnerid || 'unknown';

            // Generate QR URL
            const qrUrl = `https://invoice.1000m.vn?shopId=${shopId}&partnerId=${partnerId}&orderId=${orderId}&expireAt=${timestamp}`;

            console.log('Generated QR URL:', qrUrl);
            return qrUrl;
        } catch (error) {
            console.error('Error generating QR URL:', error);
            // Return a fallback URL to prevent QR code crashes
            return 'https://invoice.1000m.vn?shopId=unknown&partnerId=unknown&orderId=unknown&expireAt=0';
        }
    };

    const calculateSubTotal = () => {
        if (!selectedOrder?.itemInfo?.items) return 0;
        return selectedOrder.itemInfo.items.reduce((total, item) => {
            // Extract numeric price more robustly
            let itemPrice = 0;
            if (item.fare?.priceDisplay) {
                // Handle formatted string prices like "25,000"
                const priceStr = item.fare.priceDisplay.toString().replace(/[^\d]/g, '');
                itemPrice = parseInt(priceStr) || 0;
            } else if (item.price) {
                itemPrice = typeof item.price === 'number' ? item.price : parseInt(item.price) || 0;
            } else if (item.amount) {
                itemPrice = typeof item.amount === 'number' ? item.amount : parseInt(item.amount) || 0;
            }
            return total + (itemPrice * (item.quantity || item.quanlity || 1));
        }, 0);
    };

    const subTotal = calculateSubTotal();
    const serviceFeePct = 0; // Can be configured
    const serviceFee = Math.round(subTotal * serviceFeePct / 100);
    const discount = 0; // Can be from order data
    const finalTotal = subTotal + serviceFee - discount;

    return (
        <View style={styles.container}>
            {/* Header with Logo and Shop Info */}
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <Image
                        source={require('../../assets/images/logo_1000m.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.shopInfoSection}>
                    <Text style={[styles.shopName, { fontSize: fontSizes.header }]}>{shopInfo.name}</Text>
                    {shopInfo.address ? <Text style={[styles.shopDetails, { fontSize: fontSizes.content }]}>{shopInfo.address}</Text> : null}
                    {shopInfo.phone ? <Text style={[styles.shopDetails, { fontSize: fontSizes.content }]}>{shopInfo.phone}</Text> : null}
                </View>
            </View>

            {/* Divider */}
            <View style={styles.dashedLine} />

            {/* Order Information */}
            <View style={styles.orderInfoSection}>
                <View style={styles.orderInfoRow}>
                    <View style={styles.orderInfoLeft}>
                        <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                            Mã hóa đơn: {selectedOrder?.displayID || selectedOrder?.session || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.orderInfoRight}>
                        <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                            Ngày: {formatDateTime()}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderDetailsRow}>
                    <View style={styles.orderDetailsLeft}>
                        <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                            Nhân viên: {selectedOrder?.staff || 'POS System'}
                        </Text>
                        <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                            HTTT: {selectedOrder?.paymentMethod || 'Tiền mặt'}
                        </Text>
                        <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                            Nguồn ĐH: {selectedOrder?.service || selectedOrder?.serviceType || 'POS'}
                        </Text>
                        {selectedOrder?.orderNote || selectedOrder?.note ? (
                            <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                                Ghi chú: {selectedOrder?.orderNote || selectedOrder?.note}
                            </Text>
                        ) : null}
                    </View>
                    <View style={styles.tableSection}>
                        <Text style={[styles.tableNumber, { fontSize: fontSizes.header * 1.5 }]}>
                            {selectedOrder?.tableName || selectedOrder?.shopTableName || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Shipping Address for delivery orders */}
                {selectedOrder?.shippingAddress ? (
                    <Text style={[styles.orderInfoText, { fontSize: fontSizes.content }]}>
                        Địa chỉ: {selectedOrder.shippingAddress}
                    </Text>
                ) : null}
            </View>

            {/* Divider */}
            <View style={styles.dashedLine} />

            {/* Products Header */}
            <View style={styles.productsHeader}>
                <View style={styles.productNameHeader}>
                    <Text style={[styles.productsHeaderText, { fontSize: fontSizes.content }]}>Sản phẩm</Text>
                </View>
                <View style={styles.productPriceHeader}>
                    <Text style={[styles.productsHeaderText, { fontSize: fontSizes.content }]}>Giá</Text>
                </View>
                <View style={styles.productQtyHeader}>
                    <Text style={[styles.productsHeaderText, { fontSize: fontSizes.content }]}>SL</Text>
                </View>
                <View style={styles.productTotalHeader}>
                    <Text style={[styles.productsHeaderText, { fontSize: fontSizes.content }]}>Thành tiền</Text>
                </View>
            </View>

            {/* Solid Line */}
            <View style={styles.solidLine} />

            {/* Products List */}
            <View style={styles.productsList}>
                {selectedOrder?.itemInfo?.items?.map((item, index) => {
                    // Extract numeric price more robustly
                    let itemPrice = 0;
                    if (item.fare?.priceDisplay) {
                        // Handle formatted string prices like "25,000"
                        const priceStr = item.fare.priceDisplay.toString().replace(/[^\d]/g, '');
                        itemPrice = parseInt(priceStr) || 0;
                    } else if (item.price) {
                        itemPrice = typeof item.price === 'number' ? item.price : parseInt(item.price) || 0;
                    } else if (item.amount) {
                        itemPrice = typeof item.amount === 'number' ? item.amount : parseInt(item.amount) || 0;
                    }

                    const quantity = item.quantity || item.quanlity || 1;
                    const totalPrice = itemPrice * quantity;

                    return (
                        <View key={index} style={styles.productItem}>
                            <View style={styles.productNameColumn}>
                                <Text style={[styles.productText, { fontSize: fontSizes.content }]}>
                                    {item.name}
                                </Text>
                                {/* Show modifiers/extras */}
                                {item.modifierGroups?.map((group, groupIndex) => (
                                    <View key={groupIndex}>
                                        {group.modifiers?.map((modifier, modIndex) => (
                                            <Text key={modIndex} style={[styles.modifierText, { fontSize: fontSizes.content - 2 }]}>
                                                {modifier.modifierName}
                                            </Text>
                                        ))}
                                    </View>
                                ))}
                                {/* Show extras for offline orders */}
                                {item.extras?.map((extra, extraIndex) => (
                                    <Text key={extraIndex} style={[styles.modifierText, { fontSize: fontSizes.content - 2 }]}>
                                        {extra.name}
                                    </Text>
                                ))}
                                {/* Show item note */}
                                {item.note && item.note.trim() !== '' && (
                                    <View style={styles.noteContainer}>
                                        <Text style={[styles.noteText, { fontSize: fontSizes.content - 2 }]}>📝 {item.note}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.productPriceColumn}>
                                <Text style={[styles.productText, { fontSize: fontSizes.content }]}>
                                    {formatCurrency(itemPrice)}
                                </Text>
                            </View>
                            <View style={styles.productQtyColumn}>
                                <Text style={[styles.productText, { fontSize: fontSizes.content }]}>
                                    {quantity}
                                </Text>
                            </View>
                            <View style={styles.productTotalColumn}>
                                <Text style={[styles.productText, { fontSize: fontSizes.content }]}>
                                    {formatCurrency(totalPrice)}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Dotted Line */}
            <View style={styles.dottedLine} />

            {/* Totals Section */}
            <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { fontSize: fontSizes.content }]}>Tổng</Text>
                    <Text style={[styles.totalValue, { fontSize: fontSizes.content }]}>
                        {formatCurrency(subTotal)}
                    </Text>
                </View>
                {serviceFee > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { fontSize: fontSizes.content }]}>Phí dịch vụ</Text>
                        <Text style={[styles.totalValue, { fontSize: fontSizes.content }]}>
                            {formatCurrency(serviceFee)}
                        </Text>
                    </View>
                )}
                {discount > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { fontSize: fontSizes.content }]}>Giảm giá</Text>
                        <Text style={[styles.totalValue, { fontSize: fontSizes.content }]}>
                            {formatCurrency(discount)}
                        </Text>
                    </View>
                )}
                <View style={styles.totalRow}>
                    <Text style={[styles.finalTotalLabel, { fontSize: fontSizes.total }]}>Thanh toán</Text>
                    <Text style={[styles.finalTotalValue, { fontSize: fontSizes.total }]}>
                        {formatCurrency(selectedOrder?.orderValue || selectedOrder?.total_amount || finalTotal)}
                    </Text>
                </View>
            </View>

            {/* Dotted Line */}
            <View style={styles.dottedLine} />

            {/* WiFi Information */}
            <View style={styles.wifiSection}>
                <Text style={[styles.wifiText, { fontSize: fontSizes.content }]}>
                    Wifi: {shopInfo.wifi_name}
                </Text>
                <Text style={[styles.wifiText, { fontSize: fontSizes.content }]}>
                    Pass: {shopInfo.wifi_pass}
                </Text>
            </View>

            {/* Dotted Line */}
            <View style={styles.dottedLine} />

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { fontSize: fontSizes.content }]}>
                    Cảm ơn quý khách đã sử dụng dịch vụ!
                </Text>
                <Text style={[styles.footerText, { fontSize: fontSizes.content }]}>
                    Powered by Neo Cafe
                </Text>
            </View>
            <View style={styles.qrSection}>
                <QRCode
                    value={generateQRUrl()}
                    size={120}
                    color="black"
                    backgroundColor="white"
                />
                <Text style={[styles.qrLabel, { fontSize: fontSizes.content - 4 }]}>
                    Quét mã để xem hóa đơn điện tử
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        width: '100%',
    },

    // Header section styles
    header: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    logoSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    logoText: {
        fontWeight: 'bold',
        color: '#666',
    },
    shopInfoSection: {
        flex: 2,
        marginLeft: 15,
        justifyContent: 'center',
    },
    shopName: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    shopDetails: {
        marginBottom: 2,
        color: '#444',
    },

    // Divider styles
    dashedLine: {
        borderTopWidth: 2,
        borderTopColor: '#bbb',
        borderStyle: 'dashed',
        marginVertical: 10,
    },
    solidLine: {
        borderTopWidth: 1,
        borderTopColor: '#bbb',
        marginVertical: 5,
    },
    dottedLine: {
        borderTopWidth: 1,
        borderTopColor: '#bbb',
        borderStyle: 'dotted',
        marginVertical: 8,
    },

    // Order info section styles
    orderInfoSection: {
        marginBottom: 10,
    },
    orderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    orderInfoLeft: {
        flex: 1,
    },
    orderInfoRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    orderDetailsRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    orderDetailsLeft: {
        flex: 2,
    },
    tableSection: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    tableNumber: {
        fontWeight: 'bold',
        color: '#333',
    },
    orderInfoText: {
        marginBottom: 3,
        color: '#333',
    },

    // Products section styles
    productsHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    productNameHeader: {
        flex: 2,
        paddingLeft: 5,
    },
    productPriceHeader: {
        flex: 1,
        alignItems: 'flex-end',
    },
    productQtyHeader: {
        flex: 0.5,
        alignItems: 'flex-end',
    },
    productTotalHeader: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    productsHeaderText: {
        fontWeight: 'bold',
        color: '#333',
    },

    productsList: {
        marginBottom: 10,
    },
    productItem: {
        flexDirection: 'row',
        paddingVertical: 5,
        alignItems: 'flex-start',
    },
    productNameColumn: {
        flex: 2,
        paddingLeft: 5,
    },
    productPriceColumn: {
        flex: 1,
        alignItems: 'flex-end',
    },
    productQtyColumn: {
        flex: 0.5,
        alignItems: 'flex-end',
    },
    productTotalColumn: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    productText: {
        color: '#333',
        lineHeight: 20,
    },
    modifierText: {
        color: '#666',
        marginLeft: 10,
        fontStyle: 'italic',
        lineHeight: 16,
    },

    // Totals section styles
    totalsSection: {
        marginVertical: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    totalLabel: {
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#333',
    },
    finalTotalLabel: {
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
    },
    finalTotalValue: {
        fontWeight: 'bold',
        color: '#333',
    },

    // WiFi section styles
    wifiSection: {
        marginVertical: 10,
    },
    wifiText: {
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 5,
        marginVertical: 2,
    },

    // Footer section styles
    footer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    footerText: {
        textAlign: 'center',
        color: '#333',
        marginVertical: 2,
    },

    // QR section styles
    qrSection: {
        alignItems: 'center',
        marginTop: 15,
    },
    qrPlaceholder: {
        width: 120,
        height: 120,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    qrText: {
        color: '#666',
        fontWeight: 'bold',
    },
    qrLabel: {
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    },

    // Note styles
    noteContainer: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: '#FFF8F0',
        borderRadius: 3,
        alignSelf: 'flex-start',
    },
    noteText: {
        color: '#8B4513',
        fontStyle: 'italic',
    },
});

export default BillTemplate;
