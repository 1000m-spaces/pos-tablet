import React, {useEffect} from 'react';
import {NAVIGATION_HOME, NAVIGATION_MENU} from 'navigation/routes';
import {Platform, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import * as Screens from 'components';
const Drawer = createDrawerNavigator();
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Svg from 'common/Svg/Svg';
import {TextNormal} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
import { heightDevice } from 'assets/constans';

const CustomDrawerContent = props => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        {/* Custom header content */}
        <Svg name={'logo_menu'} size={60} />
      </View>
      {/* Custom drawer items */}
      <DrawerItemList {...props} />

      {/* Additional buttons in the drawer */}
      {/* <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => alert('Logout')}>
        <Text style={styles.logoutText}>Menu</Text>
      </TouchableOpacity> */}
    </DrawerContentScrollView>
  );
};

const Main = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      overlayColor="rgba(0, 0, 0, 0.7)"
      screenOptions={{
        headerShown: false,
        drawerType: 'permanent',
        drawerActiveBackgroundColor: Colors.primary,
        drawerActiveTintColor: Colors.whiteColor,
        drawerStyle: {
          backgroundColor: '#021526',
          width: 108,
          padding: 0,
        },
      }}
      initialRouteName={NAVIGATION_HOME}>
      <Drawer.Screen name={'Menu'} component={Screens.Home} />
      {/* <Drawer.Screen name="Notifications" component={NotificationsScreen} /> */}
    </Drawer.Navigator>
  );
};

export default Main;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 20,
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
