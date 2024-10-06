import {ActivityIndicator, View} from 'react-native';
import React from 'react';
import {heightDevice, widthDevice} from 'assets/constans';

const Loading = ({isHidden}) => {
  if (isHidden) {
    return (
      <View
        style={{
          position: 'absolute',
          width: widthDevice,
          height: heightDevice,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size={'large'} color={'#004D40'} />
      </View>
    );
  } else {
    return <></>;
  }
};

export default Loading;
