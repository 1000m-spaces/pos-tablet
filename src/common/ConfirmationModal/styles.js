import {heightDevice, widthDevice} from 'assets/constans';
import {StyleSheet} from 'react-native';
import Colors from 'theme/Colors';

const styles = StyleSheet.create({
  containerChildren: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    // backgroundColor: 'red',
  },
  headerModal: {
    // backgroundColor: '#255D54',
    borderRadius: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapperContentConfirm: {
    justifyContent: 'center',
    paddingVertical: 20,
    alignItems: 'center',
  },
  wrapperActionWarning: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  textContents: {width: '80%', textAlign: 'center'},
  modalButtonCancel: {
    width: 120,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: Colors.buttonTextColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  modalButtonOk: {
    width: 120,
    paddingVertical: 7,
    backgroundColor: Colors.buttonTextColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  modalButtonCancelText: {
    color: Colors.buttonTextColor,
  },
  modalButtonOkText: {
    color: 'white',
  },
  wrapperButtonSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 5,
  },
  containerModalWithChildren: {
    backgroundColor: 'whitesmoke',
    width: widthDevice - 24,
    borderRadius: 10,
  },
  containerModal: {
    backgroundColor: 'whitesmoke',
    width: widthDevice - 24,
    // height: heightDevice / 4,
    borderRadius: 20,
  },
});

export default styles;
