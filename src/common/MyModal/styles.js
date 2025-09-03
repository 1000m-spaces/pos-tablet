import { heightDevice, widthDevice } from 'assets/constans';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: heightDevice,
    // width: widthDevice,
    // padding: 30,
  },
  content: {
    // height: heightDevice,
    // width: widthDevice,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  viewBackground: {
    // height: heightDevice,
    // width: widthDevice,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    // opacity: 0.5,
  },
  viewContent: {
    // position: 'absolute',
    // height: heightDevice,
    // width: widthDevice,
  },
});

export default styles;
