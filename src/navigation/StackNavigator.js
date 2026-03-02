import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NAVIGATION_LOGIN,
  NAVIGATION_MAIN,
  NAVIGATION_SPLASH,
  NAVIGATION_HOME,
  NAVIGATION_ORDER,
  NAVIGATION_PROFILE,
  NAVIGATION_ORDER_1000M,
  NAVIGATION_ORDER_NEW,
  NAVIGATION_ORDER_DETAIL,
} from './routes';
import * as Screens from 'components';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ header: () => null }}
      initialRouteName={NAVIGATION_SPLASH}>
      <Stack.Screen name={NAVIGATION_MAIN} component={Screens.Main} />
      {/* <Stack.Screen name={NAVIGATION_HOME} component={Screens.Home} /> */}
      <Stack.Screen name={NAVIGATION_SPLASH} component={Screens.Splash} />
      <Stack.Screen name={NAVIGATION_LOGIN} component={Screens.Login} />
      <Stack.Screen name={NAVIGATION_ORDER} component={Screens.Orders} />
      <Stack.Screen name={NAVIGATION_PROFILE} component={Screens.Profile} />
      <Stack.Screen name={NAVIGATION_ORDER_NEW} component={Screens.OrderNew} />
      <Stack.Screen name={NAVIGATION_ORDER_DETAIL} component={Screens.OrderDetailNew} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
