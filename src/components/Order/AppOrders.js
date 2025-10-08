import Svg from 'common/Svg/Svg';
import { TextNormal } from 'common/Text/TextFont';
import React, { useEffect, useState, useCallback } from 'react';
import { heightDevice, widthDevice } from 'assets/constans';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Colors from 'theme/Colors';
import OrderTable from './OrderTable';
import PrinterSettingsModal from 'common/PrinterSettingsModal';
import AsyncStorage from 'store/async_storage/index';
import { getOrderShipping, getOrderPaidSuccess, resetGetOrderShipping, resetGetOrderPaidSuccess, getOnlineOrder, resetGetOnlineOrder } from 'store/order/orderAction';
import { usePrinter } from '../../services/PrinterService';
import orderController from 'store/order/orderController';
import { confirmOrderOnlineStatusSelector, getStatusGetOnlineOrder, onlineOrderSelector } from 'store/selectors';
import Status from 'common/Status/Status';

const appOrderFilters = [
  { id: 1, name: 'Đơn mới' },
  { id: 2, name: 'Lịch sử' },
];

// Function to transform new online API response to match expected order structure
const transformOrderOnlineNew = (apiOrder) => {
  try {
    // Parse the request_products JSON string
    const requestProducts = apiOrder.request_products ? JSON.parse(apiOrder.request_products) : [];

    // Transform products to itemInfo.items structure
    const items = apiOrder.products?.map((product, index) => {
      // Find corresponding request product for additional info
      const requestProduct = requestProducts.find(req => req.pid == product.prod_id) || {};

      // Transform extras to modifierGroups
      const modifierGroups = product.extras?.map(extra => ({
        modifierGroupName: extra.group_extra_name || 'Extras',
        modifiers: [{
          modifierName: extra.name,
          modifierPrice: extra.paid_price || 0
        }]
      })) || [];

      return {
        name: product.prodname,
        quantity: parseInt(product.quantity) || 1,
        comment: requestProduct.note || '',
        modifierGroups: modifierGroups,
        fare: {
          priceDisplay: product.paid_price ? parseInt(product.paid_price).toLocaleString('vi-VN') : '0',
          currencySymbol: '₫'
        }
      };
    }) || [];

    // Transform the order to match expected structure
    return {
      displayID: apiOrder.id,
      state: 'ORDER_CREATED', // Default state for new orders
      orderValue: apiOrder.price_paid ? parseInt(apiOrder.price_paid).toLocaleString('vi-VN') : '0',
      itemInfo: {
        items: items
      },
      eater: {
        name: apiOrder.order_name || 'Khách hàng',
        mobileNumber: apiOrder.userphone || '',
        comment: apiOrder.description || '',
        address: {
          address: apiOrder.address || ''
        }
      },
      // Add service info from tableName
      service: apiOrder.table_name || apiOrder.tableName || 'Unknown',
      // Mark as online order from new API
      source: 'online_new'
    };
  } catch (error) {
    console.error('Error transforming online order:', error);
    return null;
  }
};

// Function to transform app order response to match expected order structure
const transformAppOrder = (apiOrder) => {
  try {
    // Parse the request_products JSON string if it exists
    const requestProducts = apiOrder.request_products ? JSON.parse(apiOrder.request_products) : [];

    // Transform products to itemInfo.items structure
    const items = apiOrder.products?.map((product, index) => {
      // Find corresponding request product for additional info
      const requestProduct = requestProducts.find(req => req.pid == product.prod_id) || {};

      // Transform extras to modifierGroups
      const modifierGroups = product.extras?.map(extra => ({
        modifierGroupName: extra.group_extra_name || 'Extras',
        modifiers: [{
          modifierName: extra.name,
          modifierPrice: extra.paid_price || 0
        }]
      })) || [];

      return {
        name: product.prodname,
        quantity: parseInt(product.quantity) || 1,
        comment: requestProduct.note || '',
        modifierGroups: modifierGroups,
        fare: {
          priceDisplay: product.paid_price ? parseInt(product.paid_price).toLocaleString('vi-VN') : '0',
          currencySymbol: '₫'
        }
      };
    }) || [];

    // Transform the order to match expected structure
    return {
      displayID: apiOrder.id,
      state: apiOrder.status || 'ORDER_CREATED',
      orderValue: apiOrder.price_paid ? parseInt(apiOrder.price_paid).toLocaleString('vi-VN') : '0',
      itemInfo: {
        items: items
      },
      eater: {
        name: apiOrder.order_name || 'Khách hàng',
        mobileNumber: apiOrder.userphone || '',
        comment: apiOrder.description || '',
        address: {
          address: apiOrder.address || ''
        }
      },
      // Add service info 
      service: apiOrder.is_delivery == '1' ? 'Delivery' : 'Pick up',
      // Mark as app order
      source: 'app_order',
      // Add timestamps
      createdAt: apiOrder.created_at,
      updatedAt: apiOrder.updated_at
    };
  } catch (error) {
    console.error('Error transforming app order:', error);
    return null;
  }
};

