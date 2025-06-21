import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, SafeAreaView, Text } from 'react-native';
import {
  NAVIGATION_ACCESS_LOCATION,
  NAVIGATION_LOGIN,
  NAVIGATION_HOME,
  NAVIGATION_MAIN,
} from 'navigation/routes';
// import {userInfo} from 'store/selectors';
import styles from './styles';
import { asyncStorage } from 'store/index';
import Orientation from 'react-native-orientation-locker';

// import {useDispatch, useSelector} from 'react-redux';

const Splash = ({ navigation }) => {
  // const dispatch = useDispatch();
  // const userInfoInternal = useSelector(state => userInfo(state));
  // const [user, setUser] = useState(null);

  useEffect(() => {
    Orientation.lockToLandscape();
    const initUser = async () => {
      let userData = await asyncStorage.getUser();
      // If user data exists, navigate to Main (user is logged in)
      // If no user data, navigate to Login (user needs to log in)
      navigation.reset({
        index: 0,
        routes: [{ name: userData ? NAVIGATION_MAIN : NAVIGATION_LOGIN }],
      });
    };
    initUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: 'white', flex: 1 }} />
    </SafeAreaView>
  );
};
export default Splash;
