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
import { currentOrderSelector, onlineOrderSelector } from 'store/selectors';
import { NAVIGATION_LOGIN } from 'navigation/routes';
import AsyncStorage from 'store/async_storage/index';
import {
    TextNormal,
    TextSemiBold,
    TextHighLightBold,
} from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Colors from 'theme/Colors';
import OrderBackupDialog from './OrderBackupDialog';
import styles from './styles';

const Profile = ({ navigation }) => {
    const dispatch = useDispatch();
    const [user, setUser] = useState(null);
    const currentOrder = useSelector(state => currentOrderSelector(state));
    const onlineOrders = useSelector(state => onlineOrderSelector(state));

    const [orderStats, setOrderStats] = useState({
        pendingOrders: 0,
        completedToday: 0,
        totalRevenue: 0,
        lastOrderTime: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Hidden admin feature: Tap profile icon 5 times to show backup dialog
    const [tapCount, setTapCount] = useState(0);
    const [tapTimeout, setTapTimeout] = useState(null);
    const [showBackupDialog, setShowBackupDialog] = useState(false);

    // Load user info and order statistics
    useEffect(() => {
        const loadUserAndOrderStats = async () => {
            try {
                setIsLoading(true);

                // Get user info from AsyncStorage
                const userData = await AsyncStorage.getUser();
                setUser(userData);

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
                        order.orderStatus !== 'Canceled'
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

        loadUserAndOrderStats();
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

    const handleProfileIconTap = () => {
        // Clear existing timeout
        if (tapTimeout) {
            clearTimeout(tapTimeout);
        }

        const newTapCount = tapCount + 1;
        setTapCount(newTapCount);

        // Show backup dialog after 5 taps
        if (newTapCount >= 5) {
            setShowBackupDialog(true);
            setTapCount(0);
            return;
        }

        // Reset tap count after 2 seconds of inactivity
        const timeout = setTimeout(() => {
            setTapCount(0);
        }, 2000);
        setTapTimeout(timeout);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.profileIconContainer}
                        onPress={handleProfileIconTap}
                        activeOpacity={0.8}
                    >
                        <Svg name={'account_pos'} size={80} color={Colors.primary} />
                    </TouchableOpacity>
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
                            <TextNormal style={styles.infoLabel}>Thẻ số:</TextNormal>
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

            {/* Hidden Admin Dialog - Order Backup */}
            <OrderBackupDialog
                visible={showBackupDialog}
                onClose={() => setShowBackupDialog(false)}
            />
        </SafeAreaView>
    );
};

export default Profile; 