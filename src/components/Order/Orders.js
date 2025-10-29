import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView, ActivityIndicator, Platform
} from 'react-native';
import orderController from 'store/order/orderController';
import Colors from 'theme/Colors';
import OrderTable from './OrderTable';
import PrinterSettingsModal from 'common/PrinterSettingsModal';
import AsyncStorage from 'store/async_storage/index'
import { usePrinter } from '../../services/PrinterService';

const orderFilters = [
  { id: 1, name: 'Đơn mới' },
  { id: 2, name: 'Lịch sử' },
];


const Orders = () => {
  const [orderType, setOrderType] = useState(1);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [userShop, setUserShop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [printerType, setPrinterType] = useState('label'); // 'label' or 'bill'

  // Printer service
  const { labelPrinterStatus, billPrinterStatus } = usePrinter();
  // Helper function to parse price strings (removes thousand separator dots)
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    // Remove dots (thousand separators) and convert to number
    const cleaned = String(priceStr).replace(/\./g, '');
    return Number(cleaned) || 0;
  };

  // Transform new API format to match existing order structure
  const transformOrderData = (order, service = 'GRAB') => {
    return {
      displayID: order.display_id || '',
      deliveryId: order.delivery_id || '',
      service: service,
      state: order.state || 'ORDER_CREATED',
      orderValue: order.price_paid || order.total_price || '0',
      totalPrice: order.total_price || '0',
      discount: order.discount || '0',
      discountInfo: order.discount_info || null,
      // Transform items to match expected itemInfo structure
      itemInfo: {
        items: (order.items || []).map(item => ({
          // Fields for OrderTable compatibility
          product_name: item.product_name || '',
          quantity: item.quantity || 1,
          quanlity: item.quantity || 1, // Keep both spellings for compatibility
          price: (parsePrice(item.price_product) || parsePrice(item.price_paid) || 0).toString(),
          total_price: item.total_price || '0',
          note: item.note || '',
          campaign: item.campaign || '',
          // Fields for OrderDetailDialog compatibility
          name: item.product_name || '', // Used by getOrderItems
          comment: item.note || '', // Used by getOrderItems
          fare: {
            priceDisplay: (parsePrice(item.price_product) || parsePrice(item.price_paid) || 0).toString(),
            currencySymbol: '₫'
          },
          // Transform options for OrderItems.js display - keep as option array
          option: (item.option || []).map(opt => ({
            optdetailid: opt.product_name || '', // Use product_name as ID
            optdetailname: opt.product_name || '',
            product_name: opt.product_name || '',
            quantity: opt.quantity || 1
          })),
          // Transform extras to modifierGroups for online order display
          modifierGroups: (item.extra || []).map(ext => ({
            modifiers: [{
              modifierName: ext.product_name || '',
              quantity: ext.quantity || 1
            }]
          })),
          // Keep original extra for backward compatibility
          extra: item.extra || null
        }))
      },
      // Preserve original eater/driver for getCustomerInfo/getDriverInfo utility functions
      eater: order.eater || null,
      driver: order.driver || null,
      source: 'app_order',
      // Also keep transformed versions for backward compatibility
      customerInfo: order.eater ? {
        name: order.eater.name || '',
        phone: order.eater.mobileNumber || '',
        comment: order.eater.comment || '',
        address: order.eater.address?.address || order.eater.address || ''
      } : null,
      driverInfo: order.driver ? {
        name: order.driver.name || '',
        phone: order.driver.mobileNumber || ''
      } : null,
      // Raw data for reference
      rawData: order
    };
  };

  // Query function for fetching new orders
  const fetchNewOrders = async () => {
    if (!userShop) {
      throw new Error('No user shop data available');
    }

    const user = await AsyncStorage.getUser();
    const grabOrdersRes = await orderController.fetchOrder({
      branch_id: Number(userShop.id),
      brand_id: Number(userShop.partnerid),
      partner_id: Number(user.shopownerid),
    });
    console.log('data response GRAB orders:', grabOrdersRes, userShop);
    if (!grabOrdersRes.success) {
      throw new Error('Failed to fetch GRAB orders');
    }
    const rawOrders = grabOrdersRes?.data?.orders || [];
    const transformedOrders = rawOrders.map(order => transformOrderData(order, order.service || 'GRAB'));
    console.log('Transformed orders:', transformedOrders);
    return transformedOrders;
  };

  // Helper function to format date to UTC+7 timezone
  const formatToUTC7 = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  };

  // Query function for fetching history orders
  const fetchHistoryOrders = async () => {
    if (!userShop) {
      throw new Error('No user shop data available');
    }

    const user = await AsyncStorage.getUser();
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const fromAt = formatToUTC7(startDate);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 0);
    const toAt = formatToUTC7(endDate);
    const res = await orderController.fetchOrderHistory({
      branch_id: Number(userShop.id),
      brand_id: Number(userShop.partnerid),
      partner_id: Number(user.shopownerid),
      from_at: fromAt,
      to_at: toAt,
      page: 1,
      size: 1000,
    });
    console.log('data response history orders:', res);
    if (!res.succes) {
      throw new Error('Failed to fetch order history');
    }
    const statements = res.data?.orders || [];
    const orderDetailsPromises = statements?.map(statement =>
      orderController.getOrderDetail({
        order_id: statement.ID,
        branch_id: userShop.id,
        brand_id: userShop.partnerid,
        service: statement.service,
        partner_id: Number(user.shopownerid),
      })
    );
    const orderDetailsResults = await Promise.all(orderDetailsPromises);
    const rawOrders = orderDetailsResults?.map((result, index) => ({
      ...result?.data?.order,
      ...statements[index]
    }));
    const transformedOrders = rawOrders?.map(order => transformOrderData(order, order.service));
    console.log('Transformed history orders:', transformedOrders);
    return transformedOrders;
  };

  // Use React Query for new orders
  const newOrdersQuery = useQuery({
    queryKey: ['orders', 'new', userShop?.id],
    queryFn: fetchNewOrders,
    enabled: orderType === 1 && !!userShop,
    refetchInterval: orderType === 1 ? 60000 : false, // Auto-refetch every 1 minute for new orders
    onError: (error) => {
      console.error('Error fetching new orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải đơn hàng',
        position: 'bottom',
      });
    },
  });

  // Use React Query for history orders
  const historyOrdersQuery = useQuery({
    queryKey: ['orders', 'history', userShop?.id, selectedDate.toISOString()],
    queryFn: fetchHistoryOrders,
    enabled: orderType === 2 && !!userShop,
    onError: (error) => {
      console.error('Error fetching history orders:', error);
      Toast.show({
        type: 'error',
        text1: error.message === 'Failed to fetch order history' ? 'Lỗi khi tải lịch sử đơn hàng' : 'Lỗi khi tải chi tiết đơn hàng',
        position: 'bottom',
      });
    },
  });

  // Determine which query to use based on orderType
  const currentQuery = orderType === 1 ? newOrdersQuery : historyOrdersQuery;
  const { data = [], isLoading, error } = currentQuery;

  const loadUserShop = async () => {
    const user = await AsyncStorage.getUser();
    if (user && user.shops) {
      setUserShop(user.shops);
      console.log('Orders: User shop loaded:', user.shops);
    } else {
      console.log('Orders: No user shop data found');
    }
  };

  useEffect(() => {
    loadUserShop();
  }, []);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userShop) {
        // Refetch the active query when screen gains focus
        if (orderType === 1) {
          newOrdersQuery.refetch();
        } else if (orderType === 2) {
          historyOrdersQuery.refetch();
        }
      }
    }, [orderType, userShop])
  );

  // React Query handles refetching automatically, so no manual intervals needed

  // Handle printer settings saved
  const handlePrinterSettingsSaved = (printerSettings) => {
    // Optional: Handle any additional logic when printer settings are saved
    console.log('Printer settings saved:', printerSettings);
  };

  const renderFilter = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          if (!isLoading) {
            setOrderType(item.id);
          }
        }}
        style={[
          styles.wrapperOrderType,
          orderType === item.id && {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
        ]}>
        <TextNormal
          style={{
            fontWeight: orderType === item.id ? '500' : '400',
            color:
              orderType === item.id ? Colors.whiteColor : Colors.inactiveText,
          }}>
          {item.name}
        </TextNormal>
      </TouchableOpacity>
    );
  };



  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.bgInput,
          flexDirection: 'row',
        }}>
        <View style={styles.container}>
          {/* Content */}
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContainer}>
                <View style={styles.filtersContainer}>
                  <FlatList
                    data={orderFilters}
                    keyExtractor={i => i.id}
                    horizontal
                    contentContainerStyle={{
                      paddingVertical: 12,
                      alignSelf: 'flex-start',
                    }}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderFilter}
                  />
                </View>
                <View style={styles.actionContainer}>
                  <View style={styles.actionButton}>
                    <TextNormal style={styles.actionButtonText}>
                      {userShop ? userShop.name_vn : 'Loading...'}
                    </TextNormal>
                  </View>
                  {orderType === 1 && (
                    <TouchableOpacity
                      style={[styles.actionButton, { opacity: isLoading ? 0.5 : 1 }]}
                      onPress={() => {
                        if (!isLoading) {
                          newOrdersQuery.refetch();
                        }
                      }}
                      disabled={isLoading}
                    >
                      <Svg name={'refresh'} size={24} />
                      <TextNormal style={styles.actionButtonText}>Làm mới</TextNormal>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { opacity: isLoading ? 0.5 : 1 }]}
                    onPress={() => {
                      if (!isLoading) {
                        setPrinterType('label');
                        setPrinterModalVisible(true);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Svg name={labelPrinterStatus === 'connected' ? 'icon_print' : 'icon_print_warning'} size={24} />
                    <TextNormal style={styles.actionButtonText}>In tem</TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { opacity: isLoading ? 0.5 : 1 }]}
                    onPress={() => {
                      if (!isLoading) {
                        setPrinterType('bill');
                        setPrinterModalVisible(true);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <Svg name={billPrinterStatus === 'connected' ? 'icon_print' : 'icon_print_warning'} size={24} />
                    <TextNormal style={styles.actionButtonText}>In bill</TextNormal>
                  </TouchableOpacity>
                </View>
              </View>
              {orderType === 2 && (
                <View style={styles.searchContainer}>
                  <TouchableOpacity
                    style={[styles.searchInput, isLoading && styles.disabledInput]}
                    onPress={() => !isLoading && setShowDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Svg name={'clock'} size={20} color={'gray'} />
                    <TextNormal style={styles.searchInputText}>
                      {selectedDate.toLocaleDateString('en-GB')}
                    </TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.searchInput, isLoading && styles.disabledInput]}
                    disabled={isLoading}
                  >
                    <Svg name={'search'} size={20} color={'gray'} />
                    <TextNormal style={styles.searchInputText}>
                      {'All'}
                    </TextNormal>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.searchInput, { flex: 2 }, isLoading && styles.disabledInput]}
                    disabled={isLoading}
                  >
                    <Svg name={'search'} size={20} />
                    <TextNormal style={styles.searchInputText}>
                      {' Tìm kiếm theo mã đơn hàng'}
                    </TextNormal>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <TextNormal style={styles.loadingText}>
                  {orderType === 1 ? 'Đang tải đơn hàng mới...' : 'Đang tải lịch sử đơn hàng...'}
                </TextNormal>
              </View>
            ) : (
              <OrderTable orderType={orderType} orders={data} showSettingPrinter={() => setPrinterModalVisible(true)} isFoodApp={true} />
            )}
            {/* Printer Settings Modal */}
            <PrinterSettingsModal
              visible={printerModalVisible}
              onClose={() => setPrinterModalVisible(false)}
              initialPrinterType={printerType}
              onSettingsSaved={handlePrinterSettingsSaved}
            />
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
      <Toast
        position="top"
        topOffset={50}
        visibilityTime={4000}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
  },
  containerModal: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 16,
    alignSelf: 'center',
    margin: 20,
  },
  wrapperOrderType: {
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
  },
  textHeader: {
    color: Colors.secondary,
  },
  sidebar: {
    width: 80,
    backgroundColor: '#001f3f',
    paddingTop: 20,
    alignItems: 'center',
  },
  menuItem: {
    marginVertical: 15,
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  header: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    height: 40,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 120,
    flex: 1,
  },
  dialogInput: {
    borderRadius: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
    height: 50,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 120,
    flex: 1,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  badgeRed: {
    backgroundColor: '#ffcccc',
  },
  badgeBlue: {
    backgroundColor: '#cce5ff',
  },
  badgeText: {
    fontSize: 12,
    color: '#000',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    borderRadius: 10,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
  disabledInput: {
    opacity: 0.5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersContainer: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputText: {
    marginLeft: 10,
    borderLeftWidth: 1,
    borderColor: 'gray',
    paddingLeft: 10,
  },

});

export default Orders;
