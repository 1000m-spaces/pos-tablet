import React, {useEffect, useRef, useState} from 'react';
import {Platform, View, SafeAreaView} from 'react-native';
import {
  NAVIGATION_ACCESS_LOCATION,
  NAVIGATION_LOGIN,
  NAVIGATION_HOME,
} from 'navigation/routes';
import {userInfo} from 'store/selectors';
import styles from './styles';
import {asyncStorage} from 'store/index';

import {useDispatch, useSelector} from 'react-redux';

const Splash = props => {
  const dispatch = useDispatch();
  const userInfoInternal = useSelector(state => userInfo(state));
  const [user, setUser] = useState(null);

  const initUser = async () => {
    const userData = await asyncStorage.getUser();
    // user.acctbal = parseInt(user.acctbal, 10);
    // user.acctbal2 = parseInt(user.acctbal2, 10);
    if (user && user.userid) {
      setUser(userData || {userid: -1});
    }
  };

  useEffect(() => {
    initUser();
  }, []);

  console.log('userInfoInternal::', userInfoInternal);
  useEffect(() => {
    setTimeout(() => {
      if (!user || user.userid === -1) {
        props.navigation.reset({
          index: 0,
          routes: [{name: NAVIGATION_LOGIN}],
        });
      } else {
        props.navigation.reset({
          index: 0,
          routes: [{name: NAVIGATION_HOME}],
        });
      }
    }, 2000);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={{}} />
    </SafeAreaView>
  );
};
export default Splash;
