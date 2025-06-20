import React, { useState, useEffect } from 'react';
import { NAVIGATION_HOME, NAVIGATION_ORDER, NAVIGATION_INVOICE } from 'navigation/routes';
import { StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Screens from 'components';
const Drawer = createDrawerNavigator();

import Colors from 'theme/Colors';
import AsyncStorage from 'store/async_storage/index';
import DrawerContent from './DrawerContent';
import { useSelector } from 'react-redux';
import { screenSelector } from 'store/selectors';
import StoreSelectionDialog from '../Order/StoreSelectionDialog';

const Main = () => {
  const currentScreen = useSelector(state => screenSelector(state));
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  console.log('Main: Current screen from selector:', currentScreen);

  useEffect(() => {
    const checkStoreSelection = async () => {
      const storeInfo = await AsyncStorage.getSelectedStore();
      console.log('Main: Store info:', storeInfo);
      if (!storeInfo) {
        setShowStoreDialog(true);
      } else {
        setSelectedStore(storeInfo);
      }
    };
    checkStoreSelection();
  }, []);

  const handleStoreSelect = async (store) => {
    console.log('Main: Store selected:', store);
    setSelectedStore(store);
    await AsyncStorage.setSelectedStore(store);
    setShowStoreDialog(false);
  };

  if (!selectedStore) {
    console.log('Main: No store selected, showing store dialog');
    return (
      <StoreSelectionDialog
        visible={showStoreDialog}
        onClose={() => { }} // Prevent closing without selection
        onStoreSelect={handleStoreSelect}
      />
    );
  }

  console.log('Main: Rendering drawer navigator with selected store:', selectedStore?.name);

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
        <Drawer.Screen
          name={NAVIGATION_INVOICE}
          component={Screens.Invoice}
          options={{
            drawerLabel: 'Hóa Đơn'
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
