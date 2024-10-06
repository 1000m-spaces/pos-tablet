import Colors from 'theme/Colors';
import {StyleSheet} from 'react-native';
import {heightDevice, widthDevice} from 'assets/constans';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
  },
  viewLogo: {
    width: 129,
    height: 129,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // marginTop: heightDevice - widthDevice * 1.4188 - 65,
    backgroundColor: '#B29171',
    borderRadius: 30,
  },
  viewLogoSlogan: {
    backgroundColor: '#162D25',
    alignItems: 'center',
    width: widthDevice,
    // height: heightDevice - widthDevice * 1.4188,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
});
export default styles;
