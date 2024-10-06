import {heightDevice, widthDevice} from 'assets/constans';
import {StyleSheet} from 'react-native';
import Colors from 'theme/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerStyle: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  contentContainerStyle: {
    borderRadius: 15,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 15,
    width: widthDevice,
    height: widthDevice * 0.8,
  },
  dot: {
    backgroundColor: '#D9D9D9',
    width: 7,
    height: 7,
    borderRadius: 11,
    marginLeft: 4,
    marginRight: 4,
    marginBottom: -30,
  },
  active_dot: {
    width: 7,
    height: 7,
    borderRadius: 11,
    marginLeft: 4,
    marginRight: 4,
    backgroundColor: Colors.buttonTextColor,
    marginBottom: -30,
  },
  image: {
    height: (widthDevice - 30) * 0.8,
    width: widthDevice - 30,
    marginTop: 0,
    marginLeft: 0,
    borderRadius: 15,
  },
});

export default styles;
