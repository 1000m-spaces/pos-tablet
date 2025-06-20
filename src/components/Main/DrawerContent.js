/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
// import {Avatar, Title} from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Images from 'common/Images/Images';
import { TextNormal } from 'common/Text/TextFont';
import Svg from 'common/Svg/Svg';
import Icons from 'common/Icons/Icons';
import Colors from 'theme/Colors';
import { NAVIGATION_HOME, NAVIGATION_ORDER, NAVIGATION_INVOICE } from 'navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { screenSelector } from 'store/selectors';
import { setScreenAction } from 'store/actions';
const DrawerList = [
  { icon: 'menu_pos', label: 'Menu', navigateTo: NAVIGATION_HOME },
  { icon: 'order_pos', label: 'Đơn online', navigateTo: NAVIGATION_ORDER },
  { icon: 'invoice_pos', label: 'Hóa Đơn', navigateTo: NAVIGATION_INVOICE },
  // Temporarily comment out invalid routes until they are properly implemented
  // { icon: 'history_pos', label: 'Lich sử', navigateTo: 'History' },
  // { icon: 'account_pos', label: 'Tài khoản', navigateTo: 'Account' },
];
const DrawerLayout = ({ icon, label, navigateTo, currentScreen, navigation }) => {
  const dispatch = useDispatch();

  const handlePress = () => {
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
      console.error('DrawerLayout: Error stack:', error.stack);
    }
  };

  return (
    <DrawerItem
      icon={() => (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              currentScreen && currentScreen === navigateTo
                ? Colors.primary
                : 'transparent',
            width: 70,
            height: 60,
            borderRadius: 12,
          }}>
          <Svg
            name={icon}
            size={24}
            color={currentScreen === navigateTo ? 'white' : 'gray'}
          />
          <TextNormal
            style={{
              color:
                currentScreen && currentScreen === navigateTo
                  ? Colors.whiteColor
                  : Colors.grayText,
            }}>
            {label}
          </TextNormal>
        </View>
      )}
      label={label}
      activeTintColor={Colors.whiteColor}
      inactiveTintColor={Colors.whiteColor}
      onPress={handlePress}
    />
  );
};

const DrawerItems = ({ currentScreen, navigation }) => {
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        currentScreen={currentScreen}
        navigation={navigation}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
      />
    );
  });
};

const DrawerContent = props => {
  const currentScreen = useSelector(state => screenSelector(state));

  console.log('DrawerContent: Rendering with props:', props);
  console.log('DrawerContent: Current screen from selector:', currentScreen);
  console.log('DrawerContent: Props navigation:', props.navigation);

  return (
    <View style={{ flex: 1, backgroundColor: '#001f3f', width: 108 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <Svg name={'logo_menu'} size={60} />
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems currentScreen={currentScreen} navigation={props.navigation} />
          </View>
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <Icons
              type={'Feather'}
              name="arrow-right"
              color={color}
              size={size}
            />
          )}
          label="Sign Out"
        />
      </View>
    </View>
  );
};
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
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
    // alignItems: 'center',
    width: 108,
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
