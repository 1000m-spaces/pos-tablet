import React, {useEffect, useRef, useState} from 'react';
import {Platform, View, SafeAreaView} from 'react-native';
import styles from './styles';

import {useDispatch} from 'react-redux';

const Splash = props => {
  const dispatch = useDispatch();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{}} />
    </SafeAreaView>
  );
};
export default Splash;
