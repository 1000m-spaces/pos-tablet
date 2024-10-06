import {Platform, StyleSheet} from 'react-native';
import Colors from 'theme/Colors';
const isAndroid = Platform.OS === 'android';

const styles = StyleSheet.create({
  small11: {
    fontFamily: 'SVN-Poppins-Regular',
    fontSize: 11,
    color: Colors.blackColor,
    fontWeight: '400',
  },
  small12: {
    fontFamily: 'SVN-Poppins-Regular',
    fontSize: 12,
    color: Colors.blackColor,
    fontWeight: '400',
  },
  smallMedium12: {
    fontFamily: 'SVN-Poppins-Medium',
    fontSize: 12,
    color: Colors.blackColor,
    fontWeight: '500',
  },
  normal13: {
    fontFamily: 'SVN-Poppins-Regular',
    fontSize: 13,
    color: Colors.blackColor,
    fontWeight: '400',
  },
  normalSemiBold13: {
    fontFamily: 'SVN-Poppins-SemiBold',
    fontSize: 13,
    color: Colors.blackColor,
    fontWeight: '600',
  },
  highLightBold16: {
    fontFamily: 'SVN-Poppins-Bold',
    fontSize: 16,
    color: Colors.blackColor,
    // fontWeight: '700',
  },
  semiBold16: {
    fontFamily: 'SVN-Poppins-SemiBold',
    fontSize: 16,
    color: Colors.blackColor,
    fontWeight: '600',
    fontStyle: 'normal',
  },
  moneyBold20: {
    fontFamily: 'SVN-Poppins-Bold',
    fontSize: 20,
    color: Colors.blackColor,
    fontWeight: isAndroid ? 'normal' : '700',
  },
});

export default styles;
