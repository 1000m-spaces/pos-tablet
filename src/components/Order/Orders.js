import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState, useCallback } from 'react';
import { heightDevice, widthDevice } from 'assets/constans';
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [data, setData] = useState([]);
  const [orderType, setOrderType] = useState(1);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [userShop, setUserShop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [printerType, setPrinterType] = useState('label'); // 'label' or 'bill'

  // Printer service
  const { labelPrinterStatus, billPrinterStatus } = usePrinter();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('-');
  };

  const fetchOrders = useCallback(async () => {
    if (!userShop) {
      console.log('No user shop data available');
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setData([]); // Clear data while loading

    try {
      if (orderType === 1) {
        // Fetch GRAB orders only
        const grabOrdersRes = await orderController.fetchOrder({
          branch_id: userShop.id,
          brand_id: userShop.partnerid,
          merchant_id: userShop.partnerid,
          service: "GRAB",
        });

        if (grabOrdersRes.success) {
          setData(grabOrdersRes?.data?.orders || []);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi khi tải đơn hàng GRAB',
            position: 'bottom',
          });
        }
      } else {
        // History orders - keep existing logic
        const formattedDate = formatDate(selectedDate);
        const res = await orderController.fetchOrderHistory({
          branch_id: userShop.id,
          brand_id: userShop.partnerid,
          merchant_id: userShop.partnerid,
          from_at: formattedDate,
          to_at: formattedDate,
          page: 1,
          service: "GRAB",
          size: 1000,
        });

        if (res.success) {
          const statements = res.data.statements || [];
          try {
            const orderDetailsPromises = statements.map(statement =>
              orderController.getOrderDetail({
                order_id: statement.ID,
                branch_id: userShop.id,
                brand_id: userShop.partnerid,
                service: "GRAB",
                merchant_id: userShop.partnerid,
              })
            );
            const orderDetailsResults = await Promise.all(orderDetailsPromises);
            const orders = orderDetailsResults.map((result, index) => ({
              ...result?.data?.order,
              ...statements[index]
            }));
            setData(orders);
          } catch (error) {
            console.error('Error fetching order details:', error);
            Toast.show({
              type: 'error',
              text1: 'Lỗi khi tải chi tiết đơn hàng',
              position: 'bottom',
            });
          }
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi khi tải lịch sử đơn hàng',
            position: 'bottom',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải đơn hàng',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userShop, orderType, selectedDate, isLoading]);

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

  useEffect(() => {
    if (userShop) {
      // Initial fetch
      fetchOrders();
      if (orderType !== 1) {
        return;
      }
      // Set up interval for fetching orders every 30 seconds
      const intervalId = setInterval(() => {
        if (!isLoading) {
          fetchOrders();
        }
      }, 30000);
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [userShop, orderType, selectedDate]);

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
            setOrderType(item.id)
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
              <OrderTable orderType={orderType} orders={data} showSettingPrinter={() => setPrinterModalVisible(true)} />
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
