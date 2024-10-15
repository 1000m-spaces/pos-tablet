import {heightDevice, widthDevice} from 'assets/constans';
import {StyleSheet} from 'react-native';
import Colors from 'theme/Colors';

const styles = StyleSheet.create({
  textError: {color: Colors.redColor, marginTop: 10, textAlign: 'center'},
  safeView: {
    flex: 1,
  },
  textConfirm: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },

  container: {
    paddingHorizontal: 15,
    flex: 1,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundColor,
  },
  textHello: {
    // fontWeight: '500',
    fontSize: 18,
    marginTop: 20,
  },
  textIntro: {
    color: Colors.buttonTextColor,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 20,
  },
  policyWrapper: {paddingHorizontal: 10, paddingVertical: 10},
  checkboxSection: {flexDirection: 'row', paddingVertical: 15},
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  contentPolicySection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  column: {
    width: 1,
    height: 22,
    backgroundColor: Colors.textGrayColor,
    marginHorizontal: 10,
  },
  separatorLine: {
    marginTop: 40,
  },
  styleCheckbox: {
    height: 18,
    width: 20,
  },
  buttonSkip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    marginTop: 10,
  },
  textSkip: {
    color: Colors.textGrayColor,
  },
  buttonSubmitPhone: {
    // backgroundColor: Colors.buttonTextColor,
    // height: 60,
    // width: 60,
    // borderRadius: 60,
    // justifyContent: 'center',
    // alignItems: 'center',
    width: widthDevice / 1.15,
    marginTop: 10,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonSubmitPhone: {
    alignItems: 'center',
    paddingTop: 80,
  },
  containerButtonInputPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 0.16 * heightDevice,
    width: widthDevice * 0.88,
    backgroundColor: Colors.whiteColor,
    paddingVertical: 5,
    borderRadius: 50,
  },
  containerButtonInputPhone2: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 0.16 * heightDevice,
    marginTop: 10,
    width: widthDevice * 0.88,
    backgroundColor: Colors.whiteColor,
    paddingVertical: 5,
    borderRadius: 50,
  },
  viewImageVietnam: {
    borderRightWidth: 1,
    borderRightColor: '#E2E2E2',
    paddingRight: 10,
    alignItems: 'center',
    marginRight: 10,
    flexDirection: 'row',
    paddingLeft: 20,
  },
  codeCountry: {
    fontWeight: '500',
    fontFamily: 'SVN-Poppins-Medium',
    fontSize: 20,
    marginRight: 10,
  },
  styleTextInput: {
    fontSize: 20,
    // alignItems: 'center',
    // backgroundColor: 'red',
    color: 'black',
    fontFamily: 'SVN-Poppins-Medium',
    fontWeight: '500',
  },
  imageVietNam: {},
  iconDown: {
    marginLeft: 3,
  },
});

export default styles;
