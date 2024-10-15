import React, {useEffect, useRef, useState} from 'react';
import {FlatList, SafeAreaView, View, TouchableOpacity} from 'react-native';

import {
  TextNormal,
  TextNormalSemiBold,
  TextSemiBold,
} from 'common/Text/TextFont';
import styles from './styles';

const Home = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <TextNormal>{'Hê Lổ'}</TextNormal>
    </SafeAreaView>
  );
};

export default Home;
