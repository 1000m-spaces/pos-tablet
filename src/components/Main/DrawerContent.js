/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
// import {Avatar, Title} from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Images from 'common/Images/Images';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Icons from 'common/Icons/Icons';
import Colors from 'theme/Colors';
import { NAVIGATION_HOME, NAVIGATION_ORDER, NAVIGATION_APP_ORDER, NAVIGATION_INVOICE, NAVIGATION_PROFILE } from 'navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { screenSelector, onlineOrderSelector } from 'store/selectors';
import { setScreenAction, logout, getOnlineOrder } from 'store/actions';
import AsyncStorage from 'store/async_storage/index';
import { NAVIGATION_LOGIN } from 'navigation/routes';
import { versionNameApp, versionDisplayApp, versionSystem, widthDevice, isTablet } from 'assets/constans';
const DrawerList = [
  { icon: 'menu_pos', label: 'Menu', navigateTo: NAVIGATION_HOME },
  { icon: 'order_pos', label: 'FoodApp', navigateTo: NAVIGATION_ORDER },
  { icon: 'invoice_pos', label: 'Đơn online', navigateTo: NAVIGATION_APP_ORDER },
  { icon: 'invoice_pos', label: 'Hóa Đơn', navigateTo: NAVIGATION_INVOICE },
  { icon: 'account_pos', label: 'Tài khoản', navigateTo: NAVIGATION_PROFILE },
  { icon: 'clock', label: 'Chốt ca', isPopup: true },
];
const DrawerLayout = ({ icon, label, navigateTo, isPopup, onPressShiftClose, currentScreen, navigation, hasDeliveryOrders }) => {
  const dispatch = useDispatch();
  const blinkAnim = useRef(new Animated.Value(1)).current;

  // Blinking animation for delivery notification
  useEffect(() => {
    // Only animate when there are NEW unviewed delivery orders
    if (hasDeliveryOrders && navigateTo === NAVIGATION_APP_ORDER) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [hasDeliveryOrders, navigateTo, blinkAnim]);

  const handlePress = () => {
    if (isPopup) {
      if (onPressShiftClose) {
        onPressShiftClose();
      }
      return;
    }
    console.log('DrawerLayout: Attempting to navigate to:', navigateTo);
    console.log('DrawerLayout: Current screen:', currentScreen);
    console.log('DrawerLayout: Navigation object:', navigation);

    try {
      // First update the Redux state
      dispatch(setScreenAction(navigateTo));
      console.log('DrawerLayout: Redux action dispatched successfully');

      // Use drawer-specific navigation methods
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate(navigateTo);
        console.log('DrawerLayout: Navigation successful to:', navigateTo);
      } else if (navigation && typeof navigation.jumpTo === 'function') {
        navigation.jumpTo(navigateTo);
        console.log('DrawerLayout: JumpTo navigation successful to:', navigateTo);
      } else {
        console.error('DrawerLayout: No valid navigation method available');
      }
    } catch (error) {
      console.error('DrawerLayout: Navigation error:', error);
      console.error(
        'DrawerLayout: Error stack:',
        error && typeof error === 'object' && 'stack' in error ? error.stack : error,
      );
    }
  };

  return (
    <DrawerItem
      icon={() => (
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              currentScreen && currentScreen === navigateTo
                ? Colors.primary
                : hasDeliveryOrders && navigateTo === NAVIGATION_APP_ORDER
                  ? 'rgba(255, 0, 0, 0.8)'
                  : 'transparent',
            width: isTablet ? 70 : 55,
            height: isTablet ? 60 : 45,
            borderRadius: 12,
            marginLeft: isTablet ? 30 : 10,
            opacity: hasDeliveryOrders && navigateTo === NAVIGATION_APP_ORDER ? blinkAnim : 1,
          }}>
          <Svg
            name={icon}
            size={isTablet ? 24 : 18}
            color={currentScreen === navigateTo || (hasDeliveryOrders && navigateTo === NAVIGATION_APP_ORDER) ? 'white' : '#B9B9B9'}
          />
          <TextNormal
            style={{
              fontSize: isTablet ? 14 : 9,
              color:
                currentScreen && currentScreen === navigateTo
                  ? Colors.whiteColor
                  : hasDeliveryOrders && navigateTo === NAVIGATION_APP_ORDER
                    ? Colors.whiteColor
                    : '#B9B9B9',
            }}>
            {label}
          </TextNormal>
        </Animated.View>
      )}
      label={''}
      activeTintColor={Colors.whiteColor}
      inactiveTintColor={Colors.whiteColor}
      onPress={handlePress}
    />
  );
};

const DrawerItems = ({ currentScreen, navigation, hasDeliveryOrders, onPressShiftClose }) => {
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        currentScreen={currentScreen}
        navigation={navigation}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
        isPopup={el.isPopup}
        onPressShiftClose={onPressShiftClose}
        hasDeliveryOrders={hasDeliveryOrders}
      />
    );
  });
};

