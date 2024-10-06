import {widthDevice} from 'assets/constans';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Colors from 'theme/Colors';

const SeparatorLine = ({
  pointSeparatorLine,
  separatorLine,
  menuScreen,
  containerSeparatorLine,
}) => {
  return (
    <View style={[styles.containerSeparatorLine, containerSeparatorLine]}>
      {menuScreen !== true && (
        <View style={[styles.pointSeparatorLine, pointSeparatorLine]} />
      )}
      <View style={[styles.separatorLine, separatorLine]} />
      <View style={[styles.pointSeparatorLine, pointSeparatorLine]} />
    </View>
  );
};

export default SeparatorLine;

const styles = StyleSheet.create({
  containerSeparatorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorLine: {
    height: 0.7,
    backgroundColor: Colors.button2Color,
    width: widthDevice * 0.7,
  },
  pointSeparatorLine: {
    height: 2.5,
    width: 2.5,
    borderRadius: 2.5,
    // paddingTop: -14,
    backgroundColor: Colors.button2Color,
  },
});
