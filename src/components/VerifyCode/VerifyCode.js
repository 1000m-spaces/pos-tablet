import {React, useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Pressable,
  Keyboard,
} from 'react-native';

import Loading from 'common/Loading/Loading';

const VerifyCode = ({navigation, route}) => {
  return (
    <SafeAreaView>
      <Pressable onPress={Keyboard.dismiss}>{/* Title */}</Pressable>
      <Loading isHidden={true} />
    </SafeAreaView>
  );
};

export default VerifyCode;
