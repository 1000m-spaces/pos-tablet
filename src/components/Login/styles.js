// import {heightDevice, widthDevice} from 'assets/constans';
import {Dimensions, StyleSheet} from 'react-native';
import Colors from 'theme/Colors';

const heightDevice = Dimensions.get('window').height;
const widthDevice = Dimensions.get('window').width;
console.log(widthDevice, heightDevice)
const styles = StyleSheet.create({
  titleLogin: {marginBottom: 32, fontSize: 40, fontWeight: '600'},
  logoTea: {position: 'absolute', top: 32, left: 32},
  hideText: {position: 'absolute', top: 13, right: 16, zIndex: 99},
  imgBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingEnd: 40,
  },
  loginScreen: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.whiteColor,
  },
  containerLogin: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textError: {color: Colors.error, textAlign: 'center'},
  safeView: {
    flex: 1,
  },
  textConfirm: {
    color: Colors.textDisabled,
    fontWeight: '600',
    fontSize: 18,
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
    width: 377,
    height: 48,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: Colors.btnDisabled,
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
    fontSize: 16,
    color: 'black',
    paddingLeft: 16,
    marginBottom: 24,
    fontFamily: 'SVN-Poppins-Medium',
    fontWeight: '500',
    width: 377,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  imageVietNam: {},
  iconDown: {
    marginLeft: 3,
  },
});

export default styles;