const DrawerContent = ({ onPressShiftClose, ...props }) => {
  const dispatch = useDispatch();
  const currentScreen = useSelector(state => screenSelector(state));
  const onlineOrders = useSelector(state => onlineOrderSelector(state));
  const [previousOrderIds, setPreviousOrderIds] = useState(new Set());
  const [viewedDeliveryOrderIds, setViewedDeliveryOrderIds] = useState(new Set());
  const [userShop, setUserShop] = useState(null);

  // Load user shop data
  useEffect(() => {
    const loadUserShop = async () => {
      const user = await AsyncStorage.getUser();
      if (user && user.shops) {
        setUserShop(user.shops);
      }
    };
    loadUserShop();
  }, []);

  // Fetch orders every 1 minute
  useEffect(() => {
    if (!userShop?.id) return;

    // Initial fetch
    dispatch(getOnlineOrder({ rest_id: userShop.id }));

    // Set up interval for every 1 minute (60000ms)
    const intervalId = setInterval(() => {
      dispatch(getOnlineOrder({ rest_id: userShop.id }));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [userShop, dispatch]);

  // Check for NEW unviewed delivery orders
  const hasNewDeliveryOrders = React.useMemo(() => {
    if (!onlineOrders || onlineOrders.length === 0) {
      return false;
    }
    // Get current delivery order IDs
    const currentDeliveryOrderIds = onlineOrders
      .filter(order => order.is_delivery === '1')
      .map(order => order.id);
    
    // Check if there are any new delivery orders that haven't been viewed
    return currentDeliveryOrderIds.some(orderId => !viewedDeliveryOrderIds.has(orderId));
  }, [onlineOrders, viewedDeliveryOrderIds]);

  // Mark delivery orders as viewed when user navigates to Đơn online screen
  useEffect(() => {
    if (currentScreen === NAVIGATION_APP_ORDER && onlineOrders && onlineOrders.length > 0) {
      const currentDeliveryOrderIds = new Set(
        onlineOrders
          .filter(order => order.is_delivery === '1')
          .map(order => order.id)
      );
      setViewedDeliveryOrderIds(currentDeliveryOrderIds);
    }
  }, [currentScreen, onlineOrders]);

  // Clear viewed orders when all delivery orders are gone
  useEffect(() => {
    if (!onlineOrders || onlineOrders.length === 0) {
      setViewedDeliveryOrderIds(new Set());
      setPreviousOrderIds(new Set());
      return;
    }

    const currentDeliveryOrderIds = new Set(
      onlineOrders
        .filter(order => order.is_delivery === '1')
        .map(order => order.id)
    );

    // Update previous order IDs
    setPreviousOrderIds(currentDeliveryOrderIds);
  }, [onlineOrders]);

  console.log('DrawerContent: Has new delivery orders:', hasNewDeliveryOrders);
  console.log('DrawerContent: Total delivery orders:', onlineOrders?.filter(o => o.is_delivery === '1').length || 0);
  console.log('DrawerContent: Viewed order IDs:', Array.from(viewedDeliveryOrderIds));

  const handleLogout = () => {
    dispatch(logout());
    // Navigate to login screen
    props.navigation.reset({
      index: 0,
      routes: [{ name: NAVIGATION_LOGIN }],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#021526', width: widthDevice * (isTablet ? 0.09 : 0.14), alignItems: 'center', justifyContent: 'center' }}>
      <DrawerContentScrollView contentContainerStyle={{ width: widthDevice * (isTablet ? 0.09 : 0.14), alignItems: 'center' }} {...props}>
        <View style={[styles.drawerContent, { width: widthDevice * (isTablet ? 0.09 : 0.14) }]}>
          <TouchableOpacity activeOpacity={0.8}>
            <Svg name={'logo_menu'} size={isTablet ? 60 : 40} />
          </TouchableOpacity>
          <View style={[styles.drawerSection, { width: widthDevice * (isTablet ? 0.09 : 0.14) }]}>
            <DrawerItems
              currentScreen={currentScreen}
              navigation={props.navigation}
              hasDeliveryOrders={hasNewDeliveryOrders}
              onPressShiftClose={onPressShiftClose}
            />
          </View>
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: isTablet ? 20 : 0 }}>
              {/* <Icons
                type={'AntDesign'}
                name={'close'}
                color={'white'}
                size={30}
              /> */}
              <Text style={{ color: 'white', flexWrap: 'wrap', fontSize: isTablet ? 12 : 9, marginLeft: isTablet ? 5 : 2 }} numberOfLines={2}>
                Sign Out
              </Text>
            </View>
          )}
          label={''}
          onPress={handleLogout}
        />
      </View>
      <DrawerItem
        icon={({ color, size }) => (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: isTablet ? 20 : 0 }}>
            <TextNormal style={{ color: 'white', fontSize: isTablet ? 12 : 8, textAlign: 'center' }}>Version: {versionDisplayApp}</TextNormal>
          </View>
        )}
        label={''}
      />
    </View>
  );
};
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    width: widthDevice * (isTablet ? 0.09 : 0.14),
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 13,
    // lineHeight: 14,
    // color: '#6e6e6e',
    // width: '100%',
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 10,
    alignItems: 'center',
    width: widthDevice * (isTablet ? 0.09 : 0.14),
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#dedede',
    borderTopWidth: 1,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
