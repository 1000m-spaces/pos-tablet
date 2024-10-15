import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  NAVIGATION_LOGIN,
  NAVIGATION_MAIN,
  NAVIGATION_SPLASH,
  NAVIGATION_HOME,
} from './routes';
import * as Screens from 'components';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{header: () => null}}
      initialRouteName={NAVIGATION_SPLASH}>
      <Stack.Screen name={NAVIGATION_HOME} component={Screens.Home} />
      <Stack.Screen name={NAVIGATION_SPLASH} component={Screens.Splash} />
      <Stack.Screen name={NAVIGATION_LOGIN} component={Screens.Login} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
