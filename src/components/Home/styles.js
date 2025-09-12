import { heightDevice, widthDevice } from 'assets/constans';
import { StyleSheet } from 'react-native';
import Colors from 'theme/Colors';

const styles = StyleSheet.create({
  storeText: { fontSize: 28, marginBottom: 2, fontWeight: '800' },
  searchHeader: {
    borderRadius: 8,
    width: 295,
    height: 48,
    alignItems: 'center',
    backgroundColor: Colors.whiteColor,
    flexDirection: 'row',
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginRight: 28,
  },
  timeText: { fontSize: 14, color: Colors.grayText },
  wrapperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    // padding: 14,
  },
  containerHeader: {
    paddingLeft: 28,
    paddingBottom: 12,
    backgroundColor: Colors.bgInput,
    borderBottomWidth: 1,
    borderBottomColor: Colors.btnDisabled,
  },
  containerCateTab: {
    // height: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 6,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Colors.btnDisabled,
    backgroundColor: Colors.whiteColor,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
});

export default styles;
