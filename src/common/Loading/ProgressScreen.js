import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {TextSemiBold} from 'common/Text/TextFont';
import Colors from 'theme/Colors';
const ProgressScreen = () => {
  return (
    <View style={{justifyContent: 'center', flex: 1}}>
      <ActivityIndicator color={Colors.buttonTextColor} size="large" />
      <TextSemiBold
        style={{textAlign: 'center', color: Colors.buttonTextColor}}>
        Loading...
      </TextSemiBold>
    </View>
  );
};

export default ProgressScreen;
