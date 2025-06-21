import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from 'store/actions';
import { userInfo, currentOrderSelector, onlineOrderSelector } from 'store/selectors';
import { NAVIGATION_LOGIN } from 'navigation/routes';
import AsyncStorage from 'store/async_storage/index';
import {
    TextNormal,
    TextSemiBold,
    TextHighLightBold,
} from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Colors from 'theme/Colors';
import styles from './styles';

const Profile = ({ navigation }) => {
    const dispatch = useDispatch();
    const user = useSelector(state => userInfo(state));
    const currentOrder = useSelector(state => currentOrderSelector(state));
    const onlineOrders = useSelector(state => onlineOrderSelector(state));

    const [orderStats, setOrderStats] = useState({
        pendingOrders: 0,
        completedToday: 0,
        totalRevenue: 0,
        lastOrderTime: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load order statistics
    useEffect(() => {
        const loadOrderStats = async () => {
            try {
                setIsLoading(true);

                // Get pending orders
                const pendingOrders = await AsyncStorage.getPendingOrders();

                // Get last order
                const lastOrder = await AsyncStorage.getLastOrder();

                // Calculate today's statistics
                const today = new Date().toDateString();
                const todayOrders = pendingOrders.filter(order => {
                    const orderDate = new Date(order.created_at || order.updated_at);
                    return orderDate.toDateString() === today;
                });

                // Calculate completed orders today
                const completedToday = todayOrders.filter(order =>
                    order.orderStatus === 'Completed'
                ).length;

                // Calculate total revenue (estimate from completed orders)
                const totalRevenue = todayOrders
                    .filter(order => order.orderStatus === 'Completed')
                    .reduce((sum, order) => {
                        return sum + (order.totalAmount || order.total || 0);
                    }, 0);

                // Get last order time
                const lastOrderTime = lastOrder?.created_at ||
                    (pendingOrders.length > 0 ?
                        pendingOrders.sort((a, b) =>
                            new Date(b.created_at || b.updated_at) -
                            new Date(a.created_at || a.updated_at)
                        )[0].created_at : null);

                setOrderStats({
                    pendingOrders: pendingOrders.filter(order =>
                        order.orderStatus !== 'Completed' &&
                        order.orderStatus !== 'Cancelled'
                    ).length,
                    completedToday,
                    totalRevenue,
                    lastOrderTime,
                });
            } catch (error) {
                console.error('Error loading order stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrderStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất không?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(logout());
                        // Navigate to login screen
                        navigation.reset({
                            index: 0,
                            routes: [{ name: NAVIGATION_LOGIN }],
                        });
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.profileIconContainer}>
                        <Svg name={'account_pos'} size={80} color={Colors.primary} />
                    </View>
                    <TextSemiBold style={styles.username}>
                        {user?.username || 'Người dùng'}
                    </TextSemiBold>
                    <TextNormal style={styles.userRole}>
                        ID: {user?.userid || 'N/A'}
                    </TextNormal>
                </View>

                {/* User Information */}
                <View style={styles.infoSection}>
                    <TextSemiBold style={styles.sectionTitle}>
                        Thông tin tài khoản
                    </TextSemiBold>

                    <View style={styles.infoItem}>
                        <TextNormal style={styles.infoLabel}>Tên đăng nhập:</TextNormal>
                        <TextNormal style={styles.infoValue}>
                            {user?.username || 'N/A'}
                        </TextNormal>
                    </View>

                    <View style={styles.infoItem}>
                        <TextNormal style={styles.infoLabel}>ID người dùng:</TextNormal>
                        <TextNormal style={styles.infoValue}>
                            {user?.userid || 'N/A'}
                        </TextNormal>
                    </View>

                    <View style={styles.infoItem}>
                        <TextNormal style={styles.infoLabel}>Vai trò:</TextNormal>
                        <TextNormal style={styles.infoValue}>
                            {user?.roleid || 'N/A'}
                        </TextNormal>
                    </View>

                    <View style={styles.infoItem}>
                        <TextNormal style={styles.infoLabel}>Cửa hàng:</TextNormal>
                        <TextNormal style={styles.infoValue}>
                            {user?.shopid || 'N/A'}
                        </TextNormal>
                    </View>

                    {user?.vnpay_terminal_name && (
                        <View style={styles.infoItem}>
                            <TextNormal style={styles.infoLabel}>Terminal:</TextNormal>
                            <TextNormal style={styles.infoValue}>
                                {user.vnpay_terminal_name}
                            </TextNormal>
                        </View>
                    )}
                </View>

                {/* Store Information */}
                {user?.shops && user.shops.length > 0 && (
                    <View style={styles.infoSection}>
                        <TextSemiBold style={styles.sectionTitle}>
                            Danh sách cửa hàng
                        </TextSemiBold>
                        {user.shops.map((shop, index) => (
                            <View key={index} style={styles.shopItem}>
                                <TextNormal style={styles.shopName}>
                                    {shop.name || `Cửa hàng ${shop.id}`}
                                </TextNormal>
                                <TextNormal style={styles.shopId}>
                                    ID: {shop.id}
                                </TextNormal>
                            </View>
                        ))}
                    </View>
                )}

                {/* Current Order Information */}
                {currentOrder && currentOrder.products && currentOrder.products.length > 0 && (
                    <View style={styles.infoSection}>
                        <TextSemiBold style={styles.sectionTitle}>
                            Đơn hàng hiện tại
                        </TextSemiBold>

                        <View style={styles.infoItem}>
                            <TextNormal style={styles.infoLabel}>Số sản phẩm:</TextNormal>
                            <TextNormal style={styles.infoValue}>
                                {currentOrder.products.reduce((sum, product) => sum + product.quantity, 0)}
                            </TextNormal>
                        </View>

                        <View style={styles.infoItem}>
                            <TextNormal style={styles.infoLabel}>Bàn số:</TextNormal>
                            <TextNormal style={styles.infoValue}>
                                {currentOrder.table || 'Chưa chọn'}
                            </TextNormal>
                        </View>

                        <View style={styles.infoItem}>
                            <TextNormal style={styles.infoLabel}>Mang đi:</TextNormal>
                            <TextNormal style={styles.infoValue}>
                                {currentOrder.take_away ? 'Có' : 'Không'}
                            </TextNormal>
                        </View>

                        {currentOrder.note && (
                            <View style={styles.infoItem}>
                                <TextNormal style={styles.infoLabel}>Ghi chú:</TextNormal>
                                <TextNormal style={styles.infoValue}>
                                    {currentOrder.note}
                                </TextNormal>
                            </View>
                        )}
                    </View>
                )}

                {/* Order Statistics */}
                <View style={styles.infoSection}>
                    <TextSemiBold style={styles.sectionTitle}>
                        Thống kê đơn hàng
                    </TextSemiBold>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <TextNormal style={styles.loadingText}>
                                Đang tải thống kê...
                            </TextNormal>
                        </View>
                    ) : (
                        <>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <TextSemiBold style={styles.statNumber}>
                                        {orderStats.pendingOrders}
                                    </TextSemiBold>
                                    <TextNormal style={styles.statLabel}>
                                        Đơn đang xử lý
                                    </TextNormal>
                                </View>

                                <View style={styles.statItem}>
                                    <TextSemiBold style={styles.statNumber}>
                                        {orderStats.completedToday}
                                    </TextSemiBold>
                                    <TextNormal style={styles.statLabel}>
                                        Hoàn thành hôm nay
                                    </TextNormal>
                                </View>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <TextSemiBold style={styles.statNumber}>
                                        {onlineOrders.length}
                                    </TextSemiBold>
                                    <TextNormal style={styles.statLabel}>
                                        Đơn online
                                    </TextNormal>
                                </View>

                                <View style={styles.statItem}>
                                    <TextSemiBold style={styles.statNumber}>
                                        {formatCurrency(orderStats.totalRevenue)}
                                    </TextSemiBold>
                                    <TextNormal style={styles.statLabel}>
                                        Doanh thu hôm nay
                                    </TextNormal>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <TextNormal style={styles.infoLabel}>Đơn hàng cuối:</TextNormal>
                                <TextNormal style={styles.infoValue}>
                                    {formatDate(orderStats.lastOrderTime)}
                                </TextNormal>
                            </View>
                        </>
                    )}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}>
                        <TextHighLightBold style={styles.logoutText}>
                            Đăng xuất
                        </TextHighLightBold>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile; 