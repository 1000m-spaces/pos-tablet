import {heightDevice, widthDevice} from 'assets/constans';
import {StyleSheet} from 'react-native';
import Colors from 'theme/Colors';

const styles = StyleSheet.create({
  storeText:{fontSize: 28, marginBottom: 4},
  searchHeader: {
    borderRadius: 12,
    width: '50%',
    height: 48,
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    flexDirection: 'row',
    paddingLeft: 16,
  },
  timeText: {fontSize: 16, color: Colors.grayText},
  wrapperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: 14,
  },
  containerHeader: {paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20},
  containerCateTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
  },
});

export default styles;
