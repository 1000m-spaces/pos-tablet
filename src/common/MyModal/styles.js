import {heightDevice, widthDevice} from 'assets/constans';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: heightDevice,
    width: widthDevice,
    backgroundColor: 'red',
    padding: 30,
  },
  content: {
    height: heightDevice,
    width: widthDevice,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    // opacity: 0.2,
  },
  viewBackground: {
    height: heightDevice,
    width: widthDevice,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0.2,
  },
  viewContent: {
    // position: 'absolute',
    // height: heightDevice,
    // width: widthDevice,
  },
});

export default styles;
