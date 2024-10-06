import {SafeAreaView} from 'react-native-safe-area-context';
import React from 'react';

import {View} from 'react-native';
import styles from './styles';

const Login = props => {
  return (
    // <SafeAreaView style={styles.safeView}>
    //   <Pressable style={{flex: 1}} onPress={Keyboard.dismiss} />
    // </SafeAreaView>
    <View style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: 'red'}} />
    </View>
  );
};

export default Login;
