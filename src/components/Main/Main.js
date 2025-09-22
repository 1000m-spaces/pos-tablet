import React, { useState, useEffect, useRef } from 'react';
import { NAVIGATION_HOME, NAVIGATION_ORDER, NAVIGATION_APP_ORDER, NAVIGATION_INVOICE, NAVIGATION_PROFILE } from 'navigation/routes';
import { StyleSheet, View, Dimensions, PixelRatio } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Screens from 'components';
const Drawer = createDrawerNavigator();

import Colors from 'theme/Colors';
import AsyncStorage from 'store/async_storage/index';
import DrawerContent from './DrawerContent';
import { useDispatch, useSelector } from 'react-redux';
import { screenSelector } from 'store/selectors';
import { widthDevice } from 'assets/constans';
import { syncPendingOrdersAction } from 'store/actions';
import Toast from 'react-native-toast-message';


const Main = () => {
  const dispatch = useDispatch();
  const currentScreen = useSelector(state => screenSelector(state));
  const [userShop, setUserShop] = useState(null);

  // Print queue related state
  const [printQueueStatus, setPrintQueueStatus] = useState('');

  console.log('Main: Current screen from selector:', currentScreen);


  useEffect(() => {
    // Background job: sync offline orders every 1 minute
    const intervalId = setInterval(() => {
      dispatch(syncPendingOrdersAction());
      // Optionally refresh local data after dispatching sync action
    }, 120000); // 60,000 ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    const loadUserShop = async () => {
      const user = await AsyncStorage.getUser();
      console.log('Main: User data:', user);
      if (user && user.shops) {
        setUserShop(user.shops);
        console.log('Main: User shop loaded:', user.shops);
      }
    };
    loadUserShop();
  }, []);

  // Initialize print queue listener
  useEffect(() => {
    const initializePrintQueue = async () => {
      try {
        // Set up print queue listener
        const unsubscribe = printQueueService.addListener((event, data) => {
          console.log('Print queue event:', event, data);

          switch (event) {
            case 'taskAdded':
              setPrintQueueStatus('Đơn hàng đã được thêm vào hàng đợi in');
              break;

            case 'taskProcessing':
              setPrintQueueStatus('Đang xử lý in đơn hàng...');
              break;

            case 'taskCompleted':
              setPrintQueueStatus('In đơn hàng thành công');
              Toast.show({
                type: 'success',
                text1: 'In thành công',
                text2: `Đơn hàng ${data.order?.session || data.order?.offlineOrderId} đã được in`,
                position: 'top',
              });
              // Clear status after a delay
              setTimeout(() => {
                setPrintQueueStatus('');
              }, 2000);
              break;

            case 'taskFailed':
              setPrintQueueStatus('In đơn hàng thất bại');
              Toast.show({
                type: 'error',
                text1: 'In thất bại',
                text2: `Lỗi: ${data.lastError || 'Không xác định'}`,
                position: 'top',
              });
              // Clear status after a delay
              setTimeout(() => {
                setPrintQueueStatus('');
              }, 3000);
              break;

            case 'taskRetrying':
              setPrintQueueStatus(`Đang thử lại lần ${data.retries}/${printQueueService.maxRetries}...`);
              break;

            case 'processingStarted':
              setPrintQueueStatus('Bắt đầu xử lý hàng đợi in');
              break;

            case 'processingCompleted':
              setPrintQueueStatus('Hoàn thành xử lý hàng đợi in');
              setTimeout(() => {
                setPrintQueueStatus('');
              }, 2000);
              break;
          }
        });

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error('Error initializing print queue:', error);
      }
    };

    const cleanup = initializePrintQueue();

    // Cleanup on unmount
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);


  // Don't render anything until we have user shop data
  if (!userShop) {
    console.log('Main: No user shop data, waiting...');
    return null;
  }

  console.log('Main: Rendering drawer navigator with user shop:', userShop?.name_vn);


  return (
    <>
      <Drawer.Navigator
        drawerContent={props => (
          <DrawerContent {...props} />
        )}
        overlayColor="rgba(0, 0, 0, 0.7)"
        screenOptions={{
          headerShown: false,
          drawerType: 'permanent',
          drawerActiveBackgroundColor: Colors.primary,
          drawerActiveTintColor: Colors.whiteColor,
          drawerStyle: {
            width: widthDevice * 0.09,
          },
          swipeEnabled: false,
          drawerPosition: 'left',
        }}
        initialRouteName={NAVIGATION_HOME}>
        <Drawer.Screen
          name={NAVIGATION_HOME}
          component={Screens.Home}
          options={{
            drawerLabel: 'Menu'
          }}
        />
        <Drawer.Screen
          name={NAVIGATION_ORDER}
          component={Screens.Orders}
          options={{
            drawerLabel: 'Đơn online'
          }}
        />
        <Drawer.Screen
          name={NAVIGATION_APP_ORDER}
          component={Screens.AppOrders}
          options={{
            drawerLabel: 'Food App'
          }}
        />
        <Drawer.Screen
          name={NAVIGATION_INVOICE}
          component={Screens.Invoice}
          options={{
            drawerLabel: 'Hóa Đơn'
          }}
        />
        <Drawer.Screen
          name={NAVIGATION_PROFILE}
          component={Screens.Profile}
          options={{
            drawerLabel: 'Tài khoản'
          }}
        />
      </Drawer.Navigator>

    </>
  );
};

export default Main;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    // padding: 20,
    backgroundColor: '#021526',
    // backgroundColor: '#f4f4f4',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff6347',
    borderRadius: 5,
    marginHorizontal: 20,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  customDrawerSection: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
});
