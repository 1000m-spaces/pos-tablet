import React from 'react';
import {Text} from 'react-native';
import styles from './styles';

export const TextSmallEleven = ({style, ...props}) => {
  return <Text {...props} style={[styles.small11, style]} />;
};

export const TextSmallTwelve = ({style, ...props}) => {
  return <Text {...props} style={[styles.small12, style]} />;
};

export const TextSmallMedium = ({style, ...props}) => {
  return <Text {...props} style={[styles.smallMedium12, style]} />;
};

export const TextNormal = ({style, ...props}) => {
  return <Text {...props} style={[styles.normal13, style]} />;
};

export const TextNormalSemiBold = ({style, ...props}) => {
  return <Text {...props} style={[styles.normalSemiBold13, style]} />;
};

export const TextHighLightBold = ({style, ...props}) => {
  return <Text {...props} style={[styles.highLightBold16, style]} />;
};

export const TextSemiBold = ({style, ...props}) => {
  return <Text {...props} style={[styles.semiBold16, style]} />;
};

export const TextMoneyBold = ({style, ...props}) => {
  return <Text {...props} style={[styles.moneyBold20, style]} />;
};
