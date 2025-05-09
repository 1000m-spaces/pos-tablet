import React from 'react';
import { NAVIGATION_HOME, NAVIGATION_ORDER } from 'navigation/routes';
import { StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Screens from 'components';
const Drawer = createDrawerNavigator();

import Colors from 'theme/Colors';

import DrawerContent from './DrawerContent';
import { useSelector } from 'react-redux';
import { screenSelector } from 'store/selectors';
const Main = () => {
  const currentScreen = useSelector(state => screenSelector(state));
  // console.log('currentScreen:::', currentScreen);
  return (
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
          width: 108,
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
      {/* <Drawer.Screen name="Notifications" component={NotificationsScreen} /> */}
    </Drawer.Navigator>
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