const AppOrders = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [orderType, setOrderType] = useState(1);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [userShop, setUserShop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [printerType, setPrinterType] = useState('label');

  // Printer service
  const { labelPrinterStatus, billPrinterStatus } = usePrinter();

  // Redux selectors
  const shippingOrders = useSelector(state => state.order.shippingOrders);
  const statusGetOrderShipping = useSelector(state => state.order.statusGetOrderShipping);
  const paidSuccessOrders = useSelector(state => state.order.paidSuccessOrders);
  const statusGetOrderPaidSuccess = useSelector(state => state.order.statusGetOrderPaidSuccess);
  const isOnlineOrderSelector = useSelector(state => onlineOrderSelector(state));
  const isStatusGetOnlineOrder = useSelector(state => getStatusGetOnlineOrder(state));
  const isStatustConfirmOrderOnline = useSelector(state => confirmOrderOnlineStatusSelector(state));

  const fetchAppOrders = useCallback(async () => {
    if (!userShop) {
      console.log('No user shop data available for app orders');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setData([]);

    try {
      if (orderType === 1) {
        dispatch(getOnlineOrder({ rest_id: userShop.id }));

        // Handle online orders from direct API call
        if (isStatusGetOnlineOrder === Status.SUCCESS) {
          const transformedOnlineOrders = isOnlineOrderSelector
            .map(transformOrderOnlineNew)
            .filter(order => order !== null);

          // We'll combine this with Redux data in the useEffect
          setData(isOnlineOrderSelector);
          dispatch(resetGetOnlineOrder());
        }
      } else {
        // Fetch paid success orders (Lịch sử)
        dispatch(getOrderPaidSuccess({
          rest_id: userShop.id
        }));
      }
    } catch (error) {
      console.error('Error fetching app orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải đơn hàng app',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userShop, orderType, dispatch, isLoading]);

  const loadUserShop = async () => {
    const user = await AsyncStorage.getUser();
    if (user && user.shops) {
      setUserShop(user.shops);
      console.log('AppOrders: User shop loaded:', user.shops);
    } else {
      console.log('AppOrders: No user shop data found');
    }
  };

  useEffect(() => {
    loadUserShop();
  }, []);

  useEffect(() => {
    if (userShop) {
      fetchAppOrders();
    }
  }, [userShop, orderType]);


  // set data all online order
  useEffect(() => {
    if (isStatustConfirmOrderOnline === Status.SUCCESS) {
      dispatch(getOnlineOrder({ rest_id: userShop.id }));
      dispatch(resetGetOnlineOrder());
    }
  }, [isStatustConfirmOrderOnline]);

  useEffect(() => {
    loadDataOrderOnline();
  }, [orderType, isOnlineOrderSelector, isStatustConfirmOrderOnline]);

  useEffect(() => {
    if (userShop?.id) {
      const intervalId = setInterval(() => {
        dispatch(getOnlineOrder({ rest_id: userShop?.id }));
      }, 20000)
      return () => clearInterval(intervalId);
    }
  }, [userShop])

  const loadDataOrderOnline = () => {
    if (orderType === 1 && isStatusGetOnlineOrder === Status.SUCCESS) {
      dispatch(resetGetOnlineOrder());
      if (isOnlineOrderSelector?.length > 0) {
        const transformedAppOrders = isOnlineOrderSelector
          .map(transformAppOrder)
          .filter(order => order !== null);

        // Combine with existing online orders (if any were set by direct API call)
        setData(prevData => {
          // Filter out any app orders to avoid duplicates, keep online orders
          const onlineOrders = prevData.filter(order => order.source === 'online_new');
          return [...transformedAppOrders, ...onlineOrders];
        });
      } else if (isStatusGetOnlineOrder === Status.ERROR) {
        Toast.show({
          type: 'error',
          text1: shippingOrders?.error || 'Lỗi khi tải đơn hàng mới',
          position: 'bottom',
        });
      }
      setIsLoading(false);
    } else if (statusGetOrderShipping === 'ERROR') {
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải đơn hàng mới',
        position: 'bottom',
      });
      setIsLoading(false);
    }
  };

  // Handle Redux state updates
  useEffect(() => {
    if (orderType === 1 && statusGetOrderShipping === 'SUCCESS') {
      if (shippingOrders?.status && shippingOrders?.data) {
        const transformedAppOrders = shippingOrders.data
          .map(transformAppOrder)
          .filter(order => order !== null);

        // Combine with existing online orders (if any were set by direct API call)
        setData(prevData => {
          // Filter out any app orders to avoid duplicates, keep online orders
          const onlineOrders = prevData.filter(order => order.source === 'online_new');
          return [...transformedAppOrders, ...onlineOrders];
        });
      } else if (shippingOrders?.status === false) {
        Toast.show({
          type: 'error',
          text1: shippingOrders?.error || 'Lỗi khi tải đơn hàng mới',
          position: 'bottom',
        });
      }
      setIsLoading(false);
    } else if (statusGetOrderShipping === 'ERROR') {
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải đơn hàng mới',
        position: 'bottom',
      });
      setIsLoading(false);
    }
  }, [statusGetOrderShipping, shippingOrders, orderType]);

  useEffect(() => {
    if (orderType === 2 && statusGetOrderPaidSuccess === 'SUCCESS') {
      if (paidSuccessOrders?.status && paidSuccessOrders?.data) {
        const transformedOrders = paidSuccessOrders.data
          .map(transformAppOrder)
          .filter(order => order !== null);
        setData(transformedOrders);
      } else if (paidSuccessOrders?.status === false) {
        Toast.show({
          type: 'error',
          text1: paidSuccessOrders?.error || 'Lỗi khi tải lịch sử đơn hàng',
          position: 'bottom',
        });
      }
      setIsLoading(false);
    } else if (statusGetOrderPaidSuccess === 'ERROR') {
      Toast.show({
        type: 'error',
        text1: 'Lỗi khi tải lịch sử đơn hàng',
        position: 'bottom',
      });
      setIsLoading(false);
    }
  }, [statusGetOrderPaidSuccess, paidSuccessOrders, orderType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetGetOrderShipping());
      dispatch(resetGetOrderPaidSuccess());
    };
  }, [dispatch]);

  const handlePrinterSettingsSaved = (printerSettings) => {
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

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.bgInput,
          flexDirection: 'row',
        }}>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContainer}>
                <View style={styles.filtersContainer}>
                  <FlatList
                    data={appOrderFilters}
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
            </View>

            {/* Content */}
            {isLoading || statusGetOrderShipping === 'LOADING' || statusGetOrderPaidSuccess === 'LOADING' || isStatustConfirmOrderOnline === Status.LOADING ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <TextNormal style={styles.loadingText}>
                  {orderType === 1 ? 'Đang tải đơn hàng mới...' : 'Đang tải lịch sử đơn hàng...'}
                </TextNormal>
              </View>
            ) : (
              <OrderTable
                orderType={orderType}
                orders={data}
                showSettingPrinter={() => setPrinterModalVisible(true)}
                isFoodApp={false}
              />
            )}

            {/* Printer Settings Modal */}
            <PrinterSettingsModal
              visible={printerModalVisible}
              onClose={() => setPrinterModalVisible(false)}
              initialPrinterType={printerType}
              onSettingsSaved={handlePrinterSettingsSaved}
            />
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
  content: {
    flex: 1,
    padding: 10,
  },
  header: {
    marginBottom: 10,
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
});

export default AppOrders;
