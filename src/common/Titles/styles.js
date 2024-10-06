import {widthDevice} from 'assets/constans';
import {StyleSheet} from 'react-native';

const styles = ({iconLanguage, iconBack}) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      backgroundColor: 'white',
      paddingVertical: 8,
    },
    buttonBack: {
      height: 20,
      width: 30,
    },
    iconEnglish: {
      // alignSelf: 'center',
      marginTop: 5,
      height: 20,
      width: 20,
    },
    viewTextTitle: {
      width: iconBack
        ? iconLanguage
          ? widthDevice - 110
          : widthDevice - 60
        : iconLanguage
        ? widthDevice - 80
        : widthDevice - 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textTitle: {
      marginLeft: iconBack ? (iconLanguage ? 20 : -30) : iconLanguage ? 50 : 0,
    },
    buttonLanguage: {
      flexDirection: 'row',
    },
    imageVietNam: {
      // height: 22,
      // width: 22,
      // marginRight: 5,
      marginTop: 5,
    },
    imageTranslate: {
      height: 23,
      width: 23,
    },
  });

export default styles;
